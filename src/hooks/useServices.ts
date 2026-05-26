'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveServices, getServices } from '@/lib/firestore';
import type { Service } from '@/types';
import { FALLBACK_SERVICES } from '@/lib/fallbackData';

export function useServices(activeOnly: boolean = true) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = activeOnly ? await getActiveServices() : await getServices();
      if (data.length === 0) {
        setServices(FALLBACK_SERVICES);
      } else {
        setServices(data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching services, using fallback:', err);
      setServices(FALLBACK_SERVICES);
      setError(null); // Clear error to allow demo mode
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
}
