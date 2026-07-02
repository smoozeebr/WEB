import { createClient } from "@supabase/supabase-js";

let supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim().replace(/^['"]|['"]$/g, "");
if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  supabaseUrl = "https://quvimnhcavjwkarbfybw.supabase.co";
}

let supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim().replace(/^['"]|['"]$/g, "");
if (!supabaseAnonKey || supabaseAnonKey.length < 20) {
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1dmltbmhjYXZqd2thcmJmeWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4NTEyNTksImV4cCI6MjA5ODQyNzI1OX0.EmfAQebcXm_BCXW3eee_5FgrXWGYb-H-8D8YYbNoAKA";
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseProduct {
  id?: string;
  code: string;
  name: string;
  price: number;
  image_url: string;
  brush_color: "pink" | "purple" | "black";
  package_type: "single" | "gift_set";
  description?: string;
}

export interface SupabaseOrder {
  id: string;
  order_number: string;
  full_name: string;
  phone_number: string;
  email?: string;
  address: string;
  brush_color: "pink" | "purple" | "black";
  package_type: "single" | "gift_set";
  payment_method: "vodafone_cash" | "instapay" | "visa" | "card" | "cod";
  total_amount: number;
  ordered_at: string;
  status: "confirmed" | "preparing" | "shipped" | "delivered";
  payment_screenshot?: string;
}

// Default products to seed local or Supabase DB
export const DEFAULT_PRODUCTS: SupabaseProduct[] = [
  {
    code: "SMB-01",
    name: "فرشاة Smoozice الفاخرة - أسود ملكي",
    image_url: "https://images.unsplash.com/photo-1590156546746-c58d08d1f70a?w=600&q=80",
    price: 1490,
    brush_color: "black",
    package_type: "single",
    description: "تصميم أنيق بلمسة سوداء فاخرة، لفك تشابك الشعر بنعومة فائقة وحماية أليافه."
  },
  {
    code: "SMP-02",
    name: "فرشاة Smoozice الفاخرة - وردي حريري",
    image_url: "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&q=80",
    price: 1490,
    brush_color: "pink",
    package_type: "single",
    description: "اللون الوردي الحريري الكلاسيكي الأكثر طلباً لفك تشابك الشعر وتنعيمه."
  },
  {
    code: "SMV-03",
    name: "فرشاة Smoozice الفاخرة - بنفسجي ملكي",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    price: 1490,
    brush_color: "purple",
    package_type: "single",
    description: "اللون البنفسجي الساحر الذي يضفي لمسة من الفخامة على روتينكِ اليومي."
  },
  {
    code: "SMC-04",
    name: "مجموعة الهدايا المتكاملة Smoozice Collage",
    image_url: "https://images.unsplash.com/photo-1522337094846-8a8101f49413?w=600&q=80",
    price: 2190,
    brush_color: "pink",
    package_type: "gift_set",
    description: "مجموعة فاخرة متكاملة تشمل الفرشاة، وجراب من الحرير الطبيعي، وصندوق هدايا مذهب فاخر."
  }
];

// Helper to check connection and load products
export async function getProducts(): Promise<{ data: SupabaseProduct[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Unknown error occurred" };
  }
}

// Helper to save/update a product in Supabase
export async function saveProduct(product: SupabaseProduct): Promise<{ error: string | null }> {
  try {
    const { id, ...rest } = product;
    if (id) {
      const { error } = await supabase
        .from("products")
        .update(rest)
        .eq("id", id);
      return { error: error ? error.message : null };
    } else {
      const { error } = await supabase
        .from("products")
        .insert([rest]);
      return { error: error ? error.message : null };
    }
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to delete a product
export async function deleteProduct(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to fetch orders
export async function getOrders(): Promise<{ data: SupabaseOrder[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Unknown error occurred" };
  }
}

// Helper to save/insert order
export async function saveOrder(order: SupabaseOrder): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("orders")
      .upsert([order]);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to update order status
export async function updateOrderStatus(orderId: string, status: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to delete order
export async function deleteOrder(orderId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

export interface SupabaseWaitlist {
  id: string;
  hair_type?: string;
  takes_care?: string;
  is_brush_important?: string;
  predicted_price?: string;
  phone_number: string;
  email: string;
  queue_number: number;
  submitted_at: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface SupabaseUserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

// Helper to fetch waitlist submissions
export async function getWaitlistSubmissions(): Promise<{ data: SupabaseWaitlist[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Unknown error occurred" };
  }
}

// Helper to save waitlist submission
export async function saveWaitlistSubmission(submission: SupabaseWaitlist): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist")
      .upsert([submission]);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to update waitlist status
export async function updateWaitlistStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist")
      .update({ status })
      .eq("id", id);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to delete a waitlist submission
export async function deleteWaitlistSubmission(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist")
      .delete()
      .eq("id", id);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to fetch user profiles
export async function getUserProfiles(): Promise<{ data: SupabaseUserProfile[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("registered_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return { data: [], error: error.message };
    }
    return { data: data || [], error: null };
  } catch (err: any) {
    return { data: [], error: err.message || "Unknown error occurred" };
  }
}

// Helper to save user profile
export async function saveUserProfile(profile: SupabaseUserProfile): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("registered_users")
      .upsert([profile]);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// Helper to delete a user profile
export async function deleteUserProfile(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("registered_users")
      .delete()
      .eq("id", id);
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

// SQL code string for copy-paste inside Supabase Dashboard
export const SUPABASE_SQL_SETUP = `-- 1. إنشاء جدول المنتجات (products)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  brush_color TEXT DEFAULT 'pink',
  package_type TEXT DEFAULT 'single',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 2. إنشاء جدول الطلبات (orders)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  brush_color TEXT NOT NULL,
  package_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  ordered_at TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_screenshot TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 3. إنشاء جدول قائمة الانتظار (waitlist)
CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  hair_type TEXT,
  takes_care TEXT,
  is_brush_important TEXT,
  predicted_price TEXT,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  queue_number INTEGER NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 4. إنشاء جدول المستخدمين المسجلين (registered_users)
CREATE TABLE IF NOT EXISTS registered_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  system_created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 5. تفعيل الحماية والوصول المفتوح (Row Level Security - RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_users ENABLE ROW LEVEL SECURITY;

-- 6. عمل سياسات الوصول العام (Policies) لتسهيل القراءة والكتابة للعملاء والداشبورد دون تعقيد
DROP POLICY IF EXISTS "Allow public read and write on products" ON products;
CREATE POLICY "Allow public read and write on products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write on orders" ON orders;
CREATE POLICY "Allow public read and write on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write on waitlist" ON waitlist;
CREATE POLICY "Allow public read and write on waitlist" ON waitlist FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write on registered_users" ON registered_users;
CREATE POLICY "Allow public read and write on registered_users" ON registered_users FOR ALL USING (true) WITH CHECK (true);

-- 7. إدخال بعض البيانات الأساسية لتجربتها مباشرة
INSERT INTO products (code, name, price, image_url, brush_color, package_type, description)
VALUES 
('SMB-01', 'فرشاة Smoozice الفاخرة - أسود ملكي', 1490, 'https://images.unsplash.com/photo-1590156546746-c58d08d1f70a?w=600&q=80', 'black', 'single', 'تصميم أنيق بلمسة سوداء فاخرة، لفك تشابك الشعر بنعومة فائقة وحماية أليافه.'),
('SMP-02', 'فرشاة Smoozice الفاخرة - وردي حريري', 1490, 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&q=80', 'pink', 'single', 'اللون الوردي الحريري الكلاسيكي الأكثر طلباً لفك تشابك الشعر وتنعيمه.'),
('SMV-03', 'فرشاة Smoozice الفاخرة - بنفسجي ملكي', 1490, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80', 'purple', 'single', 'اللون البنفسجي الساحر الذي يضفي لمسة من الفخامة على روتينكِ اليومي.'),
('SMC-04', 'مجموعة الهدايا المتكاملة Smoozice Collage', 2190, 'https://images.unsplash.com/photo-1522337094846-8a8101f49413?w=600&q=80', 'pink', 'gift_set', 'مجموعة فاخرة متكاملة تشمل الفرشاة، وجراب من الحرير الطبيعي، وصندوق هدايا مذهب فاخر.')
ON CONFLICT (code) DO NOTHING;
`;

// Helper to check if global forced redirect is active
export async function getForcedRedirectSetting(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .eq("id", "system_config_forced_redirect")
      .single();

    if (error || !data) {
      return false;
    }
    return data.phone_number === "true";
  } catch (err) {
    console.warn("Could not retrieve forced redirect setting from Supabase:", err);
    return false;
  }
}

// Helper to update global forced redirect state
export async function setForcedRedirectSetting(enabled: boolean): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("waitlist")
      .upsert([{
        id: "system_config_forced_redirect",
        email: "config@system.local",
        phone_number: enabled ? "true" : "false",
        queue_number: 0,
        submitted_at: new Date().toISOString(),
        hair_type: "system_config",
        takes_care: "system_config",
        is_brush_important: "system_config",
        predicted_price: "system_config",
        status: "pending"
      }]);

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || "Unknown error occurred" };
  }
}

