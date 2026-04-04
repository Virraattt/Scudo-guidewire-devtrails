import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Home,
  LogOut,
  Menu,
  Shield,
  TrendingUp,
  User,
  Zap,
  X
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  const [driver, setDriver] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        {driver && <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}
        
        {/* Main Content */}
        <div className={`flex-1 overflow-auto transition-all ${sidebarOpen && driver ? 'ml-64' : ''}`}>
          {/* Header */}
          {driver && <Header driver={driver} onLogout={() => setDriver(null)} />}
          
          {/* Routes */}
          <Routes>
            <Route path="/" element={<LoginPage onLogin={setDriver} />} />
            <Route path="/dashboard" element={<Dashboard driver={driver} />} />
            <Route path="/register" element={<RegisterPage onSuccess={setDriver} />} />
            <Route path="/policy" element={<PolicyPage driver={driver} />} />
            <Route path="/claims" element={<ClaimsPage driver={driver} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// ============================================================================
// SIDEBAR
// ============================================================================

function Sidebar({ open, onToggle }) {
  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-50 ${
      open ? 'w-64' : 'w-20'
    }`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-blue-700">
        <Shield className={`w-8 h-8 ${open ? '' : 'mx-auto'}`} />
        {open && <h1 className="text-xl font-bold">Scudo</h1>}
      </div>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        <NavLink icon={<Home className="w-5 h-5" />} label="Dashboard" to="/dashboard" open={open} />
        <NavLink icon={<Shield className="w-5 h-5" />} label="My Policy" to="/policy" open={open} />
        <NavLink icon={<AlertCircle className="w-5 h-5" />} label="Claims" to="/claims" open={open} />
        <NavLink icon={<TrendingUp className="w-5 h-5" />} label="Analytics" to="#" open={open} />
      </nav>

      {/* Help Section */}
      {open && (
        <div className="absolute bottom-6 left-4 right-4 bg-blue-700 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">Need Help?</p>
          <p className="text-blue-100">Contact support 24/7 via WhatsApp</p>
        </div>
      )}
    </div>
  );
}

function NavLink({ icon, label, to, open }) {
  return (
    <a href={to} className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition">
      {icon}
      {open && <span>{label}</span>}
    </a>
  );
}

// ============================================================================
// HEADER
// ============================================================================

function Header({ driver, onLogout }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {driver?.name}</h2>
        <p className="text-sm text-gray-500">{driver?.city} • {driver?.platform}</p>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
}

// ============================================================================
// LOGIN PAGE
// ============================================================================

function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState('9876543210');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.get(`${API_URL}/drivers`, {
        params: { phone }
      });
      
      const drivers = response.data;
      const foundDriver = drivers.find(d => d.phone === phone);
      
      if (foundDriver) {
        onLogin(foundDriver);
        navigate('/dashboard');
      } else {
        alert('Driver not found. Please register first.');
        navigate('/register');
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-900 to-blue-600 p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Scudo</h1>
          <p className="text-center text-gray-600 mb-8">AI-Enabled Income Insurance for Gig Workers</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Demo Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-2">Demo Credentials:</p>
              <p>Phone: 9876543210 (Rajesh Kumar, Mumbai)</p>
              <p>Phone: 9876543211 (Priya Sharma, Delhi)</p>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-900 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">New driver?</p>
            <a href="/register" className="text-blue-600 font-semibold hover:underline">
              Register here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REGISTRATION PAGE
// ============================================================================

function RegisterPage({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Mumbai',
    platform: 'Swiggy',
    vehicle_type: 'two-wheeler',
    avg_daily_earn: 1000,
    weekly_hours: 45,
    weekly_orders: 120,
    weekly_gmv: 5000
  });
  const [step, setStep] = useState(1);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value)
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register driver
      const driverRes = await axios.post(`${API_URL}/drivers/register`, formData);
      const driver_id = driverRes.data.driver_id;

      // Create policy
      const policyRes = await axios.post(`${API_URL}/policies/create`, { driver_id });
      setPolicy(policyRes.data);
      setStep(2);

      // Auto-login after registration
      setTimeout(() => {
        const completeDriver = { ...formData, id: driver_id };
        onSuccess(completeDriver);
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Insured in 5 Minutes</h1>
            <p className="text-gray-600 mb-8">Zero paperwork. Instant coverage.</p>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10-digit phone"
                  />
                </div>
              </div>

              {/* City & Platform */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Mumbai</option>
                    <option>Delhi</option>
                    <option>Bangalore</option>
                    <option>Hyderabad</option>
                    <option>Chennai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Swiggy</option>
                    <option>Zomato</option>
                    <option>Zepto</option>
                    <option>Flipkart</option>
                    <option>Dunzo</option>
                  </select>
                </div>
              </div>

              {/* Earnings Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Average Daily Earnings</label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">₹</span>
                  <input
                    type="number"
                    name="avg_daily_earn"
                    value={formData.avg_daily_earn}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Activity Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours</label>
                  <input
                    type="number"
                    name="weekly_hours"
                    value={formData.weekly_hours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Orders</label>
                  <input
                    type="number"
                    name="weekly_orders"
                    value={formData.weekly_orders}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekly GMV (₹)</label>
                  <input
                    type="number"
                    name="weekly_gmv"
                    value={formData.weekly_gmv}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-900 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Get My Policy & Premium'}
              </button>
            </form>
          </div>
        )}

        {step === 2 && policy && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Policy Created!</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mt-6 text-left">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Your Coverage Summary</h3>
              <div className="space-y-3">
                <StatItem label="Policy ID" value={policy.policy_id.slice(0, 8).toUpperCase()} />
                <StatItem label="Risk Tier" value={policy.risk_tier} />
                <StatItem label="Annual Risk Exposure" value={`₹${policy.annual_risk.toLocaleString()}`} />
                <StatItem label="Weekly Premium" value={`₹${policy.final_weekly_premium}`} />
                <StatItem label="Activity Index (WAI)" value={`${(policy.wai_score * 100).toFixed(0)}%`} />
              </div>
            </div>

            <p className="text-gray-600 mt-6">Coverage starts tomorrow. Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================

function Dashboard({ driver }) {
  const [disruptions, setDisruptions] = useState([]);
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driver) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [driver]);

  const fetchDashboardData = async () => {
    try {
      const [policyRes, disruptionsRes] = await Promise.all([
        axios.get(`${API_URL}/policies/${driver.id}`),
        axios.get(`${API_URL}/disruptions/${driver.city}`)
      ]);
      setPolicy(policyRes.data);
      setDisruptions(disruptionsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="p-8 space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Shield className="w-6 h-6" />}
          label="Coverage Status"
          value="Active"
          color="green"
        />
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Weekly Premium"
          value={`₹${policy?.final_weekly_premium || 0}`}
          color="blue"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Annual Risk"
          value={`₹${policy?.annual_risk || 0}`}
          color="orange"
        />
        <MetricCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Risk Tier"
          value={policy?.risk_tier || 'N/A'}
          color="red"
        />
      </div>

      {/* Active Disruptions */}
      {disruptions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 text-orange-500 mr-2" />
            Active Disruptions in {driver.city}
          </h3>
          <div className="space-y-3">
            {disruptions.map(d => (
              <div key={d.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{d.event_type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-sm text-gray-600">Severity: {d.severity}</p>
                    <p className="text-xs text-gray-500 mt-1">Detection: {new Date(d.created_timestamp).toLocaleTimeString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    d.severity === 'red' || d.severity === 'full' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {d.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-orange-700 mt-3 bg-orange-100 p-2 rounded">
                  💡 Your claim will be auto-processed. Check back in 1 hour for payment confirmation.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-bold text-gray-900 mb-4">How Scudo Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProcessStep number="1" title="Disruption Occurs" description="Weather, bandh, or platform outage detected" />
          <ProcessStep number="2" title="Automatic Verification" description="System verifies against official APIs" />
          <ProcessStep number="3" title="Instant Payout" description="By 7 AM next morning via UPI" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  const colorClasses = {
    green: 'from-green-50 to-green-100',
    blue: 'from-blue-50 to-blue-100',
    orange: 'from-orange-50 to-orange-100',
    red: 'from-red-50 to-red-100'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-lg text-gray-700">{icon}</div>
      </div>
    </div>
  );
}

function ProcessStep({ number, title, description }) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-3">
        {number}
      </div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

// ============================================================================
// POLICY PAGE
// ============================================================================

function PolicyPage({ driver }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driver) {
      axios.get(`${API_URL}/policies/${driver.id}`)
        .then(res => setPolicy(res.data))
        .catch(err => console.error('Error fetching policy:', err))
        .finally(() => setLoading(false));
    }
  }, [driver]);

  if (loading) return <div className="p-8 text-center">Loading policy...</div>;
  if (!policy) return <div className="p-8 text-center text-gray-600">No policy found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">Your Insurance Policy</h1>
          <p className="text-blue-100">Policy ID: {policy.id.slice(0, 12).toUpperCase()}</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Coverage Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Coverage Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <p className="text-gray-600 text-sm mb-2">Risk Tier</p>
                <p className="text-3xl font-bold text-blue-900">{policy.risk_tier}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <p className="text-gray-600 text-sm mb-2">Annual Risk Exposure</p>
                <p className="text-3xl font-bold text-green-900">₹{policy.annual_risk.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Premium Details */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Premium Calculation</h3>
            <table className="w-full text-sm">
              <tbody className="space-y-3">
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Annual Risk Score</td>
                  <td className="py-3 font-bold text-gray-900">₹{policy.annual_risk.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Premium Rate</td>
                  <td className="py-3 font-bold text-gray-900">{(policy.premium_rate * 100).toFixed(0)}%</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Annual Premium</td>
                  <td className="py-3 font-bold text-gray-900">₹{policy.annual_premium.toLocaleString()}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 text-gray-600">Weekly Base Premium</td>
                  <td className="py-3 font-bold text-gray-900">₹{policy.weekly_premium_base.toFixed(2)}</td>
                </tr>
                <tr className="border-b bg-yellow-50">
                  <td className="py-3 text-gray-600">Activity Index (WAI)</td>
                  <td className="py-3 font-bold text-yellow-900">{(policy.wai_score * 100).toFixed(0)}%</td>
                </tr>
                <tr className="bg-green-100">
                  <td className="py-3 font-bold text-gray-900">Final Weekly Premium</td>
                  <td className="py-3 font-bold text-green-900 text-lg">₹{policy.final_weekly_premium.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* What's Covered */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4">What's Covered</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CoverageItem title="Extreme Weather" description="Orange/Red alerts from IMD" loss="60-80%" />
              <CoverageItem title="Air Pollution" description="AQI > 300 (CPCB alerts)" loss="30-70%" />
              <CoverageItem title="Civil Disruptions" description="Bandh, curfew, strikes" loss="70-90%" />
              <CoverageItem title="Platform Anomalies" description="Order volume drops >60%" loss="40-60%" />
              <CoverageItem title="Fuel Price Spikes" description="≥20% increase in 7 days" loss="35%" />
              <CoverageItem title="Market Crashes" description="Significant demand drops" loss="40%" />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-3 bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Coverage Active</p>
              <p className="text-sm text-green-700">Starting {new Date(policy.created_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoverageItem({ title, description, loss }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <p className="text-xs bg-blue-100 text-blue-900 inline-block mt-2 px-2 py-1 rounded">Income loss: {loss}</p>
    </div>
  );
}

// ============================================================================
// CLAIMS PAGE
// ============================================================================

function ClaimsPage({ driver }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (driver) {
      axios.get(`${API_URL}/claims/${driver.id}`)
        .then(res => setClaims(res.data))
        .catch(err => console.error('Error fetching claims:', err))
        .finally(() => setLoading(false));
    }
  }, [driver]);

  if (loading) return <div className="p-8 text-center">Loading claims...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Claims</h1>

      {claims.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No claims yet</p>
          <p className="text-gray-500">When a disruption occurs, your claim will be processed automatically</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6 border-l-4" style={{
                borderLeftColor: claim.status === 'approved' ? '#10b981' : claim.status === 'rejected' ? '#ef4444' : '#f59e0b'
              }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{claim.disruption_type.replace('_', ' ').toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">Claim on {new Date(claim.disruption_date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    claim.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {claim.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <ClaimStat label="Expected Earnings" value={`₹${claim.expected_daily_earn}`} />
                  <ClaimStat label="Actual Earnings" value={`₹${claim.actual_daily_earn}`} />
                  <ClaimStat label="Hours Worked" value={`${claim.hours_worked}h`} />
                  <ClaimStat label="Orders Done" value={claim.orders_completed} />
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600 text-sm">Compliance Factor</p>
                      <p className="font-bold text-gray-900">{(claim.compliance_factor * 100).toFixed(0)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 text-sm">Payout Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{claim.payout_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimStat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default App;
