from fastapi import APIRouter

from .v1.smart_products import router as products_router
from .v1.smart_recipes import router as recipes_router


router = APIRouter()

router.include_router(products_router, prefix="/smart_products")
router.include_router(recipes_router, prefix="/smart_recipes")
