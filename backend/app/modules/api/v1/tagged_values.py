from fastapi import APIRouter, Depends, Query, Path, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func, or_
from typing import Union
from datetime import datetime
from uuid import uuid4

from app.modules.db_context import get_db
from app.modules.schema.main.recipe_dish_tags_reference import RecipeDishTagsReference
from app.modules.schema.main.tagged_ingredient_statuses import TaggedIngredientStatuses
from app.modules.schema.main.tagged_ingredient_values import TaggedIngredientValues
from app.modules.schema.main.tagging_history import TaggingHistory
from app.modules.schema.public.users import Users
from .authentication import get_current_user

router = APIRouter()


@router.get("/read/")
def read_tagged_values(option: str,
                       session: Session = Depends(get_db),
                       current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    condition = "main.tagged_ingredient_statuses.status ='true'" \
        if option == 'verified' \
        else "main.tagged_ingredient_statuses.status ='false' OR main.tagged_ingredient_statuses.status IS NULL"

    try:
        values_query = f"SELECT main.primary_ingredients.id AS id, " \
                       f"main.primary_ingredients.name AS ingredient, " \
                       f"ARRAY_TO_STRING(" \
                       f"ARRAY(" \
                       f"SELECT main.recipe_dish_tags_reference.name " \
                       f"FROM main.recipe_dish_tags_reference " \
                       f"WHERE main.recipe_dish_tags_reference.id IN (" \
                       f"SELECT main.tagged_ingredient_values.tag_id " \
                       f"FROM main.tagged_ingredient_values " \
                       f"WHERE main.tagged_ingredient_values.ingredient_id = main.primary_ingredients.id) " \
                       f"ORDER BY main.recipe_dish_tags_reference.name), ', ') AS tags, " \
                       f"CASE " \
                       f"WHEN main.tagged_ingredient_statuses.status='true' " \
                       f"THEN 'проверено' " \
                       f"WHEN main.tagged_ingredient_statuses.status='false' " \
                       f"THEN 'не проверено' " \
                       f"ELSE 'не обработано' " \
                       f"END AS status, " \
                       f"CASE " \
                       f"WHEN public.users.login IS NULL " \
                       f"AND main.tagged_ingredient_statuses.status IS NULL " \
                       f"THEN 'не обработано' " \
                       f"WHEN public.users.login IS NOT NULL " \
                       f"THEN public.users.login " \
                       f"ELSE 'system' " \
                       f"END AS author " \
                       f"FROM main.tagged_ingredient_statuses " \
                       f"RIGHT JOIN main.primary_ingredients " \
                       f"ON main.tagged_ingredient_statuses.ingredient_id = main.primary_ingredients.id " \
                       f"LEFT JOIN public.users " \
                       f"ON main.tagged_ingredient_statuses.author_id = public.users.id " \
                       f"WHERE {condition} " \
                       f"ORDER BY main.primary_ingredients.name"

        values = session.execute(values_query).fetchall()

        history_query = f"SELECT * " \
                        f"FROM main.tagging_history " \
                        f"WHERE main.tagging_history.author_id = '{current_user.id}'" \
                        f"ORDER BY main.tagging_history.created_at DESC " \
                        f"LIMIT 1"
        history = session.execute(history_query).fetchone()

        if history:
            return values, history.page
        else:
            return values, 0

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.put("/update/")
def update_tagged_values(primary_id: str,
                         items: list[str] = Query(None),
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        tagged_status = session.query(TaggedIngredientStatuses) \
            .where(TaggedIngredientStatuses.ingredient_id == primary_id).first()

        # если ингредиент еще не был обработан при автоматическом тегировании
        if not tagged_status:
            tagged_status = TaggedIngredientStatuses(id=str(uuid4()),
                                                     ingredient_id=primary_id,
                                                     status=True,
                                                     author_id=current_user.id,
                                                     created_at=datetime.now(),
                                                     controller_id=current_user.id,
                                                     verified_at=datetime.now())
            if items:
                for item in items:
                    value = TaggedIngredientValues(id=str(uuid4()),
                                                   ingredient_id=primary_id,
                                                   tag_id=item,
                                                   created_at=datetime.now())
                    session.add(value)

        # если ингредиент был обработан при автоматическом или экспертном тегировании
        else:
            tagged_values = session.query(TaggedIngredientValues) \
                .where(TaggedIngredientValues.ingredient_id == primary_id).all()

            tagged_values = [value.tag_id for value in tagged_values]

            values_to_add = []
            values_to_delete = []

            if items and not tagged_values:
                values_to_add.extend(items)

            if not items and tagged_values:
                values_to_delete.extend(tagged_values)

            if items and tagged_values:
                tags = session.query(RecipeDishTagsReference).all()
                for tag in tags:
                    if tag.id in items and tag.id not in tagged_values:
                        values_to_add.append(tag.id)

                    if tag.id not in items and tag.id in tagged_values:
                        values_to_delete.append(tag.id)

            tagged_status.status = True
            tagged_status.controller_id = current_user.id
            tagged_status.verified_at = datetime.now()
            if values_to_add or values_to_delete:
                tagged_status.author_id = current_user.id

            for value in values_to_add:
                new_tagged_value = TaggedIngredientValues(id=str(uuid4()),
                                                          ingredient_id=primary_id,
                                                          tag_id=value,
                                                          created_at=datetime.now())
                session.add(new_tagged_value)

            for value in values_to_delete:
                query = f"DELETE " \
                        f"FROM main.tagged_ingredient_values " \
                        f"WHERE main.tagged_ingredient_values.ingredient_id = '{primary_id}' " \
                        f"AND main.tagged_ingredient_values.tag_id = '{value}'"

                session.execute(query)

        session.add(tagged_status)
        session.commit()
        return {"result": "Редактирование: внесенные изменения были сохранены БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.put("/verify/")
def verify_tagged_values(items: list[str] = Query(None),
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        for item in items:
            tagged_status = session.query(TaggedIngredientStatuses) \
                .where(TaggedIngredientValues.ingredient_id == item).first()

            if not tagged_status:
                tagged_status = TaggedIngredientStatuses(id=str(uuid4()),
                                                         ingredient_id=item,
                                                         status=True,
                                                         author_id=current_user.id,
                                                         created_at=datetime.now(),
                                                         controller_id=current_user.id,
                                                         verified_at=datetime.now())
            else:
                tagged_status.status = True
                tagged_status.controller_id = current_user.id
                tagged_status.verified_at = datetime.now()

            session.add(tagged_status)

        session.commit()

        return {"result": "Проверка: внесенные изменения были сохранены БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.post("/history/")
def save_tagged_values_history(page: int,
                               session: Session = Depends(get_db),
                               current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        query = f"SELECT * " \
                f"FROM main.tagging_history " \
                f"WHERE main.tagging_history.author_id = '{current_user.id}'" \
                f"ORDER BY main.tagging_history.created_at DESC " \
                f"LIMIT 1"

        history = session.execute(query).fetchone()

        # история тегирования есть в БД
        if history:
            new_history = session.query(TaggingHistory) \
                .where(TaggingHistory.id == history[0]) \
                .first()
            new_history.page = page
            new_history.created_at = datetime.now()
        # истории тегирования нет в БД
        else:
            new_history = TaggingHistory(id=str(uuid4()),
                                         page=page,
                                         author_id=current_user.id,
                                         created_at=datetime.now())
            session.add(new_history)
        session.commit()

        return {"result": "История обработки сохранена в БД!"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
