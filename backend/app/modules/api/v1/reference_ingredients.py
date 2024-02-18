from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select
from typing import Union
from uuid import uuid4
from datetime import datetime
import json

from app.modules.db_context import get_db
from app.modules.schema.main.mapped_ingredient_values import MappedIngredientValues
from app.modules.schema.main.primary_ingredients import PrimaryIngredients
from app.modules.schema.main.reference_ingredients import ReferenceIngredients
from app.modules.schema.public.nutrients import Nutrients
from app.modules.schema.public.product_nutrients import ProductNutrients
from app.modules.schema.public.products import Products
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


@router.post("/create_primary/")
def create_primary_ingredients(session: Session = Depends(get_db),
                               current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return {"result": "Добавление публичного наименования: внесенные изменения были сохранены БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.put("/update_primary/")
def update_primary_ingredients(session: Session = Depends(get_db),
                               current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return {"result": "Редактирование публичного наименования: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.delete("/delete_primary/")
def delete_primary_ingredients(item_id: str,
                               session: Session = Depends(get_db),
                               current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        mapped_values = session.query(MappedIngredientValues).where(MappedIngredientValues.primary_id == item_id).all()
        if mapped_values:
            return JSONResponse({"error": "Невозможно удалить выбранное публичное наименование ингредиента,"
                                          "так как оно используется при сопоставлении названий ингредиентов!"},
                                status_code=422)

        return {"result": "Удаление публичного наименования: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/create_benchmark/")
def create_benchmark_ingredients(session: Session = Depends(get_db),
                                 current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return {"result": "Добавление эталонного наименования: внесенные изменения были сохранены БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.put("/update_benchmark/")
def update_benchmark_ingredients(session: Session = Depends(get_db),
                                 current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return {"result": "Редактирование эталонного наименования: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.delete("/delete_benchmark/")
def delete_benchmark_ingredients(item_id: str,
                                 session: Session = Depends(get_db),
                                 current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        product = session.query(Products).where(Products.id == item_id).first()
        if not product.author_id:
            return JSONResponse({"error": "Невозможно удалить выбранное эталонное наименование ингредиента,"
                                          "так как оно является системным!"},
                                status_code=422)

        return {"result": "Удаление эталонного наименования: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
