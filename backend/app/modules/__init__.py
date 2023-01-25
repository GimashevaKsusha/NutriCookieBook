from fastapi import APIRouter

from app.modules.api import router as smart_router


router = APIRouter()

router.include_router(smart_router, prefix="/v1")
