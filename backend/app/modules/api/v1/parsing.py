from fastapi import APIRouter, Depends, Query, UploadFile, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func
from datetime import datetime
from uuid import uuid4
import json
import sqlite3

from app.modules.db_context import get_db
from app.modules.schema.public.parsing_sessions import ParsingSessions
from app.modules.schema.public.parsing_themes import ParsingThemes
from app.modules.schema.public.users import Users
from app.modules.parser import *
from .authentication import get_current_user

router = APIRouter()


# запустить парсинг сайта
@router.post("/start/")
def run_web_parser(filename: str,
                   session: Session = Depends(get_db),
                   current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    # проверить, что это именно онтология
    try:
        parser = WebParser(f"./app/sources/web_sources/{filename}", session)
    except ValueError as err:
        return JSONResponse({"error": f"{err}"}, status_code=422)

    try:
        result = parser.start_parsing()

        with open(f"./app/sources/web_sources/{filename}", "w") as f:
            json.dump(parser.onto.data, f)

        return result
    except Exception as e:
        return JSONResponse({"error": f"Произошла ошибка! Парсинг был прерван! {e}"}, status_code=500)


@router.post("/customize/")
def customize_web_parser(theme: str,
                         data: str,
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    file = session.query(ParsingThemes).where(ParsingThemes.id == theme).first()
    try:
        onto = OntoParser(f"./app/sources/web_sources/{file.filename}")
    except ValueError as err:
        return JSONResponse({"error": f"{err}"}, status_code=422)

    try:
        web_structure = onto.get_first_node_by_name('Получить HTML головной страницы')
        subject_structure = onto.get_first_node_by_name('Получить теги категорий')
        db_file = onto.get_first_node_by_name('Создать таблицы БД')

        parsing_info = json.loads(data)

        for info in parsing_info:
            if info[0] in web_structure['attributes'] and info[0] != 'theme':
                onto.set_attribute(web_structure, info[0], info[1].strip("/"))

            if info[0] in subject_structure['attributes']:
                params = json.loads(info[1])
                for p in params:
                    onto.set_attribute_for_subject(subject_structure, info[0], p[0], p[1])

        uuid = str(uuid4())
        site = web_structure['attributes']['url'].split("://")[1]
        site = site.replace("/", "_").replace(".", "_")

    except:
        return JSONResponse({"error": f"Ошибка во время установки атрибутов в онтологии!"}, status_code=422)

    filename = f"{web_structure['attributes']['theme']} {site} {uuid}.ont"
    db_name = f"{web_structure['attributes']['theme']} {site} {uuid}.db"

    try:
        onto.set_attribute(db_file, "db", db_name)
    except:
        return JSONResponse({"error": f"Ошибка во время установки атрибутов в онтологии!"}, status_code=422)

    connection = None
    try:
        connection = sqlite3.connect(f"./app/sources/web_sources/{db_name}", check_same_thread=False)
    except sqlite3.Error as err:
        return JSONResponse({"error": 'Ошибка при работе с sqlite!'}, status_code=500)
    finally:
        if connection:
            connection.close()
    try:
        parsing_session = ParsingSessions(id=uuid,
                                          created_at=datetime.now(),
                                          user_id=current_user.id,
                                          filename=filename,
                                          type='web')
        try:
            session.add(parsing_session)
            session.commit()

            # записать файл онтологии
            with open(f"./app/sources/web_sources/{filename}", "w") as f:
                json.dump(onto.data, f)

            return uuid
        except Exception as e:
            print(e)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/themes/")
def get_parsing_themes(session: Session = Depends(get_db),
                       current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return [
            {
                "id": x.id,
                "theme": x.first_category.lower() + " - " + x.second_category.lower()
            } for x in session.query(ParsingThemes).all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/subjects/")
def get_parsing_subjects(theme: str,
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    file = session.query(ParsingThemes).where(ParsingThemes.id == theme).first()
    try:
        onto = OntoParser(f"./app/sources/web_sources/{file.filename}")
    except ValueError as err:
        return JSONResponse({"error": f"{err}"}, status_code=422)

    node = onto.get_first_node_by_name('Получить теги категорий')

    try:
        return [
            {
                "name": x,
                "attr_prop": node['attributes'][x]['attr_prop'],
                "attr_value": node['attributes'][x]['attr_value'],
                "tag": node['attributes'][x]['tag'],
                "value": node['attributes'][x]['value'],
            } for x in node['attributes']
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/current_session/")
def get_current_parsing_session(id: str,
                                session: Session = Depends(get_db),
                                current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    file = session.query(ParsingSessions).where(ParsingSessions.id == id).first()

    try:
        return file.filename
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/current_ontology/")
def get_current_ontology(id: str,
                         session: Session = Depends(get_db),
                         current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    file = session.query(ParsingSessions).where(ParsingSessions.id == id).first()

    try:
        return FileResponse(f"./app/sources/web_sources/{file.filename}",
                            filename=file.filename,
                            media_type="application/octet-stream")
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/current_database/")
def get_current_db(id: str,
                   session: Session = Depends(get_db),
                   current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    file = session.query(ParsingSessions).where(ParsingSessions.id == id).first()

    try:
        onto = OntoParser(f"./app/sources/web_sources/{file.filename}")
        db = onto.get_first_node_by_name("Создать таблицы БД")['attributes']
    except ValueError as err:
        return JSONResponse({"error": f"{err}"}, status_code=422)

    filename = db['db']
    sql = filename.replace('.ont', '.sql')

    connection = None
    try:
        connection = sqlite3.connect(f"./app/sources/web_sources/{filename}")
        with open(f"./app/sources/web_sources/{sql}", "w", encoding="utf-8") as f:
            for line in connection.iterdump():
                f.write('%s\n' % line)
    except sqlite3.Error as err:
        raise Exception(f"Ошибка при работе с sqlite! {err}")
    finally:
        if connection:
            connection.close()

    try:
        return FileResponse(f"./app/sources/web_sources/{sql}",
                            filename=filename,
                            media_type="application/octet-stream")

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/current_result/")
def get_current_result(id: str,
                       session: Session = Depends(get_db),
                       current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    file = session.query(ParsingSessions).where(ParsingSessions.id == id).first()

    try:
        onto = OntoParser(f"./app/sources/web_sources/{file.filename}")
    except ValueError as err:
        return JSONResponse({"error": f"{err}"}, status_code=422)

    db = onto.get_first_node_by_name("Создать таблицы БД")['attributes']

    connection = None
    try:
        connection = sqlite3.connect(f"./app/sources/web_sources/{db['db']}")
        cursor = connection.cursor()
        cursor.execute(db["select_script"])
        connection.commit()
        result = cursor.fetchall()
        cursor.close()
    except sqlite3.Error as err:
        return JSONResponse({"error": f"Ошибка при работе с sqlite! {err}"}, status_code=500)
    finally:
        if connection:
            connection.close()

    try:
        return result
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/sessions/")
def get_all_sessions(session: Session = Depends(get_db),
                     current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    try:
        return [
            {
                "id": x.id,
                "filename": x.filename
            } for x in session.query(ParsingSessions)
            .where(ParsingSessions.user_id == current_user.id, ParsingSessions.type == 'web').all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
