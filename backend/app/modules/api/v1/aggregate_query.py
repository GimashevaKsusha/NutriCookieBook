from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from sqlalchemy.sql import text
from typing import Union

from app.modules.db_context import get_db
from app.modules.schema.public.nutrient_list_headers import NutrientListHeaders
from app.modules.schema.public.nutrients import Nutrients
from app.modules.schema.public.product_nutrients import ProductNutrients
from app.modules.schema.public.products import Products
from app.modules.schema.public.products_ingredients import ProductsIngredients
from app.modules.schema.public.recipe_ingredients import RecipeIngredients
from app.modules.schema.public.recipes import Recipes
from app.modules.schema.public.tags_products import TagsProducts
from app.modules.schema.public.tags_reference import TagsReference
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


def get_all_recipes(session, page, size):
    return [
        {
            "recipe_id": x.id,
            "recipe_name": x.name,
            "recipe_description": x.description,
            "recipe_method": x.method,
            "recipe_tags": x.tags,
            "recipe_ingredients": [
                {
                    "ingredient_id": y.ingredient.id,
                    "ingredient_name": y.ingredient.name,
                    "ingredient_amount": y.amount,
                    "ingredient_used": False
                } for y in session.query(RecipeIngredients).where(RecipeIngredients.recipe_id == x.id).all()
            ]
        } for x in session.query(Recipes).order_by(Recipes.id).offset((page - 1) * size).limit(size).all()
    ]


@router.get("/recipes/")
def get_list_of_recipes(page: int,
                        size: int,
                        session: Session = Depends(get_db),
                        current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    count = session.query(Recipes).count()

    try:
        return count, get_all_recipes(session, page, size)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/nutrients/")
def get_list_of_nutrients(session: Session = Depends(get_db),
                          current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return [
            {
                "value": str(x.id),
                "label": x.name.lower(),
                "children": [
                    {
                        "value": str(y.id),
                        "label": y.name.lower()
                    } for y in session.query(Nutrients).where(Nutrients.header_id == x.id).all()
                ]
            } for x in session.query(NutrientListHeaders).where(NutrientListHeaders.displayed).all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


def generate_sql_for_recipes_by_nutrients(page, size, items):
    params = ''
    for i in range(len(items)):
        params += "'" + items[i] + "'"
        if i != len(items) - 1:
            params += ", "

    text_all_recipes = f"SELECT COUNT(DISTINCT(r.id)) " \
                       f"FROM recipes AS r " \
                       f"JOIN recipe_ingredients AS ri " \
                       f"ON r.id = ri.recipe_id " \
                       f"WHERE ri.ingredient_id IN ({params})"

    text = f"SELECT DISTINCT(r.id), r.name, r.description, r.method, r.tags, " \
           f"(SELECT COUNT(*) FROM recipe_ingredients AS ri2 " \
           f"WHERE ri2.recipe_id = r.id " \
           f"AND ri2.ingredient_id IN ({params})) " \
           f"FROM recipes AS r " \
           f"JOIN recipe_ingredients AS ri " \
           f"ON r.id = ri.recipe_id " \
           f"WHERE ri.ingredient_id IN ({params}) " \
           f"ORDER BY (SELECT COUNT(*) FROM recipe_ingredients AS ri2 " \
           f"WHERE ri2.recipe_id = r.id " \
           f"AND ri2.ingredient_id IN ({params})) " \
           f"DESC " \
           f"OFFSET {(page - 1) * size} " \
           f"LIMIT {size}"

    return text_all_recipes, text


@router.get("/recipes_by_nutrients/")
def get_recipes_by_nutrients(page: int,
                             size: int,
                             items: list[str] = Query(None),
                             session: Session = Depends(get_db),
                             current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    if not items:
        count = session.query(Recipes).count()
        try:
            return count, get_all_recipes(session, page, size)
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)
    else:
        try:
            products = [
                x.product_id for x in
                session
                .execute(
                    select(ProductNutrients.product_id)
                    .where(ProductNutrients.nutrient_id.in_(items), ProductNutrients.amount > 0)
                    .group_by(ProductNutrients.product_id)
                    .having(func.count(ProductNutrients.product_id) == len(items)))
            ]

            if not products:
                return 0, []

            ingredients = [
                x.ingredient_id for x in
                session
                .execute(
                    select(ProductsIngredients.ingredient_id)
                    .distinct(ProductsIngredients.ingredient_id)
                    .where(ProductsIngredients.product_id.in_(products)))
            ]

            if not ingredients:
                return 0, []

            sql_all_recipes, sql = generate_sql_for_recipes_by_nutrients(page, size, ingredients)

            statement_all_recipes = text(sql_all_recipes)
            statement = text(sql)

            count = [row[0] for row in session.execute(statement_all_recipes)]

            return count[0], [
                {
                    "recipe_id": str(x[0]),
                    "recipe_name": x[1],
                    "recipe_description": x[2],
                    "recipe_method": x[3],
                    "recipe_tags": x[4],
                    "recipe_ingredients": [
                        {
                            "ingredient_id": y.ingredient.id,
                            "ingredient_name": y.ingredient.name,
                            "ingredient_amount": y.amount,
                            "ingredient_used": y.ingredient.id in ingredients,
                        } for y in
                        session.query(RecipeIngredients).where(RecipeIngredients.recipe_id == str(x[0])).all()
                    ]
                } for x in session.execute(statement)
            ]

        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/tags/")
def get_list_of_tags(session: Session = Depends(get_db),
                     current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return [
            {
                "value": str(x.id),
                "label": x.name.lower(),
            } for x in session.query(TagsReference).filter(TagsReference.filename != '').all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


def get_products_by_tags(session, tags):
    add_tags = [t.id for t in
                session.query(TagsReference)
                .where(TagsReference.id.in_(tags), TagsReference.filename == "для включения.ont")
                .all()]

    exclude_tags = [t.id for t in
                    session.query(TagsReference)
                    .where(TagsReference.id.in_(tags), TagsReference.filename == "для исключения.ont")
                    .all()]

    add_products = [p.product_id for p in
                    session.query(TagsProducts).where(TagsProducts.tag_id.in_(add_tags)).all()]

    exclude_products = [p.product_id for p in
                        session.query(TagsProducts).where(TagsProducts.tag_id.in_(exclude_tags)).all()]

    products = [
        x.id for x in
        session.query(Products)
        .where(~Products.id.in_(exclude_products)).all()]

    if add_products:
        result = [x for x in products if x in add_products]
        return result

    return products


def generate_sql_for_recipes_by_tags(page, size, items):
    params = ''
    for i in range(len(items)):
        params += "'" + items[i] + "'"
        if i != len(items) - 1:
            params += ", "

    text_all_recipes = f"SELECT DISTINCT(r.id) " \
                       f"FROM recipes AS r " \
                       f"JOIN recipe_ingredients AS ri " \
                       f"ON r.id = ri.recipe_id " \
                       f"WHERE ri.ingredient_id IN ({params}) " \
                       f"GROUP BY r.id " \
                       f"HAVING COUNT(ri.recipe_id) = (SELECT COUNT (ri2.recipe_id) " \
                       f"FROM recipe_ingredients ri2 " \
                       f"WHERE ri2.recipe_id = r.id)"

    text = f"SELECT DISTINCT(r.id), r.name, r.description, r.method, r.tags " \
           f"FROM recipes AS r " \
           f"JOIN recipe_ingredients AS ri " \
           f"ON r.id = ri.recipe_id " \
           f"WHERE ri.ingredient_id IN ({params}) " \
           f"GROUP BY r.id " \
           f"HAVING COUNT(ri.recipe_id) = (SELECT COUNT (ri2.recipe_id) " \
           f"FROM recipe_ingredients ri2 " \
           f"WHERE ri2.recipe_id = r.id) " \
           f"OFFSET {(page - 1) * size} " \
           f"LIMIT {size}"

    return text_all_recipes, text


@router.get("/recipes_by_tags/")
def get_recipes_by_tags(page: int,
                        size: int,
                        items: list[str] = Query(None),
                        session: Session = Depends(get_db),
                        current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    if not items:
        count = session.query(Recipes).count()
        try:
            return count, get_all_recipes(session, page, size)
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)
    else:
        try:

            products = get_products_by_tags(session, items)

            if not products:
                return 0, []

            ingredients = [
                x.ingredient_id for x in
                session
                .execute(
                    select(ProductsIngredients.ingredient_id)
                    .distinct(ProductsIngredients.ingredient_id)
                    .where(ProductsIngredients.product_id.in_(products)))
            ]

            if not ingredients:
                return 0, []

            sql_all_recipes, sql = generate_sql_for_recipes_by_tags(page, size, ingredients)

            statement_all_recipes = text(sql_all_recipes)
            statement = text(sql)

            count = [row[0] for row in session.execute(statement_all_recipes)]

            return len(count), [
                {
                    "recipe_id": str(x[0]),
                    "recipe_name": x[1],
                    "recipe_description": x[2],
                    "recipe_method": x[3],
                    "recipe_tags": x[4],
                    "recipe_ingredients": [
                        {
                            "ingredient_id": y.ingredient.id,
                            "ingredient_name": y.ingredient.name,
                            "ingredient_amount": y.amount,
                            "ingredient_used": True
                        } for y in
                        session.query(RecipeIngredients).where(RecipeIngredients.recipe_id == str(x[0])).all()
                    ]
                } for x in session.execute(statement)
            ]
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/user_query/")
def get_user_query(type: int,
                   items: list[str] = Query(None),
                   session: Session = Depends(get_db),
                   current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    if not items:
        return "———"
    try:
        if type == 1:
            elements = [
                x.name.lower() for x in
                session
                .execute(
                    select(Nutrients.name)
                    .where(Nutrients.id.in_(items)))
            ]
        else:
            elements = [
                x.name.lower() for x in
                session
                .execute(
                    select(TagsReference.name)
                    .where(TagsReference.id.in_(items)))
            ]

        return "; ".join(elements)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
