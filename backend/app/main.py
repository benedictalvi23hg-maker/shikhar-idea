import asyncio
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.core.database import Base, engine
from app.api.api_router import api_router
from app.seed_data import seed_database

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PROJECT SHIKHAR - Predictive Logistics Platform",
    description="Unified Predictive Logistics & Intelligent Supply Chain Management Engine for High-Readiness Operations",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tactical & OWASP Security Headers Middleware
@app.middleware("http")
async def add_security_headers_and_audit(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["X-Tactical-Classification"] = "RESTRICTED // NORTHERN COMMAND LOGISTICS"
    response.headers["X-Security-Integrity"] = "SHA256-RBAC-ENFORCED"
    return response

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    print("Project SHIKHAR Backend initializing...")
    seed_database()
    print("Project SHIKHAR Operational on unified host: http://localhost:8000")

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "engine": "Predictive Logistics Decision Engine v1.0"}

# WebSocket Connection Manager for live tactical telemetry
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/api/v1/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Emit live sensor pulse every 5 seconds
            await asyncio.sleep(5)
            telemetry_pulse = {
                "type": "SENSOR_TELEMETRY",
                "device_uid": "ESP32-LEH-CHAMBER-01",
                "temperature_c": round(3.2 + (0.1 * (hash(str(asyncio.get_event_loop().time())) % 5 - 2)), 2),
                "humidity_pct": 46.5,
                "timestamp": "LIVE"
            }
            await websocket.send_text(json.dumps(telemetry_pulse))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Locate static build directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(STATIC_DIR):
    STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

ASSETS_DIR = os.path.join(STATIC_DIR, "assets")
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

# Single Page Application fallback for all frontend routes
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Check if a specific static file exists in static dir
    file_path = os.path.join(STATIC_DIR, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for React client-side routing
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    
    return {
        "system": "PROJECT SHIKHAR",
        "status": "OPERATIONAL",
        "api_docs": "/api/docs"
    }
