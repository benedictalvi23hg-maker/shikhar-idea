from fastapi import APIRouter
from app.api.routes import (
    auth, dashboard, inventory, warehouses,
    forecast, freshness, transportation, weather,
    suppliers, recommendations, simulation, iot,
    reports, admin, assistant
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(inventory.router)
api_router.include_router(warehouses.router)
api_router.include_router(forecast.router)
api_router.include_router(freshness.router)
api_router.include_router(transportation.router)
api_router.include_router(weather.router)
api_router.include_router(suppliers.router)
api_router.include_router(recommendations.router)
api_router.include_router(simulation.router)
api_router.include_router(iot.router)
api_router.include_router(reports.router)
api_router.include_router(admin.router)
api_router.include_router(assistant.router)
