from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from typing import Union
from uuid import uuid4
from datetime import datetime

from app.modules.db_context import get_db
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


@router.get("/deleted_mapped_values/")
def get_data_deleted_mapped_values(session: Session = Depends(get_db),
                                   current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.deleted_mapped_values.id AS id, " \
                "main.deleted_mapped_values.ingredient_id AS ingredient_id, " \
                "(SELECT main.ingredients.name " \
                "FROM main.ingredients " \
                "WHERE main.ingredients.id = main.deleted_mapped_values.ingredient_id) " \
                "AS ingredient_name, " \
                "main.deleted_mapped_values.primary_id AS primary_id, " \
                "(SELECT main.primary_ingredients.name " \
                "FROM main.primary_ingredients " \
                "WHERE main.primary_ingredients.id = main.deleted_mapped_values.primary_id) " \
                "AS primary_name, " \
                "main.deleted_mapped_values.author_id AS author_id, " \
                "(SELECT public.users.login " \
                "FROM public.users " \
                "WHERE public.users.id = main.deleted_mapped_values.author_id) " \
                "AS author_login, " \
                "main.deleted_mapped_values.created_at AS created_at " \
                "FROM main.deleted_mapped_values "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/mapped_ingredient_values/")
def get_data_mapped_ingredient_values(session: Session = Depends(get_db),
                                      current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.mapped_ingredient_values.id AS id, " \
                "main.mapped_ingredient_values.ingredient_id AS ingredient_id, " \
                "(SELECT main.ingredients.name " \
                "FROM main.ingredients " \
                "WHERE main.ingredients.id = main.mapped_ingredient_values.ingredient_id) " \
                "AS ingredient_name, " \
                "main.mapped_ingredient_values.primary_id AS primary_id, " \
                "(SELECT main.primary_ingredients.name " \
                "FROM main.primary_ingredients " \
                "WHERE main.primary_ingredients.id = main.mapped_ingredient_values.primary_id) " \
                "AS primary_name, " \
                "main.mapped_ingredient_values.status AS status, " \
                "main.mapped_ingredient_values.author_id AS author_id, " \
                "(SELECT public.users.login " \
                "FROM public.users " \
                "WHERE public.users.id = main.mapped_ingredient_values.author_id) " \
                "AS author_login, " \
                "main.mapped_ingredient_values.created_at AS created_at, " \
                "main.mapped_ingredient_values.controller_id AS controller_id, " \
                "(SELECT public.users.login " \
                "FROM public.users " \
                "WHERE public.users.id = main.mapped_ingredient_values.controller_id) " \
                "AS controller_login, " \
                "main.mapped_ingredient_values.verified_at AS verified_at " \
                "FROM main.mapped_ingredient_values "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/mapping_logs/")
def get_data_mapping_logs(session: Session = Depends(get_db),
                          current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.mapping_logs.id AS id, " \
                "main.mapping_logs.ingredient_id AS ingredient_id, " \
                "(SELECT main.ingredients.name " \
                "FROM main.ingredients " \
                "WHERE main.ingredients.id = main.mapping_logs.ingredient_id) " \
                "AS ingredient_name, " \
                "main.mapping_logs.log AS log, " \
                "main.mapping_logs.created_at AS created_at " \
                "FROM main.mapping_logs "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/tagged_ingredient_statuses/")
def get_data_tagged_ingredient_statuses(session: Session = Depends(get_db),
                                        current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.tagged_ingredient_statuses.id AS id, " \
                "main.tagged_ingredient_statuses.ingredient_id AS ingredient_id, " \
                "(SELECT main.primary_ingredients.name " \
                "FROM main.primary_ingredients " \
                "WHERE main.primary_ingredients.id = main.tagged_ingredient_statuses.ingredient_id) " \
                "AS ingredient_name, " \
                "main.tagged_ingredient_statuses.status AS status, " \
                "main.tagged_ingredient_statuses.author_id AS author_id, " \
                "(SELECT public.users.login " \
                "FROM public.users " \
                "WHERE public.users.id = main.tagged_ingredient_statuses.author_id) " \
                "AS author_login, " \
                "main.tagged_ingredient_statuses.created_at AS created_at, " \
                "main.tagged_ingredient_statuses.controller_id AS controller_id, " \
                "(SELECT public.users.login " \
                "FROM public.users " \
                "WHERE public.users.id = main.tagged_ingredient_statuses.controller_id) " \
                "AS controller_login, " \
                "main.tagged_ingredient_statuses.verified_at AS verified_at " \
                "FROM main.tagged_ingredient_statuses "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/tagged_ingredient_values/")
def get_data_tagged_ingredient_values(session: Session = Depends(get_db),
                                      current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.tagged_ingredient_values.id AS id, " \
                "main.tagged_ingredient_values.ingredient_id AS ingredient_id, " \
                "(SELECT main.primary_ingredients.name " \
                "FROM main.primary_ingredients " \
                "WHERE main.primary_ingredients.id = main.tagged_ingredient_values.ingredient_id) " \
                "AS ingredient_name, " \
                "main.tagged_ingredient_values.tag_id AS tag_id, " \
                "(SELECT main.recipe_dish_tags_reference.name " \
                "FROM main.recipe_dish_tags_reference " \
                "WHERE main.recipe_dish_tags_reference.id = main.tagged_ingredient_values.tag_id) " \
                "AS tag_name, " \
                "main.tagged_ingredient_values.created_at AS created_at " \
                "FROM main.tagged_ingredient_values "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/reference_ingredients/")
def get_data_reference_ingredients(session: Session = Depends(get_db),
                                   current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.reference_ingredients.id AS id, " \
                "main.reference_ingredients.reference_id AS reference_id, " \
                "(SELECT public.products.name " \
                "FROM public.products " \
                "WHERE public.products.id = main.reference_ingredients.reference_id) " \
                "AS reference_name, " \
                "main.reference_ingredients.primary_id AS primary_id, " \
                "(SELECT main.primary_ingredients.name " \
                "FROM main.primary_ingredients " \
                "WHERE main.primary_ingredients.id = main.reference_ingredients.primary_id) " \
                "AS primary_name, " \
                "main.reference_ingredients.created_at AS created_at " \
                "FROM main.reference_ingredients "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/primary_ingredients/")
def get_data_primary_ingredients(session: Session = Depends(get_db),
                                 current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT main.primary_ingredients.id AS primary_id, " \
                "main.primary_ingredients.name AS primary_name, " \
                "main.primary_ingredients.created_at AS created_ad " \
                "FROM main.primary_ingredients "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/products/")
def get_data_products(session: Session = Depends(get_db),
                      current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)
    try:
        query = "SELECT public.products.id AS product_id, " \
                "public.products.name AS product_name, " \
                "public.products.category_id AS category_id, " \
                "(SELECT public.product_list_categories.name " \
                "FROM public.product_list_categories " \
                "WHERE public.product_list_categories.id = public.products.category_id) " \
                "AS category_name, " \
                "public.products.source AS source, " \
                "public.products.link AS link, " \
                "public.products.created_at AS created_at " \
                "FROM public.products "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
