from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False) # e.g. "WH-LEH-01"
    name = Column(String(100), nullable=False) # e.g. "Leh Forward High-Altitude Depot"
    command_region = Column(String(50), default="Northern Command") # Northern, Western, Eastern, Central
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_meters = Column(Float, default=1000.0)
    total_capacity_tons = Column(Float, default=5000.0)
    current_load_tons = Column(Float, default=1200.0)
    isolation_risk_score = Column(Float, default=0.25) # 0.0 to 1.0 (U1 isolation factor)
    stock_truth_score = Column(Float, default=0.98) # 0.0 to 1.0 (U9 Stock Truth Score)
    status = Column(String(30), default="OPERATIONAL") # OPERATIONAL, WEATHER_RESTRICTED, ISOLATED, MAINTENANCE
    climate_zone = Column(String(50), default="SUB_ZERO_ALPINE")
    
    # Storage Capabilities
    cold_chain_capable = Column(Boolean, default=True)
    hazardous_pol_capable = Column(Boolean, default=True)
    drone_hub_capable = Column(Boolean, default=True)
    helipad_available = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    capabilities = relationship("WarehouseCapability", back_populates="warehouse", cascade="all, delete-orphan")
    inventory_items = relationship("InventoryItem", back_populates="warehouse", cascade="all, delete-orphan")
    sensor_devices = relationship("SensorDevice", back_populates="warehouse")

class WarehouseCapability(Base):
    __tablename__ = "warehouse_capabilities"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    capability_name = Column(String(50), nullable=False) # e.g. "Deep Freezing -20C", "Smart Drum IoT Level", "Armored Vault"
    readiness_percentage = Column(Float, default=100.0) # 0 to 100 (U15 Capability-Readiness)
    is_active = Column(Boolean, default=True)
    last_certified = Column(DateTime, default=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="capabilities")
