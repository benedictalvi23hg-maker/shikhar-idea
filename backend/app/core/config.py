import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "PROJECT SHIKHAR"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "SHIKHAR_CLASSIFIED_MILITARY_LOGISTICS_KEY_2026_TAC_SEC")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database (Default to local high-performance SQLite WAL database in workspace for zero-config reliability)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shikhar.db")
    
    # External Integration Placeholders
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "86a83d106396db935fb1e98f177a5572")
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "86a83d106396db935fb1e98f177a5572")
    AI_API_KEY: str = os.getenv("AI_API_KEY", "AQ.Ab8RN6JJVzPJSkrhgd27kdSV34cpHCFGsHZJpqE7WgvaQURiew")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AQ.Ab8RN6JJVzPJSkrhgd27kdSV34cpHCFGsHZJpqE7WgvaQURiew")
    MAP_API_KEY: str = os.getenv("MAP_API_KEY", "pk.eyJ1IjoiYmVuZWRpY3QxMjM0NTU2IiwiYSI6ImNtd25rOW9lYTAwZmMzNXE2Yzhndnpyc3QifQ.7thVNkZUSMxeVbGbOQPzdw")
    MAPBOX_API_KEY: str = os.getenv("MAPBOX_API_KEY", "pk.eyJ1IjoiYmVuZWRpY3QxMjM0NTU2IiwiYSI6ImNtd25rOW9lYTAwZmMzNXE2Yzhndnpyc3QifQ.7thVNkZUSMxeVbGbOQPzdw")
    NASA_API_KEY: str = os.getenv("NASA_API_KEY", "9m8P7zL6t9HgbcHB7DMrDJ9pnzDGDfcdRdrrmtQb")
    MQTT_BROKER_URL: str = os.getenv("MQTT_BROKER_URL", "mqtt://localhost:1883")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
