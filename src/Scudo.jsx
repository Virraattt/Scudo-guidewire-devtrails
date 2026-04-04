import React, { useState, useEffect, useRef } from 'react'

// ============================================================================
// SECTION A: LIVE PREMIUM CALCULATOR DATA AND HELPERS
// ============================================================================

const CITY_DISRUPTION_BASELINES = {
  Mumbai: { weather: 15, aqi: 0, heat: 3, civil: 4, market: 6 },
  Delhi: { weather: 6, aqi: 45, heat: 8, civil: 5, market: 5 },
  Chennai: { weather: 13, aqi: 0, heat: 5, civil: 3, market: 4 },
  Kolkata: { weather: 12, aqi: 5, heat: 4, civil: 6, market: 4 },
  Hyderabad: { weather: 8, aqi: 0, heat: 6, civil: 3, market: 5 },
  Bengaluru: { weather: 6, aqi: 0, heat: 2, civil: 2, market: 6 },
  Lucknow: { weather: 5, aqi: 40, heat: 7, civil: 4, market: 4 }
}

const CITY_MEDIAN_BENCHMARKS = {
  Mumbai: { medianHours: 44, medianOrders: 30, medianGMV: 5500 },
  Delhi: { medianHours: 42, medianOrders: 28, medianGMV: 5000 },
  Chennai: { medianHours: 43, medianOrders: 29, medianGMV: 5200 },
  Kolkata: { medianHours: 40, medianOrders: 27, medianGMV: 4800 },
  Hyderabad: { medianHours: 41, medianOrders: 28, medianGMV: 5100 },
  Bengaluru: { medianHours: 43, medianOrders: 31, medianGMV: 5400 },
  Lucknow: { medianHours: 38, medianOrders: 25, medianGMV: 4500 }
}

const LOSS_RATE_WEIGHTED_AVERAGES = {
  Mumbai: { weatherLoss: 0.667, aqiLoss: 0, heatLoss: 0.35, civilLoss: 0.75, marketLoss: 0.467 },
  Delhi: { weatherLoss: 0.60, aqiLoss: 0.50, heatLoss: 0.45, civilLoss: 0.775, marketLoss: 0.467 },
  Chennai: { weatherLoss: 0.65, aqiLoss: 0, heatLoss: 0.40, civilLoss: 0.75, marketLoss: 0.467 },
  Kolkata: { weatherLoss: 0.65, aqiLoss: 0.30, heatLoss: 0.35, civilLoss: 0.775, marketLoss: 0.467 },
  Hyderabad: { weatherLoss: 0.60, aqiLoss: 0, heatLoss: 0.40, civilLoss: 0.75, marketLoss: 0.467 },
  Bengaluru: { weatherLoss: 0.60, aqiLoss: 0, heatLoss: 0.35, civilLoss: 0.70, marketLoss: 0.467 },
  Lucknow: { weatherLoss: 0.60, aqiLoss: 0.50, heatLoss: 0.45, civilLoss: 0.775, marketLoss: 0.467 }
}

const RISK_TIER_RATES = [
  { min: 0, max: 6000, tier: 'Low', rate: 0.14 },
  { min: 6001, max: 15000, tier: 'Medium', rate: 0.12 },
  { min: 15001, max: 30000, tier: 'High', rate: 0.10 },
  { min: 30001, max: Infinity, tier: 'Very High', rate: 0.08 }
]

const CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Hyderabad', 'Bengaluru', 'Lucknow']
const PLATFORMS = ['Swiggy', 'Zomato', 'Zepto', 'Amazon', 'Dunzo', 'Shadowfax']

// ============================================================================
// SECTION B: ML PRICING DEMO DATA
// ============================================================================

const ZONE_DATA = {
  Mumbai: [
    { name: 'Andheri West', multiplier: 0.88, reason: 'Historically 14% lower waterlogging; elevated flyover access reduces flood disruption' },
    { name: 'Dharavi', multiplier: 1.12, reason: 'High waterlogging index; narrow lanes increase civil disruption exposure' },
    { name: 'Bandra East', multiplier: 0.95, reason: 'Moderate risk; good drainage infrastructure partially offsets coastal exposure' },
    { name: 'Kurla', multiplier: 1.08, reason: 'Flood-prone low-lying zones; high bandh exposure from industrial clusters' },
    { name: 'Powai', multiplier: 0.90, reason: 'Lake-adjacent but elevated terrain; lower historical disruption days per IMD data' },
    { name: 'Worli', multiplier: 1.05, reason: 'Coastal exposure increases cyclone wind risk; sea link closure during alerts' },
    { name: 'Malad West', multiplier: 0.92, reason: 'Lower AQI impact; fewer civil disruption events in 3-year history' }
  ],
  Delhi: [
    { name: 'Connaught Place', multiplier: 1.10, reason: 'High AQI concentration; central location increases bandh/curfew exposure' },
    { name: 'Dwarka', multiplier: 0.87, reason: 'Lower AQI than central Delhi; fewer civil events; predictive weather model shows 11% lower disruption days' },
    { name: 'Lajpat Nagar', multiplier: 1.06, reason: 'Dense market area; high civil disruption sensitivity' },
    { name: 'Rohini', multiplier: 0.91, reason: 'Outer zone; lower AQI exposure; fewer bandh-affected commercial zones' },
    { name: 'Karol Bagh', multiplier: 1.09, reason: 'High foot-traffic market; elevated civil disruption days historically' },
    { name: 'Saket', multiplier: 0.94, reason: 'Residential zone; moderate AQI; lower commercial disruption sensitivity' }
  ],
  Chennai: [
    { name: 'Downtown', multiplier: 0.92, reason: 'Urban core with better infrastructure; moderate risk' },
    { name: 'Coastal', multiplier: 1.08, reason: 'Cyclone exposure; elevated disruption risk' },
    { name: 'North Zone', multiplier: 0.95, reason: 'Mixed area; average risk profile' },
    { name: 'West Zone', multiplier: 1.04, reason: 'Industrial area; higher disruption frequency' }
  ],
  Kolkata: [
    { name: 'South City', multiplier: 0.88, reason: 'Premium area with lower disruption history' },
    { name: 'East Kolkata', multiplier: 1.10, reason: 'Flood-prone; elevated waterlogging risk' },
    { name: 'Central', multiplier: 0.96, reason: 'Mid-range risk; moderate impact zones' },
    { name: 'North', multiplier: 1.06, reason: 'Industrial district; higher civil disruption exposure' }
  ],
  Hyderabad: [
    { name: 'Hi-Tech City', multiplier: 0.89, reason: 'Modern infrastructure; lower disruption impact' },
    { name: 'Old City', multiplier: 1.09, reason: 'Dense area; higher crowding-related disruptions' },
    { name: 'Secunderabad', multiplier: 0.94, reason: 'Planned layout; moderate risk mitigation' },
    { name: 'HITEC', multiplier: 0.91, reason: 'Business district; efficient logistics network' }
  ],
  Bengaluru: [
    { name: 'Whitefield', multiplier: 0.88, reason: 'Tech hub with excellent infrastructure' },
    { name: 'Indiranagar', multiplier: 0.95, reason: 'Well-developed area; lower disruption' },
    { name: 'JP Nagar', multiplier: 0.92, reason: 'Planned zone; good road connectivity' },
    { name: 'Outer Ring Road', multiplier: 1.04, reason: 'Developing area; emergent disruption factors' }
  ],
  Lucknow: [
    { name: 'Central Lucknow', multiplier: 0.93, reason: 'Urban core; stable infrastructure' },
    { name: 'Gomti Nagar', multiplier: 1.07, reason: 'Water-adjacent; elevated weather risk' },
    { name: 'Alambagh', multiplier: 0.90, reason: 'Residential; lower disruption exposure' },
    { name: 'Aliganj', multiplier: 1.05, reason: 'Mixed-use; moderate risk profile' }
  ]
}

// ============================================================================
// SECTION C: CLAIMS MANAGEMENT ENGINE DATA
// ============================================================================

const TRIGGER_EVENTS = [
  {
    id: 1,
    type: 'IMD Weather Trigger',
    icon: '🌪️',
    city: 'Mumbai',
    alert: 'RED',
    district: 'Mumbai Suburban',
    incomeLossRate: 0.80,
    forecast: '218mm forecast',
    description: 'Severe weather alert for extended period'
  },
  {
    id: 2,
    type: 'CPCB AQI Trigger',
    icon: '😷',
    city: 'Delhi',
    aqi: 420,
    category: 'Severe',
    incomeLossRate: 0.50,
    grapStage: 'Stage III',
    description: 'Hazardous air quality restricts operations'
  },
  {
    id: 3,
    type: 'Platform Outage Trigger',
    icon: '⚠️',
    city: 'Bengaluru',
    platform: 'Swiggy',
    orderVolumeDrop: 68,
    duration: 5.2,
    incomeLossRate: 0.60,
    description: 'Delivery platform downtime'
  },
  {
    id: 4,
    type: 'Civil Disruption Trigger',
    icon: '🚨',
    city: 'Chennai',
    eventType: 'Full City Bandh',
    declaredBy: 'Tamil Nadu State Home Department',
    incomeLossRate: 0.85,
    description: 'Citywide civil disruption event'
  },
  {
    id: 5,
    type: 'Fuel Price Spike Trigger',
    icon: '⛽',
    city: 'All Cities',
    fuelIncrease: 22,
    source: 'IOC Notification',
    incomeLossRate: 0.35,
    description: 'Sudden fuel cost escalation'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value) => {
  return '₹' + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const calculatePremium = (inputs) => {
  const { city, dailyEarnings, weeklyHours, weeklyOrders, weeklyGMV } = inputs
  
  const disruption = CITY_DISRUPTION_BASELINES[city]
  const losses = LOSS_RATE_WEIGHTED_AVERAGES[city]
  
  // Step 1: Annual Risk per category
  const weatherRisk = disruption.weather * dailyEarnings * losses.weatherLoss * 260
  const aqiRisk = disruption.aqi * dailyEarnings * losses.aqiLoss * 260
  const heatRisk = disruption.heat * dailyEarnings * losses.heatLoss * 260
  const civilRisk = disruption.civil * dailyEarnings * losses.civilLoss * 260
  const marketRisk = disruption.market * dailyEarnings * losses.marketLoss * 260
  
  const annualRisk = weatherRisk + aqiRisk + heatRisk + civilRisk + marketRisk
  
  // Step 2: Risk Tier and Rate
  const tierInfo = RISK_TIER_RATES.find(t => annualRisk >= t.min && annualRisk <= t.max)
  const premiumRate = tierInfo.rate
  
  // Step 3: Weekly Base Premium
  const annualPremium = annualRisk * premiumRate
  const weeklyBase = annualPremium / 52
  
  // Step 4: WAI (Work Activity Index)
  const benchmark = CITY_MEDIAN_BENCHMARKS[city]
  const hoursRatio = weeklyHours / benchmark.medianHours
  const ordersRatio = weeklyOrders / benchmark.medianOrders
  const gmvRatio = weeklyGMV / benchmark.medianGMV
  
  const wai = Math.max(0.5, Math.min(1.2, (0.4 * hoursRatio) + (0.3 * ordersRatio) + (0.3 * gmvRatio)))
  
  return {
    weatherRisk,
    aqiRisk,
    heatRisk,
    civilRisk,
    marketRisk,
    annualRisk,
    tierInfo,
    premiumRate,
    annualPremium,
    weeklyBase,
    wai,
    riskBreakdown: [
      { label: 'Weather', value: weatherRisk, pct: (weatherRisk / annualRisk) * 100 },
      { label: 'AQI', value: aqiRisk, pct: (aqiRisk / annualRisk) * 100 },
      { label: 'Heat', value: heatRisk, pct: (heatRisk / annualRisk) * 100 },
      { label: 'Civil', value: civilRisk, pct: (civilRisk / annualRisk) * 100 },
      { label: 'Market', value: marketRisk, pct: (marketRisk / annualRisk) * 100 }
    ]
  }
}

const getRiskTierColor = (tier) => {
  switch (tier) {
    case 'Low': return 'bg-success-green bg-opacity-20 text-success-green'
    case 'Medium': return 'bg-warning-amber bg-opacity-20 text-warning-amber'
    case 'High': return 'bg-orange-500 bg-opacity-20 text-orange-300'
    case 'Very High': return 'bg-error-red bg-opacity-20 text-error-red'
    default: return 'bg-gray-600 bg-opacity-20 text-gray-300'
  }
}

const getRiskBreakdownColor = (label) => {
  switch (label) {
    case 'Weather': return '#9333ea'
    case 'AQI': return '#f59e0b'
    case 'Heat': return '#ef4444'
    case 'Civil': return '#3b82f6'
    case 'Market': return '#8b5cf6'
    default: return '#6b7280'
  }
}

// ============================================================================
// MAIN SCUDO COMPONENT
// ============================================================================

export default function Scudo() {
  const [activeTab, setActiveTab] = useState('calculator')
  
  // Calculator States
  const [city, setCity] = useState('Mumbai')
  const [platform, setPlatform] = useState('Swiggy')
  const [dailyEarnings, setDailyEarnings] = useState(800)
  const [weeklyHours, setWeeklyHours] = useState(44)
  const [weeklyOrders, setWeeklyOrders] = useState(30)
  const [weeklyGMV, setWeeklyGMV] = useState(5500)
  const [showBreakdown, setShowBreakdown] = useState(false)
  
  // ML States
  const [zone, setZone] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)
  const [mlResult, setMlResult] = useState(null)
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false)
  
  // Claims States
  const [triggers, setTriggers] = useState(TRIGGER_EVENTS.map(e => ({ ...e, lastChecked: new Date(), status: 'Monitoring', eventCount: 0 })))
  const [activeClaims, setActiveClaims] = useState([])
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [manualTriggerType, setManualTriggerType] = useState(1)
  
  // Calculate premium
  const inputs = { city, dailyEarnings, weeklyHours, weeklyOrders, weeklyGMV }
  const premium = calculatePremium(inputs)
  
  // Get available zones
  const availableZones = ZONE_DATA[city] || []
  
  // Initialize zone on city change
  useEffect(() => {
    if (availableZones.length > 0) {
      setZone(availableZones[0])
      setMlResult(null)
    }
  }, [city])
  
  // Polling for trigger events
  useEffect(() => {
    const interval = setInterval(() => {
      setTriggers(prev => prev.map(t => ({
        ...t,
        lastChecked: new Date(),
        status: ['Monitoring', 'Checking...'].includes(t.status) ? 'Checking...' : 'Monitoring'
      })))
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Simulate auto-trigger after 15 seconds
  const autoTriggerTimeout = useRef(null)
  useEffect(() => {
    autoTriggerTimeout.current = setTimeout(() => {
      fireTrigger(1)
    }, 15000)
    
    return () => clearTimeout(autoTriggerTimeout.current)
  }, [])
  
  const fireTrigger = (triggerId) => {
    const triggerEvent = TRIGGER_EVENTS.find(e => e.id === triggerId)
    const affected = Math.floor(Math.random() * (3400 - 120 + 1)) + 120
    
    const claimId = `SCU-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    
    const newClaim = {
      id: claimId,
      triggerId,
      type: triggerEvent.type,
      city: triggerEvent.city,
      affected,
      status: 'DETECTED',
      timestamp: new Date(),
      stages: [
        { name: 'DETECTED', completed: true, timestamp: Date.now() },
        { name: 'VERIFIED', completed: false, timestamp: null },
        { name: 'BASELINES PULLED', completed: false, timestamp: null },
        { name: 'GATE CHECK', completed: false, timestamp: null },
        { name: 'PAYOUT INITIATED', completed: false, timestamp: null }
      ],
      currentStageIndex: 0,
      incomeLossRate: triggerEvent.incomeLossRate
    }
    
    setActiveClaims(prev => [newClaim, ...prev])
    setSelectedClaim(newClaim)
    setTriggers(prev => prev.map(t => 
      t.id === triggerId ? { ...t, status: 'EVENT DETECTED', eventCount: t.eventCount + 1 } : t
    ))
  }
  
  // Animate claim progression
  useEffect(() => {
    if (!selectedClaim) return
    
    const currentStageIndex = selectedClaim.currentStageIndex
    if (currentStageIndex >= selectedClaim.stages.length) return
    
    const stage = selectedClaim.stages[currentStageIndex]
    if (stage.completed) {
      const timer = setTimeout(() => {
        setActiveClaims(prev => prev.map(c => {
          if (c.id !== selectedClaim.id) return c
          
          const updatedStages = c.stages.map((s, i) => {
            if (i === c.currentStageIndex + 1) {
              return { ...s, completed: true, timestamp: Date.now() }
            }
            return s
          })
          
          const updated = {
            ...c,
            currentStageIndex: c.currentStageIndex + 1,
            stages: updatedStages,
            status: updatedStages[c.currentStageIndex + 1]?.name || 'COMPLETED'
          }
          
          setSelectedClaim(updated)
          return updated
        }))
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [selectedClaim])
  
  const handleZoneSelect = (selectedZone) => {
    setZone(selectedZone)
    setMlLoading(true)
    setTimeout(() => {
      const zoneRiskScore = ((selectedZone.multiplier - 0.8) / 0.4) * 100
      setMlResult({
        zone: selectedZone,
        riskScore: Math.max(0, Math.min(100, zoneRiskScore)),
        basePremium: premium.weeklyBase,
        adjustedPremium: premium.weeklyBase * selectedZone.multiplier,
        adjustment: ((selectedZone.multiplier - 1) * 100).toFixed(1)
      })
      setMlLoading(false)
    }, 800)
  }
  
  const getCurrentMonth = () => new Date().getMonth() + 1
  const isMonsoonSeason = [6, 7, 8, 9].includes(getCurrentMonth())
  const showMonsoonSurcharge = showWeatherOverlay && (city === 'Mumbai' || city === 'Chennai' || city === 'Kolkata') && isMonsoonSeason
  const monsoonMultiplier = showMonsoonSurcharge ? 1.08 : 1
  
  const finalPremium = zone ? premium.weeklyBase * premium.wai * zone.multiplier * monsoonMultiplier : premium.weeklyBase * premium.wai
  
  const driverPayoutInfo = selectedClaim ? {
    expectedDaily: dailyEarnings,
    actualDaily: dailyEarnings * (1 - selectedClaim.incomeLossRate) * 0.4,
    complianceFactor: 0.82,
    floorHours: dailyEarnings * 0.4 * 0.4,
    payout: 0.70 * (dailyEarnings - (dailyEarnings * (1 - selectedClaim.incomeLossRate) * 0.4)) * 0.82
  } : null

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans">
      {/* Header */}
      <header className="bg-dark-card border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-blue rounded-lg flex items-center justify-center font-bold text-lg">
                S
              </div>
              <div>
                <h1 className="text-2xl font-bold">Scudo</h1>
                <p className="text-sm text-gray-400">Parametric Income Insurance for Indian Gig Workers</p>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-700">
            {[
              { id: 'calculator', label: '📊 Premium Calculator' },
              { id: 'ml', label: '🤖 ML Pricing Demo' },
              { id: 'claims', label: '📋 Claims Engine' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'text-accent-blue border-b-2 border-accent-blue -mb-[2px]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Input Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">📍 Location & Platform</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-dark-bg border border-gray-600 rounded px-4 py-2 text-white hover:border-accent-blue focus:border-accent-blue focus:outline-none transition-colors"
                    >
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-dark-bg border border-gray-600 rounded px-4 py-2 text-white hover:border-accent-blue focus:border-accent-blue focus:outline-none transition-colors"
                    >
                      {PLATFORMS.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">💰 Daily Earnings</h3>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">Average Daily: {formatCurrency(dailyEarnings)}</label>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="2000"
                    step="50"
                    value={dailyEarnings}
                    onChange={(e) => setDailyEarnings(Number(e.target.value))}
                    className="w-full cursor-pointer accent-accent-blue"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹300</span>
                    <span>₹2,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Work Activity Sliders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">⏱️ Weekly Hours</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">{weeklyHours} hrs/week</label>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="1"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full cursor-pointer accent-accent-blue"
                />
              </div>
              
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">📦 Weekly Orders</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">{weeklyOrders} orders/week</label>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="1"
                  value={weeklyOrders}
                  onChange={(e) => setWeeklyOrders(Number(e.target.value))}
                  className="w-full cursor-pointer accent-accent-blue"
                />
              </div>
              
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">📊 Weekly GMV</h3>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-300">{formatCurrency(weeklyGMV)}/week</label>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="100"
                  value={weeklyGMV}
                  onChange={(e) => setWeeklyGMV(Number(e.target.value))}
                  className="w-full cursor-pointer accent-accent-blue"
                />
              </div>
            </div>
            
            {/* Premium Card */}
            <div className="bg-gradient-to-br from-accent-blue to-blue-600 rounded-lg p-8 text-white shadow-lg">
              <div className="text-center">
                <p className="text-sm font-medium opacity-90 mb-2">Your Weekly Premium</p>
                <div className="text-5xl font-bold">{formatCurrency(finalPremium)}</div>
                <p className="text-sm opacity-75 mt-2">/week • Annual: {formatCurrency(finalPremium * 52)}</p>
              </div>
            </div>
            
            {/* Risk Tier and WAI Badges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`rounded-lg p-6 border border-gray-700 ${getRiskTierColor(premium.tierInfo.tier)}`}>
                <p className="text-sm font-medium text-gray-400 mb-1">Risk Tier</p>
                <p className="text-2xl font-bold">{premium.tierInfo.tier}</p>
                <p className="text-xs mt-2 opacity-75">Annual Risk: {formatCurrency(premium.annualRisk)} @ {(premium.premiumRate * 100).toFixed(0)}% rate</p>
              </div>
              
              <div className="bg-accent-blue bg-opacity-20 text-accent-blue rounded-lg p-6 border border-accent-blue">
                <p className="text-sm font-medium mb-1">Work Activity Index (WAI)</p>
                <p className="text-2xl font-bold">{premium.wai.toFixed(2)}x</p>
                <p className="text-xs mt-2 opacity-75">
                  You work {((premium.wai - 1) * 100).toFixed(0)}% {premium.wai >= 1 ? 'more' : 'less'} than the average {city} driver
                </p>
              </div>
            </div>
            
            {/* Risk Breakdown Bar Chart */}
            <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">⚖️ Risk Breakdown</h3>
              <div className="space-y-3">
                {premium.riskBreakdown.map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-gray-400">{item.pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${item.pct}%`,
                          backgroundColor: getRiskBreakdownColor(item.label)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Breakdown Details */}
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full bg-dark-card rounded-lg p-4 border border-gray-700 hover:border-accent-blue transition-colors text-left font-semibold text-accent-blue"
            >
              {showBreakdown ? '▼' : '▶'} How is this calculated?
            </button>
            
            {showBreakdown && (
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-accent-blue">Step 1: Annual Risk by Category</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>Weather: {formatCurrency(premium.weatherRisk)}</div>
                    <div>AQI: {formatCurrency(premium.aqiRisk)}</div>
                    <div>Heat: {formatCurrency(premium.heatRisk)}</div>
                    <div>Civil: {formatCurrency(premium.civilRisk)}</div>
                    <div>Market: {formatCurrency(premium.marketRisk)}</div>
                    <div className="font-bold text-accent-blue">Total: {formatCurrency(premium.annualRisk)}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-accent-blue">Step 2: Risk Tier Classification</h4>
                  <p className="text-sm">Annual Risk {formatCurrency(premium.annualRisk)} → <span className="font-bold">{premium.tierInfo.tier} Tier</span> @ {(premium.premiumRate * 100).toFixed(0)}% premium rate</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-accent-blue">Step 3: Weekly Base Premium</h4>
                  <p className="text-sm">Annual Premium: {formatCurrency(premium.annualPremium)} ÷ 52 weeks = <span className="font-bold">{formatCurrency(premium.weeklyBase)}</span>/week</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-accent-blue">Step 4: Work Activity Index (WAI)</h4>
                  <p className="text-sm">
                    Hours: {weeklyHours}/{CITY_MEDIAN_BENCHMARKS[city].medianHours} = {(weeklyHours / CITY_MEDIAN_BENCHMARKS[city].medianHours).toFixed(2)}
                  </p>
                  <p className="text-sm">
                    Orders: {weeklyOrders}/{CITY_MEDIAN_BENCHMARKS[city].medianOrders} = {(weeklyOrders / CITY_MEDIAN_BENCHMARKS[city].medianOrders).toFixed(2)}
                  </p>
                  <p className="text-sm">
                    GMV: {formatCurrency(weeklyGMV)}/{formatCurrency(CITY_MEDIAN_BENCHMARKS[city].medianGMV)} = {(weeklyGMV / CITY_MEDIAN_BENCHMARKS[city].medianGMV).toFixed(2)}
                  </p>
                  <p className="text-sm mt-2">WAI = (0.4 × {(weeklyHours / CITY_MEDIAN_BENCHMARKS[city].medianHours).toFixed(2)}) + (0.3 × {(weeklyOrders / CITY_MEDIAN_BENCHMARKS[city].medianOrders).toFixed(2)}) + (0.3 × {(weeklyGMV / CITY_MEDIAN_BENCHMARKS[city].medianGMV).toFixed(2)}) = <span className="font-bold">{premium.wai.toFixed(2)}</span></p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-accent-blue">Step 5: Final Premium with Zone Adjustment</h4>
                  <p className="text-sm">
                    {formatCurrency(premium.weeklyBase)} × {premium.wai.toFixed(2)} (WAI) × {zone?.multiplier || 1} (zone) {showMonsoonSurcharge && `× 1.08 (monsoon)`} = <span className="font-bold">{formatCurrency(finalPremium)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* ML PRICING TAB */}
        {activeTab === 'ml' && (
          <div className="space-y-6">
            <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">🗺️ Hyper-Local Zone Selection</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Zone in {city}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableZones.map(z => (
                    <button
                      key={z.name}
                      onClick={() => handleZoneSelect(z)}
                      className={`p-3 rounded-lg border transition-colors text-sm text-left ${
                        zone?.name === z.name
                          ? 'border-accent-blue bg-accent-blue bg-opacity-20 text-accent-blue'
                          : 'border-gray-600 bg-dark-bg hover:border-accent-blue text-gray-200'
                      }`}
                    >
                      {z.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {mlLoading && (
              <div className="bg-accent-blue bg-opacity-20 border border-accent-blue rounded-lg p-6 text-center">
                <div className="inline-block">
                  <div className="animate-spin h-8 w-8 border-2 border-accent-blue border-t-transparent rounded-full mb-2"></div>
                  <p className="text-accent-blue font-medium">ML Model Running...</p>
                </div>
              </div>
            )}
            
            {mlResult && !mlLoading && (
              <div className="space-y-6">
                {/* Zone Risk Score */}
                <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">📊 Zone Risk Score</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold text-accent-blue">{mlResult.riskScore.toFixed(0)}</div>
                      <p className="text-sm text-gray-400 mt-2">Based on hyper-local disruption factors</p>
                    </div>
                    <div className="flex-1 mx-8">
                      <div className="bg-gray-700 rounded h-3 overflow-hidden">
                        <div
                          className="bg-accent-blue h-full transition-all duration-500"
                          style={{ width: `${mlResult.riskScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0 (Low)</span>
                        <span>100 (High)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ML Insight */}
                <div className="bg-warning-amber bg-opacity-10 border border-warning-amber rounded-lg p-6">
                  <p className="text-sm">
                    <span className="font-semibold text-warning-amber">💡 ML Insight:</span> {mlResult.zone.reason}
                  </p>
                </div>
                
                {/* Premium Comparison */}
                <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">💰 Premium Comparison</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-dark-bg rounded">
                      <span className="text-gray-300">Base Premium (no zone)</span>
                      <span className="font-semibold">{formatCurrency(mlResult.basePremium * premium.wai)}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-2xl">→</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-dark-bg rounded">
                      <span className="text-gray-300">After Zone Adjustment</span>
                      <span className="font-semibold text-success-green">{formatCurrency(mlResult.adjustedPremium * premium.wai)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded">
                      <span className="font-semibold">Adjustment</span>
                      <span className={`font-bold ${mlResult.adjustment >= 0 ? 'text-error-red' : 'text-success-green'}`}>
                        {mlResult.adjustment >= 0 ? '+' : ''}{mlResult.adjustment}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Powered by badge */}
                <div className="text-center text-xs text-gray-500">
                  💡 Powered by Scudo ZoneML v1.2
                </div>
              </div>
            )}
            
            {/* Weather Overlay Toggle */}
            <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">🌧️ Predictive Weather Overlay</h3>
                  <p className="text-sm text-gray-400">Simulate monsoon surcharge detection</p>
                </div>
                <button
                  onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    showWeatherOverlay ? 'bg-accent-blue' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      showWeatherOverlay ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {showMonsoonSurcharge && (
                <div className="mt-4 p-3 bg-warning-amber bg-opacity-10 border border-warning-amber rounded text-sm">
                  <p className="text-warning-amber">
                    🌧️ <span className="font-semibold">Monsoon season detected</span> — Elevated disruption probability in next 7 days
                  </p>
                  <p className="text-gray-400 mt-1 text-xs">+8% surcharge applied to premium</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* CLAIMS ENGINE TAB */}
        {activeTab === 'claims' && (
          <div className="space-y-6">
            {/* Trigger Polling Status */}
            <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">📡 Real-Time Trigger Monitoring</h3>
              
              <div className="space-y-3">
                {triggers.map(trigger => (
                  <div key={trigger.id} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <p className="font-semibold flex items-center gap-2">
                        <span>{trigger.icon}</span>
                        <span>{trigger.type}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Last checked: {trigger.lastChecked.toLocaleTimeString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          trigger.status === 'EVENT DETECTED'
                            ? 'bg-error-red bg-opacity-20 text-error-red animate-pulse'
                            : trigger.status === 'Checking...'
                            ? 'bg-warning-amber bg-opacity-20 text-warning-amber animate-pulse'
                            : 'bg-gray-600 bg-opacity-20 text-gray-400'
                        }`}>
                          {trigger.status}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{trigger.eventCount} events detected</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Manual Trigger */}
            <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">🔴 Manual Trigger Simulation</h3>
              
              <div className="flex gap-3">
                <select
                  value={manualTriggerType}
                  onChange={(e) => setManualTriggerType(Number(e.target.value))}
                  className="flex-1 bg-dark-bg border border-gray-600 rounded px-4 py-2 text-white hover:border-accent-blue focus:border-accent-blue focus:outline-none"
                >
                  {TRIGGER_EVENTS.map(e => (
                    <option key={e.id} value={e.id}>{e.type}</option>
                  ))}
                </select>
                
                <button
                  onClick={() => fireTrigger(manualTriggerType)}
                  className="bg-error-red hover:bg-red-600 text-white font-semibold px-6 py-2 rounded transition-colors"
                >
                  🔴 Fire Event
                </button>
              </div>
            </div>
            
            {/* Active Claims Table */}
            {activeClaims.length > 0 && (
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700 overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">📋 Active Claims</h3>
                
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 font-semibold text-gray-300">Event ID</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-300">Trigger Type</th>
                      <th className="text-center py-2 px-2 font-semibold text-gray-300">Affected Drivers</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-300">Status</th>
                      <th className="text-right py-2 px-2 font-semibold text-gray-300">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeClaims.map(claim => {
                      const affected = claim.affected
                      const avgPayout = 800 * claim.incomeLossRate * 0.70
                      const totalPayout = affected * avgPayout
                      
                      return (
                        <tr
                          key={claim.id}
                          onClick={() => setSelectedClaim(claim)}
                          className="border-b border-gray-700 hover:bg-dark-card cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-2 text-accent-blue font-mono">{claim.id}</td>
                          <td className="py-3 px-2">{claim.type}</td>
                          <td className="py-3 px-2 text-center">{affected.toLocaleString()}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              claim.currentStageIndex >= claim.stages.length - 1
                                ? 'bg-success-green bg-opacity-20 text-success-green'
                                : 'bg-warning-amber bg-opacity-20 text-warning-amber animate-pulse'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-success-green">{formatCurrency(totalPayout)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pipeline Visualization */}
            {selectedClaim && (
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">⚙️ Claim Processing Pipeline: {selectedClaim.id}</h3>
                
                <div className="flex justify-between items-center mb-6">
                  {selectedClaim.stages.map((stage, index) => (
                    <div key={stage.name} className="flex-1">
                      <div className={`p-3 rounded-lg text-center mb-2 transition-all ${
                        stage.completed
                          ? 'bg-success-green bg-opacity-20 text-success-green'
                          : index === selectedClaim.currentStageIndex
                          ? 'bg-warning-amber bg-opacity-20 text-warning-amber animate-pulse'
                          : 'bg-gray-700 bg-opacity-50 text-gray-400'
                      }`}>
                        <p className="text-xs font-bold">{stage.name}</p>
                      </div>
                      {index < selectedClaim.stages.length - 1 && (
                        <div className={`h-1 -mx-2 transition-all ${
                          selectedClaim.stages[index + 1].completed ? 'bg-success-green' : 'bg-gray-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Driver Spotlight */}
            {selectedClaim && driverPayoutInfo && (
              <div className="bg-dark-card rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">👤 Driver Spotlight - Payout Simulation</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Expected Daily Earnings</p>
                    <p className="text-3xl font-bold">{formatCurrency(driverPayoutInfo.expectedDaily)}</p>
                    <p className="text-xs text-gray-500 mt-2">Your configured daily earnings</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Actual Earnings (after {(selectedClaim.incomeLossRate * 100).toFixed(0)}% loss)</p>
                    <p className="text-3xl font-bold text-error-red">{formatCurrency(driverPayoutInfo.actualDaily)}</p>
                    <p className="text-xs text-gray-500 mt-2">Without Scudo protection</p>
                  </div>
                </div>
                
                {/* Compliance Gates */}
                <div className="mt-6 space-y-4">
                  <div className="bg-dark-bg p-4 rounded-lg">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <span>✓</span> Gate 1: Minimum Activity Verification
                    </p>
                    <p className="text-xs text-gray-400">
                      Floor Hours: {driverPayoutInfo.floorHours.toFixed(0)} hrs | Compliance Factor: {driverPayoutInfo.complianceFactor.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="bg-dark-bg p-4 rounded-lg">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <span>✓</span> Gate 2: Order Quality Check
                    </p>
                    <p className="text-xs text-gray-400">3 orders completed ≥ 1 required → PASS</p>
                  </div>
                </div>
                
                {/* Payout Summary */}
                <div className="mt-6 p-4 bg-success-green bg-opacity-10 border border-success-green rounded-lg">
                  <p className="font-semibold mb-4">💵 Scudo Payout: {formatCurrency(driverPayoutInfo.payout)}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Without Scudo</span>
                      <span className="font-semibold">{formatCurrency(driverPayoutInfo.actualDaily)}</span>
                    </div>
                    <div className="flex justify-between text-success-green font-bold text-lg pt-2 border-t border-success-green border-opacity-30">
                      <span>With Scudo</span>
                      <span>{formatCurrency(driverPayoutInfo.actualDaily + driverPayoutInfo.payout)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-dark-bg p-3 rounded text-xs">
                    <p className="text-gray-400">
                      ✓ Income Protected: <span className="text-success-green font-semibold">{formatCurrency(driverPayoutInfo.payout)}</span>
                    </p>
                    <p className="text-gray-400 mt-2">📱 Credited to UPI by 7:00 AM tomorrow</p>
                    <p className="text-gray-500 mt-2">UTR: SCU{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}{String(Math.random() * 100000 | 0).padStart(6, '0')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
