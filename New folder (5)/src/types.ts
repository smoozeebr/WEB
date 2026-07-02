export interface WaitlistEntry {
  id: string;
  queueNumber: number;
  email: string;
  phone: string;
  hairTypes: string[]; // multi-select Arabic types
  careRoutine: string;
  isQualityImportant: string; // "نعم" | "لا" | "إلى حد ما"
  expectedPrice: string; // text accepting Arabic/English numbers
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  colorInterest: 'pink' | 'purple' | 'black' | 'any';
}

export interface RegisteredMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface GlobalSettings {
  forceRedirect: boolean;
  redirectUrl: string;
}

export interface DbConnectionStatus {
  connected: boolean;
  driver: string;
  envChecked: {
    SUPABASE_URL: boolean;
    SUPABASE_ANON_KEY: boolean;
    LOCAL_STORAGE_BACKUP: boolean;
  };
  message: string;
}
