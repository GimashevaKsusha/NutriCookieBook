from fastapi import APIRouter

from app.modules.api import router as app_router


router = APIRouter()

router.include_router(app_router, prefix="/v1")
