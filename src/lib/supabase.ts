import { createClient } from '@supabase/supabase-js';
import { MOCK_COLLEGES, MOCK_CUTOFFS, College, Cutoff, UserProfile, getStoredData, setStoredData } from './mockDb';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if credentials are properly set up (and not placeholders)
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-url') &&
  supabaseUrl.startsWith('https://');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// FALLBACK DATA LAYER (LocalStorage & Memory)
// ==========================================

export interface UserSession {
  user: {
    id: string;
    email: string;
    full_name?: string;
    is_premium: boolean;
    role: 'student' | 'admin';
  } | null;
}

// Global helper functions that encapsulate DB operations
export const dbService = {
  // Fetch colleges
  async getColleges(): Promise<College[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('ranking', { ascending: true });
      if (!error && data && data.length > 0) return data as College[];
    }
    return getStoredData<College[]>('counsel_colleges', MOCK_COLLEGES);
  },

  // Fetch single college
  async getCollegeById(id: string): Promise<College | null> {
    const colleges = await this.getColleges();
    return colleges.find((c) => c.id === id) || null;
  },

  // Fetch cutoffs
  async getCutoffs(): Promise<Cutoff[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('cutoffs')
        .select('*');
      if (!error && data && data.length > 0) return data as Cutoff[];
    }
    return getStoredData<Cutoff[]>('counsel_cutoffs', MOCK_CUTOFFS);
  },

  // Get active session profile
  async getCurrentUser(defaultEmail = 'student@example.com'): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!error && data) return data as UserProfile;
        
        // If profile doesn't exist yet, insert it
        const newProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 'Engineering Student',
          role: 'student',
          is_premium: true,
          created_at: new Date().toISOString()
        };
        await supabase.from('users').insert(newProfile);
        return newProfile;
      }
    }
    
    // Local Session fallback
    let localUser = getStoredData<UserProfile | null>('counsel_session', null);
    if (!localUser) {
      localUser = {
        id: 'mock-user-123',
        email: defaultEmail,
        full_name: 'Engineering Aspirant',
        role: defaultEmail.startsWith('admin') ? 'admin' : 'student',
        is_premium: true,
        created_at: new Date().toISOString()
      };
      setStoredData('counsel_session', localUser);
    }
    return localUser;
  },

  // Login simulation or actual auth
  async simulateLogin(email: string, role: 'student' | 'admin' = 'student'): Promise<UserProfile> {
    const isPremium = getStoredData<boolean>(`premium_user_${email}`, false);
    const user: UserProfile = {
      id: role === 'admin' ? 'mock-admin-999' : `mock-student-${Math.floor(Math.random() * 1000)}`,
      email,
      full_name: role === 'admin' ? 'System Administrator' : 'Engineering Aspirant',
      role,
      is_premium: role === 'admin' ? true : isPremium,
      created_at: new Date().toISOString()
    };
    setStoredData('counsel_session', user);
    return user;
  },

  // Signout
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setStoredData('counsel_session', null);
  },

  // Upgrade user to premium
  async upgradeToPremium(userId: string): Promise<boolean> {
    // Save locally
    const session = getStoredData<UserProfile | null>('counsel_session', null);
    if (session) {
      session.is_premium = true;
      setStoredData('counsel_session', session);
      setStoredData(`premium_user_${session.email}`, true);
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('id', userId);
      return !error;
    }
    return true;
  },

  // Save payments
  async recordPayment(payment: {
    id: string;
    userId: string;
    amount: number;
    orderId: string;
    paymentId?: string;
  }): Promise<boolean> {
    // Mock save
    const payments = getStoredData<any[]>('counsel_payments', []);
    payments.push({
      ...payment,
      status: 'captured',
      created_at: new Date().toISOString()
    });
    setStoredData('counsel_payments', payments);

    // Run premium upgrade
    await this.upgradeToPremium(payment.userId);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('payments')
        .insert({
          id: payment.id,
          user_id: payment.userId,
          amount: payment.amount,
          currency: 'INR',
          status: 'captured',
          razorpay_order_id: payment.orderId,
          razorpay_payment_id: payment.paymentId || null
        });
      return !error;
    }
    return true;
  },

  // Save prediction results
  async savePrediction(prediction: {
    userId: string;
    exam: string;
    rank: number;
    category: string;
    branch?: string;
    state?: string;
    budget?: number;
    results: any;
  }): Promise<boolean> {
    const predictions = getStoredData<any[]>('counsel_predictions', []);
    predictions.push({
      id: `pred-${Math.floor(Math.random() * 100000)}`,
      ...prediction,
      created_at: new Date().toISOString()
    });
    setStoredData('counsel_predictions', predictions);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('predictions')
        .insert({
          user_id: prediction.userId,
          exam: prediction.exam,
          rank: prediction.rank,
          category: prediction.category,
          branch: prediction.branch || null,
          state: prediction.state || null,
          budget: prediction.budget || null,
          results: prediction.results
        });
      return !error;
    }
    return true;
  },

  // Fetch prediction history
  async getPredictionHistory(userId: string): Promise<any[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    const predictions = getStoredData<any[]>('counsel_predictions', []);
    return predictions
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Admin: Update college details
  async updateCollege(updatedCollege: College): Promise<boolean> {
    const colleges = await this.getColleges();
    const index = colleges.findIndex((c) => c.id === updatedCollege.id);
    if (index !== -1) {
      colleges[index] = updatedCollege;
      setStoredData('counsel_colleges', colleges);
    }
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('colleges')
        .upsert(updatedCollege);
      return !error;
    }
    return true;
  },

  // Admin: Bulk insert cutoff rows
  async bulkInsertCutoffs(newCutoffs: Cutoff[]): Promise<boolean> {
    const cutoffs = await this.getCutoffs();
    // Prepend or add new cutoffs
    const updatedCutoffs = [...newCutoffs, ...cutoffs];
    setStoredData('counsel_cutoffs', updatedCutoffs);
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('cutoffs')
        .insert(newCutoffs);
      return !error;
    }
    return true;
  }
};
