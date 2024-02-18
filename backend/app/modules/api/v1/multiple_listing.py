from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from typing import Union
from uuid import uuid4
from datetime import datetime

from app.modules.db_context import get_db
from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.main.recipe_dish_tags_reference import RecipeDishTagsReference
from app.modules.schema.main.reference_ingredients import ReferenceIngredients
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


@router.get("/first_letters/")
def get_first_letters_of_ingredients(session: Session = Depends(get_db),
                                     current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        letters_query = "SELECT DISTINCT SUBSTRING(i.name, 1, 1) as letter " \
                        "FROM main.ingredients i " \
                        "ORDER BY letter"
        letters = session.execute(letters_query).fetchall()

        history_query = f"SELECT * " \
                        f"FROM main.mapping_history " \
                        f"WHERE main.mapping_history.author_id = '{current_user.id}'" \
                        f"ORDER BY main.mapping_history.created_at DESC " \
                        f"LIMIT 1"
        history = session.execute(history_query).fetchone()

        if history:
            return letters, history.letter, history.page
        else:
            return letters, letters[0].letter, 0

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/benchmark_ingredients_with_categories/")
def get_benchmark_ingredients_with_categories(primary: str,
                                              session: Session = Depends(get_db),
                                              current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        value = session.query(PrimaryIngredients).where(PrimaryIngredients.name == primary).first()

        query = f"SELECT main.reference_ingredients.reference_id AS id, " \
                f"public.product_list_categories.name AS category, " \
                f"public.products.name AS benchmark " \
                f"FROM main.reference_ingredients " \
                f"JOIN public.products " \
                f"ON main.reference_ingredients.reference_id = public.products.id " \
                f"JOIN public.product_list_categories " \
                f"ON public.products.category_id = public.product_list_categories.id " \
                f"WHERE main.reference_ingredients.primary_id = '{value.id}'" \
                f"ORDER BY public.products.name "
        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/unadapted_benchmark_ingredients_with_categories/")
def get_unadapted_benchmark_ingredients_with_categories(primary: str,
                                                        session: Session = Depends(get_db),
                                                        current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        value = session.query(PrimaryIngredients).where(PrimaryIngredients.name == primary).first()

        query = f"SELECT main.reference_ingredients.reference_id AS id, " \
                f"public.product_list_categories.name AS category, " \
                f"public.products.name AS benchmark " \
                f"FROM main.reference_ingredients " \
                f"JOIN public.products " \
                f"ON main.reference_ingredients.reference_id = public.products.id " \
                f"JOIN public.product_list_categories " \
                f"ON public.products.category_id = public.product_list_categories.id " \
                f"WHERE main.reference_ingredients.primary_id = '{value.id}'" \
                f"ORDER BY public.products.name "
        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/benchmark_ingredients/")
def get_benchmark_ingredients(primary: str,
                              session: Session = Depends(get_db),
                              current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = f"SELECT main.reference_ingredients.reference_id AS id, " \
                f"public.products.name AS label " \
                f"FROM main.reference_ingredients " \
                f"JOIN public.products " \
                f"ON main.reference_ingredients.reference_id = public.products.id " \
                f"WHERE main.reference_ingredients.primary_id = '{primary}'" \
                f"ORDER BY public.products.name "
        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/unadapted_benchmark_ingredients/")
def get_unadapted_benchmark_ingredients(session: Session = Depends(get_db),
                                        current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = f"SELECT public.products.id AS id, " \
                f"public.products.name AS label " \
                f"FROM public.products " \
                f"WHERE public.products.id NOT IN (" \
                f"SELECT main.reference_ingredients.reference_id " \
                f"FROM main.reference_ingredients) " \
                f"ORDER BY public.products.name"
        values = session.execute(query).fetchall()
        return values

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/primary_ingredients/")
def get_primary_ingredients(session: Session = Depends(get_db),
                            current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = 'SELECT main.primary_ingredients.id AS id, ' \
                'main.primary_ingredients.name AS label ' \
                'FROM main.primary_ingredients ' \
                'ORDER BY main.primary_ingredients.name '
        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/practical_ingredients/")
def get_practical_ingredients(session: Session = Depends(get_db),
                              current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = 'SELECT main.ingredients.id AS id, ' \
                'main.ingredients.name AS label ' \
                'FROM main.ingredients ' \
                'ORDER BY main.ingredients.name '
        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/tags_reference/")
def get_tags_reference(session: Session = Depends(get_db),
                       current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return [
            {
                "value": 1,
                "label": "выбрать все наименования тегов из представленного списка",
                "children": [
                    {
                        "value": x.id,
                        "label": x.name.lower(),
                    } for x in session.query(RecipeDishTagsReference).order_by(RecipeDishTagsReference.name).all()
                ]
            }
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
