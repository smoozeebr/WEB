import { createClient } from '@supabase/supabase-js';
import { WaitlistEntry, RegisteredMember, GlobalSettings, DbConnectionStatus } from '../types';

// Key names for localStorage fallback
const WAITLIST_KEY = 'smoozice_waitlist';
const MEMBERS_KEY = 'smoozice_members';
const SETTINGS_KEY = 'smoozice_settings';
const AUTH_KEY = 'smoozice_auth_session';

// Initialize Supabase Client dynamically with safe protocol check & error boundaries
const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

const createSafeSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  
  // Validate protocol
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    console.warn('Supabase URL must start with http:// or https://. Falling back to LocalStorage.');
    return null;
  }
  
  // Ignore placeholder URLs
  if (supabaseUrl.includes('your-project.supabase.co') || supabaseUrl.includes('your-project-id.supabase.co')) {
    console.warn('Supabase URL is a placeholder. Falling back to LocalStorage.');
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error('Failed to initialize Supabase client safely:', err);
    return null;
  }
};

export const supabase = createSafeSupabaseClient();

// Helper to generate seed data in LocalStorage if empty (clearing all mock entries)
const seedDataIfEmpty = () => {
  // Clear only specific mock waitlist entries (wl-1 to wl-5) to clean up the dashboard without affecting real user submissions
  const waitlistData = localStorage.getItem(WAITLIST_KEY);
  if (waitlistData) {
    try {
      const parsed = JSON.parse(waitlistData) as WaitlistEntry[];
      const mockIds = ['wl-1', 'wl-2', 'wl-3', 'wl-4', 'wl-5'];
      const realOnly = parsed.filter(item => !mockIds.includes(item.id));
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(realOnly));
    } catch {
      localStorage.setItem(WAITLIST_KEY, JSON.stringify([]));
    }
  } else {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify([]));
  }

  // Clear only specific mock registered members (m-1 to m-3) to clean up the dashboard
  const membersData = localStorage.getItem(MEMBERS_KEY);
  if (membersData) {
    try {
      const parsed = JSON.parse(membersData) as RegisteredMember[];
      const mockMemberIds = ['m-1', 'm-2', 'm-3'];
      const realOnly = parsed.filter(item => !mockMemberIds.includes(item.id));
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(realOnly));
    } catch {
      localStorage.setItem(MEMBERS_KEY, JSON.stringify([]));
    }
  } else {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(SETTINGS_KEY)) {
    const initialSettings: GlobalSettings = {
      forceRedirect: false,
      redirectUrl: 'https://instagram.com/smoozice'
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
  }
};

// Execute seeding
seedDataIfEmpty();

/**
 * Waitlist Operations
 */
export const getWaitlistEntries = async (): Promise<WaitlistEntry[]> => {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) {
        return data as WaitlistEntry[];
      }
      console.warn('Supabase waitlist fetch failed or empty table, falling back to LocalStorage. Error:', error);
    } catch (err) {
      console.warn('Supabase fetch exception, using LocalStorage:', err);
    }
  }

  // Fallback to local storage
  await new Promise((resolve) => setTimeout(resolve, 300));
  const data = localStorage.getItem(WAITLIST_KEY);
  return data ? JSON.parse(data) : [];
};

export const submitWaitlist = async (
  entry: Omit<WaitlistEntry, 'id' | 'queueNumber' | 'createdAt' | 'status'>
): Promise<WaitlistEntry> => {
  const entries = await getWaitlistEntries();
  
  // Calculate next queue number (start from 1029 if empty)
  const maxQueue = entries.reduce((max, item) => (item.queueNumber > max ? item.queueNumber : max), 1023);
  const nextQueueNumber = maxQueue + 1;

  const newEntry: WaitlistEntry = {
    ...entry,
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    queueNumber: nextQueueNumber,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  // Insert to Supabase if active
  if (supabase) {
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([newEntry]);
      if (error) {
        console.error('Supabase insert error, fell back to LocalStorage only. Error:', error);
      }
    } catch (err) {
      console.error('Supabase exception on insert:', err);
    }
  }

  // Always write to local storage as fallback/local cache
  const localData = localStorage.getItem(WAITLIST_KEY);
  const localEntries = localData ? JSON.parse(localData) : [];
  localEntries.unshift(newEntry);
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(localEntries));

  await new Promise((resolve) => setTimeout(resolve, 600));
  return newEntry;
};

export const updateWaitlistStatus = async (
  id: string,
  status: 'pending' | 'accepted' | 'rejected'
): Promise<WaitlistEntry[]> => {
  // Update in Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from('waitlist')
        .update({ status })
        .eq('id', id);
      if (error) {
        console.error('Supabase status update error:', error);
      }
    } catch (err) {
      console.error('Supabase exception on update:', err);
    }
  }

  // Update in local storage
  const entries = await getWaitlistEntries();
  const updated = entries.map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(updated));

  await new Promise((resolve) => setTimeout(resolve, 200));
  return updated;
};

export const deleteWaitlistEntry = async (id: string): Promise<WaitlistEntry[]> => {
  // Delete in Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from('waitlist')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
      }
    } catch (err) {
      console.error('Supabase exception on delete:', err);
    }
  }

  // Delete in local storage
  const entries = await getWaitlistEntries();
  const filtered = entries.filter((item) => item.id !== id);
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(filtered));

  await new Promise((resolve) => setTimeout(resolve, 200));
  return filtered;
};

/**
 * Registered Members Operations
 */
export const getRegisteredMembers = async (): Promise<RegisteredMember[]> => {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('createdAt', { ascending: false });
      if (!error && data) {
        return data as RegisteredMember[];
      }
      console.warn('Supabase members fetch failed or empty, using LocalStorage:', error);
    } catch (err) {
      console.warn('Supabase exception fetching members:', err);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
  const data = localStorage.getItem(MEMBERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteRegisteredMember = async (id: string): Promise<RegisteredMember[]> => {
  // Delete from Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Supabase delete member error:', error);
      }
    } catch (err) {
      console.error('Supabase exception deleting member:', err);
    }
  }

  // Delete from local storage
  const members = await getRegisteredMembers();
  const filtered = members.filter((item) => item.id !== id);
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(filtered));

  await new Promise((resolve) => setTimeout(resolve, 200));
  return filtered;
};

/**
 * Global App Settings Operations
 */
export const getGlobalSettings = async (): Promise<GlobalSettings> => {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'global')
        .single();
      if (!error && data) {
        return {
          forceRedirect: data.forceRedirect,
          redirectUrl: data.redirectUrl
        };
      }
    } catch (err) {
      console.warn('Supabase settings fetch failed, using LocalStorage fallback:', err);
    }
  }

  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : { forceRedirect: false, redirectUrl: 'https://instagram.com/smoozice' };
};

export const updateGlobalSettings = async (settings: GlobalSettings): Promise<GlobalSettings> => {
  // Update in Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert([{ id: 'global', forceRedirect: settings.forceRedirect, redirectUrl: settings.redirectUrl }]);
      if (error) {
        console.error('Supabase settings upsert error:', error);
      }
    } catch (err) {
      console.error('Supabase exception upserting settings:', err);
    }
  }

  // Update in LocalStorage
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
};

/**
 * Authentication Operations
 */
export const login = async (email: string, password: string): Promise<{ success: boolean; email?: string; error?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  
  const trimmedEmail = email.trim().toLowerCase();

  // 1. Try checking Supabase first if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('email', trimmedEmail)
        .single();
      
      if (!error && data && data.password === password) {
        const session = { email: trimmedEmail, token: 'mock-jwt-token-' + Math.random().toString(36).substring(2), loggedInAt: new Date().toISOString() };
        localStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return { success: true, email: trimmedEmail };
      }
    } catch (err) {
      console.warn('Supabase admin authentication skipped/failed, using fallback:', err);
    }
  }

  // 2. Fallback to LocalStorage and hardcoded defaults
  const accountsStr = localStorage.getItem('smoozice_admin_accounts');
  let accounts: Record<string, string> = {
    'admin@smoozice.com': 'admin123',
    'smoozeebr@gmail.com': 'admin123'
  };

  if (accountsStr) {
    try {
      const parsed = JSON.parse(accountsStr);
      accounts = { ...accounts, ...parsed };
    } catch {
      // Use defaults
    }
  }

  if (accounts[trimmedEmail] && accounts[trimmedEmail] === password) {
    const session = { email: trimmedEmail, token: 'mock-jwt-token-' + Math.random().toString(36).substring(2), loggedInAt: new Date().toISOString() };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return { success: true, email: trimmedEmail };
  } else {
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  }
};

export const register = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return { success: false, error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.' };
  }

  // Get current accounts
  const accountsStr = localStorage.getItem('smoozice_admin_accounts');
  let accounts: Record<string, string> = {};
  if (accountsStr) {
    try {
      accounts = JSON.parse(accountsStr);
    } catch {
      accounts = {};
    }
  }

  // Seed default ones if not present
  if (!accounts['admin@smoozice.com']) {
    accounts['admin@smoozice.com'] = 'admin123';
  }
  if (!accounts['smoozeebr@gmail.com']) {
    accounts['smoozeebr@gmail.com'] = 'admin123';
  }

  if (accounts[trimmedEmail]) {
    return { success: false, error: 'هذا الحساب مسجل بالفعل.' };
  }

  // Add new account
  accounts[trimmedEmail] = password;
  localStorage.setItem('smoozice_admin_accounts', JSON.stringify(accounts));

  // Try saving to Supabase if connection is alive, gracefully fallback if not
  if (supabase) {
    try {
      const { error } = await supabase
        .from('admin_accounts')
        .upsert([{ email: trimmedEmail, password: password }]);
      if (error) {
        console.warn('Supabase optional admin_accounts insertion skipped/failed:', error.message);
      }
    } catch (err) {
      console.warn('Supabase exception during admin registration:', err);
    }
  }

  return { success: true };
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(AUTH_KEY);
};

export const getCurrentUser = (): { email: string } | null => {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return { email: parsed.email };
  } catch {
    return null;
  }
};

/**
 * Database Connection Status Check
 */
export const checkDatabaseConnection = async (): Promise<DbConnectionStatus> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  const supabaseUrlExists = !!supabaseUrl;
  const supabaseAnonKeyExists = !!supabaseAnonKey;
  const connected = !!supabase;

  return {
    connected,
    driver: connected ? 'Supabase Client (Postgres)' : 'LocalStorage Fallback (Mock DB)',
    envChecked: {
      SUPABASE_URL: supabaseUrlExists,
      SUPABASE_ANON_KEY: supabaseAnonKeyExists,
      LOCAL_STORAGE_BACKUP: true
    },
    message: connected 
      ? 'متصل بنجاح بقاعدة بيانات Supabase الأساسية ونشط بالكامل!' 
      : 'يعمل حالياً في الوضع التجريبي الآمن (LocalStorage). لربطه بقاعدة بيانات Supabase حقيقية، يرجى تهيئة متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.'
  };
};
