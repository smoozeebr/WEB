import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getWaitlistEntries, 
  updateWaitlistStatus, 
  deleteWaitlistEntry,
  getRegisteredMembers,
  deleteRegisteredMember,
  getGlobalSettings,
  updateGlobalSettings,
  checkDatabaseConnection 
} from '../lib/api';
import { WaitlistEntry, RegisteredMember, GlobalSettings, DbConnectionStatus } from '../types';
import { 
  Users, Check, X, RefreshCw, Trash2, Link, Server, ShieldCheck, 
  LogOut, Search, Filter, BarChart3, Database, Sparkles, Sliders, AlertTriangle
} from 'lucide-react';

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminEmail, onLogout }: AdminDashboardProps) {
  // DB & State
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [members, setMembers] = useState<RegisteredMember[]>([]);
  const [settings, setSettings] = useState<GlobalSettings>({ forceRedirect: false, redirectUrl: '' });
  const [dbStatus, setDbStatus] = useState<DbConnectionStatus | null>(null);

  // UI tabs & states
  const [activeTab, setActiveTab] = useState<'waitlist' | 'members' | 'settings' | 'diagnostics'>('waitlist');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [colorFilter, setColorFilter] = useState<'all' | 'pink' | 'purple' | 'black' | 'any'>('all');

  // Load everything
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const wl = await getWaitlistEntries();
      const mem = await getRegisteredMembers();
      const setts = await getGlobalSettings();
      const status = await checkDatabaseConnection();

      setWaitlist(wl);
      setMembers(mem);
      setSettings(setts);
      setDbStatus(status);
    } catch (err) {
      showToast('خطأ أثناء تحميل البيانات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Waitlist Actions
  const handleStatusUpdate = async (id: string, status: 'pending' | 'accepted' | 'rejected') => {
    setActionLoading(id);
    try {
      const updated = await updateWaitlistStatus(id, status);
      setWaitlist(updated);
      showToast('تم تحديث حالة المشترك بنجاح.');
    } catch {
      showToast('فشل تحديث الحالة.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWaitlistDelete = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا المشترك نهائياً من قائمة الانتظار؟')) return;
    setActionLoading(id);
    try {
      const updated = await deleteWaitlistEntry(id);
      setWaitlist(updated);
      showToast('تم حذف المشترك بنجاح.');
    } catch {
      showToast('فشل حذف المشترك.');
    } finally {
      setActionLoading(null);
    }
  };

  // Member Actions
  const handleMemberDelete = async (id: string) => {
    if (!window.confirm('هل أنتِ متأكدة من حذف هذا العضو؟')) return;
    try {
      const updated = await deleteRegisteredMember(id);
      setMembers(updated);
      showToast('تم حذف العضو بنجاح.');
    } catch {
      showToast('فشل حذف العضو.');
    }
  };

  // Settings Action
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGlobalSettings(settings);
      showToast('تم حفظ الإعدادات العامة بنجاح.');
    } catch {
      showToast('فشل حفظ الإعدادات.');
    }
  };

  // Helper to convert Arabic digits to English and find average expected price
  const calculateAveragePrice = (entries: WaitlistEntry[]) => {
    let total = 0;
    let count = 0;
    entries.forEach((e) => {
      // convert Arabic digits to English
      const cleanDigits = e.expectedPrice.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
      const match = cleanDigits.match(/\d+/g);
      if (match) {
        const val = parseFloat(match[0]);
        if (!isNaN(val)) {
          total += val;
          count++;
        }
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  // Filtering Logic
  const filteredWaitlist = waitlist.filter((item) => {
    const matchesSearch =
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery) ||
      item.careRoutine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesColor = colorFilter === 'all' || item.colorInterest === colorFilter;

    return matchesSearch && matchesStatus && matchesColor;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-wine text-oat-milk text-sm font-semibold rounded-full shadow-2xl border border-blush/20 flex items-center gap-2"
          >
            <Sparkles size={16} className="fill-current animate-pulse text-rose-quartz" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-red-wine/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-red-wine text-oat-milk text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={10} />
              المدير العام
            </span>
            <span className="text-red-wine/50 text-xs font-mono">{adminEmail}</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-red-wine">لوحة إدارة Smoozice</h1>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={loadDashboardData}
            className="p-3 bg-rose-quartz/30 hover:bg-rose-quartz/50 border border-blush/20 text-red-wine rounded-xl transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-red-wine text-oat-milk font-semibold rounded-xl text-sm flex items-center gap-2 hover:bg-red-wine-light transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-red-wine" size={36} />
          <p className="text-sm text-red-wine/60 font-semibold">جاري جلب البيانات وتحديث الإحصائيات الفورية...</p>
        </div>
      ) : (
        <>
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            
            <div className="bg-oat-milk border border-red-wine/10 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-red-wine/50 block mb-1">إجمالي قائمة الانتظار</span>
                <span className="text-3xl font-serif font-black text-red-wine">{waitlist.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-quartz/40 flex items-center justify-center text-red-wine">
                <Users size={18} />
              </div>
            </div>

            <div className="bg-oat-milk border border-red-wine/10 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-red-wine/50 block mb-1">في انتظار المراجعة</span>
                <span className="text-3xl font-serif font-black text-yellow-600">
                  {waitlist.filter(w => w.status === 'pending').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                <RefreshCw size={18} className="animate-pulse" />
              </div>
            </div>

            <div className="bg-oat-milk border border-red-wine/10 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-red-wine/50 block mb-1">المقبولون (VIP)</span>
                <span className="text-3xl font-serif font-black text-emerald-600">
                  {waitlist.filter(w => w.status === 'accepted').length}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Check size={18} />
              </div>
            </div>

            <div className="bg-oat-milk border border-red-wine/10 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-red-wine/50 block mb-1">متوسط السعر المتوقع</span>
                <span className="text-2xl sm:text-3xl font-serif font-black text-red-wine">
                  {calculateAveragePrice(waitlist)} ريال
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-quartz/40 flex items-center justify-center text-red-wine">
                <BarChart3 size={18} />
              </div>
            </div>

          </div>

          {/* Tab Navigation Menu */}
          <div className="flex border-b border-red-wine/10 mb-6 gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('waitlist')}
              className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-all shrink-0 cursor-pointer ${
                activeTab === 'waitlist'
                  ? 'bg-red-wine text-oat-milk'
                  : 'text-red-wine/60 hover:text-red-wine bg-oat-milk-dark/40 hover:bg-rose-quartz/20'
              }`}
            >
              قائمة الانتظار ({waitlist.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-all shrink-0 cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-red-wine text-oat-milk'
                  : 'text-red-wine/60 hover:text-red-wine bg-oat-milk-dark/40 hover:bg-rose-quartz/20'
              }`}
            >
              الأعضاء المسجلين ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-all shrink-0 cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-red-wine text-oat-milk'
                  : 'text-red-wine/60 hover:text-red-wine bg-oat-milk-dark/40 hover:bg-rose-quartz/20'
              }`}
            >
              تحويل الزوار (Redirect)
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={`px-4 py-2.5 font-bold text-sm rounded-t-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-red-wine text-oat-milk'
                  : 'text-red-wine/60 hover:text-red-wine bg-oat-milk-dark/40 hover:bg-rose-quartz/20'
              }`}
            >
              <Database size={14} />
              <span>فحص قاعدة البيانات</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div>
            
            {/* Panel 1: Waitlist Table */}
            {activeTab === 'waitlist' && (
              <div className="space-y-4">
                
                {/* Search & Filter bar */}
                <div className="bg-oat-milk border border-red-wine/10 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
                  
                  {/* Search input */}
                  <div className="relative w-full md:max-w-md">
                    <input
                      type="text"
                      placeholder="البحث بالبريد أو رقم الهاتف..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full p-2.5 pr-9 text-xs rounded-xl border border-red-wine/10 bg-oat-milk-dark/20 text-red-wine focus:outline-none"
                    />
                    <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-wine/40" />
                  </div>

                  {/* Filter controls */}
                  <div className="flex flex-wrap gap-2.5 w-full md:w-auto justify-start sm:justify-end">
                    
                    {/* Status filter */}
                    <div className="flex items-center gap-1.5 bg-oat-milk-dark/30 border border-red-wine/10 px-2 py-1 rounded-xl">
                      <Filter size={12} className="text-red-wine/50" />
                      <select
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                        className="bg-transparent text-xs text-red-wine font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="all">كل الحالات</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="accepted">مقبول</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </div>

                    {/* Color filter */}
                    <div className="flex items-center gap-1.5 bg-oat-milk-dark/30 border border-red-wine/10 px-2 py-1 rounded-xl">
                      <Sliders size={12} className="text-red-wine/50" />
                      <select
                        value={colorFilter}
                        onChange={(e: any) => setColorFilter(e.target.value)}
                        className="bg-transparent text-xs text-red-wine font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="all">كل الألوان</option>
                        <option value="pink">الوردي اللؤلؤي</option>
                        <option value="purple">الخزامى الملكي</option>
                        <option value="black">الأسود الفاخر</option>
                        <option value="any">أي لون</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Table View */}
                <div className="bg-oat-milk border border-red-wine/10 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-red-wine/5 text-red-wine border-b border-red-wine/10 text-[11px] font-bold uppercase tracking-wider">
                          <th className="p-4">بيانات الاتصال</th>
                          <th className="p-4">نوع الشعر</th>
                          <th className="p-4">الروتين المتبع</th>
                          <th className="p-4">جودة الفرشاة تهم؟</th>
                          <th className="p-4">اللون والسعر المتوقع</th>
                          <th className="p-4">الحالة</th>
                          <th className="p-4 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-wine/5">
                        {filteredWaitlist.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-red-wine/50 font-medium">
                              لا توجد نتائج مطابقة لبحثكِ الحالي.
                            </td>
                          </tr>
                        ) : (
                          filteredWaitlist.map((item) => (
                            <tr key={item.id} className="hover:bg-rose-quartz/5 transition-colors">
                              <td className="p-4 space-y-1 max-w-[180px]">
                                <div className="font-semibold text-red-wine truncate" title={item.email}>{item.email}</div>
                                <div className="text-xs text-red-wine/60 font-mono">{item.phone}</div>
                                <div className="text-[10px] text-red-wine/40">
                                  {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-1 max-w-[140px]">
                                  {item.hairTypes.map((t, idx) => (
                                    <span key={idx} className="bg-rose-quartz/45 text-[10px] px-1.5 py-0.5 rounded-md text-red-wine border border-blush/10 font-medium">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="p-4 max-w-[160px] truncate" title={item.careRoutine}>
                                {item.careRoutine}
                              </td>
                              <td className="p-4 max-w-[120px] truncate" title={item.isQualityImportant}>
                                {item.isQualityImportant}
                              </td>
                              <td className="p-4 space-y-1">
                                <div className="font-medium text-red-wine-light">{item.expectedPrice}</div>
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  item.colorInterest === 'pink' ? 'bg-[#F4B3AB]/30 text-[#8C2317]' :
                                  item.colorInterest === 'purple' ? 'bg-[#D3C1E5]/40 text-[#4D2E7C]' :
                                  item.colorInterest === 'black' ? 'bg-[#1C1917]/10 text-stone-800' : 'bg-red-wine/10 text-red-wine'
                                }`}>
                                  {item.colorInterest === 'pink' ? 'الوردي' :
                                   item.colorInterest === 'purple' ? 'الخزامى' :
                                   item.colorInterest === 'black' ? 'الأسود' : 'أي لون'}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  item.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  item.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    item.status === 'accepted' ? 'bg-emerald-500' :
                                    item.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500 animate-ping'
                                  }`} />
                                  {item.status === 'accepted' ? 'مقبول (VIP)' :
                                   item.status === 'rejected' ? 'مرفوض' : 'قيد الانتظار'}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex gap-1 justify-center">
                                  {/* Action buttons */}
                                  {item.status !== 'accepted' && (
                                    <button
                                      onClick={() => handleStatusUpdate(item.id, 'accepted')}
                                      className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-all cursor-pointer"
                                      title="قبول كـ VIP"
                                    >
                                      <Check size={12} />
                                    </button>
                                  )}
                                  {item.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                      className="p-1.5 bg-red-50 text-red-700 border border-red-100 hover:bg-red-600 hover:text-white rounded-lg transition-all cursor-pointer"
                                      title="رفض"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                  {item.status !== 'pending' && (
                                    <button
                                      onClick={() => handleStatusUpdate(item.id, 'pending')}
                                      className="p-1.5 bg-yellow-50 text-yellow-700 border border-yellow-100 hover:bg-yellow-500 hover:text-white rounded-lg transition-all cursor-pointer"
                                      title="إعادة قيد المراجعة"
                                    >
                                      <RefreshCw size={12} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleWaitlistDelete(item.id)}
                                    className="p-1.5 bg-stone-100 text-stone-700 border border-stone-200 hover:bg-red-700 hover:text-white hover:border-red-700 rounded-lg transition-all cursor-pointer"
                                    title="حذف نهائي"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* Panel 2: Registered Members */}
            {activeTab === 'members' && (
              <div className="bg-oat-milk border border-red-wine/10 rounded-2xl overflow-hidden shadow-sm p-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-red-wine">الأعضاء المسجلين بشكل دائم</h3>
                  <p className="text-red-wine/60 text-xs">قائمة بجميع المستخدمين الذين سجلوا في النظام بشكل عام بخلاف قائمة الانتظار.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-red-wine/5 text-red-wine border-b border-red-wine/10">
                        <th className="p-3">رقم العضو</th>
                        <th className="p-3">الاسم الكامل</th>
                        <th className="p-3">البريد الإلكتروني</th>
                        <th className="p-3">رقم الهاتف</th>
                        <th className="p-3">تاريخ التسجيل</th>
                        <th className="p-3 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-wine/5">
                      {members.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-red-wine/50">
                            لا يوجد أعضاء مسجلين حالياً.
                          </td>
                        </tr>
                      ) : (
                        members.map((member) => (
                          <tr key={member.id} className="hover:bg-rose-quartz/5">
                            <td className="p-3 font-mono text-red-wine/60 font-semibold">{member.id}</td>
                            <td className="p-3 font-semibold text-red-wine">{member.name}</td>
                            <td className="p-3 font-mono">{member.email}</td>
                            <td className="p-3 font-mono">{member.phone}</td>
                            <td className="p-3">{new Date(member.createdAt).toLocaleDateString('ar-EG')}</td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleMemberDelete(member.id)}
                                className="p-1.5 bg-stone-100 text-stone-700 hover:bg-red-700 hover:text-white rounded-lg border border-stone-200 transition-all cursor-pointer"
                                title="حذف العضو"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Panel 3: Global Redirect Settings */}
            {activeTab === 'settings' && (
              <div className="bg-oat-milk border border-red-wine/10 rounded-2xl p-6 shadow-sm max-w-2xl">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-red-wine flex items-center gap-2">
                    <Link size={16} />
                    إعادة توجيه الزوار إجبارياً
                  </h3>
                  <p className="text-red-wine/60 text-xs mt-1">
                    عند التفعيل، سيتم تحويل جميع الزوار العاديين بشكل فوري وتلقائي إلى الرابط الذي تحددينه في الأسفل (مثلاً حساب انستقرام أو موقع آخر).
                  </p>
                </div>

                <form onSubmit={handleSettingsSave} className="space-y-5">
                  {/* Toggle Redirect */}
                  <div className="flex items-center justify-between p-4 bg-oat-milk-dark/40 rounded-xl border border-red-wine/5">
                    <div>
                      <span className="block text-sm font-semibold text-red-wine">تفعيل إعادة التوجيه الإجباري</span>
                      <span className="block text-xs text-red-wine/50 mt-0.5">
                        {settings.forceRedirect ? 'التحويل نشط حالياً لجميع الزوار' : 'الموقع متاح للجميع بوضع الهبوط الاعتيادي'}
                      </span>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, forceRedirect: !prev.forceRedirect }))}
                      className={`w-12 h-6.5 rounded-full p-0.5 transition-colors relative focus:outline-none cursor-pointer ${
                        settings.forceRedirect ? 'bg-red-wine' : 'bg-stone-300'
                      }`}
                    >
                      <div className={`w-5.5 h-5.5 rounded-full bg-white transition-all shadow-md transform ${
                        settings.forceRedirect ? '-translate-x-5.5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Redirect URL input */}
                  <div className="space-y-1.5">
                    <label htmlFor="redirect-url-input" className="block text-xs font-bold text-red-wine">
                      رابط التوجيه الخارجي الموجه إليه
                    </label>
                    <input
                      type="url"
                      id="redirect-url-input"
                      required
                      value={settings.redirectUrl}
                      onChange={(e) => setSettings(prev => ({ ...prev, redirectUrl: e.target.value }))}
                      placeholder="https://instagram.com/smoozice"
                      className="w-full p-3 rounded-xl border border-red-wine/15 text-sm text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Warning Box */}
                  {settings.forceRedirect && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">تنبيه المدير:</span>
                        بمجرد حفظ هذا الإعداد، لن يتمكن الزوار من رؤية صفحة الهبوط أو تعبئة الاستبيان، بل سيتم تحويلهم تلقائياً لـ <code className="font-mono bg-white/60 px-1 rounded">{settings.redirectUrl}</code>.
                        يمكنكِ دائماً الدخول للوحة التحكم هذه عبر الرابط المباشر.
                      </div>
                    </div>
                  )}

                  {/* Save button */}
                  <button
                    type="submit"
                    id="save-settings-btn"
                    className="px-6 py-3 bg-red-wine hover:bg-red-wine-light text-oat-milk font-semibold rounded-xl text-xs sm:text-sm shadow-md cursor-pointer"
                  >
                    حفظ إعدادات التوجيه
                  </button>
                </form>
              </div>
            )}

            {/* Panel 4: Connection Diagnostics Checkup */}
            {activeTab === 'diagnostics' && dbStatus && (
              <div className="bg-oat-milk border border-red-wine/10 rounded-2xl p-6 shadow-sm max-w-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <Server size={18} className="text-red-wine" />
                  <h3 className="text-base font-bold text-red-wine">التحقق من اتصال قاعدة البيانات والمحيط</h3>
                </div>

                <div className="space-y-6">
                  
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                    dbStatus.connected 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <Server size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sm block mb-1">حالة الاتصال الحالية:</span>
                      <p className="text-xs leading-relaxed">{dbStatus.message}</p>
                    </div>
                  </div>

                  {/* Variables checked list */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-red-wine">فحص متغيرات البيئة الخاصة بـ Supabase:</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* URL status */}
                      <div className="p-3.5 bg-oat-milk-dark/40 border border-red-wine/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-red-wine">VITE_SUPABASE_URL</span>
                          <span className="text-[10px] text-red-wine/50 font-mono">عنوان قاعدة البيانات</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dbStatus.envChecked.SUPABASE_URL 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dbStatus.envChecked.SUPABASE_URL ? 'معرّف وموجود' : 'غير موجود (مفقود)'}
                        </span>
                      </div>

                      {/* Anon key status */}
                      <div className="p-3.5 bg-oat-milk-dark/40 border border-red-wine/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-red-wine">VITE_SUPABASE_ANON_KEY</span>
                          <span className="text-[10px] text-red-wine/50 font-mono">مفتاح الاتصال العام</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          dbStatus.envChecked.SUPABASE_ANON_KEY 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dbStatus.envChecked.SUPABASE_ANON_KEY ? 'معرّف وموجود' : 'غير موجود (مفقود)'}
                        </span>
                      </div>

                      {/* Local backup state */}
                      <div className="p-3.5 bg-oat-milk-dark/40 border border-red-wine/5 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="block text-xs font-bold text-red-wine">LOCAL_STORAGE_FALLBACK</span>
                          <span className="text-[10px] text-red-wine/50 font-mono">قاعدة بيانات المتصفح البديلة</span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          نشط وجاهز (مؤمن)
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Technical instruction help */}
                  <div className="border-t border-red-wine/10 pt-4 text-xs text-red-wine/75 space-y-3">
                    <span className="font-bold block text-red-wine">🚀 الدليل الكامل للربط الفعلي بـ Supabase:</span>
                    <p className="leading-relaxed">
                      لقد قمنا ببرمجة وتكامل عميل <strong className="text-red-wine-light">Supabase Client</strong> رسمياً في الأكواد. لتفعيل حفظ البيانات واسترجاعها مباشرة من قاعدة بياناتك، يرجى اتباع خطوتين بسيطتين:
                    </p>
                    
                    <div className="space-y-1.5">
                      <span className="font-semibold block text-red-wine">١. تهيئة متغيرات البيئة في لوحة تحكم AI Studio:</span>
                      <p className="leading-relaxed">أضيفي المتغيرات التالية بقيمها الخاصة بمشروعكِ في Supabase:</p>
                      <pre className="bg-[#1C1917] text-amber-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto text-left" dir="ltr">
{`VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-api-key"`}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold block text-red-wine">٢. تشغيل كود SQL التالي في محرر Supabase SQL Editor:</span>
                      <p className="leading-relaxed">انسخي الأوامر التالية والصقيها لإنشاء الجداول وحقول البيانات المتطابقة بالكامل:</p>
                      <pre className="bg-[#1C1917] text-[#D3C1E5] p-3.5 rounded-xl font-mono text-xs overflow-x-auto text-left max-h-[220px]" dir="ltr">
{`-- ١. جدول قائمة الانتظار والاستبيان
CREATE TABLE IF NOT EXISTS waitlist (
  "id" TEXT PRIMARY KEY,
  "queueNumber" INT,
  "email" TEXT,
  "phone" TEXT,
  "hairTypes" TEXT[],
  "careRoutine" TEXT,
  "isQualityImportant" TEXT,
  "expectedPrice" TEXT,
  "colorInterest" TEXT,
  "status" TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ٢. جدول الأعضاء العامين
CREATE TABLE IF NOT EXISTS members (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ٣. جدول إعدادات التحويل للموقع
CREATE TABLE IF NOT EXISTS settings (
  "id" TEXT PRIMARY KEY DEFAULT 'global',
  "forceRedirect" BOOLEAN DEFAULT false,
  "redirectUrl" TEXT DEFAULT 'https://instagram.com/smoozice'
);

-- إضافة الإعداد المبدئي للتوجيه
INSERT INTO settings ("id", "forceRedirect", "redirectUrl") 
VALUES ('global', false, 'https://instagram.com/smoozice')
ON CONFLICT ("id") DO NOTHING;`}
                      </pre>
                    </div>

                    <p className="leading-relaxed text-[11px] text-red-wine/50 font-medium">
                      بمجرد إنشاء هذه الجداول ووضع مفاتيح البيئة، سيتوقف التخزين التجريبي تلقائياً، وسيتم ترحيل وتحميل كافة العمليات والبيانات الفورية حياً من السيرفر السحابي لـ Supabase!
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}
