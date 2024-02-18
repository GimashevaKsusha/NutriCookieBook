from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from typing import Union
from uuid import uuid4
from datetime import datetime
import json

from app.modules.db_context import get_db
from app.modules.schema.main.deleted_mapped_values import DeletedMappedValues
from app.modules.schema.main.mapped_ingredient_values import MappedIngredientValues
from app.modules.schema.main.mapping_history import MappingHistory
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


@router.post("/create/")
def create_mapped_values(ingredient_id: str,
                         primary_id: str,
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        value = session \
            .query(MappedIngredientValues) \
            .where(MappedIngredientValues.ingredient_id == ingredient_id,
                   MappedIngredientValues.primary_id == primary_id) \
            .first()

        if value:
            return JSONResponse({"error": "Добавление: выбранная пара значений уже содержится в БД!"}, status_code=422)

        mapped_values = MappedIngredientValues(id=str(uuid4()),
                                               ingredient_id=ingredient_id,
                                               primary_id=primary_id,
                                               status=True,
                                               author_id=current_user.id,
                                               created_at=datetime.now(),
                                               controller_id=current_user.id,
                                               verified_at=datetime.now())
        session.add(mapped_values)
        session.commit()
        return {"result": "Добавление: внесенные изменения были сохранены БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/read/")
def read_mapped_values(letter: str,
                       option: str,
                       session: Session = Depends(get_db),
                       current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    flag = 'true' if option == 'verified' else 'false'

    try:
        query = f"SELECT main.mapped_ingredient_values.id AS id, " \
                f"main.ingredients.name AS practical_ingredient, " \
                f"main.primary_ingredients.name AS primary_ingredient, " \
                f"CASE " \
                f"WHEN main.mapped_ingredient_values.status='true' " \
                f"THEN 'проверено' " \
                f"ELSE 'не проверено' " \
                f"END AS status, " \
                f"COALESCE(public.users.login, 'system') AS author " \
                f"FROM main.mapped_ingredient_values " \
                f"JOIN main.ingredients " \
                f"ON main.mapped_ingredient_values.ingredient_id = main.ingredients.id " \
                f"JOIN main.primary_ingredients " \
                f"ON main.mapped_ingredient_values.primary_id = main.primary_ingredients.id " \
                f"LEFT JOIN public.users " \
                f"ON main.mapped_ingredient_values.author_id = public.users.id " \
                f"WHERE main.ingredients.name LIKE '{letter}%'" \
                f"AND main.mapped_ingredient_values.status = '{flag}' " \
                f"ORDER BY main.ingredients.name, main.primary_ingredients.name "

        values = session.execute(query)
        return values.fetchall()

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.put("/update/")
def update_mapped_values(value_id: str,
                         ingredient_id: str,
                         primary_id: str,
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        value = session \
            .query(MappedIngredientValues) \
            .where(MappedIngredientValues.id == value_id) \
            .first()

        if not value:
            return JSONResponse({"error": "Редактирование: выбранная пара значений была удалена из БД!"},
                                status_code=422)

        new_value = session \
            .query(MappedIngredientValues) \
            .where(MappedIngredientValues.ingredient_id == ingredient_id,
                   MappedIngredientValues.primary_id == primary_id) \
            .first()

        if new_value and new_value.id != value_id:
            return JSONResponse({"error": "Редактирование: выбранная пара значений уже содержится в БД!"},
                                status_code=422)

        value.status = True
        value.controller_id = current_user.id
        value.verified_at = datetime.now()
        if value.ingredient_id != ingredient_id or value.primary_id != primary_id:
            value.ingredient_id = ingredient_id
            value.primary_id = primary_id
            value.author_id = current_user.id

        session.commit()
        return {"result": "Редактирование: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.delete("/delete/")
def delete_mapped_values(items: list[str] = Query(None),
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        for item in items:
            value = session \
                .query(MappedIngredientValues) \
                .where(MappedIngredientValues.id == item) \
                .first()

            if value:
                deleted_value = DeletedMappedValues(id=str(uuid4()),
                                                    ingredient_id=value.ingredient_id,
                                                    primary_id=value.primary_id,
                                                    author_id=current_user.id,
                                                    created_at=datetime.now())
                session.add(deleted_value)
                session.delete(value)

        session.commit()

        return {"result": "Удаление: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.put("/verify/")
def verify_mapped_values(items: list[str] = Query(None),
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        for item in items:
            value = session \
                .query(MappedIngredientValues) \
                .where(MappedIngredientValues.id == item) \
                .first()

            if value:
                value.status = True
                value.controller_id = current_user.id
                value.verified_at = datetime.now()

        session.commit()

        return {"result": "Проверка: внесенные изменения были сохранены в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/history/")
def save_mapped_values_history(page: int,
                               letter: str,
                               session: Session = Depends(get_db),
                               current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = f"SELECT * " \
                f"FROM main.mapping_history " \
                f"WHERE main.mapping_history.author_id = '{current_user.id}'" \
                f"ORDER BY main.mapping_history.created_at DESC " \
                f"LIMIT 1"

        history = session.execute(query).fetchone()

        # история сопоставления есть в БД
        if history:
            # если изменилась страница, то сохранить ее в текущей записи истории
            if history[1] != page:
                new_history = session.query(MappingHistory) \
                    .where(MappingHistory.id == history[0]) \
                    .first()
                new_history.page = page
                new_history.created_at = datetime.now()
            # если изменилась буква, то создать новую запись истории
            if history[2] != letter:
                new_history = MappingHistory(id=str(uuid4()),
                                             page=page,
                                             letter=letter,
                                             author_id=current_user.id,
                                             created_at=datetime.now())
                session.add(new_history)
        # истории сопоставления нет в БД
        else:
            new_history = MappingHistory(id=str(uuid4()),
                                         page=page,
                                         letter=letter,
                                         author_id=current_user.id,
                                         created_at=datetime.now())
            session.add(new_history)
        session.commit()

        return {"result": "История обработки сохранена в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

