import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sign in admin with email and password
 */
export async function signInAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // Demo mode bypass
  if (email === 'admin@demo.com' && password === 'admin') {
    if (typeof window !== 'undefined') localStorage.setItem('demo_admin', 'true');
    // Force a tiny delay for realism and to ensure localStorage is written
    await new Promise(resolve => setTimeout(resolve, 500));
    // Hard reload the page so the useAuth hook picks up the new localStorage value
    if (typeof window !== 'undefined') window.location.href = '/admin/bookings';
    return { success: true };
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: unknown) {
    console.error('Sign-in error:', error);
    if (error instanceof Error) {
      if (error.message.includes('wrong-password') || error.message.includes('user-not-found')) {
        return { success: false, error: 'Invalid email or password' };
      }
      if (error.message.includes('invalid-credential')) {
        return { success: false, error: 'Invalid email or password' };
      }
    }
    return { success: false, error: 'An error occurred. Please try again.' };
  }
}

/**
 * Sign out current user
 */
export async function signOutAdmin(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('demo_admin');
  }
  await signOut(auth);
}

/**
 * Listen for auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}
