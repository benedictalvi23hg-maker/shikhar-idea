import io
import csv
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.core.database import get_db
from app.models.inventory import InventoryItem, Product, ProductCategory
from app.models.warehouse import Warehouse
from app.models.logistics import TransportationRecord, Supplier

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    total_warehouses = db.query(Warehouse).count()
    total_skus = db.query(Product).count()
    total_inventory = db.query(func.sum(InventoryItem.quantity_on_hand)).scalar() or 0.0
    active_convoys = db.query(TransportationRecord).filter(TransportationRecord.status == "IN_TRANSIT").count()
    suppliers_count = db.query(Supplier).count()
    
    return {
        "report_generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "total_warehouses": total_warehouses,
        "total_catalog_skus": total_skus,
        "total_units_stocked": round(total_inventory, 0),
        "active_convoys_in_field": active_convoys,
        "registered_defense_suppliers": suppliers_count,
        "security_classification": "RESTRICTED - TACTICAL LOGISTICS"
    }

@router.get("/export")
def export_tactical_report(report_type: str = "inventory", db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    
    if report_type == "inventory":
        writer.writerow(["Report: PROJECT SHIKHAR - Complete Inventory Asset Manifest"])
        writer.writerow(["Generated:", datetime.utcnow().isoformat()])
        writer.writerow([])
        writer.writerow(["Depot Code", "Depot Name", "SKU", "Nomenclature", "Category", "On Hand", "Isolation DoS", "Stock Truth Score"])
        
        items = db.query(InventoryItem).all()
        for i in items:
            writer.writerow([
                i.warehouse.code,
                i.warehouse.name,
                i.product.sku,
                i.product.name,
                i.product.category.name if i.product.category else "Defense Supply",
                i.quantity_on_hand,
                i.isolation_adjusted_dos,
                i.stock_truth_score
            ])
            
    elif report_type == "warehouses":
        writer.writerow(["Report: Strategic Warehouse Readiness & Capacity"])
        writer.writerow([])
        writer.writerow(["Code", "Name", "Region", "Capacity (Tons)", "Current Load (Tons)", "Utilization %", "Stock Truth Score", "Status"])
        for wh in db.query(Warehouse).all():
            util = round((wh.current_load_tons / wh.total_capacity_tons) * 100.0, 1)
            writer.writerow([wh.code, wh.name, wh.command_region, wh.total_capacity_tons, wh.current_load_tons, util, wh.stock_truth_score, wh.status])
            
    elif report_type == "suppliers":
        writer.writerow(["Report: Supplier Reliability and Lead-Time Risk Matrix"])
        writer.writerow([])
        writer.writerow(["Code", "Supplier Name", "Category", "Reliability Score", "On-Time Rate %", "Quality Rate %", "Lead Time (Days)", "Risk Level"])
        for s in db.query(Supplier).all():
            writer.writerow([s.code, s.name, s.category, s.reliability_score, s.on_time_delivery_rate, s.quality_pass_rate, s.lead_time_days, s.risk_level])
            
    filename = f"shikhar_{report_type}_report_{datetime.utcnow().strftime('%Y%m%d_%H%M')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
