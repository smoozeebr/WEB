import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Trash2, 
  RefreshCw, 
  Check, 
  Database, 
  ArrowLeft, 
  Info,
  X
} from "lucide-react";
import { 
  getWaitlistSubmissions,
  deleteWaitlistSubmission,
  updateWaitlistStatus,
  getUserProfiles,
  deleteUserProfile,
  getForcedRedirectSetting,
  setForcedRedirectSetting,
  SupabaseWaitlist,
  SupabaseUserProfile
} from "../lib/supabaseClient";

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  // Waitlist state
  const [waitlistSubmissions, setWaitlistSubmissions] = useState<SupabaseWaitlist[]>([]);
  const [isLoadingWaitlist, setIsLoadingWaitlist] = useState(false);
  const [forcedRedirect, setForcedRedirect] = useState(false);
  const [isUpdatingRedirect, setIsUpdatingRedirect] = useState(false);

  // Registered users state
  const [userProfiles, setUserProfiles] = useState<SupabaseUserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);


  // Status and connection states
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: "جاري التحقق من الاتصال بقاعدة بيانات Supabase..."
  });

  // Load Waitlist and Registered Users
  const loadData = async () => {
    setIsLoadingWaitlist(true);
    setIsLoadingUsers(true);

    // Load global forced redirect setting
    try {
      const redirectActive = await getForcedRedirectSetting();
      setForcedRedirect(redirectActive);
    } catch (e) {
      console.warn("Failed loading forced redirect:", e);
    }
    const localForced = localStorage.getItem("global_forced_redirect_fallback");
    if (localForced === "true") {
      setForcedRedirect(true);
    }

    // 1. Fetch waitlist submissions
    const wlRes = await getWaitlistSubmissions();
    if (wlRes.error) {
      console.warn("Could not fetch waitlist from Supabase, falling back to LocalStorage:", wlRes.error);
      const localWL = localStorage.getItem("smoozice_submissions");
      if (localWL) {
        try {
          const parsed = JSON.parse(localWL);
          const mapped = parsed
            .filter((item: any) => item.id !== "system_config_forced_redirect")
            .map((item: any) => ({
              id: item.id || Math.random().toString(),
              hair_type: item.hairType || item.hair_type || "",
              takes_care: item.takesCare || item.takes_care || "",
              is_brush_important: item.isBrushImportant || item.is_brush_important || "",
              predicted_price: item.predictedPrice || item.predicted_price || "",
              phone_number: item.phoneNumber || item.phone_number || "",
              email: item.email || "",
              queue_number: item.queueNumber || item.queue_number || 0,
              submitted_at: item.submittedAt || item.submitted_at || new Date().toISOString(),
              status: item.status || 'pending'
            }));
          setWaitlistSubmissions(mapped);
        } catch {
          setWaitlistSubmissions([]);
        }
      } else {
        setWaitlistSubmissions([]);
      }
      setDbStatus({
        connected: false,
        message: "أنت تعمل الآن في وضع التخزين المحلي الافتراضي لبيانات المستخدمين وقائمة الانتظار."
      });
    } else {
      const cleanData = (wlRes.data || []).filter((item: any) => item.id !== "system_config_forced_redirect");
      setWaitlistSubmissions(cleanData);
      setDbStatus({
        connected: true,
        message: "قاعدة بيانات Supabase متصلة ومفعّلة بنجاح! ⚡️ البيانات تتم مزامنتها بشكل مباشر وفوري."
      });
    }

    // 2. Fetch user profiles
    const userRes = await getUserProfiles();
    if (userRes.error) {
      console.warn("Could not fetch user profiles from Supabase, falling back to LocalStorage:", userRes.error);
      const localUsers = localStorage.getItem("smoozice_registered_users");
      if (localUsers) {
        try {
          setUserProfiles(JSON.parse(localUsers));
        } catch {
          setUserProfiles([]);
        }
      } else {
        setUserProfiles([]);
      }
    } else {
      setUserProfiles(userRes.data || []);
    }

    setIsLoadingWaitlist(false);
    setIsLoadingUsers(false);
  };

  // Handle Delete Waitlist Submission
  const handleDeleteWaitlistClick = async (id: string, email: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف هذا الاسم (${email}) من قائمة الانتظار؟`)) return;

    setIsLoadingWaitlist(true);
    const res = await deleteWaitlistSubmission(id);

    if (res.error) {
      console.warn("Failed to delete from Supabase, deleting locally:", res.error);
      const filtered = waitlistSubmissions.filter(w => w.id !== id);
      setWaitlistSubmissions(filtered);
      
      const localWL = localStorage.getItem("smoozice_submissions");
      if (localWL) {
        try {
          const parsed = JSON.parse(localWL);
          const updated = parsed.filter((item: any) => item.id !== id);
          localStorage.setItem("smoozice_submissions", JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      // Reload waitlist data
      const wlRes = await getWaitlistSubmissions();
      if (!wlRes.error) setWaitlistSubmissions(wlRes.data);
    }
    setIsLoadingWaitlist(false);
  };

  // Handle Update Waitlist Status
  const handleUpdateWaitlistStatus = async (id: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    setIsLoadingWaitlist(true);
    const res = await updateWaitlistStatus(id, newStatus);
    
    if (res.error) {
      console.warn("Failed to update status on Supabase, updating locally:", res.error);
    }
    
    // Update local state directly so it feels instant and robust
    const updated = waitlistSubmissions.map(w => w.id === id ? { ...w, status: newStatus } : w);
    setWaitlistSubmissions(updated);

    // Sync to local storage
    const localWL = localStorage.getItem("smoozice_submissions");
    if (localWL) {
      try {
        const parsed = JSON.parse(localWL);
        const updatedLocal = parsed.map((item: any) => 
          item.id === id ? { ...item, status: newStatus } : item
        );
        localStorage.setItem("smoozice_submissions", JSON.stringify(updatedLocal));
      } catch (e) {
        console.error(e);
      }
    }
    setIsLoadingWaitlist(false);
  };

  // Handle Delete User Profile
  const handleDeleteUserProfileClick = async (id: string, email: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف هذا الحساب (${email}) من قائمة مسجلي الدخول؟`)) return;

    setIsLoadingUsers(true);
    const res = await deleteUserProfile(id);

    if (res.error) {
      console.warn("Failed to delete from Supabase, deleting locally:", res.error);
      const filtered = userProfiles.filter(u => u.id !== id);
      setUserProfiles(filtered);
      
      const localUsers = localStorage.getItem("smoozice_registered_users");
      if (localUsers) {
        try {
          const parsed = JSON.parse(localUsers);
          const updated = parsed.filter((item: any) => item.id !== id && item.email !== email);
          localStorage.setItem("smoozice_registered_users", JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      const userRes = await getUserProfiles();
      if (!userRes.error) setUserProfiles(userRes.data);
    }
    setIsLoadingUsers(false);
  };

  const handleToggleForcedRedirect = async () => {
    setIsUpdatingRedirect(true);
    const newVal = !forcedRedirect;
    
    // Save to Supabase
    const res = await setForcedRedirectSetting(newVal);
    if (res.error) {
      console.warn("Could not save forced redirect to Supabase:", res.error);
    }
    
    // Always save locally to localStorage so we have a double backup
    localStorage.setItem("global_forced_redirect_fallback", newVal ? "true" : "false");
    
    setForcedRedirect(newVal);
    setIsUpdatingRedirect(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div 
      id="dashboard-container" 
      className="w-full max-w-6xl mx-auto px-4 py-8 relative z-20 font-arabic text-right selection:bg-red-wine selection:text-oat-milk animate-fade-in"
      dir="rtl"
    >
      {/* Top Bar with Header & Go Back */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-red-wine/80 hover:text-red-wine transition-colors bg-white/45 hover:bg-white/65 border border-red-wine/20 px-4 py-2 rounded-full text-xs font-semibold cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
            <span>العودة للمتجر</span>
          </button>
          <h2 className="text-2xl font-black text-red-wine flex items-center gap-2">
            <Database className="w-6 h-6 text-red-wine" />
            <span>لوحة تحكم المشرف والمدير 💻</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-full bg-white/50 hover:bg-white/80 border border-red-wine/20 hover:scale-105 transition-all text-red-wine cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <span className={`text-xs px-4 py-2 rounded-full border flex items-center gap-1.5 font-bold ${
            dbStatus.connected 
              ? "bg-green-100 text-green-800 border-green-200" 
              : "bg-amber-100 text-amber-800 border-amber-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? "bg-green-600 animate-pulse" : "bg-amber-600"}`} />
            {dbStatus.connected ? "Supabase متصل" : "وضع التخزين المحلي"}
          </span>
        </div>
      </div>

      {/* Database connection details banner */}
      <div className="bg-white/40 border border-red-wine/10 p-3.5 rounded-2xl mb-6 text-xs text-red-wine/90 flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-red-wine/70 mt-0.5" />
        <p className="leading-relaxed font-medium">{dbStatus.message}</p>
      </div>

      {/* Global forced redirect control box */}
      <div className="bg-gradient-to-r from-red-wine/5 via-rose-quartz/10 to-red-wine/5 border border-red-wine/25 rounded-3xl p-5 mb-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-wine/10 flex items-center justify-center text-red-wine shrink-0">
            <span className="text-xl">🔗</span>
          </div>
          <div className="text-right">
            <h3 className="font-extrabold text-sm sm:text-base text-red-wine mb-1">
              خاصية التحويل التلقائي المباشر لجميع الزوار 🚀
            </h3>
            <p className="text-xs text-red-wine/70 leading-relaxed max-w-xl">
              عند تفعيل هذا الخيار، سيتم تحويل **أي زائر عادي جديد** يدخل الموقع فوراً إلى الرابط الخاص بك (<span className="font-mono text-red-wine font-bold select-all">https://smoozieebr.duckdns.org/</span>) مباشرة، وبدون الحاجة لملء استبيان قائمة الانتظار.
            </p>
            <p className="text-[10px] text-amber-700 font-extrabold mt-1">
              💡 ملحوظة: أنت كمشرف لن يتم تحويلك أبداً حتى تتمكن من تصفح الموقع وإلغاء هذه الميزة في أي وقت!
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={handleToggleForcedRedirect}
            disabled={isUpdatingRedirect}
            className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              forcedRedirect 
                ? "bg-red-wine text-oat-milk hover:bg-red-wine/90" 
                : "bg-white text-red-wine border border-red-wine/30 hover:bg-rose-quartz/15"
            }`}
          >
            {isUpdatingRedirect ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : forcedRedirect ? (
              <>
                <span>🟢 التحويل التلقائي: مفعّل الآن</span>
              </>
            ) : (
              <>
                <span>⚪️ التحويل التلقائي: معطل حالياً</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white/50 border border-red-wine/15 rounded-3xl p-6 shadow-md text-red-wine flex items-center justify-between">
          <div>
            <span className="text-xs text-red-wine/60 font-bold block">مجموع المسجلين في قائمة الانتظار</span>
            <span className="text-3xl font-black mt-1 block">{waitlistSubmissions.length}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-wine/10 flex items-center justify-center text-red-wine">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white/50 border border-red-wine/15 rounded-3xl p-6 shadow-md text-red-wine flex items-center justify-between">
          <div>
            <span className="text-xs text-red-wine/60 font-bold block">مجموع الحسابات المسجلة</span>
            <span className="text-3xl font-black mt-1 block">{userProfiles.length}</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-wine/10 flex items-center justify-center text-red-wine">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Waitlist and Users Lists side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Waitlist list */}
        <div className="bg-white/45 backdrop-blur-md rounded-3xl border border-red-wine/20 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-red-wine/10 pb-3">
            <h3 className="font-black text-base text-red-wine flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-wine" />
              <span>قائمة الانتظار ({waitlistSubmissions.length})</span>
            </h3>
            <span className="text-[10px] text-red-wine/60 font-bold">الناس الي بعتت ردود من الاستبيان</span>
          </div>

          {isLoadingWaitlist ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-8 h-8 border-3 border-red-wine/30 border-t-red-wine rounded-full animate-spin" />
              <span className="text-xs font-bold text-red-wine">جاري التحميل...</span>
            </div>
          ) : waitlistSubmissions.length === 0 ? (
            <div className="py-12 text-center text-red-wine/60">
              <p className="text-xs font-bold">لا يوجد أحد في قائمة الانتظار حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {waitlistSubmissions.map((wl, idx) => (
                <div 
                  key={wl.id || idx}
                  className={`bg-white/80 border rounded-2xl p-4 shadow-xs relative transition-all text-xs text-red-wine ${
                    wl.status === 'approved' 
                      ? 'border-emerald-200 bg-emerald-50/20' 
                      : wl.status === 'rejected' 
                      ? 'border-rose-200 bg-rose-50/20 opacity-75' 
                      : 'border-red-wine/10'
                  }`}
                >
                  <button
                    onClick={() => handleDeleteWaitlistClick(wl.id, wl.email)}
                    className="absolute top-3 left-3 p-1 rounded-full hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="حذف من قائمة الانتظار"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-mono bg-red-wine text-oat-milk px-2 py-0.5 rounded-md font-black">
                      #{wl.queue_number || idx + 1}
                    </span>
                    <span className="text-[10px] text-red-wine/60 font-medium">
                      {wl.submitted_at ? new Date(wl.submitted_at).toLocaleDateString("ar-EG") : ""}
                    </span>
                    
                    {/* Status Indicator */}
                    {wl.status === 'approved' ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        تم القبول ✓
                      </span>
                    ) : wl.status === 'rejected' ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        تم الرفض ✗
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        قيد المراجعة
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 font-medium">
                    <p className="font-extrabold text-red-wine text-xs flex items-center gap-1">
                      <span className="text-red-wine/60">البريد الإلكتروني:</span>
                      <span className="font-mono select-all">{wl.email}</span>
                    </p>
                    <p className="font-bold text-xs flex items-center gap-1">
                      <span className="text-red-wine/60">الهاتف:</span>
                      <span className="font-mono text-xs select-all">{wl.phone_number}</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-rose-quartz/20 grid grid-cols-2 gap-2 text-[10px] text-red-wine/75">
                      <div>
                        <span className="block text-[9px] text-red-wine/50">نوع الشعر:</span>
                        <span className="font-bold">{wl.hair_type || "غير محدد"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-red-wine/50">طريقة العناية الحالية:</span>
                        <span className="font-bold">{wl.takes_care || "غير محدد"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-red-wine/50">أهمية جودة الفرشاة:</span>
                        <span className="font-bold">{wl.is_brush_important || "غير محدد"}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-red-wine/50">السعر المتوقع:</span>
                        <span className="font-bold">{wl.predicted_price || "غير محدد"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons (Accept / Reject) */}
                  <div className="mt-4 pt-3 border-t border-rose-quartz/20 flex items-center justify-end gap-2">
                    {wl.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateWaitlistStatus(wl.id, 'approved')}
                        className="px-3 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="قبول المنضم"
                      >
                        <Check className="w-3 h-3" />
                        <span>قبول</span>
                      </button>
                    )}
                    {wl.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateWaitlistStatus(wl.id, 'rejected')}
                        className="px-3 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="رفض المنضم"
                      >
                        <X className="w-3 h-3" />
                        <span>رفض</span>
                      </button>
                    )}
                    {(wl.status === 'approved' || wl.status === 'rejected') && (
                      <button
                        onClick={() => handleUpdateWaitlistStatus(wl.id, 'pending')}
                        className="px-2 py-1 text-[9px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors cursor-pointer"
                      >
                        إرجاع للانتظار
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Users list */}
        <div className="bg-white/45 backdrop-blur-md rounded-3xl border border-red-wine/20 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-red-wine/10 pb-3">
            <h3 className="font-black text-base text-red-wine flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>حسابات الأعضاء المسجلين ({userProfiles.length})</span>
            </h3>
            <span className="text-[10px] text-red-wine/60 font-bold">الناس الي أنشأت حساب كامل بالمتجر</span>
          </div>

          {isLoadingUsers ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-8 h-8 border-3 border-red-wine/30 border-t-red-wine rounded-full animate-spin" />
              <span className="text-xs font-bold text-red-wine">جاري التحميل...</span>
            </div>
          ) : userProfiles.length === 0 ? (
            <div className="py-12 text-center text-red-wine/60">
              <p className="text-xs font-bold">لا يوجد أي حسابات مسجلة حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {userProfiles.map((user, idx) => (
                <div 
                  key={user.id || idx}
                  className="bg-white/80 border border-red-wine/10 rounded-2xl p-4 shadow-xs relative hover:border-red-wine/35 transition-all text-xs text-red-wine"
                >
                  <button
                    onClick={() => handleDeleteUserProfileClick(user.id, user.email)}
                    className="absolute top-3 left-3 p-1 rounded-full hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                    title="حذف الحساب نهائياً"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="font-extrabold text-sm mb-1">{user.full_name}</div>
                  
                  <div className="space-y-1 font-medium text-xs mt-2">
                    <p className="flex items-center gap-1.5">
                      <span className="text-red-wine/60">البريد الإلكتروني:</span>
                      <span className="font-mono text-red-wine">{user.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[10px] text-red-wine/60">
                      <span>تاريخ التسجيل:</span>
                      <span>{user.created_at ? new Date(user.created_at).toLocaleString("ar-EG") : ""}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
