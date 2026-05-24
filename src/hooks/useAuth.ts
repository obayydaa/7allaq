'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo admin session
    if (typeof window !== 'undefined' && localStorage.getItem('demo_admin') === 'true') {
      setUser({ uid: 'demo-admin', email: 'admin@demo.com' } as User);
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
