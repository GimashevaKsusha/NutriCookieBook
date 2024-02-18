from fastapi import APIRouter

from .v1.aggregate_query import router as aggregate_query_router
from .v1.authentication import router as authentication_router
from .v1.building import router as building_router
from .v1.data_collection import router as data_collection_router
from .v1.mapped_values import router as mapped_values_router
from .v1.mapping import router as mapping_router
from .v1.multiple_listing import router as multiple_listing_router
from .v1.parsing import router as parsing_router
from .v1.reference_ingredients import router as reference_ingredients_router
from .v1.tagged_values import router as tagged_values_router
from .v1.tagging import router as tagging_router
from .v1.transferring import router as transferring_router

router = APIRouter()

router.include_router(aggregate_query_router, prefix="/aggregate_query")
router.include_router(authentication_router, prefix="/authentication")
router.include_router(building_router, prefix="/building")
router.include_router(data_collection_router, prefix="/data_collection")
router.include_router(mapped_values_router, prefix="/mapped_values")
router.include_router(mapping_router, prefix="/mapping")
router.include_router(multiple_listing_router, prefix="/multiple_listing")
router.include_router(parsing_router, prefix="/parsing")
router.include_router(reference_ingredients_router, prefix="/reference_ingredients")
router.include_router(tagged_values_router, prefix="/tagged_values")
router.include_router(tagging_router, prefix="/tagging")
router.include_router(transferring_router, prefix="/transferring")
