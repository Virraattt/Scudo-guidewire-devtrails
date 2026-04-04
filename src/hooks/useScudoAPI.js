/**
 * useScudoAPI - Custom React hook for Scudo Insurance Model API
 * 
 * Provides functions to interact with the Python backend API
 * 
 * Usage:
 * const { calculatePremium, getPremium, loading, error } = useScudoAPI();
 * 
 * const premium = await calculatePremium({
 *   city: 'Mumbai',
 *   daily_earnings: 800,
 *   weekly_hours: 44,
 *   weekly_orders: 30,
 *   weekly_gmv: 5500
 * });
 */

import { useState, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useScudoAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResponse = useCallback(async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }
    return response.json();
  }, []);

  // Health check
  const healthCheck = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/health`);
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Get model info
  const getModelInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/info`);
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Get supported cities
  const getCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/config/cities`);
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Get zones for a city
  const getZones = useCallback(async (city) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/config/zones/${city}`);
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Get city data (disruption baselines, loss rates, benchmarks)
  const getCityData = useCallback(async (city) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/config/city-data/${city}`);
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Calculate premium
  const calculatePremium = useCallback(async (premiumData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/premium/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(premiumData)
      });
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Calculate premiums in batch
  const calculatePremiumBatch = useCallback(async (drivers) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/premium/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ drivers })
      });
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // ML predict
  const mlPredict = useCallback(async (scenarios) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scenarios })
      });
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Get zone adjustment
  const getZoneAdjustment = useCallback(async (city, zone) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/ml/zone-adjustment/${city}/${encodeURIComponent(zone)}`);
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Fire trigger (create claim)
  const fireTrigger = useCallback(async (triggerId, city, affectedCount) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/claims/fire-trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger_id: triggerId,
          city,
          affected_count: affectedCount
        })
      });
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Progress claim
  const progressClaim = useCallback(async (claimId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/claims/${claimId}/progress`, {
        method: 'POST'
      });
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  // Calculate claim payout
  const calculateClaimPayout = useCallback(async (claimId, dailyEarnings, complianceFactor = 0.82) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/claims/${claimId}/payout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          daily_earnings: dailyEarnings,
          compliance_factor: complianceFactor
        })
      });
      return await handleResponse(response);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleResponse]);

  return {
    loading,
    error,
    healthCheck,
    getModelInfo,
    getCities,
    getZones,
    getCityData,
    calculatePremium,
    calculatePremiumBatch,
    mlPredict,
    getZoneAdjustment,
    fireTrigger,
    progressClaim,
    calculateClaimPayout
  };
}

export default useScudoAPI;
