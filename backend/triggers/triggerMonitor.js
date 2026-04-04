// AUTOMATED TRIGGER MONITORING SYSTEM
// 5 Public/Mock APIs to detect disruptions and trigger claims automatically

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const POLL_INTERVAL = 60000; // 1 minute for demo (production: 30 minutes)

// Mock API responses (in production, these would be real APIs)
const mockAPIs = {
  // Trigger 1: IMD Weather Alerts
  imdWeatherAlerts: (city) => {
    const cityAlerts = {
      'Mumbai': { alert: 'red', severity: 'Cyclone Warning', districts: ['Mumbai', 'Thane'], date: new Date() },
      'Delhi': { alert: 'none', severity: null, districts: [], date: new Date() },
      'Chennai': { alert: 'orange', severity: 'Heavy Rain Warning', districts: ['Chennai', 'Kanchipuram'], date: new Date() },
      'Bangalore': { alert: 'none', severity: null, districts: [], date: new Date() },
      'Hyderabad': { alert: 'orange', severity: 'Wind Alert', districts: ['Hyderabad'], date: new Date() }
    };
    return cityAlerts[city] || { alert: 'none', severity: null, districts: [] };
  },

  // Trigger 2: CPCB/SAFAR AQI Levels
  aqiLevels: (city) => {
    const cityAQI = {
      'Mumbai': { aqi: 145, category: 'moderate' },
      'Delhi': { aqi: 385, category: 'severe' },
      'Chennai': { aqi: 95, category: 'satisfactory' },
      'Bangalore': { aqi: 120, category: 'moderate' },
      'Hyderabad': { aqi: 165, category: 'poor' }
    };
    const data = cityAQI[city] || { aqi: 100, category: 'moderate' };
    
    // Trigger if AQI > 300
    return {
      ...data,
      triggered: data.aqi > 300,
      income_loss_rate: data.aqi > 500 ? 0.70 : data.aqi > 400 ? 0.50 : data.aqi > 300 ? 0.30 : 0
    };
  },

  // Trigger 3: Platform Order Volume Anomaly Detection
  platformOrderVolume: (city) => {
    // Simulate order volume - normally 1000 orders/hour, drop indicates disruption
    const normalVolume = 1000;
    const currentVolume = Math.random() > 0.7 ? 200 : 900; // 30% chance of drop
    const thirtyDayAverage = 950;
    
    return {
      current_volume: currentVolume,
      thirty_day_average: thirtyDayAverage,
      drop_percentage: ((thirtyDayAverage - currentVolume) / thirtyDayAverage) * 100,
      triggered: currentVolume < (thirtyDayAverage * 0.4), // Drop > 60%
      disruption_duration_hours: currentVolume < (thirtyDayAverage * 0.4) ? 4 : 0
    };
  },

  // Trigger 4: Fuel Price Spikes
  fuelPrices: (city) => {
    const prices = {
      'Mumbai': { current: 105, previous_week: 98, price_change_pct: 7.1 },
      'Delhi': { current: 96, previous_week: 95, price_change_pct: 1.0 },
      'Chennai': { current: 108, previous_week: 105, price_change_pct: 2.9 },
      'Bangalore': { current: 102, previous_week: 96, price_change_pct: 6.25 },
      'Hyderabad': { current: 100, previous_week: 94, price_change_pct: 6.4 }
    };
    const data = prices[city] || { current: 100, previous_week: 95, price_change_pct: 5.3 };
    
    return {
      ...data,
      triggered: data.price_change_pct >= 20, // Trigger if ≥ 20% increase
      income_loss_rate: data.price_change_pct >= 20 ? 0.35 : 0
    };
  },

  // Trigger 5: Civil Disruptions (Bandh, Curfew)
  civilDisruptions: (city) => {
    const disruptions = {
      'Mumbai': { active: false, type: null, severity: null },
      'Delhi': { active: true, type: 'partial_bandh', severity: 'orange' }, // Can simulate bandh on demand
      'Chennai': { active: false, type: null, severity: null },
      'Bangalore': { active: false, type: null, severity: null },
      'Hyderabad': { active: false, type: null, severity: null }
    };
    const data = disruptions[city] || { active: false, type: null, severity: null };
    
    return {
      ...data,
      triggered: data.active,
      income_loss_rate: data.type === 'full_bandh' ? 0.85 : data.type === 'partial_bandh' ? 0.70 : 0
    };
  }
};

// Disruption Classification
const classifyDisruption = (triggers) => {
  if (triggers.weather) return { type: 'weather', severity: triggers.weather.severity };
  if (triggers.aqi?.triggered) return { type: 'aqi', severity: 'air_pollution' };
  if (triggers.platform?.triggered) return { type: 'platform_anomaly', severity: 'order_drop' };
  if (triggers.fuel?.triggered) return { type: 'fuel_spike', severity: 'price_increase' };
  if (triggers.civil?.triggered) return { type: 'civil_disruption', severity: triggers.civil.type };
  return null;
};

// Trigger Monitor
const monitorCity = async (city) => {
  try {
    console.log(`\n[${new Date().toISOString()}] Monitoring ${city}...`);

    // Poll all 5 APIs
    const triggers = {
      weather: mockAPIs.imdWeatherAlerts(city),
      aqi: mockAPIs.aqiLevels(city),
      platform: mockAPIs.platformOrderVolume(city),
      fuel: mockAPIs.fuelPrices(city),
      civil: mockAPIs.civilDisruptions(city)
    };

    // Log captured data
    console.log(`  Weather: ${triggers.weather.alert} - ${triggers.weather.severity || 'None'}`);
    console.log(`  AQI: ${triggers.aqi.aqi} (${triggers.aqi.category}) ${triggers.aqi.triggered ? '⚠️ TRIGGERED' : ''}`);
    console.log(`  Platform Orders: ${triggers.platform.current_volume} (30d avg: ${triggers.platform.thirty_day_average}) ${triggers.platform.triggered ? '⚠️ TRIGGERED' : ''}`);
    console.log(`  Fuel Price: ₹${triggers.fuel.current} (+${triggers.fuel.price_change_pct.toFixed(1)}%) ${triggers.fuel.triggered ? '⚠️ TRIGGERED' : ''}`);
    console.log(`  Civil: ${triggers.civil.active ? triggers.civil.type.toUpperCase() : 'None'} ${triggers.civil.triggered ? '⚠️ TRIGGERED' : ''}`);

    // Check if any trigger activated
    const disruption = classifyDisruption(triggers);
    
    if (disruption) {
      console.log(`\n🚨 DISRUPTION DETECTED: ${disruption.type} (${disruption.severity})`);
      console.log(`💾 Creating disruption event in database...`);

      // Record disruption event in backend
      await axios.post(`${BACKEND_URL}/api/disruptions/create`, {
        event_type: disruption.type,
        severity: disruption.severity,
        city: city,
        districts: [city], // In production, extract from API
        trigger_source: 'automated_monitor',
        triggers_data: triggers
      });

      console.log(`✓ Disruption event recorded. Claims will auto-process for affected drivers.`);
    }

  } catch (error) {
    console.error(`Error monitoring ${city}:`, error.message);
  }
};

// Start monitoring all cities
const startMonitoring = () => {
  const CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Hyderabad'];
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  SCUDO - AUTOMATED TRIGGER MONITORING SYSTEM                ║');
  console.log('║  5 Integrated Public/Mock APIs for Disruption Detection    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('Monitoring triggers:');
  console.log('  1. IMD Weather Alerts (Orange/Red alerts)');
  console.log('  2. CPCB/SAFAR AQI Levels (Severe+ events)');
  console.log('  3. Platform Order Volume (>60% drop)');
  console.log('  4. Fuel Price Spikes (≥20% increase)');
  console.log('  5. Civil Disruptions (Bandh, Curfew)\n');

  // Initial run
  CITIES.forEach(city => monitorCity(city));

  // Poll every POLL_INTERVAL
  setInterval(() => {
    CITIES.forEach(city => monitorCity(city));
  }, POLL_INTERVAL);

  console.log(`\n✓ Polling every ${POLL_INTERVAL / 1000}s for disruptions...`);
};

// Start if run directly
if (require.main === module) {
  startMonitoring();
}

module.exports = { monitorCity, mockAPIs };
