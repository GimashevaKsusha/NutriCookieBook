from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select
from typing import Union

from app.modules.smart_recipes.models import *
from app.modules.db_context import get_db

router = APIRouter()


@router.get("/recipes/by_products/")
def find_recipes(products: list[str] = Query(None), session: Session = Depends(get_db)):
    try:
        return [
            {
                "recipe_name": x.recipe.recipe_name,
                "method": x.recipe.cooking_method,
                "source": x.recipe.source,
                "ingredients": [
                    {
                        "ingredient_name": y.ingredient.ingredient_name,
                        "amount": y.amount,
                        "unit": y.unit.unit_name
                    } for y in session.query(Compositions).where(Compositions.recipe_id == x.recipe_id).all()
                ]
            } for x in session.query(Compositions).join(Ingredients).where(Ingredients.ingredient_name.in_(products))
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/recipes/new")
def add_recipe(recipe_name: str, cooking_method: str, source: str, session: Session = Depends(get_db)):
    recipe_name = recipe_name.strip(" ")
    cooking_method = cooking_method.strip(" ")
    source = source.strip(" ")
    if recipe_name == "" or cooking_method == "" or source == "":
        return JSONResponse({"error": "parameters can't be empty"}, status_code=422)

    recipe = Recipes(recipe_name=recipe_name, cooking_method=cooking_method, source=source)
    try:
        session.add(recipe)
        session.commit()
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"recipe adding status": "success"}


@router.get("/recipes")
def read_recipes(session: Session = Depends(get_db)):
    try:
        return [
            {
                "id": x.id_recipe,
                "recipe_name": x.recipe_name,
                "method": x.cooking_method,
                "source": x.source,
                "ingredients": [
                    {
                        "iid": y.ingredient.id_ingredient,
                        "ingredient_name": y.ingredient.ingredient_name,
                        "amount": y.amount,
                        "unit": y.unit.unit_name
                    } for y in session.query(Compositions).where(Compositions.recipe_id == x.id_recipe).all()
                ]
            } for x in session.query(Recipes).order_by(Recipes.id_recipe).all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/recipes/{recipe_id}")
def read_recipe_by_name(recipe_id: int, session: Session = Depends(get_db)):
    r = session.query(Recipes).where(Recipes.id_recipe == recipe_id).first()
    try:
        return {
            "id": r.id_recipe,
            "recipe_name": r.recipe_name,
            "method": r.cooking_method,
            "ingredients": [
                {
                    "iid": y.ingredient.id_ingredient,
                    "ingredient_name": y.ingredient.ingredient_name,
                    "amount": y.amount,
                    "unit": y.unit.unit_name
                } for y in session.query(Compositions).where(Compositions.recipe_id == r.id_recipe).all()
            ]
        }
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/recipes/{recipe_id}/ingredients/add")
def add_ingredient(recipe_id: int, ingredient_name: str, unit_name: str,
                   amount: Union[float, None] = Query(default=None),
                   session: Session = Depends(get_db)):
    ingredient_name = ingredient_name.strip(" ")
    unit_name = unit_name.strip(" ").lower()
    if ingredient_name == "" or unit_name == "":
        return JSONResponse({"error": "parameters can't be empty"}, status_code=422)

    unit = session.query(Units).filter(Units.unit_name.ilike(unit_name)).first()
    if not unit:
        return JSONResponse({"error": "unit with this unit_name doesn't exist"}, status_code=404)

    if unit_name == "по вкусу" and amount is not None or \
            unit_name != "по вкусу" and amount is None:
        return JSONResponse({"error": "invalid amount format for this unit_name"}, status_code=422)

    ingredient = session.query(Ingredients).filter(Ingredients.ingredient_name.ilike(ingredient_name)).first()
    if not ingredient:
        ingredient = Ingredients(ingredient_name=ingredient_name)
        try:
            session.add(ingredient)
            session.commit()
        except Exception as e:
            return JSONResponse({"error": str(e)}, status_code=500)

    composition = Compositions(recipe_id=recipe_id, ingredient_id=ingredient.id_ingredient, amount=amount,
                               unit_id=unit.id_unit)
    try:
        session.add(composition)
        session.commit()
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"ingredient adding status": "success"}


@router.put("/recipes/{recipe_id}")
def update_recipe(recipe_id: int, recipe_name: Union[str, None] = Query(default=None),
                  cooking_method: Union[str, None] = Query(default=None),
                  session: Session = Depends(get_db)):
    recipe = session.query(Recipes).where(Recipes.id_recipe == recipe_id).first()

    if recipe is None:
        return JSONResponse({"error": "recipe doesn't exist"}, status_code=404)
    if (recipe.recipe_name == recipe_name or recipe_name is None) and \
            (recipe.cooking_method == cooking_method or cooking_method is None):
        return JSONResponse({"error": "there is no information to update"}, status_code=403)

    if recipe_name is not None:
        recipe_name = recipe_name.strip(" ")
        recipe.recipe_name = recipe_name
    if cooking_method is not None:
        cooking_method = cooking_method.strip(" ")
        recipe.cooking_method = cooking_method

    try:
        session.commit()
    except Exception as e:
        print(e)
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"recipe updating status": "success"}


@router.put("/recipes/{recipe_id}/ingredients/delete")
def delete_ingredient(recipe_id: int, ingredient_id: int, session: Session = Depends(get_db)):
    composition = session.query(Compositions).where(Compositions.recipe_id == recipe_id,
                                                    Compositions.ingredient_id == ingredient_id).first()

    if composition is None:
        return JSONResponse({"error": "this ingredient is not in the recipe"}, status_code=404)

    try:
        session.delete(composition)
        session.commit()
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"recipe updating status": "success"}


@router.delete("/recipes/{recipe_id}/delete")
def delete_recipe(recipe_id: int, session: Session = Depends(get_db)):
    recipe = session.query(Recipes).where(Recipes.id_recipe == recipe_id).first()

    if recipe is None:
        return JSONResponse({"error": "recipe doesn't exist"}, status_code=404)

    try:
        session.query(Compositions).filter(Compositions.recipe_id == recipe.id_recipe).delete()
        session.delete(recipe)
        session.commit()
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

    return {"recipe deleting status": "success"}
