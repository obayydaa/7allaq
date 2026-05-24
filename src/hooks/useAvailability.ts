'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAvailability } from '@/lib/firestore';
import type { Availability } from '@/types';

export function useAvailability() {
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAvailability();
      setAvailability(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return { availability, loading, error, refetch: fetchAvailability };
}
