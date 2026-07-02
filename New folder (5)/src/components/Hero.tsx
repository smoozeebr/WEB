import { motion } from 'motion/react';
import { Sparkles, ArrowDown, Flame } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative pt-16 pb-12 px-4 text-center overflow-hidden">
      {/* Decorative ambient glowing backlights (soft white on pink) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Intro Badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-white text-xs sm:text-sm font-medium mb-8"
      >
        <Sparkles size={14} className="animate-pulse text-white" />
        <span>إصدار حصري محدود • الفرشاة الفرنسية الأكثر فخامة</span>
      </motion.div>

      {/* Main Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.2] mb-6"
      >
        أعيدي تعريف علاقتك بشعرك مع <br className="hidden sm:inline" />
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white font-sans">
          Smoozice
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-white/90 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12 font-light"
      >
        فرشاة شعر ثورية مصنوعة يدوياً بمزيج من ألياف الحرير والنايلون الفاخر لتنشيط الدورة الدموية في فروة الرأس، وإضفاء لمعان طبيعي لا مثيل له منذ التمريرة الأولى.
      </motion.p>

      {/* Floating Browser Mockup as seen in screenshot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 70,
          damping: 20,
          delay: 0.3 
        }}
        className="relative max-w-2xl mx-auto mb-16 px-2 sm:px-0"
      >
        {/* Float Animation Wrapper */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-[#ee6c73] rounded-[32px] border-4 border-white shadow-2xl overflow-hidden aspect-[16/9] flex flex-col"
        >
          {/* Browser Header Bar */}
          <div className="bg-white/5 border-b-2 border-white/20 px-6 py-4 flex items-center justify-between">
            {/* Window Controls (Red, Yellow, Green as in screenshot) */}
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
            </div>
            {/* Address Bar */}
            <div className="bg-white/10 text-white/80 text-[10px] sm:text-xs px-10 py-1.5 rounded-full border border-white/15 font-mono select-none truncate max-w-[200px] sm:max-w-sm">
              smoozice.com/waitlist
            </div>
            {/* Elegant browser design accent */}
            <div className="w-12 h-2 rounded-full bg-yellow-400 hidden sm:block" />
          </div>

          {/* Browser Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#ee6c73]">
            {/* Huge Waitlist Typography */}
            <div className="text-center z-10 select-none">
              <span className="block text-xs uppercase tracking-[0.25em] text-white/70 font-semibold mb-2 font-sans">
                JOIN THE EXCLUSIVE
              </span>
              <h2 className="text-6xl sm:text-7xl md:text-8xl font-sans font-black tracking-tighter text-white drop-shadow-md relative">
                waitlist
                <span className="absolute -top-4 -right-6 text-[10px] bg-white text-[#ee6c73] font-sans not-italic font-black px-2 py-0.5 rounded-full rotate-12 shadow-md flex items-center gap-0.5">
                  <Flame size={10} className="fill-current text-[#ee6c73]" />
                  VIP
                </span>
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-white/80 font-mono tracking-widest">
                الدفعة الأولى • خريف ٢٠٢٦
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating details overlaying mockup */}
        <div className="absolute -top-6 -left-4 bg-white border-2 border-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 rotate-[-6deg] hidden sm:flex text-black">
          <span className="text-base">✨</span>
          <span className="text-xs font-black">مقاومة للكهرباء الساكنة</span>
        </div>

        <div className="absolute -bottom-4 -right-6 bg-white border-2 border-black text-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 rotate-[4deg] hidden sm:flex">
          <span className="text-xs font-black">مضمونة لشعر لامع</span>
          <span className="text-base">💇‍♀️</span>
        </div>
      </motion.div>

      {/* Call to Action Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-2 text-white/75 animate-bounce cursor-pointer mt-4"
        onClick={() => {
          document.getElementById('questionnaire-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-xs font-semibold tracking-wider">ابدئي الاستبيان أدناه للانضمام</span>
        <ArrowDown size={18} />
      </motion.div>
    </section>
  );
}
