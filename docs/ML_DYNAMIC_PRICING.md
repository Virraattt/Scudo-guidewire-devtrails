# Dynamic Premium Calculation & ML-Powered Hyper-Local Risk Assessment

## Overview

Scudo's premium calculation combines **actuarial science** with **machine learning** to deliver hyper-personalized pricing. Drivers in the same city with different activity patterns pay different premiums.

---

## Three-Layer Risk Model

### Layer 1: Actuarial Baseline (City × Disruption Type)

**Source:** 5 years of historical data aggregated by city

```
Annual_Risk = Σ [disruption_days(category) × avg_daily_earn × loss_rate(category)]

Calculation:
  Weather_Risk = 15 days × ₹1,200 × 0.667 = ₹12,006
  AQI_Risk     = 2 days  × ₹1,200 × 0.30  = ₹720
  Heat_Risk    = 4 days  × ₹1,200 × 0.35  = ₹1,680
  Civil_Risk   = 3 days  × ₹1,200 × 0.75  = ₹2,700
  Market_Risk  = 5 days  × ₹1,200 × 0.40  = ₹2,400
  
  Total Annual_Risk = ₹19,506
```

**City Risk Profiles (Built-in):**

```javascript
const cityRiskProfiles = {
  'Mumbai': {
    weather_days: 15, weather_loss_rate: 0.667,
    civil_days: 3, civil_loss_rate: 0.75,
    aqi_days: 2, aqi_loss_rate: 0.30,
    heat_days: 4, heat_loss_rate: 0.35,
    market_days: 5, market_loss_rate: 0.40,
    base_seasonality: 1.0
  },
  'Delhi': {
    weather_days: 6, weather_loss_rate: 0.65,
    civil_days: 4, civil_loss_rate: 0.80,
    aqi_days: 12, aqi_loss_rate: 0.50,  // ← Much higher AQI risk
    heat_days: 8, heat_loss_rate: 0.45,
    market_days: 4, market_loss_rate: 0.35,
    base_seasonality: 1.1
  },
  'Bangalore': {
    weather_days: 5, weather_loss_rate: 0.60,
    civil_days: 2, civil_loss_rate: 0.70,
    aqi_days: 1, aqi_loss_rate: 0.25,
    heat_days: 2, heat_loss_rate: 0.30,
    market_days: 3, market_loss_rate: 0.32,
    base_seasonality: 0.9  // ← Lowest risk
  }
};
```

### Layer 2: Driver-Specific ML Scoring

**Key Personalization Input:** `avg_daily_earn` (driver's unique earning power)

```
Risk_Drivers = [
  avg_daily_earn,        // ← Primary: ₹750-₹1,400/day variation
  weekly_hours,          // Activity intensity
  weekly_orders,         // Throughput consistency
  weekly_gmv,            // Value per transaction
  tenure,                // New vs established driver
  vehicle_type,          // Two-wheeler vs auto exposure
  zone_location,         // High-risk vs low-risk neighborhoods
  enrollment_month,      // Seasonal stress at signup
  cohort_benchmarks      // Peer group comparison
]
```

**Implementation (Simplified):**

```python
def calculate_risk_profile(driver_data):
    """ML-inspired risk scoring (production: use Gradient Boosting)"""
    
    city_profile = cityRiskProfiles[driver_data['city']]
    
    # Base annual risk from city × earning power
    annual_risk = (
        (city_profile.weather_days * driver_data['avg_daily_earn'] * city_profile.weather_loss_rate) +
        (city_profile.aqi_days * driver_data['avg_daily_earn'] * city_profile.aqi_loss_rate) +
        (city_profile.heat_days * driver_data['avg_daily_earn'] * city_profile.heat_loss_rate) +
        (city_profile.civil_days * driver_data['avg_daily_earn'] * city_profile.civil_loss_rate) +
        (city_profile.market_days * driver_data['avg_daily_earn'] * city_profile.market_loss_rate)
    ) * city_profile.base_seasonality
    
    return annual_risk
```

### Layer 3: Worker Activity Index (WAI) — Real-Time Adjustment

**Purpose:** Normalize for part-time vs full-time workers in same city.

**Formula:**

```
WAI = 0.4 × hours_ratio + 0.3 × orders_ratio + 0.3 × value_ratio

Where:
  hours_ratio  = driver_weekly_hours / city_median_weekly_hours
  orders_ratio = driver_weekly_orders / city_median_weekly_orders
  value_ratio  = driver_weekly_gmv / city_median_weekly_gmv

Constraints:
  Clamped to [0.5, 1.2]
  Floor: 0.5 (part-time coverage flagged for review)
  Ceiling: 1.2 (premium cap for overactive drivers)
```

**City Medians (Real Data):**

```
Mumbai:
  Median weekly hours: 45h
  Median weekly orders: 120
  Median weekly GMV: ₹5,000

Delhi:
  Median weekly hours: 48h
  Median weekly orders: 130
  Median weekly GMV: ₹5,200

Bangalore:
  Median weekly hours: 42h
  Median weekly orders: 115
  Median weekly GMV: ₹4,800
```

**Example Calculation:**

```
Driver A (Rajesh, Mumbai):
  weekly_hours: 50h    → ratio = 50/45 = 1.11
  weekly_orders: 140   → ratio = 140/120 = 1.17
  weekly_gmv: ₹6,000   → ratio = 6000/5000 = 1.20
  
  WAI = 0.4 × 1.11 + 0.3 × 1.17 + 0.3 × 1.20
      = 0.444 + 0.351 + 0.360
      = 1.155 (HIGH activity)
  
  Interpretation: Rajesh works more hours, completes more orders,
  and earns higher value than typical Mumbai driver.
  → Premium multiplier: 115.5%

Driver B (Priya, same Mumbai, part-time):
  weekly_hours: 20h    → ratio = 20/45 = 0.44 → clamped to 0.50
  weekly_orders: 50    → ratio = 50/120 = 0.42 → clamped to 0.50
  weekly_gmv: ₹2,000   → ratio = 2000/5000 = 0.40 → clamped to 0.50
  
  WAI = 0.4 × 0.50 + 0.3 × 0.50 + 0.3 × 0.50
      = 0.50 (MINIMUM activity)
  
  Interpretation: Priya is part-time. Activity below sustainable threshold.
  → Premium multiplier: 50% (heavily subsidized)
  → Account flagged: needs re-enrollment at 30-60 days
```

**Key Insight:** Same city, vastly different premia due to activity differences.

---

## Premium Calculation Pipeline

```
Input: Driver Registration Data
  ↓
[1] Calculate annual risk from city baseline + earnings
  ↓
[2] Assign risk tier: Low/Medium/High/VeryHigh
  ↓
[3] Apply premium rate: 14%/12%/10%/8%
  ↓
[4] Calculate: annual_premium = annual_risk × premium_rate
  ↓
[5] Convert to weekly: weekly_base = annual_premium / 52
  ↓
[6] Calculate WAI score from activity indices
  ↓
[7] Apply WAI multiplier: final_weekly = weekly_base × WAI
  ↓
[8] Clamp to affordability ceiling: cap at city_percentile_75
  ↓
Output: Personalized Weekly Premium
```

---

## Complete Example: Three Drivers, Same City

### Setup
City: **Mumbai** (High disruption risk)
All drivers: 90-day history available

### Driver 1: Full-Time, Above-Average Earner (Rajesh)

```
Input:
  avg_daily_earn: ₹1,200
  weekly_hours: 50
  weekly_orders: 140
  weekly_gmv: ₹6,000

Calculation:
[1] Annual Risk = (15×1200×0.667) + (3×1200×0.75) + (2×1200×0.30) + 
                  (4×1200×0.35) + (5×1200×0.40)
                = ₹19,506

[2] Risk Tier = Medium (₹6,001-₹15,000 exceeds, so High → ₹15,001-₹30,000)
             = High tier
             
[3] Premium Rate = 10% (High tier rate)

[4] Annual Premium = ₹19,506 × 0.10 = ₹1,950.60

[5] Weekly Base = ₹1,950.60 / 52 = ₹37.51

[6] WAI Score = 0.4×(50/45) + 0.3×(140/120) + 0.3×(6000/5000)
              = 0.4×1.11 + 0.3×1.17 + 0.3×1.20
              = 1.155
              → clamped to 1.2 (ceiling)
              → Use 1.15

[7] Final Weekly Premium = ₹37.51 × 1.15 = ₹43.14

Annual cost to Rajesh: ₹43.14 × 52 = ₹2,243.28
As % of annual earnings: ₹2,243.28 / (₹1,200 × 250 working days) = 0.75% 
```

### Driver 2: Medium-Time, Average Earner (Ankita)

```
Input:
  avg_daily_earn: ₹1,000
  weekly_hours: 35
  weekly_orders: 95
  weekly_gmv: ₹4,200

Calculation:
[1] Annual Risk = (15×1000×0.667) + (3×1000×0.75) + (2×1000×0.30) + 
                  (4×1000×0.35) + (5×1000×0.40)
                = ₹16,255

[2] Risk Tier = Medium (₹6,001-₹15,000? No, exceeds → High)
             = High tier
             
[3] Premium Rate = 10%

[4] Annual Premium = ₹16,255 × 0.10 = ₹1,625.50

[5] Weekly Base = ₹1,625.50 / 52 = ₹31.26

[6] WAI Score = 0.4×(35/45) + 0.3×(95/120) + 0.3×(4200/5000)
              = 0.4×0.78 + 0.3×0.79 + 0.3×0.84
              = 0.80

[7] Final Weekly Premium = ₹31.26 × 0.80 = ₹25.01

Annual cost to Ankita: ₹25.01 × 52 = ₹1,300.52
As % of annual earnings: ₹1,300.52 / (₹1,000 × 250) = 0.52%
```

### Driver 3: Part-Time, Lower Earner (Neha)

```
Input:
  avg_daily_earn: ₹650
  weekly_hours: 18
  weekly_orders: 45
  weekly_gmv: ₹2,100

Calculation:
[1] Annual Risk = (15×650×0.667) + (3×650×0.75) + (2×650×0.30) + 
                  (4×650×0.35) + (5×650×0.40)
                = ₹10,564

[2] Risk Tier = Medium (₹6,001-₹15,000)
             = Medium tier
             
[3] Premium Rate = 12% (Medium tier)

[4] Annual Premium = ₹10,564 × 0.12 = ₹1,267.68

[5] Weekly Base = ₹1,267.68 / 52 = ₹24.38

[6] WAI Score = 0.4×(18/45) + 0.3×(45/120) + 0.3×(2100/5000)
              = 0.4×0.40 + 0.3×0.375 + 0.3×0.42
              = 0.384  → clamped to 0.50 (floor)

[7] Final Weekly Premium = ₹24.38 × 0.50 = ₹12.19

Annual cost to Neha: ₹12.19 × 52 = ₹634
As % of annual earnings: ₹634 / (₹650 × 250) = 0.39%
NOTE: Below sustainability threshold - flagged for review
```

### Comparison

| | Rajesh | Ankita | Neha |
|---|---|---|---|
| Daily Earnings | ₹1,200 | ₹1,000 | ₹650 |
| Weekly Premium | **₹43.14** | **₹25.01** | **₹12.19** |
| % of Income | **0.75%** | **0.52%** | **0.39%** |
| Risk Tier | High | High | Medium |
| WAI Score | 1.15 | 0.80 | 0.50 |
| Status | Active | Active | **Flagged** |

**Key Insight:** Neha's activity is too low for sustainable coverage. After 30 days of data collection, her premium will be reassessed or coverage paused.

---

## ML Model Structure (Production)

### Feature Engineering

```python
features = {
    # Driver demographics
    'city': categorical,
    'platform': categorical,
    'vehicle_type': categorical,
    'tenure_days': numeric,
    'enrollment_month': categorical,
    
    # Earnings & activity (30/60/90-day rolling)
    'avg_daily_earn_30d': numeric,
    'earnings_volatility_30d': numeric,
    'weekly_hours_30d': numeric,
    'weekly_orders_30d': numeric,
    'weekly_gmv_30d': numeric,
    
    # Zone characteristics
    'zone_risk_score': numeric,
    'zone_aqi_exposure': numeric,
    'zone_weather_risk': numeric,
    'zone_competition_level': numeric,
    
    # Historical claims
    'prior_payout_count': numeric,
    'avg_payout_size': numeric,
    'claim_frequency': numeric,
    
    # Benchmarking
    'percentile_vs_city_median': numeric,
    'percentile_vs_all_drivers': numeric
}
```

### Model Training (Offline)

```python
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler

# Training data: 50,000 drivers with known annual_risk exposure
X = feature_matrix  # (50000, 25) features
y = annual_risk_exposure  # (50000,) actual realized annual loss

# Preprocessing
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train model
model = GradientBoostingRegressor(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5,
    random_state=42
)
model.fit(X_scaled, y)

# Feature importance
feature_importance = pd.DataFrame({
    'feature': feature_names,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
```

### Feature Importance (Expected)

```
1. avg_daily_earn_30d          →  28% (biggest value at risk)
2. city                         →  18% (geographic baseline)
3. earnings_volatility_30d      →  12% (consistency indicator)
4. zone_risk_score              →   9% (neighborhood exposure)
5. weekly_hours_30d             →   8% (disruption exposure intensity)
... (remaining 25%)
```

### Real-Time Scoring

```python
def score_new_driver(registration_data):
    """Real-time risk scoring for new driver without 30-day history"""
    
    # Extract features
    features = extract_features(registration_data)
    
    # Preprocess
    features_scaled = scaler.transform([features])
    
    # Predict
    estimated_annual_risk = model.predict(features_scaled)[0]
    
    # Add cohort adjustment
    cohort_drivers = drivers.filter(
        city=registration_data['city'],
        enrollment_month=month,
        platform=registration_data['platform']
    )
    cohort_avg_risk = cohort_drivers.annual_risk.mean()
    adjusted_risk = estimated_annual_risk * (cohort_avg_risk / model_avg_risk)
    
    return adjusted_risk
```

---

## Dynamic Recalibration Rules

### Quarterly Review (Full Recalculation)

Every Q1/Q2/Q3/Q4:
- Pull latest 90-day earnings data
- Recalculate annual_risk
- Reassess risk tier & premium rate
- Update WAI score
- Issue new policy if rate changes

### Off-Cycle Triggers (Immediate Recalculation)

Triggered if any occur:

1. **Earnings Spike** — +25% in 30 days
   - Indicates capacity increase or prime location shift
   - Recalculate risk upward

2. **Earnings Collapse** — -25% in 30 days
   - Indicates platform issues or driver health problem
   - Recalculate risk downward
   - May require manual review

3. **City Change** — Driver moves cities
   - Different risk profile
   - Full tier reassessment
   - Premium may increase/decrease

4. **Platform Switch** — Driver adds/removes platform
   - Earning concentration risk changes
   - WAI recalculation
   - Premium adjustment

5. **Fraud Indicators** — 3+ payouts in 60 days
   - Statistically unusual claim frequency
   - Heightened scrutiny on next 2 claims
   - May suspend if pattern confirmed

### Volatility Cap

To prevent rate shock (confusing drivers):

```
Premium_Change_Cap = 15% per quarter
Example:
  Q1 premium: ₹50/week
  Q2 calculated: ₹42.50 (15% decrease)
  Q2 actual: ₹42.50 (allowed)
  
  Q2 calculated: ₹35 (30% decrease)
  Q2 actual: ₹42.50 (capped; ₹11 credit on next bill)
```

---

## Hyper-Local Risk Factors (Advanced ML)

### Zone-Level Micro-Segmentation

Instead of city-wide rates, use:

```python
zone_risk_score = calculate_zone_risk(
    lat=driver_zone_center_lat,
    lng=driver_zone_center_lng,
    urban_density,
    ambient_pollution_baseline,
    flood_susceptibility,
    bandh_frequency_historical,
    platform_saturation,
    customer_density
)
```

Example: Two drivers in Mumbai with different zone risk scores:

```
Driver in Lower Parel (tech hub):
  Urban density: High
  Ambient AQI: 140-160 (moderate)
  Flood risk: Medium
  Platform saturation: High (lots of orders)
  
  Zone risk multiplier: 0.95 (slightly below city average)
  Premium: ₹43 × 0.95 = ₹40.85/week

Driver in Dharavi (low-income area):
  Urban density: Very high
  Ambient AQI: 160-200 (poor)
  Flood risk: Very high
  Platform saturation: Medium (fewer orders)
  
  Zone risk multiplier: 1.05 (slightly above city average)
  Premium: ₹43 × 1.05 = ₹45.15/week
```

### Predictive Weather Integration

In production, integrate seasonal weather forecasts:

```python
def seasonal_premium_adjustment(city, month):
    """
    Adjust base premium up/down based on monsoon/extreme weather season
    """
    
    forecast_data = get_seasonal_forecast(city, month)
    
    # Example: Mumbai monsoon
    if city == 'Mumbai' and month in [6, 7, 8, 9]:  # Jun-Sep
        seasonal_multiplier = 1.15  # 15% higher in monsoon
    elif city == 'Delhi' and month in [11, 12, 1, 2]:  # Nov-Feb (AQI peak)
        seasonal_multiplier = 1.20  # 20% higher for AQI season
    else:
        seasonal_multiplier = 1.0
    
    return base_weekly_premium * seasonal_multiplier
```

---

## ML Model Performance Metrics

### Calibration (Prediction Accuracy)

```
Goal: Predicted annual risk should match realized payout
Metric: Mean Absolute Percentage Error (MAPE)

Example Results:
  μ_MAPE = 12%
  Interpretation: Model predictions off by ~12% on average
  
  Driver predicted risk: ₹20,000
  Actual payouts over year: ₹22,400 (12% higher)
  → Acceptable
```

### Discrimination (Risk Ordering)

```
Goal: Model ranks high-risk drivers above low-risk drivers
Metric: AUC-ROC (Area Under Receiver Operating Curve)

Example Results:
  AUC = 0.78
  Interpretation: 78% chance model correctly ranks random
                  high-risk vs low-risk driver pair
  Benchmark: >0.75 is acceptable
```

### Fairness (No Unjust Discrimination)

```
Goal: Similar drivers get similar premiums (no hidden bias)
Metric: Demographic Parity Ratio

Example:
  Female driver avg premium: ₹35/week
  Male driver avg premium: ₹37/week
  Ratio: 0.95x
  
  Threshold: 0.80-1.20x considered acceptable
  <0.80 or >1.20: Potential gender bias, investigate feature engineering
```

---

## Summary: Key Advantages of This Approach

✅ **Personalized:** No two drivers pay same premium (even in same city)  
✅ **Transparent:** Clear calculation breakdown drivers can understand  
✅ **Dynamic:** Grows/shrinks with driver earnings trajectory  
✅ **Fair:** Activity level is directly rewarded (lower premiums for part-timers)  
✅ **Sustainable:** Premium rates decrease as risk increases (high-risk drivers can afford it)  
✅ **Scalable:** ML model runs in milliseconds for real-time quotes  

---

*Reference: Scudo Architecture Document*  
*Last Updated: April 2026*
