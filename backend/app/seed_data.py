import sys
import os
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import *

def seed_database():
    print("Initializing Database schema...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.username == "commander.shikhar").first():
            print("Database already contains seed data. Skipping re-seed.")
            return

        print("Seeding Roles and Permissions...")
        roles_data = [
            ("Super Administrator", "Full tactical override and system authority", 10),
            ("Logistics Manager", "Fleet management, redistribution, and requisition authorization", 8),
            ("Warehouse Manager", "Depot stock reception, dispatch, and physical count reconciliation", 5),
            ("Analyst", "Read-only predictive intelligence, scenario evaluation", 2)
        ]
        created_roles = {}
        for r_name, r_desc, r_lvl in roles_data:
            role = Role(name=r_name, description=r_desc, level=r_lvl)
            db.add(role)
            created_roles[r_name] = role
        db.flush()

        print("Seeding Users...")
        pass_hash = get_password_hash("Shikhar2026!")
        admin_user = User(
            username="commander.shikhar",
            email="commander@shikhar.mod.gov.in",
            hashed_password=pass_hash,
            full_name="Brigadier General R. K. Rawat",
            military_rank="Brigadier General",
            service_id="IC-49822X",
            department="Integrated Defense Logistics Staff",
            is_active=True,
            is_superuser=True
        )
        admin_user.roles.append(created_roles["Super Administrator"])
        db.add(admin_user)

        officer_user = User(
            username="logistics.officer",
            email="logistics.officer@shikhar.mod.gov.in",
            hashed_password=pass_hash,
            full_name="Colonel A. V. Deshmukh",
            military_rank="Colonel",
            service_id="IC-54210M",
            department="Northern Command Supply Corps",
            is_active=True,
            is_superuser=False
        )
        officer_user.roles.append(created_roles["Logistics Manager"])
        db.add(officer_user)
        db.flush()

        print("Seeding Strategic Warehouses...")
        warehouses_data = [
            ("WH-LEH-01", "Leh Forward High-Altitude Depot", "Northern Command", 34.1526, 77.5771, 3500.0, 4500.0, 3100.0, 0.85, 0.99, "WEATHER_RESTRICTED", "SUB_ZERO_ALPINE", True, True, True, True),
            ("WH-CHD-01", "Strategic Logistics Hub Chandigarh", "Western Command", 30.7333, 76.7794, 320.0, 15000.0, 9200.0, 0.05, 0.99, "OPERATIONAL", "PLAINS_CONTINENTAL", True, True, True, True),
            ("WH-SLG-01", "Siliguri Corridor Forward Staging", "Eastern Command", 26.7271, 88.3953, 120.0, 8000.0, 5400.0, 0.35, 0.97, "OPERATIONAL", "HUMID_SUBTROPICAL", True, True, True, True),
            ("WH-JDH-01", "Western Frontier Logistics Base Jodhpur", "Southern Command", 26.2389, 73.0243, 230.0, 10000.0, 4800.0, 0.10, 0.98, "OPERATIONAL", "ARID_DESERT", True, True, True, True),
            ("WH-SXR-01", "Srinagar Advanced Ordnance Staging", "Northern Command", 34.0837, 74.7973, 1585.0, 6000.0, 4100.0, 0.65, 0.96, "OPERATIONAL", "ALPINE_VALLEY", True, True, True, True)
        ]
        created_wh = {}
        for code, name, reg, lat, lng, elev, cap, load, iso, truth, st, clim, cc, pol, dr, heli in warehouses_data:
            wh = Warehouse(
                code=code, name=name, command_region=reg, latitude=lat, longitude=lng,
                elevation_meters=elev, total_capacity_tons=cap, current_load_tons=load,
                isolation_risk_score=iso, stock_truth_score=truth, status=st, climate_zone=clim,
                cold_chain_capable=cc, hazardous_pol_capable=pol, drone_hub_capable=dr, helipad_available=heli
            )
            db.add(wh)
            created_wh[code] = wh
        db.flush()

        print("Seeding Product Categories...")
        categories_data = [
            ("Cold-Chain Medical & Plasma", "MED-COLD", "Perishable biologicals and emergency resuscitation fluids", True, 5),
            ("High-Altitude Rations & MRE", "RAT-MRE", "Long shelf-life vacuum-sealed caloric ration packs", False, 4),
            ("Aviation Turbine Fuel (POL)", "POL-FUEL", "Heavy aviation fuel and sub-zero diesel lubricants", False, 5),
            ("Tactical UAV Lithium Batteries", "UAV-PWR", "Extreme low-temperature drone power cells", False, 3),
            ("Extreme Cold Weather Clothing", "CLOTH-ECWCS", "High-altitude mountaineering tactical suits", False, 3)
        ]
        created_cats = []
        for c_name, c_code, c_desc, c_cc, c_prio in categories_data:
            cat = ProductCategory(name=c_name, code=c_code, description=c_desc, requires_cold_chain=c_cc, priority_level=c_prio)
            db.add(cat)
            created_cats.append(cat)
        db.flush()

        print("Seeding Strategic Products...")
        products_data = [
            ("MED-PLAS-001", "Freeze-Dried Universal Blood Plasma", created_cats[0].id, "Cartons", 2.5, 0.005, -20.0, 4.0, 60.0, 730, 200.0, 100.0, 12500.0),
            ("MED-HEMO-002", "Emergency Whole Blood Units (O-Neg)", created_cats[0].id, "Pounds", 0.5, 0.001, 2.0, 6.0, 65.0, 42, 80.0, 40.0, 8500.0),
            ("RAT-HIGH-101", "High-Altitude Self-Heating Ration (4500 kcal)", created_cats[1].id, "Packs", 1.2, 0.003, -40.0, 45.0, 80.0, 1095, 1500.0, 800.0, 650.0),
            ("RAT-SURV-102", "Emergency Survival Glucose Nutrient Bars", created_cats[1].id, "Tins", 0.8, 0.002, -50.0, 50.0, 75.0, 1825, 1000.0, 500.0, 420.0),
            ("POL-ATF-201", "Sub-Zero Aviation Turbine Fuel (JP-8/Jet A-1)", created_cats[2].id, "Drums (200L)", 165.0, 0.25, -55.0, 45.0, 90.0, 730, 400.0, 200.0, 18000.0),
            ("POL-DSL-202", "Arctic Winter-Grade Diesel Fuel (Anti-Freeze)", created_cats[2].id, "Drums (200L)", 175.0, 0.25, -50.0, 45.0, 90.0, 730, 600.0, 300.0, 16500.0),
            ("UAV-BAT-301", "Thermal-Insulated High-Discharge LiFePO4 Battery Pack", created_cats[3].id, "Units", 4.5, 0.008, -30.0, 40.0, 70.0, 500, 150.0, 75.0, 28000.0),
            ("ECW-SUIT-401", "Special Forces Multi-Layer Arctic Survival Parka", created_cats[4].id, "Suits", 3.2, 0.02, -60.0, 40.0, 85.0, 1825, 300.0, 150.0, 9500.0)
        ]
        created_prods = []
        for sku, p_name, cid, uom, wt, vol, mint, maxt, maxh, sl, reord, emerg, cost in products_data:
            prod = Product(
                sku=sku, name=p_name, category_id=cid, unit_of_measure=uom,
                weight_kg_per_unit=wt, volume_m3_per_unit=vol, min_safe_temp_c=mint,
                max_safe_temp_c=maxt, max_safe_humidity_pct=maxh, nominal_shelf_life_days=sl,
                reorder_threshold=reord, emergency_buffer_min=emerg, unit_cost_inr=cost
            )
            db.add(prod)
            created_prods.append(prod)
        db.flush()

        print("Seeding Inventory Items and Batches with Arrhenius Tracking...")
        now = datetime.utcnow()
        stock_allocations = [
            # Leh Forward (WH-LEH-01) - High altitude, winter risk
            ("WH-LEH-01", created_prods[0].id, 180.0, [("BATCH-PLAS-LEH-01", 180.0, now - timedelta(days=60), now + timedelta(days=670), 3.2, "OPTIMAL")]),
            ("WH-LEH-01", created_prods[1].id, 35.0, [("BATCH-HEMO-LEH-01", 35.0, now - timedelta(days=22), now + timedelta(days=20), 5.8, "ELEVATED_RISK")]), # Low stock & risk!
            ("WH-LEH-01", created_prods[2].id, 1250.0, [("BATCH-MRE-LEH-01", 1250.0, now - timedelta(days=90), now + timedelta(days=1005), -5.0, "OPTIMAL")]),
            ("WH-LEH-01", created_prods[4].id, 320.0, [("BATCH-ATF-LEH-01", 320.0, now - timedelta(days=40), now + timedelta(days=690), -12.0, "OPTIMAL")]),
            ("WH-LEH-01", created_prods[6].id, 65.0, [("BATCH-UAV-LEH-01", 65.0, now - timedelta(days=30), now + timedelta(days=470), -8.0, "OPTIMAL")]),
            
            # Chandigarh Hub (WH-CHD-01) - Deep strategic reserve
            ("WH-CHD-01", created_prods[0].id, 1400.0, [("BATCH-PLAS-CHD-01", 1400.0, now - timedelta(days=30), now + timedelta(days=700), -22.0, "OPTIMAL")]),
            ("WH-CHD-01", created_prods[1].id, 280.0, [("BATCH-HEMO-CHD-01", 280.0, now - timedelta(days=10), now + timedelta(days=32), 3.5, "OPTIMAL")]),
            ("WH-CHD-01", created_prods[2].id, 8500.0, [("BATCH-MRE-CHD-01", 8500.0, now - timedelta(days=45), now + timedelta(days=1050), 22.0, "OPTIMAL")]),
            ("WH-CHD-01", created_prods[4].id, 2400.0, [("BATCH-ATF-CHD-01", 2400.0, now - timedelta(days=15), now + timedelta(days=715), 24.0, "OPTIMAL")]),
            
            # Siliguri Staging (WH-SLG-01)
            ("WH-SLG-01", created_prods[2].id, 3200.0, [("BATCH-MRE-SLG-01", 3200.0, now - timedelta(days=50), now + timedelta(days=1045), 25.0, "OPTIMAL")]),
            ("WH-SLG-01", created_prods[5].id, 850.0, [("BATCH-DSL-SLG-01", 850.0, now - timedelta(days=30), now + timedelta(days=700), 26.0, "OPTIMAL")]),
        ]

        for wh_code, prod_id, qty, batch_list in stock_allocations:
            wh_obj = created_wh[wh_code]
            inv = InventoryItem(
                warehouse_id=wh_obj.id,
                product_id=prod_id,
                quantity_on_hand=qty,
                isolation_adjusted_dos=round(qty / 25.0 * (1.0 - wh_obj.isolation_risk_score * 0.4), 1),
                stock_truth_score=wh_obj.stock_truth_score,
                spoilage_risk_index=0.08 if "HEMO" in str(batch_list) else 0.02
            )
            db.add(inv)
            db.flush()

            for b_num, b_qty, mfg, exp, temp, q_st in batch_list:
                batch = InventoryBatch(
                    inventory_id=inv.id,
                    batch_number=b_num,
                    initial_quantity=b_qty,
                    current_quantity=b_qty,
                    manufacture_date=mfg,
                    expiry_date=exp,
                    dynamic_remaining_shelf_life_days=max(1.0, (exp - now).total_seconds() / 86400.0),
                    quality_status=q_st,
                    smart_drum_fill_pct=88.5
                )
                db.add(batch)

            # Record initial inventory intake transaction
            tx = InventoryTransaction(
                inventory_id=inv.id,
                transaction_type="RECEIVE",
                quantity=qty,
                balance_after=qty,
                reference_number="INITIAL-DEPOT-LOAD",
                notes="Standard logistics stock intake authorization"
            )
            db.add(tx)
        db.flush()

        print("Seeding Corridors and Convoys...")
        corridors_data = [
            ("CORR-MANALI-LEH", "Manali - Leh Strategic Alpine Highway", "Western Command", "Northern Command", 428.0, 0.42, 0.78, True, 22.0, "CONVOY_RESTRICTED"),
            ("CORR-ZOJILA-LEH", "Zojila Pass - Srinagar to Leh Expressway", "Northern Command", "Northern Command", 434.0, 0.58, 0.62, False, 18.0, "CONVOY_RESTRICTED"),
            ("CORR-SILIGURI-TAWANG", "Siliguri to Tawang Forward Axis", "Eastern Command", "Eastern Command", 390.0, 0.88, 0.20, False, 14.0, "OPEN_CLEAR"),
            ("CORR-DELHI-CHANDIGARH", "Delhi - Chandigarh Grand Logistics Trunk", "Central Command", "Western Command", 245.0, 0.99, 0.00, False, 5.0, "OPEN_CLEAR")
        ]
        created_corrs = []
        for code, c_name, orig, dest, dist, pass_sc, aval, w_close, tr_hrs, st in corridors_data:
            corr = CorridorReliability(
                code=code, name=c_name, origin_region=orig, destination_region=dest,
                distance_km=dist, passability_score=pass_sc, avalanche_risk_index=aval,
                winter_closure_active=w_close, average_transit_hours=tr_hrs, current_status=st
            )
            db.add(corr)
            created_corrs.append(corr)
        db.flush()

        convoys_data = [
            ("CNV-NORTH-2026-081", created_corrs[1].id, created_wh["WH-SXR-01"].id, created_wh["WH-LEH-01"].id, "HEAVY_CONVOY", "IN_TRANSIT", 34.28, 75.32, 14500.0, now - timedelta(hours=6), now + timedelta(hours=12), "MODERATE", "Escorted tactical echelon carrying winter diesel drums"),
            ("CNV-ROTARY-2026-014", created_corrs[0].id, created_wh["WH-CHD-01"].id, created_wh["WH-LEH-01"].id, "ROTARY_AIRLIFT", "IN_TRANSIT", 32.85, 77.10, 3800.0, now - timedelta(hours=2), now + timedelta(hours=3), "LOW", "Mi-17V5 heavy sortie carrying emergency blood plasma and vaccines"),
            ("CNV-EAST-2026-092", created_corrs[2].id, created_wh["WH-SLG-01"].id, created_wh["WH-LEH-01"].id, "HEAVY_CONVOY", "SCHEDULED", None, None, 18000.0, now + timedelta(hours=4), now + timedelta(hours=26), "LOW", "Scheduled dry ration echelon")
        ]
        for c_code, c_id, s_id, d_id, mode, st, lat, lng, wt, dep, eta, risk, nts in convoys_data:
            tr = TransportationRecord(
                convoy_code=c_code, corridor_id=c_id, source_warehouse_id=s_id,
                dest_warehouse_id=d_id, transport_mode=mode, status=st,
                current_latitude=lat, current_longitude=lng, cargo_weight_kg=wt,
                departure_time=dep, estimated_arrival=eta, environmental_risk_level=risk, notes=nts
            )
            db.add(tr)
        db.flush()

        print("Seeding Defense Suppliers...")
        suppliers_data = [
            ("SUP-DEF-ORD-01", "Bharat Ordnance & Ration Corp", "High-Calorie Rations", 0.96, 94.2, 99.5, 5, "LOW_RISK", "Major General (Retd) S. Sharma", "procurement@borc.gov.in", "+91-11-23010001", "New Delhi Logistics Park"),
            ("SUP-HIM-COLD-02", "Himalayan Cold-Chain Resuscitation Labs", "Field Medical & Plasma", 0.91, 88.0, 99.8, 4, "MODERATE_RISK", "Dr. Neelam Mehta", "supplies@himcold.in", "+91-172-2740002", "Chandigarh Biotech Zone"),
            ("SUP-AERO-POL-03", "Aviation Petroleum & Petrochemicals Corp", "Aviation Turbine Fuel", 0.98, 97.5, 99.9, 7, "LOW_RISK", "Rajesh Singhania", "defense.pol@appc.in", "+91-22-26500003", "Mumbai Petro Complex")
        ]
        for code, s_name, cat, rel, ot, qp, lt, rk, cont, em, ph, ad in suppliers_data:
            sup = Supplier(
                code=code, name=s_name, category=cat, reliability_score=rel,
                on_time_delivery_rate=ot, quality_pass_rate=qp, lead_time_days=lt,
                risk_level=rk, contact_person=cont, email=em, phone=ph, address=ad, is_active=True
            )
            db.add(sup)
        db.flush()

        print("Seeding Weather Observations...")
        weather_data = [
            (created_wh["WH-LEH-01"].id, "Leh Ladakh Alpine Sector", -14.5, 68.0, 0.0, 18.5, 38.0, 3.5, "AMBER_CAUTION", 0.75, "OPEN_METEO_ALPINE"),
            (created_wh["WH-CHD-01"].id, "Chandigarh Logistics Hub", 18.2, 52.0, 0.0, 0.0, 12.0, 10.0, "GREEN_NOMINAL", 0.10, "OPEN_METEO_ALPINE"),
            (created_wh["WH-SXR-01"].id, "Srinagar Kashmir Valley", 1.8, 76.0, 12.0, 4.2, 22.0, 6.0, "AMBER_CAUTION", 0.65, "OPEN_METEO_ALPINE"),
            (created_wh["WH-SLG-01"].id, "Siliguri Plains", 24.5, 82.0, 5.0, 0.0, 8.0, 9.0, "GREEN_NOMINAL", 0.25, "OPEN_METEO_ALPINE")
        ]
        for w_id, reg, temp, hum, rain, snow, wind, vis, threat, cloud, prov in weather_data:
            wo = WeatherObservation(
                warehouse_id=w_id, region_name=reg, temperature_c=temp,
                humidity_percent=hum, rainfall_mm=rain, snowfall_cm=snow,
                wind_speed_kmh=wind, visibility_km=vis, environmental_threat_code=threat,
                satellite_cloud_index=cloud, provider_source=prov
            )
            db.add(wo)
        db.flush()

        print("Seeding Recommendations with Challenger AI Verification...")
        recs_data = [
            (
                "REC-PREWINTER-2026-001",
                "Pre-Winter Surge Redistribution: Rations to Leh Forward",
                "SMART_REDISTRIBUTION",
                "IMMEDIATE_CRITICAL",
                "Forecast models predict Manali-Leh corridor closure within 8 days due to 35cm blizzard accumulation. Transfer 1,500 packs of High-Altitude Rations from Chandigarh Hub.",
                created_wh["WH-CHD-01"].id,
                created_wh["WH-LEH-01"].id,
                created_prods[2].id,
                1500.0,
                "VERIFIED_FEASIBLE",
                "Challenger AI verified: Chandigarh has 8,500 packs on hand (>30% minimum safety buffer retained). Road transit window feasible if dispatched within 36 hours.",
                "Alternative: Split 50% via road convoy and 50% rotary airlift if passability drops below 0.40.",
                0.97,
                "PENDING_HUMAN_APPROVAL"
            ),
            (
                "REC-PLASMA-ROTARY-002",
                "Emergency Rotary Airlift: Universal Plasma to Leh Depot",
                "EMERGENCY_BUFFER",
                "IMMEDIATE_CRITICAL",
                "Leh Forward O-Negative whole blood units depleted to 35 units (isolation days of supply < 8 days). Surface passes restricted.",
                created_wh["WH-CHD-01"].id,
                created_wh["WH-LEH-01"].id,
                created_prods[1].id,
                100.0,
                "VERIFIED_FEASIBLE",
                "Challenger AI verified: Road transit unviable due to Arrhenius thermal kinetic deterioration over 22-hour convoy. Rotary airlift (3.5 hour sortie) keeps cold chain intact at 3.5C.",
                "Alternative: Dispatch from Srinagar Advanced Ordnance depot via All-Terrain tracked ambulance.",
                0.99,
                "APPROVED"
            )
        ]
        for code, tit, cat, urg, desc, s_id, t_id, p_id, qty, c_stat, c_rat, c_alt, conf, app_st in recs_data:
            r = Recommendation(
                recommendation_code=code, title=tit, category=cat, urgency=urg,
                description=desc, source_warehouse_id=s_id, target_warehouse_id=t_id,
                product_id=p_id, recommended_quantity=qty,
                challenger_verification_status=c_stat, challenger_rationale=c_rat,
                alternative_strategy=c_alt, confidence_score=conf, approval_status=app_st
            )
            db.add(r)
        db.flush()

        print("Seeding IoT Sensors and Smart-Drum Devices...")
        sensors_data = [
            ("ESP32-LEH-CHAMBER-01", "Leh Cryogenic Plasma Chamber Probe", created_wh["WH-LEH-01"].id, "COLD_CHAIN_PROBE", 96.0, -62.0, 3.2, 45.0, None),
            ("ESP32-LEH-DRUM-ATF-01", "Leh Smart-Drum Level Sensor (POL)", created_wh["WH-LEH-01"].id, "SMART_DRUM_LOADCELL", 99.0, -58.0, -11.0, 30.0, 84.5),
            ("ESP32-CHD-VAULT-01", "Chandigarh Main Medical Deep Freezer", created_wh["WH-CHD-01"].id, "COLD_CHAIN_PROBE", 100.0, -50.0, -21.4, 38.0, None)
        ]
        for uid, s_name, w_id, d_type, bat, sig, temp, hum, fill in sensors_data:
            dev = SensorDevice(
                device_uid=uid, name=s_name, warehouse_id=w_id,
                device_type=d_type, battery_level_pct=bat, signal_strength_dbm=sig,
                is_online=True
            )
            db.add(dev)
            db.flush()
            
            # Add initial telemetry reading
            rd = SensorReading(
                device_id=dev.id,
                temperature_c=temp,
                humidity_percent=hum,
                fill_level_percent=fill,
                drum_weight_kg=168.0 if fill else None
            )
            db.add(rd)
        db.flush()

        print("Seeding Tactical Notifications...")
        notifs_data = [
            ("BLIZZARD WARNING - ZOJILA CORRIDOR", "Satellite observation indicates 28cm snowfall on Zojila Pass. Heavy convoy speeds restricted to 15 km/h.", "WARNING", "WEATHER", "/transportation"),
            ("LOW BUFFER ALERT - WHOLE BLOOD O-NEG", "Leh Forward Depot is at 35 units (Isolation DoS: 7.2 days). Challenger AI verified recommendation pending command authorization.", "CRITICAL", "INVENTORY", "/recommendations"),
            ("SMART-DRUM DEPLETION DETECTED", "ESP32-LEH-DRUM-ATF-01 reported 84.5% fill level. Inflow/outflow balanced against verified ledger.", "INFO", "IOT", "/iot")
        ]
        for tit, msg, sev, cat, url in notifs_data:
            db.add(Notification(title=tit, message=msg, severity=sev, category=cat, is_read=False, action_url=url))

        print("Seeding Integration Settings...")
        integrations_data = [
            ("WEATHER", "Open-Meteo High-Resolution Alpine API", "CONNECTED", True, "https://api.open-meteo.com/v1/forecast"),
            ("SATELLITE", "ISRO MOSDAC Satellite Telemetry", "SIMULATED", True, "https://mosdac.gov.in/api/v2"),
            ("MAPPING", "Leaflet OpenStreetMap Tactical GIS", "CONNECTED", True, "https://tile.openstreetmap.org/{z}/{x}/{y}.png"),
            ("AI_LLM", "Integrated Defense LLM Decision Layer", "CONNECTED", True, "http://localhost:8000/api/v1/assistant/query"),
            ("MQTT", "ESP32 Field Sensor MQTT Broker", "CONNECTED", True, "mqtt://localhost:1883")
        ]
        for s_name, p_name, st, en, url in integrations_data:
            db.add(IntegrationSetting(service_name=s_name, provider_name=p_name, status=st, is_enabled=en, endpoint_url=url))

        db.commit()
        print("SEEDING COMPLETE! Database ready with operational tactical records.")
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
