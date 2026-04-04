# Scudo Phase 2 — Complete Solution Guide

## Overview

Scudo is an **AI-enabled parametric income insurance platform** for India's 12 million gig workers. Phase 2 implements a fully functional prototype with:

- ✅ Driver registration & onboarding
- ✅ Dynamic AI-powered premium calculation using hyper-local risk factors
- ✅ Insurance policy management
- ✅ Zero-touch automated claims processing
- ✅ 5 automated disruption triggers (public/mock APIs)
- ✅ Professional React UI

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  Registration → Dashboard → Policy View → Claims Management  │
└─────────────────────────────────────────────────────────────┘
                            ↕
       ┌────────────────────────────────────────┐
       │    BACKEND (Node.js/Express)           │
       │  • Premium Calculation Engine          │
       │  • Claims Processing                   │
       │  • Payout Formula Implementation       │
       │  • Disruption Database                 │
       └────────────────────────────────────────┘
                            ↕
┌──────────────────────────────────────────────────────────────┐
│           5 AUTOMATED TRIGGER MONITORS                       │
│  1. IMD Weather Alerts          4. Fuel Price Spikes        │
│  2. CPCB/SAFAR AQI Levels       5. Civil Disruptions        │
│  3. Platform Order Volume Drops                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm/yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Seed demo database with drivers
npm run seed

# Start the server
npm start
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
# Opens on http://localhost:3000
```

### Trigger Monitor (Optional - runs in background)

```bash
cd backend

# Start automated disruption monitoring system
npm run trigger:all
# Monitors all 5 APIs simultaneously
```

---

## Demo Credentials

Login with these pre-seeded drivers:

| Phone | Name | City | Status |
|-------|------|------|--------|
| 9876543210 | Rajesh Kumar | Mumbai | Active |
| 9876543211 | Priya Sharma | Delhi | Active |
| 9876543212 | Akhil Reddy | Hyderabad | Active |
| 9876543213 | Maya Patel | Bangalore | Active |
| 9876543214 | Suresh Andhra | Chennai | Active |

---

## Key Features

### 1. DYNAMIC PREMIUM CALCULATION (AI/ML)

The system uses **hyper-local risk assessment** based on:

#### City Risk Profiles
- **Weather disruption frequency** (IMD historical data)
- **AQI pollution exposure** (CPCB data)
- **Market volatility** (platform order patterns)
- **Civil unrest probability** (government records)

#### Driver Activity Index (WAI) — Personalized Multiplier

```
WAI = 0.4 × hours_ratio + 0.3 × orders_ratio + 0.3 × value_ratio
Clamped: [0.5, 1.2]
```

**Result:** Two "identical" drivers pay different premiums based on:
- Weekly working hours
- Order completion velocity
- Weekly GMV (earnings value)

#### Risk Tier Classification

```
Annual Risk ≤ ₹6,000       → Low     (14% rate)
₹6,001 - ₹15,000           → Medium  (12% rate)
₹15,001 - ₹30,000          → High    (10% rate)
> ₹30,000                  → V.High  (8% rate)
```

The decreasing rate structure ensures the product remains *affordable for high-risk drivers*.

---

### 2. ZERO-TOUCH CLAIMS AUTOMATION

**No forms. No documents. No waiting.**

#### Fully Automated Process:
1. **Disruption detected** via external APIs (imdo, CPCB, platform data, fuel prices, government alerts)
2. **Affected drivers identified** in the disruption zone
3. **Day-end data collected** (actual earnings, GPS hours, completed orders)
4. **Payout calculated** using two-gate anti-fraud formula
5. **Payment initiated** via UPI/NEFT
6. **Credited by 7 AM** next morning

#### Payout Formula (Two Technical Gates)

```
Base_Payout_Calculation:
  Income_Loss = Expected_Daily_Earn - Actual_Daily_Earn
  Base_Payout = 0.70 × Income_Loss   [70% co-participation]

Gate 1 — Compliance Factor (Smooth Scale):
  floor_hours = severity_factor × daily_hours × 0.4
  compliance_factor = min(1.0, actual_hours_worked / floor_hours)
  Payout_After_Gate1 = Base_Payout × compliance_factor

Gate 2 — Minimum Order Floor (Binary):
  min_orders = (full_disruption) ? 1 : 2
  Final_Payout = 0 if orders < min_orders, else Payout_After_Gate1

Final_Payout = max(0, Final_Payout)  [minimum threshold: ₹50]
```

**Why Gates work:**
- **Gate 1:** Smooth hours-based compliance prevents cliff effects
- **Gate 2:** Minimum orders prevent GPS-spoofing ("appear present without working")

Example payout scenario:
```
Expected daily earn:  ₹1,000
Actual on disruption: ₹300
Hours worked:         4/10 (40%)
Orders completed:     3 (exceeds minimum of 2)

Calculation:
  Income_loss = 700
  Base = 0.70 × 700 = ₹490
  Compliance = 4/4 = 1.0 (4 hours ≥ floor of 4 hours = 0.6 × 10 × 0.4)
  Final = 490 × 1.0 = ₹490 (paid)
```

---

### 3. FIVE INTEGRATED AUTOMATED TRIGGERS

#### Trigger 1: **IMD Weather Alerts** (India Meteorological Department)
- **Data source:** District-level alerts (Orange/Red)
- **Activation:** Orange → 60% income loss, Red → 80% loss
- **Check frequency:** Every 30 minutes
- **Anti-gaming:** Alert level locked at 06:00 AM; no retroactive changes

#### Trigger 2: **CPCB/SAFAR AQI Levels** (Central Pollution Control Board)
- **Data source:** District-level AQI index
- **Activation thresholds:**
  - AQI 301-400 (Very Poor) → 30% loss
  - AQI 401-500 (Severe) → 50% loss
  - AQI > 500 (Severe+) → 70% loss
- **Cities covered:** Delhi NCR, Lucknow, Kanpur, Patna, Varanasi
- **Seasonality:** October-January peak

#### Trigger 3: **Platform Order Volume Anomaly Detection**
- **Data source:** Swiggy, Zomato, Zepto, Flipkart, Dunzo APIs
- **Metric:** City-wide order volume vs 30-day rolling average
- **Trigger:** Drop > 60% for ≥4 continuous hours
- **Income loss rate:** 40-60%
- **Use case:** Platform outages, regional app degradation

#### Trigger 4: **Fuel Price Spike Detection** (IOC/HPCL/BPCL)
- **Data source:** Government retail fuel price notifications
- **Trigger:** Price increase ≥ 20% in 7-day window
- **Income loss rate:** 35%
- **Rationale:** Fuel costs erode earnings on the same day

#### Trigger 5: **Civil Disruptions** (Government Alerts)
- **Data sources:**
  - State Home Department / District Collector
  - Municipal Corporation / Police Commissioner
  - Recognized union body declarations
- **Event types:**
  - Partial bandh / zonal shutdown → 70% loss
  - Full city bandh → 85% loss
  - Section 144 / curfew → 90% loss
  - Transport strike → 75% loss
- **Secondary verification:** Platform order volume must also drop ≥50%

All triggers are **mock APIs** in this demo — in production, they connect live to government and platform data feeds.

---

### 4. DATABASE SCHEMA

#### drivers
```sql
id (UUID), phone (UNIQUE), name, city, platform, vehicle_type,
avg_daily_earn, weekly_hours, weekly_orders, weekly_gmv,
registration_date, enrollment_date
```

#### policies
```sql
id (UUID), driver_id, city, annual_risk, risk_tier, premium_rate,
annual_premium, weekly_premium_base, wai_score, final_weekly_premium,
status, created_date
```

#### claims
```sql
id (UUID), driver_id, policy_id, disruption_type, disruption_date,
severity, city, expected_daily_earn, actual_daily_earn, hours_worked,
orders_completed, compliance_factor, payout_amount, status,
created_timestamp, processed_timestamp
```

#### disruption_events
```sql
id (UUID), event_type, severity, city, districts, start_time,
trigger_source, created_timestamp
```

---

## API Endpoints

### Driver Management
```
POST   /api/drivers/register           → Register new driver
GET    /api/drivers                     → Get all drivers (demo)
```

### Policy Management
```
POST   /api/policies/create             → Create policy & calculate premium
GET    /api/policies/:driver_id         → Get driver's current policy
```

### Claims
```
POST   /api/claims/process              → Process automatic claim & payout
GET    /api/claims/:driver_id           → Get claim history
```

### Disruptions
```
POST   /api/disruptions/create          → Record disruption event (trigger monitor)
GET    /api/disruptions/:city           → Get active disruptions in city
```

---

## Frontend Components

### Pages
1. **Login** — Authenticate via phone number
2. **Register** — 5-minute driver onboarding
3. **Dashboard** — Key metrics, disruption alerts, how-it-works
4. **Policy Details** — Full coverage breakdown, premium calculation
5. **Claims History** — All past claims with payout details

### Key UI Features
- ✅ Real-time disruption alerts
- ✅ Automated claims status tracking
- ✅ Premium calculation transparency
- ✅ Mobile-responsive design
- ✅ Dark mode support

---

## Running the Demo

### Step 1: Start Backend
```bash
cd backend
npm install && npm start
# Waits for requests on http://localhost:5000
```

### Step 2: Start Frontend
```bash
cd frontend
npm install && npm start
# Opens http://localhost:3000 automatically
```

### Step 3: (Optional) Start Trigger Monitoring
```bash
cd backend
npm run trigger:all
# Continuously monitors the 5 APIs
# Simulates disruptions, records in database
# Triggers automatic claims
```

### Step 4: Test the Flow
1. **Login** with phone: `9876543210`
2. **View Dashboard** — see policy & metrics
3. **Check Policy** — review coverage & premiums
4. **Trigger Monitor** will create disruptions automatically
5. **View Claims** — auto-processed payouts appear

---

## ML Model Implementation Notes

### Hyper-Local Risk Factors Used:
1. **City seasonality** — Monsoons, AQI peaks, festival strikes
2. **Zone-level disruption frequency** — High vs low-risk neighborhoods
3. **Driver earnings volatility** — Baseline stability
4. **Activity pattern consistency** — Regular vs sporadic workers
5. **Cross-city migrations** — New to city = higher premium

### Dynamic Adjustment Triggers:
- Earnings change ≥25% in 30 days → Recalculate
- 3+ payouts in 60 days → Fraud review flag
- Driver switches city/platform → Tier reassessment

In a production system, this would use:
- **Scikit-learn:** Gradient-boosted trees for risk scoring
- **TensorFlow/Keras:** Time-series LSTM for earnings volatility
- **Feature engineering:** ~50+ features from driver behavior & external data

---

## Security & Fraud Prevention

### Built-in Protections:
1. **GPS spoofing detection** — Route coherence checks, speed validation
2. **Order verification** — Platform order data cross-check
3. **Claim-level gates** — Hours worked + minimum orders
4. **Behavioral anomalies** — Claim rate vs city median
5. **Account collusion detection** — Device fingerprinting, IP checks

### Two-Gate Payout Formula:
- Prevents "appear present without working" exploit
- Smooth compliance multiplier vs binary cliff
- 30% co-participation incentivizes work attempt

---

## Demo Video Script (2 minutes)

```
[Scene 1: Login - 10 sec]
"Meet Rajesh, a delivery partner in Mumbai earning ₹1,200/day.
When a monsoon hits tomorrow, how does he protect his income?"

[Scene 2: Registration - 20 sec]
"Scudo takes just 5 minutes to register. No documents. Just activity data
from his delivery app. The AI assesses his city's disruption risk and
calculates a personalized premium: ₹48/week."

[Scene 3: Dashboard - 15 sec]
"His coverage is active immediately. The dashboard shows his risk profile,
weekly premium, and what's covered: weather, pollution, bandhs, platform
outages, and fuel costs."

[Scene 4: Disruption Event - 15 sec]
"On Tuesday morning, heavy rains hit Mumbai. IMD issues a Red alert.
Scudo detects it within minutes. Orders drop 70% across the platform."

[Scene 5: Automatic Claim Processing - 40 sec]
"Rajesh doesn't file a claim. Scudo's system automatically:
1. Verifies the disruption via official APIs
2. Pulls his day-end earnings and GPS hours
3. Calculates: He worked 4 hours (60% of normal), earned ₹350
4. Applies the payout formula: 70% of income loss × compliance factor
5. Result: ₹420 payout, credited by 7 AM next morning

The entire process? Zero forms. Zero assessors. Zero paperwork."

[Scene 6: Claims History - 10 sec]
"His claims dashboard shows all payouts in one place. 100% transparent.
No surprises."

[Scene 7: Impact - 10 sec]
"By 7 AM the next morning, ₹420 is in Rajesh's UPI account.
His lost income is replaced. His family is protected."

[End]
"Scudo. Zero-friction income insurance for India's gig workers."
```

---

## Customization & Extension

### Adding New Triggers:
1. Add trigger detection in `backend/triggers/triggerMonitor.js`
2. Create mock API in `mockAPIs` object
3. Register in `monitorCity()` function
4. Update frontend disruption alerts

### Changing Premium Rates:
Edit `calculateRiskProfile()` in `backend/server.js`:
```javascript
// Modify risk tier thresholds
if (annual_risk <= 5000) {
  risk_tier = 'Low';
  premium_rate = 0.15;  // Change from 0.14
}
```

### Adjusting Payout Gates:
Edit `calculatePayout()` formula:
```javascript
// Change co-participation rate
const base_payout = 0.80 * income_loss;  // Was 0.70

// Change minimum order threshold
const min_orders = (severity === 'red') ? 2 : 3;  // Was 1,2
```

---

## Files Structure

```
scudo-phase2/
├── backend/
│   ├── package.json
│   ├── server.js                    [Core backend + APIs]
│   ├── triggers/
│   │   └── triggerMonitor.js        [5 automated triggers]
│   ├── seeds/
│   │   └── seedDatabase.js          [Demo driver data]
│   └── scudo.db                     [SQLite database]
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html               [HTML template]
│   └── src/
│       ├── App.js                   [All React components]
│       ├── index.js                 [Entry point]
│       └── index.css                [Tailwind styles]
│
├── ml-models/
│   └── risk_scoring_model.py        [ML model placeholder]
│
└── docs/
    └── README.md                    [This file]
```

---

## Production Roadmap

### Phase 3 (Months 5-6):
- [ ] Production database (PostgreSQL/MongoDB)
- [ ] Real API integrations (IMD, CPCB, platform partners)
- [ ] ML model training (scikit-learn to production)
- [ ] Payment gateway integration (Razorpay, AWS Payments)
- [ ] KYC/AML compliance

### Phase 4 (Months 7-8):
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Hindi, Tamil, Telugu, Kannada)
- [ ] WhatsApp bot integration
- [ ] Analytics dashboard
- [ ] Reinsurance partnerships

### Phase 5 (Months 9-12):
- [ ] Expansion to 5 new cities
- [ ] Additional coverage categories
- [ ] Driver loyalty program
- [ ] Employer partnerships (Swiggy, Zomato direct)
- [ ] Government subsidy integration

---

## Support & Deployment

### Local Testing:
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Triggers (optional)
cd backend && npm run trigger:all
```

### Deployment to Cloud:
- **Backend:** AWS EC2 / Heroku + RDS PostgreSQL
- **Frontend:** Vercel / Netlify + CDN
- **Database:** AWS RDS PostgreSQL (production)
- **Storage:** AWS S3 for documents
- **Monitoring:** DataDog / New Relic

---

## Contact & Documentation

For questions or feature requests:
- **Email:** hello@scudo.dev
- **WhatsApp:** +91-XXXXX-XXXXX
- **GitHub:** github.com/scudo/phase2

Built with ❤️ for India's delivery workers.

---

*Last Updated: April 2026*
*Version: 2.0.0 (Phase 2 Complete)*
