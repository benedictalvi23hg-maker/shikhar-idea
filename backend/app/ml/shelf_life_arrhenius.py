import math
from datetime import datetime

# Gas constant R in J/(mol·K)
R_GAS = 8.314

class ArrheniusDegradationEngine:
    """
    Implements U3 Physics-Informed Prediction and U13 Dynamic Remaining Shelf Life.
    Calculates temperature-dependent quality loss velocity using kinetic Arrhenius modeling.
    """
    @staticmethod
    def calculate_depletion_velocity(
        current_temp_c: float,
        reference_temp_c: float = 4.0,
        activation_energy_kj: float = 85.0
    ) -> float:
        """
        k(T) / k(T_ref) = exp( (Ea / R) * (1/T_ref - 1/T) )
        """
        T_kelvin = current_temp_c + 273.15
        T_ref_kelvin = reference_temp_c + 273.15
        Ea_joules = activation_energy_kj * 1000.0

        if T_kelvin <= 0:
            return 0.1 # Cryogenic freezing halts degradation

        exponent = (Ea_joules / R_GAS) * ((1.0 / T_ref_kelvin) - (1.0 / T_kelvin))
        velocity = math.exp(exponent)
        return max(0.05, min(velocity, 25.0)) # Clamped between 0.05x and 25x

    @classmethod
    def compute_dynamic_rsl(
        cls,
        manufacture_date: datetime,
        nominal_expiry_date: datetime,
        current_temp_c: float,
        reference_temp_c: float = 4.0,
        activation_energy_kj: float = 85.0,
        humidity_pct: float = 50.0
    ) -> dict:
        now = datetime.utcnow()
        # Ensure timezone-naive comparison to avoid Python aware/naive subtraction crashes
        if nominal_expiry_date.tzinfo is not None:
            nominal_expiry_date = nominal_expiry_date.replace(tzinfo=None)
        if manufacture_date.tzinfo is not None:
            manufacture_date = manufacture_date.replace(tzinfo=None)

        nominal_total_days = max(1.0, (nominal_expiry_date - manufacture_date).total_seconds() / 86400.0)
        nominal_remaining_days = max(0.0, (nominal_expiry_date - now).total_seconds() / 86400.0)
        
        velocity = cls.calculate_depletion_velocity(current_temp_c, reference_temp_c, activation_energy_kj)
        
        # Humidity penalty factor for packaging degradation (e.g. rations or dry goods)
        humidity_factor = 1.0
        if humidity_pct > 75.0:
            humidity_factor = 1.0 + ((humidity_pct - 75.0) / 100.0) * 0.5

        effective_velocity = velocity * humidity_factor
        
        # Adjusted Dynamic Remaining Shelf Life (U13)
        dynamic_rsl = nominal_remaining_days / effective_velocity

        # Classification
        if dynamic_rsl <= 0.0:
            risk = "SPOILED"
            action = "CONDEMN & DISPOSE: Quality integrity compromised."
            mandate_inspection = True
        elif dynamic_rsl < (nominal_total_days * 0.15) or dynamic_rsl < 7.0:
            risk = "CRITICAL_EXPEDITE"
            action = "IMMEDIATE DISPATCH OR CONSUMPTION: Rapid thermal acceleration detected."
            mandate_inspection = True
        elif dynamic_rsl < (nominal_total_days * 0.35) or dynamic_rsl < 30.0:
            risk = "ELEVATED_RISK"
            action = "INSPECT BATCH: Prioritize for forward deployment before seasonal cutoff."
            mandate_inspection = False
        else:
            risk = "OPTIMAL"
            action = "NOMINAL COLD CHAIN STABLE: Standard monitoring active."
            mandate_inspection = False

        return {
            "dynamic_remaining_shelf_life_days": round(dynamic_rsl, 1),
            "nominal_remaining_days": round(nominal_remaining_days, 1),
            "depletion_velocity": round(effective_velocity, 2),
            "risk_classification": risk,
            "recommended_action": action,
            "inspection_mandated": mandate_inspection
        }
