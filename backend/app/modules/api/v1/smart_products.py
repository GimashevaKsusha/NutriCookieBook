from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse
from sqlalchemy import select, func

from app.modules.smart_products.models import *
from app.modules.db_context import get_db

router = APIRouter()


@router.get("/products/by_nutrients/")
def find_products(nutrients: list[str] = Query(None), session: Session = Depends(get_db)):
    size = len(nutrients)
    if size == 0:
        return JSONResponse({"error": "list of nutrients cannot be empty"}, status_code=422)
    try:
        result = [
            x.product_id for x in
            session
            .execute(
                select(Compositions.product_id)
                .select_from(Compositions)
                .join(Nutrients)
                .where(Nutrients.nutrient_name.in_(nutrients), Compositions.amount > 0)
                .group_by(Compositions.product_id)
                .having(func.count(Compositions.product_id) == size))
        ]
        return [
            {
                "name": x.product_name,
                "category": x.category.category_name,
            } for x in session.query(Products).where(Products.id_product.in_(result)).all()
        ]
    except Exception as e:
        print(e)
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/headers/nutrients")
def read_headers_nutrients(session: Session = Depends(get_db)):
    try:
        return [
            {
                "value": "/" + x.header_name,
                "label": x.header_name,
                "children": [
                    {
                        "value": y.nutrient_name,
                        "label": y.nutrient_name
                    } for y in session.query(Nutrients).where(Nutrients.header_id == x.id_header).all()
                ]
            } for x in session.query(Headers).all()
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/products/{product_name}")
def read_products(product_name: str, session: Session = Depends(get_db)):
    try:
        product_name = product_name.strip(" ")
        if product_name == "":
            return JSONResponse({"error": "product_name can't be empty"}, status_code=422)
        name = f'{product_name}%'
        if session.execute(select(Products).where(Products.product_name.ilike(name))).scalars().first():
            return [
                {
                    "product_name": x.product_name
                } for x in session.query(Products).where(Products.product_name.ilike(name)).all()
            ]
        else:
            return JSONResponse({"error": "products with this product_name don't exist"}, status_code=404)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@router.get("/products/{product_id}/nutrients")
def read_nutrients(product_id: int, session: Session = Depends(get_db)):
    try:
        return [
            {
                "product_name": x.product_name,
                "nutrients": [
                    {
                        "nutrient_name": y.nutrient.nutrient_name,
                        "amount": y.amount,
                        "unit": y.unit,
                        "rsp_percent": y.rsp_percent,
                    } for y in session.query(Compositions).filter(Compositions.product_id == x.id_product).
                    order_by(Compositions.id_composition)
                ],
            } for x in session.query(Products).where(Products.id_product == product_id)
        ]
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
