from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from typing import Union
from datetime import datetime
import re
import json
from uuid import uuid4

from app.modules.db_context import get_db
from app.modules.schema.public.nutrients import Nutrients
from app.modules.schema.public.parsing_sessions import ParsingSessions
from app.modules.schema.public.product_list_categories import ProductListCategories
from app.modules.schema.public.product_nutrients import ProductNutrients
from app.modules.schema.public.products import Products
from app.modules.schema.public.tags_products import TagsProducts
from app.modules.schema.public.tags_reference import TagsReference
from app.modules.schema.public.users import Users
from app.modules.parser import *
from .authentication import get_current_user

router = APIRouter()


# выборка продуктов по категории
def select_by_category(node, session):
    category = session \
        .query(ProductListCategories) \
        .filter(ProductListCategories.name == node['name']) \
        .first()

    products = session \
        .query(Products) \
        .where(Products.category_id == category.id) \
        .all()

    return products


# выборка продуктов по вхождение в название слова, указанного в онтологии
def select_by_pattern(node, session):
    name = node['name']

    products = session \
        .query(Products) \
        .where(Products.name.ilike(f'%{name}%')) \
        .all()

    return products


# выборка продуктов по нутриенту (значение нутриента равно указанному в онтологии)
def select_by_nutrient(onto, node, session):
    value = onto.get_value_by_prop(node, 'Количество')

    products = session.query(Products) \
        .join(ProductNutrients).join(Nutrients) \
        .where(Nutrients.name == node['name'],
               ProductNutrients.amount == value['name']) \
        .all()

    return products


# найти продукты для определенного тег
def find_products_by_tag(tag, onto, session):
    # получить источник данные для тега
    source = onto.get_nodes_linked_from(tag, 'source')[0]

    # получить все узлы, которые являются частью тега (связь a_part_of)
    parts_of_tag = onto.get_nodes_linked_to(tag, 'a_part_of')

    products = set([])
    if source['name'] == "БЗ":
        for part in parts_of_tag:
            products.update(pattern_selection(part, session))

    if source['name'] == "БД":
        if onto.is_node_of_type(parts_of_tag[0], 'Нутриент'):
            for part in parts_of_tag:
                products.update(nutrient_selection(onto, part, session))
        else:
            for part in parts_of_tag:
                products.update(category_selection(part, session))

    return products


# добавление значений тег-продукт в БД
def add_tag_products_to_db(tag, products, session):
    if not products:
        return

    for product in products:
        tag_product = session.query(TagsProducts) \
            .where(TagsProducts.tag_id == tag.id, TagsProducts.product_id == product.id).first()

        # если запись уже есть в БД, перейти к следующему продукту
        if tag_product:
            continue

        tag_product = TagsProducts(id=str(uuid4()),
                                   tag_id=tag.id,
                                   product_id=product.id_product,
                                   created_at=datetime.now())

        try:
            session.add(tag_product)
            session.commit()
        except Exception as e:
            print(e)


# сопоставление тегов и продуктов Intelmeal
@router.post("/start/")
def start_tags_products_mapping(file: UploadFile,
                                session: Session = Depends(get_db),
                                current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    if file.filename != "для включения.ont" and file.filename != 'для исключения.ont':
        return JSONResponse({"error": f"Неверное наименования файла! "
                                      f"Обратитесь к подсказке на странице и скорректируйте название файла!"},
                            status_code=422)

    # проверить, что это именно онтология
    try:
        onto = OntoParser('', file)
    except ValueError as err:
        return JSONResponse({"error": f"{err}"}, status_code=422)

    uuid = str(uuid4())
    filename = f"{uuid} {file.filename}"

    status = ParsingSessions(id=uuid,
                             created_at=datetime.now(),
                             user_id=current_user.id,
                             filename=filename,
                             type='tag')
    try:
        session.add(status)
        session.commit()
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    # записать файл онтологии
    with open(f"./app/sources/tag_sources/{filename}", "w") as f:
        json.dump(onto.data, f)

    try:
        node = onto.get_first_node_by_name("Тег")
        tags = onto.get_nodes_linked_to(node, 'is_a')

        for tag in tags:
            # проверить, что в БД сохранен файл для данного тега
            tag_db = session.query(TagsReference).where(TagsReference.name == tag['name']).first()
            # если тега нет в БД, создать новую запись
            if not tag_db:
                tag_db = Tags(tag_name=tag['name'], filename=file.filename)
            # если у тега нет файла, добавить название файла
            if tag_db.filename != file.filename:
                tag_db.filename = file.filename
                try:
                    session.commit()
                except Exception as e:
                    print(e)

            # найти продукты для тега
            products = find_products_by_tag(tag, onto, session)

            # сохранить продукты
            add_tag_products_to_db(tag_db, products, session)

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"tag ontology parsing": "success"}


@router.get("/sessions/")
def get_tags_products_mapping_sessions(session: Session = Depends(get_db),
                                       current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return [
            {
                "datetime": x.created_at.date(),
                "filename": x.filename,
            } for x in session.query(ParsingSessions)
            .where(ParsingSessions.user_id == current_user.id, ParsingSessions.type == 'tag').all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/tags_products/")
def get_tags_products(page: int,
                      size: int,
                      session: Session = Depends(get_db),
                      current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    count = session.query(TagsProducts).count()

    try:
        return count, [
            {
                "value": str(x.id),
                "label": x.tag.name.lower() + " (" +
                         x.tag.filename.lower() + ") - " +
                         x.product.name.lower()
            } for x in session
            .query(TagsProducts)
            .join(TagsReference)
            .join(Products)
            .order_by(TagsProducts.id)
            .offset((page - 1) * size)
            .limit(size)
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
