import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { login, register } from '../lib/api';
import { Lock, Mail, Loader2, Sparkles, AlertCircle, HelpCircle, UserPlus, CheckCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  onBackToLanding: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBackToLanding }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success && result.email) {
        onLoginSuccess(result.email);
      } else {
        setErrorMsg(result.error || 'فشل تسجيل الدخول.');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12" dir="rtl">
      <div className="absolute inset-0 bg-radial-gradient from-rose-quartz/20 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-oat-milk border border-red-wine/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1.5 bg-red-wine" />

        {/* Brand Identity Header */}
        <div className="text-center mb-6">
          <div className="text-xl font-serif font-black tracking-widest text-red-wine uppercase mb-1">
            Smoozice
          </div>
        </div>

        {/* Error Message Display */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-red-wine/5 border border-red-wine/20 text-red-wine text-xs sm:text-sm rounded-xl flex items-start gap-2"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message Display */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-xl flex items-start gap-2"
            >
              <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span className="font-medium">{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-xs font-bold text-red-wine">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smoozice.com"
                className="w-full p-3 pr-10 rounded-xl border border-red-wine/15 bg-oat-milk-dark/30 text-red-wine text-sm focus:border-red-wine focus:ring-1 focus:ring-red-wine focus:outline-none transition-all text-left"
                dir="ltr"
                required
              />
              <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-wine/40" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="admin-password" className="block text-xs font-bold text-red-wine">
                كلمة المرور
              </label>
              <button
                type="button"
                id="forgot-password-btn"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-red-wine/60 hover:text-red-wine font-medium underline"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 pr-10 rounded-xl border border-red-wine/15 bg-oat-milk-dark/30 text-red-wine text-sm focus:border-red-wine focus:ring-1 focus:ring-red-wine focus:outline-none transition-all text-left"
                dir="ltr"
                required
              />
              <Lock size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-wine/40" />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={loading}
            className="w-full py-3.5 bg-red-wine hover:bg-red-wine-light text-oat-milk font-semibold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>جاري التحقق من الهوية...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="fill-current" />
                <span>تسجيل الدخول للوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Back navigation */}
        <div className="mt-6 text-center border-t border-red-wine/10 pt-4">
          <button
            onClick={onBackToLanding}
            className="text-xs text-red-wine-light hover:text-red-wine font-semibold transition-colors cursor-pointer"
          >
            ← العودة لصفحة الهبوط وقائمة الانتظار الرئيسية
          </button>
        </div>
      </motion.div>

      {/* Forgot Password Dialog */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-oat-milk border border-red-wine/20 rounded-2xl p-6 max-w-sm w-full text-right shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-red-wine mb-2">استعادة كلمة المرور</h3>
              <p className="text-xs text-red-wine/70 leading-relaxed mb-4">
                أدخلي بريدكِ الإلكتروني المسجل وسنقوم بإرسال رابط إعادة تعيين كلمة المرور فور تفعيل نظام البريد الحقيقي.
              </p>

              {forgotSuccess ? (
                <div className="p-3 bg-red-wine/5 border border-red-wine/20 text-red-wine text-xs rounded-xl font-bold text-center">
                  ✔️ تم إرسال طلب إعادة التعيين بنجاح (وضع المحاكاة).
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full p-2.5 rounded-lg border border-red-wine/15 text-xs text-left"
                    dir="ltr"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-red-wine text-oat-milk font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      إرسال رابط البدء
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2 bg-red-wine/10 text-red-wine font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
