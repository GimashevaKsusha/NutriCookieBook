from fastapi import APIRouter, Depends, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func
from datetime import datetime, timedelta
import uuid
import jwt
import os
import bcrypt

from app.modules.db_context import get_db
from app.modules.schema.public.user_types_reference import UserTypesReference
from app.modules.schema.public.users import Users

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/authentication/authentication/")


# авторизация пользователя
def get_current_user(token: str = Depends(oauth2_scheme),
                     session: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, 'hef5FW5FFFjberuijpechfFCnweiNFJNWMCWMFF', algorithms=["HS256"])
    except:
        return None

    user_id = payload.get("user_id")
    user = session.query(Users).where(Users.id == user_id).first()

    if not user:
        return None
    return user


# генерация токена доступа JWT
# header - заголовок
# payload - полезные данные
# signature - подпись
def create_access_token(id):
    expire = datetime.utcnow() + timedelta(hours=8)
    payload = {"user_id": id, "exp": expire}
    token = jwt.encode(payload, 'hef5FW5FFFjberuijpechfFCnweiNFJNWMCWMFF', algorithm="HS256")
    return token


# аутентификация пользователя (вход в систему)
@router.post("/authentication/")
def authenticate_user(data: OAuth2PasswordRequestForm = Depends(),
                      session: Session = Depends(get_db)):
    # удалить незначащие пробелы в начале и конце логина и пароля
    login = data.username.strip()
    password = data.password.strip()

    # проверить, что логин и пароль не пустые
    if login == '' or password == '':
        return JSONResponse({"error": 'Логин и пароль не могут быть пустыми!'}, status_code=401)

    # проверить, что пользователь с указанным логином зарегистрирован в системе
    user = session.query(Users).where(Users.login == login).first()
    if not user:
        return JSONResponse({"error": 'Данные пользователя не были найдены в системе!'}, status_code=401)

    # проверить, что указанный пароль и пароль в БД совпадают
    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return JSONResponse({"error": 'Неверный пароль!'}, status_code=401)

    try:
        access_token = create_access_token(user.id)
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


# регистрация пользователя
@router.post("/registration/")
def registrate_user(login: str,
                    password: str,
                    session: Session = Depends(get_db)):
    # удалить незначащие пробелы в начале и конце логина и пароля
    login = login.strip()
    password = password.strip()
    # проверить, что логин и пароль не пустые
    if login == '' or password == '':
        return JSONResponse({"error": 'Логин и пароль не могут быть пустыми!'}, status_code=401)

    # проверить, что логин еще не занят
    user = session.query(Users).where(Users.login == login).first()
    if user:
        return JSONResponse({"error": 'Логин уже используется!'}, status_code=401)

    # проверить, что пароль состоит минимум из 6 символов
    if len(password) < 6:
        return JSONResponse({"error": 'Пароль должен состоять минимум из 6 символов!'}, status_code=401)

    # добавить нового пользователя в БД
    standard = session.query(UserTypesReference)\
        .where(UserTypesReference.type == 'Пользователь').first()

    hash_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    user = Users(id=str(uuid.uuid4()),
                 login=login,
                 password=hash_password.decode(),
                 type_id=standard.id,
                 created_at=datetime.now())

    try:
        session.add(user)
        session.commit()
        access_token = create_access_token(user.id)
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(e)
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/user_info/")
def get_user_info(session: Session = Depends(get_db),
                  current_user: Users = Depends(get_current_user)):
    if not current_user:
        return JSONResponse({"error": "user is unauthorized"}, status_code=403)

    role = session.query(UserTypesReference)\
        .where(UserTypesReference.id == current_user.type_id).first()

    try:
        return {
            'user_name': current_user.login,
            'user_role': role.type
        }
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
