from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from typing import Union
import json
from uuid import uuid4
from datetime import datetime
import re
import nltk
import pymorphy2
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from wiki_ru_wordnet import WikiWordnet

from app.modules.db_context import get_db
from app.modules.schema.main.ingredients import Ingredients as MainIngredients
from app.modules.schema.main.mapped_ingredient_values import MappedIngredientValues
from app.modules.schema.main.mapping_logs import MappingLogs
from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.public.ingredients import Ingredients as PublicIngredients
from app.modules.schema.public.products import Products
from app.modules.schema.public.products_ingredients import ProductsIngredients
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


# предобработка наименований ингредиентов
def preprocess_name(name, flag):
    words = word_tokenize(name, language="russian")
    words = [w.lower() for w in words
             if w.lower() not in stopwords.words('russian') and re.search(r'^\b[А-Яа-яЁё]+\b', w)]

    morph = pymorphy2.MorphAnalyzer()
    normal_forms = [morph.parse(w)[0].normal_form for w in words]
    if flag:
        normal_forms.extend(words)

    return list(set(normal_forms))


def get_word_synonyms(name, max_level):
    synonyms = [name]
    wordnet = WikiWordnet()

    # получить первый слой синсетов для слова
    layer = wordnet.get_synsets(name)
    for level in range(max_level):
        if layer:
            next_layer = []

            # получить синонимы для синсета
            for syn in layer:
                for word in syn.get_words():
                    synonyms.append(word.lemma())

                # получить гипонимы для синсета
                hyponyms = wordnet.get_hyponyms(syn)
                for hyponym in hyponyms:
                    for word in hyponym.get_words():
                        synonyms.append(word.lemma())
                next_layer.extend(hyponyms)

                # получить гиперонимы для синсета
                hypernyms = wordnet.get_hypernyms(syn)
                for hypernym in hypernyms:
                    for word in hypernym.get_words():
                        synonyms.append(word.lemma())
                next_layer.extend(hypernyms)

            # перейти к следующему слою
            layer = list(set(next_layer))

    return list(set(synonyms))


def get_ingredient_synonyms(preprocessed_ingredient, depth, amount):
    ingredient_synonyms = []
    synonyms = []

    for word in preprocessed_ingredient:
        word_synonyms = []
        current_depth = 0
        while len(word_synonyms) < amount and current_depth < depth:
            current_depth += 1
            word_synonyms = get_word_synonyms(word, current_depth)

        if len(word_synonyms) > amount and current_depth != 1:
            current_depth -= 1
            word_synonyms = get_word_synonyms(word, current_depth)

        synonyms.append({"word": word,
                         "depth": current_depth,
                         "amount": len(word_synonyms),
                         "synonyms": word_synonyms})
        ingredient_synonyms.extend(word_synonyms)

    return synonyms, ingredient_synonyms


# сопоставление одного наименования ингредиента со списком публичных наименований ингредиентов
def match_name_of_ingredient(session, ingredient_id, depth, amount):
    result = False
    # найти наименование ингредиента
    ingredient = session.query(MainIngredients).where(MainIngredients.id == ingredient_id).first()
    # предобработать наименование ингредиента
    preprocessed_ingredient = preprocess_name(ingredient.name, True)

    # найти синонимы для наименования ингредиента - основное
    # найти гипонимы (частное) и гиперонимы (общее) для наименования ингредиента - дополнительное
    synonyms, ingredient_synonyms = get_ingredient_synonyms(preprocessed_ingredient, depth, amount)

    ingredient_synonyms = list(set(ingredient_synonyms))

    # найти предполагаемые "синонимы" для рассматриваемого ингредиента
    primary_ingredients = session.query(PrimaryIngredients) \
        .filter(or_(PrimaryIngredients.name.ilike(f'%{synonym}%') for synonym in ingredient_synonyms)).all()

    primary_values = []
    mapped_values = []

    if ingredient_synonyms:
        # сопоставить наименование ингредиента с каждым из выбранных публичных наименований
        for primary in primary_ingredients:
            # предобработать публичное наименование
            preprocessed_primary = preprocess_name(primary.name, False)

            primary_values.append({"primary": primary.name, "preprocessed_primary": preprocessed_primary})

            if not preprocessed_primary:
                continue

            # посчитать количество совпавших слов в наименованиях с учетом синонимов
            word_count = 0
            for word in preprocessed_primary:
                if word in ingredient_synonyms:
                    word_count += 1

            # если было найдено хотя бы одно совпадение публичного и рассматриваемого ингредиента,
            # то будет считаться, что рассматриваемый ингредиент был сопоставлен
            if word_count / len(preprocessed_primary) >= 0.5 or word_count >= len(preprocessed_ingredient):
                result = True
                mapped_values.append(primary.name)

                value = session \
                    .query(MappedIngredientValues) \
                    .where(MappedIngredientValues.ingredient_id == ingredient_id,
                           MappedIngredientValues.primary_id == primary.id) \
                    .first()

                if not value:
                    new_mapped_values = MappedIngredientValues(id=str(uuid4()),
                                                               ingredient_id=ingredient_id,
                                                               primary_id=primary.id,
                                                               status=False,
                                                               author_id=None,
                                                               created_at=datetime.now(),
                                                               controller_id=None,
                                                               verified_at=None)
                    session.add(new_mapped_values)
                    session.commit()

    log = {
        "ingredient": ingredient.name,
        "synonyms": synonyms,
        "primary_values": primary_values,
        "mapped_values": mapped_values,
        "status": 'Сопоставлено' if result else 'Не сопоставлено'
    }

    return result, log


# сопоставление публичных наименований ингредиентов и ингредиентов сторонних рецептов
@router.post("/start/")
def start_ingredients_mapping(depth: int,
                              amount: int,
                              items: list[str] = Query(None),
                              session: Session = Depends(get_db),
                              current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        result_count = 0
        logs = []
        for item in items:
            result, log = match_name_of_ingredient(session, item, depth, amount)
            if result:
                result_count += 1

            mapping_log = MappingLogs(id=str(uuid4()),
                                      ingredient_id=item,
                                      log=log,
                                      created_at=datetime.now())

            session.add(mapping_log)
            session.commit()

            logs.append(log)

        return {"result": f"Процесс сопоставления завершен! "
                          f"Сопоставлено {result_count} из {len(items)} значений\n "
                          f"(глубина поиска синонимов равна {depth}, "
                          f"максимальное количество синонимов для одного слова равно {amount})",
                "logs": logs}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/ingredients/")
def get_ingredients_for_mapping(session: Session = Depends(get_db),
                                current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = "SELECT main.ingredients.id AS id, " \
                "main.ingredients.name AS ingredient " \
                "FROM main.ingredients " \
                "WHERE main.ingredients.id NOT IN (" \
                "SELECT main.mapped_ingredient_values.ingredient_id " \
                "FROM main.mapped_ingredient_values) " \
                "ORDER BY main.ingredients.name "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/products_ingredients/")
def get_products_ingredients(page: int,
                             size: int,
                             session: Session = Depends(get_db),
                             current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    count = session.query(ProductsIngredients).count()

    try:
        return count, [
            {
                "value": str(x.id),
                "label": x.product.name.lower() + " - " + x.ingredient.name.lower()
            } for x in session
            .query(ProductsIngredients)
            .join(Products)
            .join(PublicIngredients)
            .order_by(ProductsIngredients.id)
            .offset((page - 1) * size)
            .limit(size)
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
