from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    requires_cold_chain: bool = False
    priority_level: int = 1

class CategoryOut(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    name: str
    category_id: int
    unit_of_measure: str = "Units"
    weight_kg_per_unit: float = 1.0
    volume_m3_per_unit: float = 0.01
    min_safe_temp_c: float = -5.0
    max_safe_temp_c: float = 25.0
    max_safe_humidity_pct: float = 70.0
    nominal_shelf_life_days: int = 365
    reorder_threshold: float = 500.0
    emergency_buffer_min: float = 200.0
    unit_cost_inr: float = 1000.0

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    weight_kg_per_unit: Optional[float] = None
    min_safe_temp_c: Optional[float] = None
    max_safe_temp_c: Optional[float] = None
    nominal_shelf_life_days: Optional[int] = None
    reorder_threshold: Optional[float] = None
    emergency_buffer_min: Optional[float] = None
    unit_cost_inr: Optional[float] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime
    category_name: Optional[str] = None
    total_quantity_on_hand: Optional[float] = 0.0

    class Config:
        from_attributes = True

class BatchOut(BaseModel):
    id: int
    batch_number: str
    initial_quantity: float
    current_quantity: float
    manufacture_date: datetime
    expiry_date: datetime
    dynamic_remaining_shelf_life_days: Optional[float] = None
    quality_status: str
    smart_drum_fill_pct: Optional[float] = 100.0

    class Config:
        from_attributes = True

class InventoryItemOut(BaseModel):
    id: int
    warehouse_id: int
    warehouse_name: str
    product_id: int
    product_name: str
    sku: str
    category_name: str
    quantity_on_hand: float
    quantity_reserved: float
    quantity_in_transit: float
    isolation_adjusted_dos: float
    stock_truth_score: float
    spoilage_risk_index: float
    batches: List[BatchOut] = []
    updated_at: datetime

    class Config:
        from_attributes = True

class ReceiveStockRequest(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: float
    batch_number: str
    manufacture_date: datetime
    expiry_date: datetime
    supplier_id: Optional[int] = None
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class DispatchStockRequest(BaseModel):
    warehouse_id: int
    product_id: int
    quantity: float
    destination: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class TransferStockRequest(BaseModel):
    source_warehouse_id: int
    dest_warehouse_id: int
    product_id: int
    quantity: float
    priority: str = "TACTICAL_HIGH"
    transport_mode: str = "HEAVY_CONVOY"
    notes: Optional[str] = None

class TransferOut(BaseModel):
    id: int
    transfer_code: str
    source_warehouse_id: int
    source_warehouse_name: str
    dest_warehouse_id: int
    dest_warehouse_name: str
    product_id: int
    product_name: str
    quantity: float
    status: str
    priority: str
    transport_mode: str
    created_at: datetime
    estimated_arrival: Optional[datetime] = None

    class Config:
        from_attributes = True

class InventoryTransactionOut(BaseModel):
    id: int
    transaction_type: str
    quantity: float
    balance_after: float
    product_name: str
    warehouse_name: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True
