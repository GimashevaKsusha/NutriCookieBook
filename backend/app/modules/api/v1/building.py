from fastapi import APIRouter, Depends, Query, UploadFile, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func
from datetime import datetime
from uuid import uuid4
import json

from app.modules.db_context import get_db
from app.modules.schema.public.users import Users
from app.modules.builder import *
from .authentication import get_current_user

router = APIRouter()


# запустить парсинг сайта
@router.post("/start/")
def run_onto_builder(session: Session = Depends(get_db),
                     current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        filename = "Ingredient WordNet.ont"
        builder = OntoBuilder(f"{filename}", session)
        builder.start_building()
        builder.save_ontology()

        return FileResponse(f"./app/modules/builder//{filename}",
                            filename=filename,
                            media_type="application/octet-stream")

    except Exception as e:
        return JSONResponse({"error": f"Произошла ошибка! Процесс построения онтологии был прерван! {e}"}, status_code=500)
