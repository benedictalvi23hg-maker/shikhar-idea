from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class CorridorReliability(Base):
    __tablename__ = "corridors"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True, nullable=False) # e.g. "CORR-MANALI-LEH", "CORR-ZOJILA"
    name = Column(String(100), nullable=False)
    origin_region = Column(String(50), nullable=False)
    destination_region = Column(String(50), nullable=False)
    distance_km = Column(Float, default=450.0)
    
    # U2 Corridor Reliability Graph Metrics
    passability_score = Column(Float, default=0.88) # 0.0 to 1.0
    avalanche_risk_index = Column(Float, default=0.15) # 0.0 to 1.0
    winter_closure_active = Column(Boolean, default=False)
    average_transit_hours = Column(Float, default=18.0)
    current_status = Column(String(30), default="OPEN_CLEAR") # OPEN_CLEAR, CONVOY_RESTRICTED, CLOSED_BLIZZARD, RE-ROUTED
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transport_records = relationship("TransportationRecord", back_populates="corridor")

class TransportationRecord(Base):
    __tablename__ = "transportation_records"

    id = Column(Integer, primary_key=True, index=True)
    convoy_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "CNV-TACTICAL-2026-09"
    corridor_id = Column(Integer, ForeignKey("corridors.id"), nullable=True)
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    dest_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    
    transport_mode = Column(String(50), default="HEAVY_CONVOY") # HEAVY_CONVOY, ROTARY_AIRLIFT, ALL_TERRAIN, TACTICAL_DRONE
    status = Column(String(30), default="IN_TRANSIT") # SCHEDULED, DISPATCHED, IN_TRANSIT, DELAYED, DELIVERED, HALTED_WEATHER
    
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)
    cargo_weight_kg = Column(Float, default=12500.0)
    
    departure_time = Column(DateTime, default=datetime.utcnow)
    estimated_arrival = Column(DateTime, nullable=False)
    actual_arrival = Column(DateTime, nullable=True)
    
    environmental_risk_level = Column(String(20), default="LOW") # LOW, MODERATE, HIGH, EXTREME
    notes = Column(Text, nullable=True)

    corridor = relationship("CorridorReliability", back_populates="transport_records")
    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    dest_warehouse = relationship("Warehouse", foreign_keys=[dest_warehouse_id])

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(30), unique=True, index=True, nullable=False) # e.g. "SUP-DEF-ORD-01"
    name = Column(String(100), nullable=False)
    category = Column(String(50), default="RATIONS & NUTRITION")
    
    # Predictive Supplier Risk Metrics
    reliability_score = Column(Float, default=0.94) # 0.0 to 1.0
    on_time_delivery_rate = Column(Float, default=92.5) # Percentage
    quality_pass_rate = Column(Float, default=99.1) # Percentage
    lead_time_days = Column(Integer, default=7)
    risk_level = Column(String(20), default="LOW_RISK") # LOW_RISK, MODERATE_RISK, HIGH_RISK, EMBARGOED
    
    contact_person = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    deliveries = relationship("SupplierDelivery", back_populates="supplier", cascade="all, delete-orphan")

class SupplierDelivery(Base):
    __tablename__ = "supplier_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, index=True, nullable=False) # e.g. "PO-DEF-2026-881"
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    ordered_quantity = Column(Float, nullable=False)
    delivered_quantity = Column(Float, default=0.0)
    
    expected_delivery_date = Column(DateTime, nullable=False)
    actual_delivery_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="SCHEDULED") # SCHEDULED, DISPATCHED, DELIVERED, DELAYED, REJECTED
    delay_days = Column(Integer, default=0)
    inspection_passed = Column(Boolean, default=True)

    supplier = relationship("Supplier", back_populates="deliveries")
    warehouse = relationship("Warehouse")
    product = relationship("Product")
