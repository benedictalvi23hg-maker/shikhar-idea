from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False) # e.g., "Field Medical & Plasma", "Cold-Weather Rations", "Aviation POL Fuel"
    code = Column(String(20), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    requires_cold_chain = Column(Boolean, default=False)
    priority_level = Column(Integer, default=1) # 1: Low, 5: Critical / Life-Support

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False) # e.g. "MED-PLAS-001"
    name = Column(String(100), nullable=False)
    category_id = Column(Integer, ForeignKey("product_categories.id"), nullable=False)
    unit_of_measure = Column(String(20), default="Units") # Litres, Kg, Cartons, Drums
    weight_kg_per_unit = Column(Float, default=1.0) # Used for U6 Lift-per-kg Prioritizer
    volume_m3_per_unit = Column(Float, default=0.01)
    
    # Environmental Thresholds
    min_safe_temp_c = Column(Float, default=-5.0)
    max_safe_temp_c = Column(Float, default=25.0)
    max_safe_humidity_pct = Column(Float, default=70.0)
    nominal_shelf_life_days = Column(Integer, default=365)
    
    # Stock threshold guidelines
    reorder_threshold = Column(Float, default=500.0)
    emergency_buffer_min = Column(Float, default=200.0)
    unit_cost_inr = Column(Float, default=1000.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("ProductCategory", back_populates="products")
    inventory_items = relationship("InventoryItem", back_populates="product", cascade="all, delete-orphan")
    demand_history = relationship("DemandHistory", back_populates="product", cascade="all, delete-orphan")
    demand_forecasts = relationship("DemandForecast", back_populates="product", cascade="all, delete-orphan")

class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    
    quantity_on_hand = Column(Float, default=0.0)
    quantity_reserved = Column(Float, default=0.0)
    quantity_in_transit = Column(Float, default=0.0)
    
    # Computed Decision Metrics
    isolation_adjusted_dos = Column(Float, default=45.0) # U1 Isolation-Adjusted Days of Supply
    stock_truth_score = Column(Float, default=0.99) # U9 Truth Score
    spoilage_risk_index = Column(Float, default=0.05) # 0.0 to 1.0
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="inventory_items")
    product = relationship("Product", back_populates="inventory_items")
    batches = relationship("InventoryBatch", back_populates="inventory_item", cascade="all, delete-orphan")
    transactions = relationship("InventoryTransaction", back_populates="inventory_item", cascade="all, delete-orphan")

class InventoryBatch(Base):
    __tablename__ = "inventory_batches"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False)
    batch_number = Column(String(50), index=True, nullable=False) # e.g. "BATCH-2026-NOV-991"
    
    initial_quantity = Column(Float, nullable=False)
    current_quantity = Column(Float, nullable=False)
    
    manufacture_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    
    # Real-time IoT / Physics-Informed Shelf Life (U13 & U3)
    dynamic_remaining_shelf_life_days = Column(Float, nullable=True) # Physics-computed
    cumulative_thermal_stress = Column(Float, default=0.0) # Thermal exposure kinetic integral
    quality_status = Column(String(30), default="OPTIMAL") # OPTIMAL, ELEVATED_RISK, CRITICAL, SPOILED
    smart_drum_fill_pct = Column(Float, default=100.0) # U8 Smart Drum Depletion
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    inventory_item = relationship("InventoryItem", back_populates="batches")
    freshness_predictions = relationship("FreshnessPrediction", back_populates="batch", cascade="all, delete-orphan")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("inventory.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(30), nullable=False) # RECEIVE, DISPATCH, TRANSFER_IN, TRANSFER_OUT, RECONCILIATION
    quantity = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    batch_id = Column(Integer, ForeignKey("inventory_batches.id"), nullable=True)
    
    performed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reference_number = Column(String(100), nullable=True) # Bill of Lading, Tactical Transfer Order
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    inventory_item = relationship("InventoryItem", back_populates="transactions")

class StockTransfer(Base):
    __tablename__ = "stock_transfers"

    id = Column(Integer, primary_key=True, index=True)
    transfer_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "XFER-2026-081"
    source_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    dest_warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("inventory_batches.id"), nullable=True)
    
    quantity = Column(Float, nullable=False)
    status = Column(String(30), default="PENDING") # PENDING, APPROVED, DISPATCHED, IN_TRANSIT, DELIVERED, REJECTED
    priority = Column(String(20), default="TACTICAL_HIGH") # NORMAL, TACTICAL_HIGH, EMERGENCY_CRITICAL
    
    transport_mode = Column(String(50), default="HEAVY_CONVOY") # HEAVY_CONVOY, ROTARY_AIRLIFT, DRONE_SWARM, LIGHT_TACTICAL
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    estimated_arrival = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    source_warehouse = relationship("Warehouse", foreign_keys=[source_warehouse_id])
    dest_warehouse = relationship("Warehouse", foreign_keys=[dest_warehouse_id])
    product = relationship("Product")
