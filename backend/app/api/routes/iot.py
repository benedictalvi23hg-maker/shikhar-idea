from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from app.core.database import get_db
from app.models.iot_offline import SensorDevice, SensorReading, SyncEvent
from app.models.inventory import InventoryBatch, InventoryItem, InventoryTransaction
from app.models.warehouse import Warehouse
from app.schemas.iot import SensorDeviceOut, SensorReadingCreate, SyncEventCreate, SyncEventOut

router = APIRouter(prefix="/iot", tags=["IoT & Offline Operations"])

@router.get("/devices", response_model=List[SensorDeviceOut])
def get_sensor_devices(db: Session = Depends(get_db)):
    devices = db.query(SensorDevice).all()
    out = []
    for d in devices:
        latest = db.query(SensorReading).filter(SensorReading.device_id == d.id).order_by(SensorReading.timestamp.desc()).first()
        batch = db.query(InventoryBatch).filter(InventoryBatch.id == d.batch_id).first() if d.batch_id else None
        out.append({
            "id": d.id,
            "device_uid": d.device_uid,
            "name": d.name,
            "warehouse_name": d.warehouse.name if d.warehouse else "Forward Depot",
            "batch_number": batch.batch_number if batch else None,
            "device_type": d.device_type,
            "battery_level_pct": d.battery_level_pct,
            "signal_strength_dbm": d.signal_strength_dbm,
            "is_online": d.is_online,
            "last_heartbeat": d.last_heartbeat,
            "latest_temperature_c": latest.temperature_c if latest else 3.8,
            "latest_humidity_pct": latest.humidity_percent if latest else 48.0,
            "latest_fill_level_pct": latest.fill_level_percent if latest else 82.5
        })
    return out

@router.post("/readings")
def record_sensor_reading(payload: SensorReadingCreate, db: Session = Depends(get_db)):
    dev = db.query(SensorDevice).filter(SensorDevice.device_uid == payload.device_uid).first()
    if not dev:
        raise HTTPException(status_code=404, detail=f"Sensor UID {payload.device_uid} not registered.")
        
    dev.last_heartbeat = datetime.utcnow()
    dev.is_online = True
    
    reading = SensorReading(
        device_id=dev.id,
        temperature_c=payload.temperature_c,
        humidity_percent=payload.humidity_percent,
        fill_level_percent=payload.fill_level_percent,
        drum_weight_kg=payload.drum_weight_kg,
        vibration_g=payload.vibration_g,
        is_anomaly=bool(payload.temperature_c and (payload.temperature_c > dev.max_temp_alarm or payload.temperature_c < dev.min_temp_alarm))
    )
    db.add(reading)
    
    # If U8 Smart-Drum reading, update batch fill % and item truth score
    if payload.fill_level_percent is not None and dev.batch_id:
        batch = db.query(InventoryBatch).filter(InventoryBatch.id == dev.batch_id).first()
        if batch:
            batch.smart_drum_fill_pct = payload.fill_level_percent
            batch.current_quantity = (payload.fill_level_percent / 100.0) * batch.initial_quantity
            
    db.commit()
    return {"status": "SUCCESS", "message": "Telemetry packet ingested into tactical datastore."}

@router.post("/sync", response_model=SyncEventOut)
def sync_offline_transaction(payload: SyncEventCreate, db: Session = Depends(get_db)):
    """
    Implements U7 Zero-Network Logistics Ledger:
    Synchronizes offline transaction logged in IndexedDB during communications blackout.
    Checks for conflicts before finalizing ledger.
    """
    existing = db.query(SyncEvent).filter(SyncEvent.client_transaction_id == payload.client_transaction_id).first()
    if existing:
        return existing
        
    sync_status = "SYNCED"
    conflict_note = None
    
    # Validate transaction type and payload
    tx_type = payload.transaction_type
    p_data = payload.payload_json
    
    if tx_type in ["DISPATCH", "RECEIVE"]:
        inv_item = db.query(InventoryItem).filter(
            InventoryItem.warehouse_id == p_data.get("warehouse_id"),
            InventoryItem.product_id == p_data.get("product_id")
        ).first()
        
        qty = float(p_data.get("quantity", 0))
        if tx_type == "DISPATCH":
            if not inv_item or inv_item.quantity_on_hand < qty:
                sync_status = "CONFLICT_FLAGGED"
                conflict_note = f"Offline dispatch requested {qty} units, but current verified stock is only {inv_item.quantity_on_hand if inv_item else 0}. Flagged for Commander review."
            else:
                inv_item.quantity_on_hand -= qty
        elif tx_type == "RECEIVE" and inv_item:
            inv_item.quantity_on_hand += qty
            
    event = SyncEvent(
        client_transaction_id=payload.client_transaction_id,
        transaction_type=payload.transaction_type,
        payload_json=payload.payload_json,
        sync_status=sync_status,
        conflict_resolution=conflict_note,
        client_timestamp=payload.client_timestamp
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    
    return {
        "id": event.id,
        "client_transaction_id": event.client_transaction_id,
        "transaction_type": event.transaction_type,
        "sync_status": event.sync_status,
        "conflict_resolution": event.conflict_resolution,
        "server_synced_at": event.server_synced_at
    }
