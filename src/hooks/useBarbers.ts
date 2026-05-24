'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActiveBarbers, getBarbers } from '@/lib/firestore';
import type { Barber } from '@/types';
import { FALLBACK_BARBERS } from '@/lib/fallbackData';

export function useBarbers(activeOnly: boolean = true) {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBarbers = useCallback(async () => {
    try {
      setLoading(true);
      const data = activeOnly ? await getActiveBarbers() : await getBarbers();
      if (data.length === 0) {
        setBarbers(FALLBACK_BARBERS);
      } else {
        setBarbers(data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching barbers, using fallback:', err);
      setBarbers(FALLBACK_BARBERS);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [activeOnly]);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  return { barbers, loading, error, refetch: fetchBarbers };
}
