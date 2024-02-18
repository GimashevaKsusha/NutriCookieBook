from fastapi import APIRouter, Depends, Query, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
import sqlite3
from uuid import uuid4
from datetime import datetime
from openpyxl import load_workbook

from app.modules.db_context import get_db
from app.modules.schema.main.ingredients import Ingredients
from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.main.recipe_dish_preparation_methods_reference import RecipeDishPreparationMethodsReference
from app.modules.schema.main.recipe_dish_units_reference import RecipeDishUnitsReference
from app.modules.schema.main.recipe_ingredients import RecipeIngredients
from app.modules.schema.main.recipes import Recipes
from app.modules.schema.main.reference_ingredients import ReferenceIngredients
from app.modules.schema.public.product_list_categories import ProductListCategories
from app.modules.schema.public.products import Products
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


@router.post("/primary_ingredients/")
def transfer_primary_ingredients(filename: str,
                                 session: Session = Depends(get_db),
                                 current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        workbook = load_workbook(f"./app/sources/intelmeal/{filename}")

        for worksheet in workbook:
            category = session \
                .query(ProductListCategories) \
                .where(ProductListCategories.name == worksheet.title) \
                .first()

            count = 2
            while worksheet[f"B{count}"].value is not None:

                if worksheet[f"C{count}"].value is None:
                    count = count + 1
                    continue
                else:
                    primary_name = worksheet[f"C{count}"].value.strip()
                    primary = session \
                        .query(PrimaryIngredients) \
                        .where(PrimaryIngredients.name.ilike(primary_name)) \
                        .first()

                    if not primary:
                        primary = PrimaryIngredients(id=str(uuid4()),
                                                     name=primary_name,
                                                     created_at=datetime.now(),
                                                     author_id=None)
                        session.add(primary)
                        session.commit()

                    product_name = worksheet[f"B{count}"].value.strip()
                    product = session \
                        .query(Products) \
                        .where(Products.name == product_name, Products.category_id == category.id) \
                        .first()

                    print(product_name)

                    reference = ReferenceIngredients(id=str(uuid4()),
                                                     reference_id=product.id,
                                                     primary_id=primary.id,
                                                     created_at=datetime.now(),
                                                     author_id=None)
                    session.add(reference)

                count = count + 1

        session.commit()
        return {"result": "all primary_ingredients added to database"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/ingredients/")
def transfer_ingredients(filename: str,
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    connection = None
    try:
        connection = sqlite3.connect(f"./app/sources/web_sources/{filename}", check_same_thread=False)
        cursor = connection.cursor()
        cursor.execute("SELECT id, name FROM ingredients")
        connection.commit()
        result = cursor.fetchall()
        cursor.close()
    except sqlite3.Error as err:
        raise Exception(f"Ошибка при работе с sqlite! {err}")
    finally:
        if connection:
            connection.close()

    try:
        for res in result:
            ingredient = session.query(Ingredients) \
                .where(Ingredients.name == res[1]) \
                .first()

            if ingredient:
                continue

            ingredient = Ingredients(id=res[0],
                                     name=res[1],
                                     consultant_id=None,
                                     created_at=datetime.now())
            session.add(ingredient)
            session.commit()
        return {"result": "all ingredients added to database"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/recipes/")
def transfer_recipes(filename: str,
                     session: Session = Depends(get_db),
                     current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    connection = None
    try:
        connection = sqlite3.connect(f"./app/sources/web_sources/{filename}", check_same_thread=False)
        cursor = connection.cursor()
        cursor.execute("SELECT id, name, description, image FROM recipes")
        connection.commit()
        result = cursor.fetchall()
        cursor.close()
    except sqlite3.Error as err:
        raise Exception(f"Ошибка при работе с sqlite! {err}")
    finally:
        if connection:
            connection.close()

    method = session \
        .query(RecipeDishPreparationMethodsReference) \
        .where(RecipeDishPreparationMethodsReference.name == "не указано") \
        .first()

    unit = session \
        .query(RecipeDishUnitsReference) \
        .where(RecipeDishUnitsReference.name == "г",
               RecipeDishUnitsReference.type == "Dish") \
        .first()

    try:
        for res in result:
            id = res[0]
            name = res[1]
            description = res[2]
            image = None if "no-photo" in res[3] else res[3]

            recipe = session.query(Recipes) \
                .where(Recipes.name == name, Recipes.description == description) \
                .first()

            if recipe:
                continue

            recipe = Recipes(id=id,
                             name=name,
                             description=description,
                             method_id=method.id,
                             preview_url=image,
                             photo_file_id=None,
                             consultant_id=None,
                             volume=0,
                             unit_volume_id=unit.id,
                             created_at=datetime.now())
            session.add(recipe)
            session.commit()
        return {"result": "all recipes added to database"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/recipe_ingredients/")
def transfer_recipe_ingredients(filename: str,
                                session: Session = Depends(get_db),
                                current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    recipes = session.query(Recipes).all()

    for r in recipes:

        connection = None
        try:
            connection = sqlite3.connect(f"./app/sources/web_sources/{filename}", check_same_thread=False)
            cursor = connection.cursor()
            cursor.execute(f"SELECT id, recipe_id, ingredient_id, amount "
                           f"FROM recipe_ingredients "
                           f"WHERE recipe_id = '{r.id}'")
            connection.commit()
            result = cursor.fetchall()
            cursor.close()
        except sqlite3.Error as err:
            raise Exception(f"Ошибка при работе с sqlite! {err}")
        finally:
            if connection:
                connection.close()

        try:
            for res in result:

                recipe_ingredient = session.query(RecipeIngredients) \
                    .where(RecipeIngredients.recipe_id == res[1],
                           RecipeIngredients.ingredient_id == res[2]) \
                    .first()

                if recipe_ingredient:
                    continue

                amount = res[3]
                value = 0
                unit = session.query(RecipeDishUnitsReference) \
                    .where(RecipeDishUnitsReference.type == "Ingredient",
                           RecipeDishUnitsReference.name == amount) \
                    .first()

                if not unit:
                    part_amount = amount.split()
                    if part_amount[0] == '⅔':
                        value = 0.67
                    elif part_amount[0] == '⅓':
                        value = 0.33
                    elif part_amount[0] == '¾':
                        value = 3 / 4
                    elif part_amount[0] == '½':
                        value = 1 / 2
                    elif part_amount[0] == '¼':
                        value = 1 / 4
                    else:
                        value = part_amount[0].replace(",", ".")

                    unit = session.query(RecipeDishUnitsReference) \
                        .where(RecipeDishUnitsReference.type == "Ingredient",
                               RecipeDishUnitsReference.name == part_amount[1]) \
                        .first()

                    if not unit:
                        if part_amount[1] == 'кг':
                            value = int(float(value) * 1000)
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'г') \
                                .first()
                        elif part_amount[1] == 'л':
                            value = int(float(value) * 1000)
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'мл') \
                                .first()
                        elif 'чайн' in part_amount[1]:
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'чайн. ложки') \
                                .first()
                        elif 'столов' in part_amount[1]:
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'ст. ложки') \
                                .first()
                        elif 'стакан' in part_amount[1]:
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'стакан') \
                                .first()
                        elif 'бан' in part_amount[1]:
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'банка') \
                                .first()
                        else:
                            unit = session.query(RecipeDishUnitsReference) \
                                .where(RecipeDishUnitsReference.type == "Ingredient",
                                       RecipeDishUnitsReference.name == 'шт') \
                                .first()

                recipe_ingredient = RecipeIngredients(id=res[0],
                                                      ingredient_id=res[2],
                                                      recipe_id=res[1],
                                                      volume=value,
                                                      unit_volume_id=unit.id,
                                                      created_at=datetime.now())

                session.add(recipe_ingredient)

            session.commit()

        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)

    return {"result": "all recipe_ingredients added to database"}
