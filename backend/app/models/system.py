from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO") # INFO, WARNING, CRITICAL, SUCCESS
    category = Column(String(50), default="OPERATIONS") # WEATHER, INVENTORY, TRANSIT, SPOILAGE, SYSTEM
    is_read = Column(Boolean, default=False)
    action_url = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "RECEIVE_INVENTORY", "APPROVE_TRANSFER", "LOGIN"
    entity_type = Column(String(50), nullable=True) # "inventory", "stock_transfers", "users"
    entity_id = Column(String(50), nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

class IntegrationSetting(Base):
    __tablename__ = "integration_settings"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(50), unique=True, index=True, nullable=False) # WEATHER, SATELLITE, MAPPING, AI_LLM, MQTT
    provider_name = Column(String(100), default="MOCK_PROVIDER")
    status = Column(String(30), default="SIMULATED") # CONNECTED, SIMULATED, DISCONNECTED, ERROR
    is_enabled = Column(Boolean, default=True)
    endpoint_url = Column(String(255), nullable=True)
    last_health_check = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
