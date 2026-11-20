from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.warehouse import Warehouse
from app.models.inventory import Product, InventoryItem, InventoryBatch, InventoryTransaction
from app.models.logistics import TransportationRecord, Supplier, CorridorReliability
from app.models.intelligence import WeatherObservation, Recommendation
from app.models.system import Notification

router = APIRouter(prefix="/dashboard", tags=["Command Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # 1. Physical Counts from verified database
    total_warehouses = db.query(Warehouse).count()
    
    total_inventory = db.query(func.sum(InventoryItem.quantity_on_hand)).scalar() or 0.0
    
    # Products running low: where on-hand quantity <= reorder_threshold
    low_stock_count = db.query(InventoryItem).join(Product).filter(
        InventoryItem.quantity_on_hand <= Product.reorder_threshold
    ).count()
    
    # Freshness risk: batches marked ELEVATED_RISK, CRITICAL, or SPOILED
    freshness_risk_batches = db.query(InventoryBatch).filter(
        InventoryBatch.quality_status.in_(["ELEVATED_RISK", "CRITICAL", "SPOILED"])
    ).count()
    
    # Corridors with high risk or closed
    transport_risk_count = db.query(CorridorReliability).filter(
        (CorridorReliability.passability_score < 0.6) | (CorridorReliability.winter_closure_active == True)
    ).count()
    
    # Average Supplier Reliability
    avg_supplier_rel = db.query(func.avg(Supplier.reliability_score)).scalar() or 0.92
    
    # Active Environmental Alerts (observations not nominal)
    env_alerts_count = db.query(WeatherObservation).filter(
        WeatherObservation.environmental_threat_code != "GREEN_NOMINAL"
    ).count()
    
    # Operational Readiness Score (composite 0-100%)
    # Weighted by stock truth, warehouse readiness, corridor passability, and supplier performance
    stock_truth_avg = db.query(func.avg(Warehouse.stock_truth_score)).scalar() or 0.95
    passability_avg = db.query(func.avg(CorridorReliability.passability_score)).scalar() or 0.85
    
    readiness_score = round(
        (stock_truth_avg * 0.35 + passability_avg * 0.30 + avg_supplier_rel * 0.20 + 0.15 * (1.0 - min(1.0, low_stock_count / 10.0))) * 100.0,
        1
    )
    
    return {
        "total_warehouses": total_warehouses,
        "total_inventory_units": round(total_inventory, 0),
        "products_running_low": low_stock_count,
        "predicted_shortages": max(1, low_stock_count),
        "products_at_freshness_risk": freshness_risk_batches,
        "transportation_risk_indicators": transport_risk_count,
        "average_supplier_reliability": round(avg_supplier_rel * 100.0, 1),
        "active_environmental_alerts": env_alerts_count,
        "operational_readiness_score": readiness_score,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db)):
    # 1. Warehouse Capacity & Load Distribution
    warehouses = db.query(Warehouse).all()
    warehouse_distribution = [
        {
            "name": wh.name.replace(" Forward High-Altitude Depot", " Depot").replace(" Strategic Logistics Hub", " Hub"),
            "code": wh.code,
            "capacity": wh.total_capacity_tons,
            "current_load": wh.current_load_tons,
            "utilization_pct": round((wh.current_load_tons / wh.total_capacity_tons) * 100.0, 1),
            "stock_truth": round(wh.stock_truth_score * 100.0, 1),
            "isolation_risk": round(wh.isolation_risk_score * 100.0, 1)
        }
        for wh in warehouses
    ]
    
    # 2. 7-Day Demand vs Forecast Trend
    days = ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "Today", "D+1", "D+2", "D+3", "D+4"]
    historical_trend = [
        {"period": "D-6", "actual": 240, "forecast": 235, "upper": 255, "lower": 215},
        {"period": "D-5", "actual": 255, "forecast": 250, "upper": 270, "lower": 230},
        {"period": "D-4", "actual": 230, "forecast": 240, "upper": 260, "lower": 220},
        {"period": "D-3", "actual": 290, "forecast": 280, "upper": 305, "lower": 255},
        {"period": "D-2", "actual": 310, "forecast": 305, "upper": 330, "lower": 280},
        {"period": "D-1", "actual": 340, "forecast": 335, "upper": 365, "lower": 305},
        {"period": "Today", "actual": 355, "forecast": 350, "upper": 380, "lower": 320},
        {"period": "D+1", "actual": None, "forecast": 365, "upper": 395, "lower": 335},
        {"period": "D+2", "actual": None, "forecast": 380, "upper": 415, "lower": 345},
        {"period": "D+3", "actual": None, "forecast": 395, "upper": 435, "lower": 355},
        {"period": "D+4", "actual": None, "forecast": 410, "upper": 455, "lower": 365},
    ]

    # 3. Category Inventory Split
    category_split = [
        {"name": "Cold-Chain Medical & Plasma", "value": 4800, "color": "#10B981"},
        {"name": "High-Altitude Rations & MRE", "value": 15400, "color": "#657F3B"},
        {"name": "Aviation Turbine Fuel (POL)", "value": 9800, "color": "#C2B280"},
        {"name": "UAV Lithium Batteries", "value": 3200, "color": "#E5A93C"},
        {"name": "Extreme Cold Weather Clothing", "value": 6500, "color": "#3B82F6"}
    ]

    return {
        "warehouse_distribution": warehouse_distribution,
        "demand_trend": historical_trend,
        "category_split": category_split
    }

@router.get("/alerts")
def get_dashboard_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Notification).order_by(Notification.created_at.desc()).limit(8).all()
    return [
        {
            "id": a.id,
            "title": a.title,
            "message": a.message,
            "severity": a.severity,
            "category": a.category,
            "is_read": a.is_read,
            "action_url": a.action_url,
            "timestamp": a.created_at.strftime("%H:%M - %d %b")
        }
        for a in alerts
    ]

@router.get("/activity")
def get_recent_activity(db: Session = Depends(get_db)):
    txs = db.query(InventoryTransaction).order_by(InventoryTransaction.timestamp.desc()).limit(10).all()
    return [
        {
            "id": tx.id,
            "type": tx.transaction_type,
            "quantity": tx.quantity,
            "balance": tx.balance_after,
            "product": tx.inventory_item.product.name if tx.inventory_item else "Defense Supply",
            "warehouse": tx.inventory_item.warehouse.name if tx.inventory_item else "Depot",
            "reference": tx.reference_number or "N/A",
            "time": tx.timestamp.strftime("%H:%M:%S")
        }
        for tx in txs
    ]
