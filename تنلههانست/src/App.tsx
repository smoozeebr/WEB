import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, getGlobalSettings } from './lib/api';
import { WaitlistEntry, GlobalSettings } from './types';
import Hero from './components/Hero';
import QuestionnaireForm from './components/QuestionnaireForm';
import PhotoGrid from './components/PhotoGrid';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { Brush, Shield, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'admin'>( 'landing' );
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'pink' | 'purple' | 'black' | 'any'>('any');
  const [redirectSettings, setRedirectSettings] = useState<GlobalSettings>({ forceRedirect: false, redirectUrl: '' });
  const [dismissRedirectSimulator, setDismissRedirectSimulator] = useState(false);

  // Check auth session and settings on load
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setAdminEmail(user.email);
    }

    const loadSettings = async () => {
      try {
        const settings = await getGlobalSettings();
        setRedirectSettings(settings);
      } catch {
        // Fallback
      }
    };
    loadSettings();
  }, [currentView]);

  const handleLoginSuccess = (email: string) => {
    setAdminEmail(email);
    showToastNotification('مرحباً بكِ مجدداً في لوحة التحكم!');
  };

  const handleLogout = () => {
    localStorage.removeItem('smoozice_auth_session');
    setAdminEmail(null);
    setCurrentView('landing');
    showToastNotification('تم تسجيل الخروج بأمان.');
  };

  // Simple custom toast indicator helper
  const [toast, setToast] = useState<string | null>(null);
  const showToastNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const shouldTriggerRedirect = redirectSettings.forceRedirect && !adminEmail && !dismissRedirectSimulator;

  return (
    <div className={`min-h-screen flex flex-col ${currentView === 'landing' ? 'bg-[#ee6c73] text-white' : 'bg-oat-milk text-red-wine'} relative selection:bg-rose-quartz selection:text-red-wine-dark font-sans`} dir="rtl">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-sm mx-auto px-5 py-3.5 bg-white text-black font-semibold rounded-full shadow-2xl border border-gray-100 text-center flex items-center justify-center gap-2"
          >
            <Sparkles size={16} className="text-[#ee6c73] animate-pulse" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Luxury Header Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all duration-300 ${
        currentView === 'landing' 
          ? 'bg-[#ee6c73]/90 border-b border-white/10 text-white' 
          : 'bg-oat-milk/80 border-b border-red-wine/5 text-red-wine'
      }`}>
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
            currentView === 'landing' ? 'bg-white text-[#ee6c73]' : 'bg-gradient-to-br from-red-wine to-red-wine-light text-oat-milk'
          }`}>
            <Brush size={18} className="rotate-[45deg]" />
          </div>
          <div className="text-right">
            <span className={`block font-serif font-black text-lg sm:text-xl tracking-widest leading-tight ${
              currentView === 'landing' ? 'text-white' : 'text-red-wine'
            }`}>
              Smoozice
            </span>
            <span className={`block text-[9px] font-bold uppercase tracking-[0.2em] ${
              currentView === 'landing' ? 'text-white/80' : 'text-[#F08B81]'
            }`}>
              Premium Hairbrushes
            </span>
          </div>
        </div>

        {/* View Mode Switcher / Admin Login Action */}
        <div className="flex items-center gap-2">
          {currentView === 'landing' ? (
            <button
              onClick={() => setCurrentView('admin')}
              id="goto-admin-btn"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Shield size={14} />
              <span>لوحة المدير</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentView('landing')}
              id="goto-landing-btn"
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-red-wine text-oat-milk text-xs sm:text-sm font-bold rounded-full transition-all flex items-center gap-1.5 hover:bg-red-wine-light cursor-pointer"
            >
              <ArrowRight size={14} className="scale-x-[-1]" />
              <span>صفحة الهبوط الرئيسية</span>
            </button>
          )}
        </div>
      </header>

      {/* Force Redirect Active Screen (Simulation Mode for AI Studio) */}
      <AnimatePresence>
        {shouldTriggerRedirect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#4A0D15] text-oat-milk flex items-center justify-center p-4 backdrop-blur-md"
          >
            <div className="max-w-md w-full bg-[#33060a]/80 border border-blush/20 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-quartz via-blush to-red-wine" />
              
              <div className="w-16 h-16 bg-[#F4B3AB]/20 text-rose-quartz rounded-full flex items-center justify-center mx-auto mb-6">
                <ExternalLink size={32} />
              </div>

              <h2 className="text-2xl font-serif font-black tracking-wide text-oat-milk mb-4">
                Smoozice Waitlist Redirect
              </h2>
              
              <p className="text-rose-quartz/80 text-sm leading-relaxed mb-6">
                تم تفعيل خيار <strong className="text-white">إعادة التوجيه التلقائي</strong> من قبل مسؤول الموقع. سيتم تحويل الزوار العاديين بشكل فوري للرابط التالي:
              </p>

              <div className="bg-[#4A0D15] border border-blush/15 p-3 rounded-xl mb-8 select-all font-mono text-xs sm:text-sm text-rose-quartz break-all">
                {redirectSettings.redirectUrl}
              </div>

              <div className="flex flex-col gap-3">
                {/* Simulated Real Action */}
                <a
                  href={redirectSettings.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-rose-quartz hover:bg-white text-red-wine-dark font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>زيارة الرابط الخارجي (الإنستقرام)</span>
                  <ExternalLink size={14} />
                </a>

                {/* Developer bypass helper */}
                <button
                  onClick={() => setDismissRedirectSimulator(true)}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-rose-quartz/80 hover:text-white rounded-lg text-xs transition-all cursor-pointer font-semibold"
                >
                  إلغاء التوجيه وتصفح صفحة الهبوط للاستعراض 🛠️
                </button>
              </div>

              <p className="text-[10px] text-rose-quartz/40 mt-4 leading-relaxed">
                يمكن لمدير الموقع تغيير هذا السلوك أو إلغاء تفعيل خيار التوجيه من خلال النقر على "لوحة المدير" وإيقاف المفتاح.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Render */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'landing' ? (
            <motion.div
              key="landing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero header window */}
              <Hero />

              {/* Interactive Questionnaire and validation */}
              <QuestionnaireForm 
                onSubmissionSuccess={() => {
                  showToastNotification("تم تسجيلكِ بنجاح في قائمة الانتظار!");
                }}
                onColorChange={setSelectedColor}
                selectedColor={selectedColor}
              />

              {/* Collage showcase of brushes with color focus highlights */}
              <PhotoGrid selectedColor={selectedColor} />
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {adminEmail ? (
                <AdminDashboard 
                  adminEmail={adminEmail} 
                  onLogout={handleLogout} 
                />
              ) : (
                <AdminLogin 
                  onLoginSuccess={handleLoginSuccess} 
                  onBackToLanding={() => setCurrentView('landing')} 
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Luxury Brand Footer */}
      <footer className="bg-oat-milk border-t border-red-wine/5 py-10 px-4 text-center mt-auto" dir="rtl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="text-right">
            <h4 className="font-serif font-black text-base text-red-wine tracking-wide">
              Smoozice br Waitlist
            </h4>
            <p className="text-xs text-red-wine/55 mt-1 font-light">
              جميع الحقوق محفوظة © ٢٠٢٦. فرش تصفيف شعر حريرية فرنسية فاخرة.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 text-xs font-semibold text-red-wine-light">
            <a href="https://instagram.com/smoozice" target="_blank" rel="noopener noreferrer" className="hover:text-red-wine transition-all flex items-center gap-1">
              <span>إنستقرام</span>
              <ExternalLink size={10} />
            </a>
            <span>•</span>
            <a href="https://tiktok.com/@smoozice" target="_blank" rel="noopener noreferrer" className="hover:text-red-wine transition-all flex items-center gap-1">
              <span>تيك توك</span>
              <ExternalLink size={10} />
            </a>
            <span>•</span>
            <button 
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="hover:text-red-wine transition-all cursor-pointer"
            >
              لوحة التحكم
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}
