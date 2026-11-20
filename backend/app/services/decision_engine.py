from datetime import datetime
from typing import Dict, Any, List

class PredictiveLogisticsDecisionEngine:
    """
    Central Predictive Logistics Decision Engine for Project SHIKHAR.
    Connects U1, U2, U3, U4, U8, U9, U10, U13, U18 adapters.
    """
    @staticmethod
    def calculate_isolation_adjusted_dos(
        stock_on_hand: float,
        daily_burn_rate: float,
        isolation_risk_score: float, # 0.0 to 1.0 (e.g. winter cutoff risk)
        stock_truth_score: float = 0.98,
        spoilage_risk_factor: float = 0.05
    ) -> Dict[str, Any]:
        """
        U1: Isolation-Adjusted Days of Supply.
        Adjusts raw days-of-supply by multiplying effective stock with truth score
        and scaling demand for emergency isolation contingencies.
        """
        burn_rate = max(1.0, daily_burn_rate)
        # Truth-adjusted physical inventory
        effective_stock = stock_on_hand * stock_truth_score * (1.0 - spoilage_risk_factor)
        
        # Isolation multiplier: if pass is 80% likely to close, daily safety buffer needed is higher
        demand_drag_multiplier = 1.0 + (isolation_risk_score * 0.8)
        adjusted_burn_rate = burn_rate * demand_drag_multiplier
        
        dos = effective_stock / adjusted_burn_rate
        
        # Buffer recommendation
        recommended_buffer_days = 30.0 + (isolation_risk_score * 60.0) # Up to 90 days for high-altitude Leh
        shortage_risk = "HIGH_CRITICAL" if dos < recommended_buffer_days else ("MODERATE_WARN" if dos < (recommended_buffer_days * 1.3) else "OPTIMAL_SAFE")
        
        return {
            "isolation_adjusted_dos": round(dos, 1),
            "raw_dos": round(stock_on_hand / burn_rate, 1),
            "recommended_buffer_days": round(recommended_buffer_days, 1),
            "shortage_risk": shortage_risk,
            "demand_drag_multiplier": round(demand_drag_multiplier, 2)
        }

    @staticmethod
    def verify_with_challenger_ai(
        proposed_action: str,
        source_warehouse_code: str,
        target_warehouse_code: str,
        product_sku: str,
        quantity: float,
        corridor_passability: float,
        source_stock_available: float
    ) -> Dict[str, Any]:
        """
        U18 Challenger AI:
        Critiques proposed logistics movements, checks physical bottleneck feasibility,
        and provides counter-factual alternative strategies.
        """
        if corridor_passability < 0.40:
            status = "CONSTRAINED_BY_PASS"
            rationale = (
                f"Challenger AI Alert: Surface corridor to {target_warehouse_code} has passability index {corridor_passability * 100:.1f}%. "
                "Severe avalanche/blizzard hazard makes heavy road convoy unviable."
            )
            alternative = (
                f"Switch transport mode to Rotary Heavy Airlift (Mi-17V5 / Chinook) or dispatch "
                f"a lighter echelon from an alternate intermediate staging base."
            )
            confidence = 0.94
        elif quantity > source_stock_available * 0.7:
            status = "DEPLETION_RISK_AT_SOURCE"
            rationale = (
                f"Challenger AI Warning: Transferring {quantity} units depletes {source_warehouse_code} below its "
                "mandatory strategic tactical reserve (leaving < 30% operational stock)."
            )
            alternative = f"Split fulfillment: 60% from {source_warehouse_code} and 40% from Central Strategic Reserve."
            confidence = 0.91
        else:
            status = "VERIFIED_FEASIBLE"
            rationale = (
                f"Challenger AI Verification Confirmed: Corridor passability is {corridor_passability * 100:.1f}%. "
                f"Source warehouse {source_warehouse_code} retains sufficient safety buffer post-dispatch."
            )
            alternative = "Proceed with scheduled convoy echelon under standard tactical tracking."
            confidence = 0.98

        return {
            "status": status,
            "rationale": rationale,
            "alternative": alternative,
            "confidence": confidence
        }
