require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const DB_PATH = path.join(__dirname, 'scudo.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database error:', err);
  else console.log('✓ Connected to SQLite database');
});

// Database Initialization
const initializeDB = () => {
  db.serialize(() => {
    // Drivers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS drivers (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE,
        name TEXT,
        city TEXT,
        platform TEXT,
        vehicle_type TEXT,
        avg_daily_earn REAL,
        weekly_hours REAL,
        weekly_orders INTEGER,
        weekly_gmv REAL,
        registration_date DATETIME,
        enrollment_date DATETIME
      )
    `);

    // Policies Table
    db.run(`
      CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        driver_id TEXT,
        city TEXT,
        annual_risk REAL,
        risk_tier TEXT,
        premium_rate REAL,
        annual_premium REAL,
        weekly_premium_base REAL,
        wai_score REAL,
        final_weekly_premium REAL,
        status TEXT,
        created_date DATETIME,
        FOREIGN KEY(driver_id) REFERENCES drivers(id)
      )
    `);

    // Claims Table
    db.run(`
      CREATE TABLE IF NOT EXISTS claims (
        id TEXT PRIMARY KEY,
        driver_id TEXT,
        policy_id TEXT,
        disruption_type TEXT,
        disruption_date DATE,
        severity TEXT,
        city TEXT,
        expected_daily_earn REAL,
        actual_daily_earn REAL,
        hours_worked REAL,
        orders_completed INTEGER,
        compliance_factor REAL,
        payout_amount REAL,
        status TEXT,
        created_timestamp DATETIME,
        processed_timestamp DATETIME,
        FOREIGN KEY(driver_id) REFERENCES drivers(id),
        FOREIGN KEY(policy_id) REFERENCES policies(id)
      )
    `);

    // Disruption Events Table (for trigger monitoring)
    db.run(`
      CREATE TABLE IF NOT EXISTS disruption_events (
        id TEXT PRIMARY KEY,
        event_type TEXT,
        severity TEXT,
        city TEXT,
        districts TEXT,
        start_time DATETIME,
        trigger_source TEXT,
        data_payload TEXT,
        created_timestamp DATETIME
      )
    `);

    // Premiums History (for tracking premium changes)
    db.run(`
      CREATE TABLE IF NOT EXISTS premiums_history (
        id TEXT PRIMARY KEY,
        driver_id TEXT,
        weekly_premium REAL,
        effective_date DATE,
        reason TEXT,
        FOREIGN KEY(driver_id) REFERENCES drivers(id)
      )
    `);

    console.log('✓ Database tables initialized');
  });
};

initializeDB();

// ============================================================================
// RISK ASSESSMENT & PREMIUM CALCULATION ENGINE
// ============================================================================

const calculateRiskProfile = (driverData) => {
  const { avg_daily_earn, city } = driverData;
  
  // Hyper-local risk factors by city (based on Scudo architecture)
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
      aqi_days: 12, aqi_loss_rate: 0.50,
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
      base_seasonality: 0.9
    },
    'Chennai': {
      weather_days: 12, weather_loss_rate: 0.72,
      civil_days: 3, civil_loss_rate: 0.75,
      aqi_days: 0, aqi_loss_rate: 0,
      heat_days: 6, heat_loss_rate: 0.40,
      market_days: 4, market_loss_rate: 0.38,
      base_seasonality: 1.05
    },
    'Hyderabad': {
      weather_days: 8, weather_loss_rate: 0.68,
      civil_days: 2, civil_loss_rate: 0.70,
      aqi_days: 2, aqi_loss_rate: 0.35,
      heat_days: 5, heat_loss_rate: 0.40,
      market_days: 3, market_loss_rate: 0.35,
      base_seasonality: 0.95
    }
  };

  const profile = cityRiskProfiles[city] || cityRiskProfiles['Bangalore'];

  // Annual Risk Calculation (from Scudo architecture)
  const annual_risk = (
    (profile.weather_days * avg_daily_earn * profile.weather_loss_rate) +
    (profile.aqi_days * avg_daily_earn * profile.aqi_loss_rate) +
    (profile.heat_days * avg_daily_earn * profile.heat_loss_rate) +
    (profile.civil_days * avg_daily_earn * profile.civil_loss_rate) +
    (profile.market_days * avg_daily_earn * profile.market_loss_rate)
  ) * profile.base_seasonality;

  // Risk Tier Classification
  let risk_tier, premium_rate;
  if (annual_risk <= 6000) {
    risk_tier = 'Low';
    premium_rate = 0.14;
  } else if (annual_risk <= 15000) {
    risk_tier = 'Medium';
    premium_rate = 0.12;
  } else if (annual_risk <= 30000) {
    risk_tier = 'High';
    premium_rate = 0.10;
  } else {
    risk_tier = 'Very High';
    premium_rate = 0.08;
  }

  return {
    annual_risk: Math.round(annual_risk),
    risk_tier,
    premium_rate
  };
};

// Worker Activity Index (WAI) Calculation
const calculateWAI = (driverData) => {
  const cityMedians = {
    'Mumbai': { hours: 45, orders: 120, gmv: 5000 },
    'Delhi': { hours: 48, orders: 130, gmv: 5200 },
    'Bangalore': { hours: 42, orders: 115, gmv: 4800 },
    'Chennai': { hours: 44, orders: 118, gmv: 4900 },
    'Hyderabad': { hours: 43, orders: 112, gmv: 4700 }
  };

  const median = cityMedians[driverData.city] || cityMedians['Bangalore'];

  const hours_ratio = (driverData.weekly_hours || 40) / median.hours;
  const orders_ratio = (driverData.weekly_orders || 100) / median.orders;
  const value_ratio = (driverData.weekly_gmv || 4500) / median.gmv;

  let wai = (0.4 * hours_ratio) + (0.3 * orders_ratio) + (0.3 * value_ratio);
  
  // Clamp WAI between 0.5 and 1.2
  wai = Math.max(0.5, Math.min(1.2, wai));
  
  return parseFloat(wai.toFixed(2));
};

// Dynamic Premium Calculation with ML-inspired hyper-local factors
const calculateDynamicPremium = (driverData) => {
  const risk = calculateRiskProfile(driverData);
  const wai = calculateWAI(driverData);

  const annual_premium = risk.annual_risk * risk.premium_rate;
  const weekly_premium_base = annual_premium / 52;
  const final_weekly_premium = weekly_premium_base * wai;

  return {
    ...risk,
    annual_premium: Math.round(annual_premium),
    weekly_premium_base: parseFloat(weekly_premium_base.toFixed(2)),
    wai_score: wai,
    final_weekly_premium: parseFloat(final_weekly_premium.toFixed(2))
  };
};

// ============================================================================
// CLAIM PAYOUT CALCULATION
// ============================================================================

const calculatePayout = (claimData) => {
  const { expected_daily_earn, actual_daily_earn, hours_worked, normal_daily_hours, orders_completed, severity } = claimData;
  
  // Base payout calculation (70% co-participation from Scudo architecture)
  const income_loss = expected_daily_earn - actual_daily_earn;
  const base_payout = 0.70 * income_loss;

  // Gate 1: Compliance Factor (Hours worked)
  const severity_factor = severity === 'red' || severity === 'full' ? 1.0 : 0.6;
  const floor_hours = severity_factor * (normal_daily_hours || 8) * 0.4;
  const compliance_factor = Math.min(1.0, hours_worked / floor_hours);

  // Gate 2: Minimum Order Floor
  const min_orders = (severity === 'red' || severity === 'full') ? 1 : 2;
  let final_payout = base_payout * compliance_factor;

  if (orders_completed < min_orders) {
    final_payout = 0;
  }

  // Minimum payout threshold
  if (final_payout > 0 && final_payout < 50) {
    final_payout = 0; // Sub-threshold amounts accumulate
  }

  return {
    base_payout: parseFloat(base_payout.toFixed(2)),
    compliance_factor: parseFloat(compliance_factor.toFixed(2)),
    final_payout: parseFloat(final_payout.toFixed(2)),
    status: final_payout > 0 ? 'approved' : 'rejected',
    rejection_reason: final_payout === 0 && orders_completed < min_orders ? 'Minimum order threshold not met' : null
  };
};

// ============================================================================
// API ENDPOINTS
// ============================================================================

// 1. DRIVER REGISTRATION
app.post('/api/drivers/register', (req, res) => {
  const { phone, name, city, platform, vehicle_type, avg_daily_earn, weekly_hours, weekly_orders, weekly_gmv } = req.body;
  const driver_id = uuidv4();
  const registration_date = new Date().toISOString();
  const enrollment_date = new Date().toISOString();

  db.run(
    `INSERT INTO drivers (id, phone, name, city, platform, vehicle_type, avg_daily_earn, weekly_hours, weekly_orders, weekly_gmv, registration_date, enrollment_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [driver_id, phone, name, city, platform, vehicle_type, avg_daily_earn, weekly_hours, weekly_orders, weekly_gmv, registration_date, enrollment_date],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ driver_id, message: 'Driver registered successfully' });
    }
  );
});

// 2. POLICY CREATION (automatic after registration)
app.post('/api/policies/create', (req, res) => {
  const { driver_id } = req.body;

  db.get('SELECT * FROM drivers WHERE id = ?', [driver_id], (err, driver) => {
    if (err || !driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const premium_data = calculateDynamicPremium(driver);
    const policy_id = uuidv4();
    const created_date = new Date().toISOString();

    db.run(
      `INSERT INTO policies (id, driver_id, city, annual_risk, risk_tier, premium_rate, annual_premium, weekly_premium_base, wai_score, final_weekly_premium, status, created_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        policy_id,
        driver_id,
        driver.city,
        premium_data.annual_risk,
        premium_data.risk_tier,
        premium_data.premium_rate,
        premium_data.annual_premium,
        premium_data.weekly_premium_base,
        premium_data.wai_score,
        premium_data.final_weekly_premium,
        'active',
        created_date
      ],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.json({
          policy_id,
          driver_id,
          ...premium_data,
          message: 'Policy created successfully'
        });
      }
    );
  });
});

// 3. GET DRIVER POLICY
app.get('/api/policies/:driver_id', (req, res) => {
  const { driver_id } = req.params;

  db.get(
    'SELECT p.*, d.name, d.city FROM policies p JOIN drivers d ON p.driver_id = d.id WHERE p.driver_id = ?',
    [driver_id],
    (err, policy) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!policy) {
        return res.status(404).json({ error: 'Policy not found' });
      }
      res.json(policy);
    }
  );
});

// 4. GET DISRUPTION EVENTS (for claim triggers)
app.get('/api/disruptions/:city', (req, res) => {
  const { city } = req.params;

  db.all(
    'SELECT * FROM disruption_events WHERE city = ? AND DATE(start_time) = DATE(?) ORDER BY created_timestamp DESC',
    [city, new Date().toISOString().split('T')[0]],
    (err, events) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(events || []);
    }
  );
});

// 5. PROCESS CLAIM (automatic payout calculation)
app.post('/api/claims/process', (req, res) => {
  const { driver_id, policy_id, disruption_type, severity, expected_daily_earn, actual_daily_earn, hours_worked, orders_completed } = req.body;

  db.get('SELECT * FROM drivers WHERE id = ?', [driver_id], (err, driver) => {
    if (err || !driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    const payout_result = calculatePayout({
      expected_daily_earn,
      actual_daily_earn,
      hours_worked,
      normal_daily_hours: driver.weekly_hours ? driver.weekly_hours / 5 : 8,
      orders_completed,
      severity
    });

    const claim_id = uuidv4();
    const disruption_date = new Date().toISOString().split('T')[0];
    const created_timestamp = new Date().toISOString();

    db.run(
      `INSERT INTO claims (id, driver_id, policy_id, disruption_type, disruption_date, severity, city, expected_daily_earn, actual_daily_earn, hours_worked, orders_completed, compliance_factor, payout_amount, status, created_timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        claim_id,
        driver_id,
        policy_id,
        disruption_type,
        disruption_date,
        severity,
        driver.city,
        expected_daily_earn,
        actual_daily_earn,
        hours_worked,
        orders_completed,
        payout_result.compliance_factor,
        payout_result.final_payout,
        payout_result.status,
        created_timestamp
      ],
      function(err) {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.json({
          claim_id,
          ...payout_result,
          message: 'Claim processed automatically'
        });
      }
    );
  });
});

// 6. GET CLAIMS FOR DRIVER
app.get('/api/claims/:driver_id', (req, res) => {
  const { driver_id } = req.params;

  db.all(
    'SELECT * FROM claims WHERE driver_id = ? ORDER BY created_timestamp DESC LIMIT 20',
    [driver_id],
    (err, claims) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(claims || []);
    }
  );
});

// 7. CREATE DISRUPTION EVENT (from triggers)
app.post('/api/disruptions/create', (req, res) => {
  const { event_type, severity, city, districts, trigger_source } = req.body;
  const event_id = uuidv4();
  const start_time = new Date().toISOString();
  const created_timestamp = new Date().toISOString();

  db.run(
    `INSERT INTO disruption_events (id, event_type, severity, city, districts, start_time, trigger_source, created_timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [event_id, event_type, severity, city, JSON.stringify(districts), start_time, trigger_source, created_timestamp],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ event_id, message: 'Disruption event recorded' });
    }
  );
});

// 8. GET ALL DRIVERS (for demo)
app.get('/api/drivers', (req, res) => {
  db.all('SELECT * FROM drivers LIMIT 50', (err, drivers) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(drivers || []);
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Scudo Backend running on http://localhost:${PORT}`);
  console.log(`✓ Database: ${DB_PATH}`);
});

module.exports = { app, db };
