from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class SensorDevice(Base):
    __tablename__ = "sensor_devices"

    id = Column(Integer, primary_key=True, index=True)
    device_uid = Column(String(50), unique=True, index=True, nullable=False) # e.g. "ESP32-LEH-CHAMBER-01"
    name = Column(String(100), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("inventory_batches.id"), nullable=True)
    
    device_type = Column(String(50), default="MULTI_SENSOR") # MULTI_SENSOR, COLD_CHAIN_PROBE, SMART_DRUM_LOADCELL
    protocol = Column(String(30), default="MQTT")
    firmware_version = Column(String(30), default="v2.4.1-tactical")
    battery_level_pct = Column(Float, default=98.0)
    signal_strength_dbm = Column(Float, default=-65.0)
    
    # Thresholds
    min_temp_alarm = Column(Float, default=-2.0)
    max_temp_alarm = Column(Float, default=8.0)
    max_humidity_alarm = Column(Float, default=75.0)
    
    is_online = Column(Boolean, default=True)
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="sensor_devices")
    readings = relationship("SensorReading", back_populates="device", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("sensor_devices.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    temperature_c = Column(Float, nullable=True)
    humidity_percent = Column(Float, nullable=True)
    fill_level_percent = Column(Float, nullable=True) # U8 Smart-Drum level
    drum_weight_kg = Column(Float, nullable=True) # U8 load-cell
    vibration_g = Column(Float, nullable=True)
    is_anomaly = Column(Boolean, default=False)

    device = relationship("SensorDevice", back_populates="readings")

class SyncEvent(Base):
    __tablename__ = "sync_events"

    id = Column(Integer, primary_key=True, index=True)
    client_transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    transaction_type = Column(String(50), nullable=False)
    payload_json = Column(JSON, nullable=False)
    sync_status = Column(String(30), default="SYNCED") # PENDING, SYNCED, CONFLICT_FLAGGED
    conflict_resolution = Column(Text, nullable=True)
    client_timestamp = Column(DateTime, nullable=False)
    server_synced_at = Column(DateTime, default=datetime.utcnow)
