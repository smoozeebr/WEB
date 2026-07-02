import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitWaitlist } from '../lib/api';
import { WaitlistEntry } from '../types';
import { Loader2, Sparkles, Ticket, CheckCircle2 } from 'lucide-react';

interface QuestionnaireFormProps {
  onSubmissionSuccess: (entry: WaitlistEntry) => void;
  onColorChange: (color: 'pink' | 'purple' | 'black' | 'any') => void;
  selectedColor: 'pink' | 'purple' | 'black' | 'any';
}

export default function QuestionnaireForm({ onSubmissionSuccess, onColorChange, selectedColor }: QuestionnaireFormProps) {
  // Form State matching the screenshot questions
  const [hairType, setHairType] = useState<'curly' | 'wavy' | null>(null);
  const [careRoutine, setCareRoutine] = useState<'sure' | 'no' | null>(null);
  const [isQualityImportant, setIsQualityImportant] = useState<'sure' | 'not_really' | 'no' | null>(null);
  const [expectedPrice, setExpectedPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedEntry, setSubmittedEntry] = useState<WaitlistEntry | null>(null);

  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Custom validations in Arabic matching the screenshot fields
    if (!hairType) {
      setErrorMsg('الرجاء اختيار نوع شعركِ.');
      return;
    }
    if (!careRoutine) {
      setErrorMsg('الرجاء الإجابة على سؤال العناية بشعركِ.');
      return;
    }
    if (!isQualityImportant) {
      setErrorMsg('الرجاء الإجابة على سؤال مدى أهمية جودة الفرشاة.');
      return;
    }
    if (!expectedPrice.trim()) {
      setErrorMsg('الرجاء كتابة السعر المتوقع للفرشاة.');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('الرجاء إدخال رقم الهاتف.');
      return;
    }
    if (!email.trim() || !validateEmail(email)) {
      setErrorMsg('الرجاء إدخال بريد إلكتروني صحيح.');
      return;
    }

    setLoading(true);
    try {
      // Map state to database friendly types
      const hairTypesMapped = [hairType === 'curly' ? 'كيرلي (Curly)' : 'ويفي (Wavy)'];
      const careRoutineMapped = careRoutine === 'sure' ? 'اكيد، بتعتني بشعرها' : 'لا، لا تعتني بشعرها';
      const isQualityImportantMapped = isQualityImportant === 'sure' ? 'اكيد مهمة' : isQualityImportant === 'not_really' ? 'مش اوي' : 'لا مش مهمة';

      const entry = await submitWaitlist({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        hairTypes: hairTypesMapped,
        careRoutine: careRoutineMapped,
        isQualityImportant: isQualityImportantMapped,
        expectedPrice: expectedPrice.trim(),
        colorInterest: selectedColor
      });

      setSubmittedEntry(entry);
      onSubmissionSuccess(entry);
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء إرسال البيانات. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="questionnaire-section" className="max-w-xl mx-auto px-4 py-8 scroll-mt-6" dir="rtl">
      <AnimatePresence mode="wait">
        {!submittedEntry ? (
          <motion.div
            key="form-container"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="border-4 border-white rounded-[36px] bg-[#ee6c73] p-8 sm:p-12 text-white shadow-xl space-y-10"
          >
            <form onSubmit={handleSubmit} className="space-y-10 text-center">
              
              {/* Question 1: نوع شعرك؟ */}
              <div className="space-y-4">
                <h4 className="text-xl sm:text-2xl font-bold tracking-wide">نوع شعرك؟</h4>
                <div className="flex justify-center items-center gap-16 sm:gap-24">
                  
                  {/* كيرلي */}
                  <button
                    type="button"
                    onClick={() => setHairType('curly')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">كيرلي</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {hairType === 'curly' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                  {/* ويفي */}
                  <button
                    type="button"
                    onClick={() => setHairType('wavy')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">ويفي</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {hairType === 'wavy' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                </div>
              </div>

              {/* Question 2: بتعتني بشعرك؟ */}
              <div className="space-y-4">
                <h4 className="text-xl sm:text-2xl font-bold tracking-wide">بتعتني بشعرك؟</h4>
                <div className="flex justify-center items-center gap-16 sm:gap-24">
                  
                  {/* اكيد */}
                  <button
                    type="button"
                    onClick={() => setCareRoutine('sure')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">اكيد</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {careRoutine === 'sure' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                  {/* لا */}
                  <button
                    type="button"
                    onClick={() => setCareRoutine('no')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">لا</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {careRoutine === 'no' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                </div>
              </div>

              {/* Question 3: تفتكري الفرشة مهمة */}
              <div className="space-y-4">
                <h4 className="text-xl sm:text-2xl font-bold tracking-wide">تفتكري الفرشة مهمة؟</h4>
                <div className="flex justify-center items-center gap-10 sm:gap-16">
                  
                  {/* اكيد */}
                  <button
                    type="button"
                    onClick={() => setIsQualityImportant('sure')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">اكيد</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {isQualityImportant === 'sure' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                  {/* مش اوي */}
                  <button
                    type="button"
                    onClick={() => setIsQualityImportant('not_really')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">مش اوي</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {isQualityImportant === 'not_really' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                  {/* لا */}
                  <button
                    type="button"
                    onClick={() => setIsQualityImportant('no')}
                    className="flex flex-col items-center gap-3 group cursor-pointer focus:outline-none"
                  >
                    <span className="text-lg sm:text-xl font-medium select-none">لا</span>
                    <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200">
                      {isQualityImportant === 'no' && (
                        <div className="w-3.5 h-3.5 rounded-full bg-white animate-scaleIn" />
                      )}
                    </div>
                  </button>

                </div>
              </div>

              {/* Question 4: توقعي فرشتك الاخيرة الي هتشتريها هتبقي بكام */}
              <div className="space-y-2 max-w-sm mx-auto">
                <label htmlFor="expectedPrice" className="block text-base sm:text-lg font-medium leading-relaxed">
                  توقعي فرشتك الاخيرة الي هتشتريها هتبقي بكام
                </label>
                <input
                  type="text"
                  id="expectedPrice"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  placeholder="ادخل السعر"
                  className="w-full text-center py-3.5 px-6 rounded-full border-2 border-white bg-transparent text-white placeholder-white/70 text-base focus:ring-0 focus:outline-none transition-all"
                />
              </div>

              {/* Question 5: ادخل رقم الهاتف */}
              <div className="space-y-2 max-w-sm mx-auto">
                <label htmlFor="phone" className="block text-base sm:text-lg font-medium leading-relaxed">
                  ادخل رقم الهاتف
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ادخل رقم الوتساب الخاص بك"
                  className="w-full text-center py-3.5 px-6 rounded-full border-2 border-white bg-transparent text-white placeholder-white/70 text-base focus:ring-0 focus:outline-none transition-all"
                />
              </div>

              {/* Question 6: الايميل */}
              <div className="space-y-2 max-w-sm mx-auto">
                <label htmlFor="email" className="block text-base sm:text-lg font-medium leading-relaxed">
                  الايميل
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ادخل الايميل"
                  className="w-full text-center py-3.5 px-6 rounded-full border-2 border-white bg-transparent text-white placeholder-white/70 text-base focus:ring-0 focus:outline-none transition-all text-left"
                  dir="ltr"
                />
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-950/20 border border-white/30 rounded-xl text-sm font-semibold text-white inline-block px-6"
                  >
                    ⚠️ {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button with Neo-Brutalist cartoon styling from screenshot */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-16 py-3.5 bg-white text-black font-extrabold text-lg rounded-full border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin text-black" size={20} />
                      <span>جاري التسجيل...</span>
                    </>
                  ) : (
                    <span>ارسال</span>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        ) : (
          /* Custom Premium Success Screen */
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="border-4 border-white rounded-[36px] bg-[#ee6c73] p-8 sm:p-12 text-white shadow-xl text-center relative overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
              className="w-16 h-16 bg-white text-[#ee6c73] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </motion.div>

            <h3 className="text-2xl sm:text-3xl font-black mb-4">
              تهانينا! تم تسجيلكِ بنجاح
            </h3>
            
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
              تم حفظ إجاباتكِ بنجاح! بريدكِ الإلكتروني مسجل الآن رسميًا كعضو ذو أولوية شراء للدفعة الأولى الحصرية من سموزيس.
            </p>

            {/* Custom Priority Member Ticket */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-sm mx-auto bg-white/10 border-2 border-dashed border-white/40 rounded-2xl p-6 mb-8 relative"
            >
              <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#ee6c73] border-r-2 border-white/40" />
              <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-[#ee6c73] border-l-2 border-white/40" />

              <div className="flex items-center justify-center gap-1.5 text-xs text-white/70 font-bold tracking-widest uppercase mb-2">
                <Ticket size={14} className="text-white" />
                تأكيد الانضمام لقائمة الانتظار
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-wide text-white my-3">
                عضو VIP مميز
              </div>

              <p className="text-[10px] sm:text-xs text-white/60 font-medium">
                تاريخ التسجيل: {new Date(submittedEntry.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>

            <button
              onClick={() => {
                setSubmittedEntry(null);
                setHairType(null);
                setCareRoutine(null);
                setIsQualityImportant(null);
                setExpectedPrice('');
                setPhone('');
                setEmail('');
              }}
              className="px-6 py-2.5 bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold rounded-full transition-all"
            >
              تسجيل حساب آخر أو تعديل الاستبيان
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
