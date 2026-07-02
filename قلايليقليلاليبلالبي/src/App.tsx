import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./components/Logo";
import HeroBrowser from "./components/HeroBrowser";
import QuestionnaireForm from "./components/QuestionnaireForm";
import PhotoGrid from "./components/PhotoGrid";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import { WaitlistSubmission } from "./types";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<"pink" | "purple" | "black" | null>(null);
  const [totalSubmissionsCount, setTotalSubmissionsCount] = useState(14820);
  const [recentSubmission, setRecentSubmission] = useState<WaitlistSubmission | null>(null);
  const [activeView, setActiveView] = useState<"home" | "dashboard" | "login">("home");

  // Check for reset query parameter to clear the cache/redirection state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "true" || params.get("clear") === "true") {
      localStorage.removeItem("user_waitlist_approved");
      localStorage.removeItem("user_waitlist_registered");
      localStorage.removeItem("user_waitlist_details");
      localStorage.removeItem("global_forced_redirect_fallback");
      
      // Also clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("reset");
      url.searchParams.delete("clear");
      window.history.replaceState({}, "", url.toString());
      
      // Force reload to apply changes instantly
      window.location.reload();
    }
  }, []);

  // Check redirections logic for normal visitors (non-admins)
  useEffect(() => {
    const checkRedirections = async () => {
      // 1. If admin is logged in, NEVER redirect!
      const savedUser = localStorage.getItem("smoozice_user");
      if (savedUser) {
        return;
      }

      // 2. Check local user waitlist approval
      const isApproved = localStorage.getItem("user_waitlist_approved");
      if (isApproved === "true") {
        window.location.replace("https://smoozieebr.duckdns.org/");
        return;
      }

      // 3. Check global forced redirection state via Supabase
      try {
        const { data, error } = await supabase
          .from("waitlist")
          .select("*")
          .eq("id", "system_config_forced_redirect")
          .single();
        
        if (!error && data && data.phone_number === "true") {
          window.location.replace("https://smoozieebr.duckdns.org/");
          return;
        }
      } catch (err) {
        console.warn("Global forced redirect check via Supabase failed:", err);
      }

      // 4. Fallback to localStorage global forced redirection setting
      const localForced = localStorage.getItem("global_forced_redirect_fallback");
      if (localForced === "true") {
        window.location.replace("https://smoozieebr.duckdns.org/");
      }
    };

    checkRedirections();
  }, [user, activeView]);

  // Read initial queue count from localStorage or initialize
  useEffect(() => {
    const savedUser = localStorage.getItem("smoozice_user");
    if (savedUser) {
      setUser(savedUser);
    }

    const savedCount = localStorage.getItem("smoozice_queue_count");
    if (savedCount) {
      setTotalSubmissionsCount(parseInt(savedCount));
    } else {
      localStorage.setItem("smoozice_queue_count", "14820");
    }

    // Check if user has already submitted previously in this session
    const existing = localStorage.getItem("smoozice_submissions");
    if (existing) {
      const parsed = JSON.parse(existing);
      if (parsed.length > 0) {
        setRecentSubmission(parsed[parsed.length - 1]);
      }
    }
  }, []);

  // Listen for view changes in URL query or hash
  useEffect(() => {
    const checkUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view") || params.get("page");
      const hash = window.location.hash;
      
      if (viewParam === "dashboard" || hash === "#dashboard") {
        setActiveView("dashboard");
      } else if (viewParam === "login" || hash === "#login") {
        setActiveView("login");
      } else {
        setActiveView("home");
      }
    };

    // Check on mount
    checkUrl();

    // Listen to popstate (back/forward in history) and hashchange
    window.addEventListener("popstate", checkUrl);
    window.addEventListener("hashchange", checkUrl);

    return () => {
      window.removeEventListener("popstate", checkUrl);
      window.removeEventListener("hashchange", checkUrl);
    };
  }, []);

  const handleGoToDashboard = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "dashboard");
    window.history.pushState({}, "", url.toString());
    setActiveView("dashboard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToLogin = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "login");
    window.history.pushState({}, "", url.toString());
    setActiveView("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToHome = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("view");
    url.searchParams.delete("page");
    url.hash = "";
    window.history.pushState({}, "", url.toString());
    setActiveView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSuccess = (submission: WaitlistSubmission) => {
    setRecentSubmission(submission);
    setTotalSubmissionsCount(submission.queueNumber);
    
    // Smoothly scroll down to the photo grid after submission so they can admire the brushes
    setTimeout(() => {
      const collageSection = document.getElementById("aesthetic-collage-section");
      if (collageSection) {
        collageSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 1200);
  };

  return (
    <div
      id="main-app-container"
      className="min-h-screen w-full bg-gradient-to-b from-rose-quartz via-blush to-oat-milk text-red-wine flex flex-col justify-between selection:bg-red-wine selection:text-oat-milk overflow-x-hidden relative"
    >
      {/* Delicate drifting background decorations (sparkles/particles) for a luxurious feel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { top: "10%", left: "5%", size: 4 },
          { top: "25%", left: "85%", size: 6 },
          { top: "50%", left: "12%", size: 5 },
          { top: "70%", left: "88%", size: 4 },
          { top: "85%", left: "8%", size: 6 },
        ].map((particle, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              top: particle.top,
              left: particle.left,
              width: particle.size,
              height: particle.size,
            }}
            className="rounded-full bg-white absolute"
          />
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col relative z-10">
        
        {/* Top Header Navigation Bar with Logo and Admin Access Switch */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 pb-2 flex items-center justify-between relative z-20">
          {/* Invisible spacer so logo is centered */}
          <div className="w-10 h-10 hidden sm:block opacity-0" />
          
          <div className="flex-1 flex justify-center">
            <Logo />
          </div>

          {/* Admin / Navigation actions */}
          <div className="flex items-center gap-2">
            {user ? (
              activeView === "home" ? (
                <button
                  onClick={handleGoToDashboard}
                  className="px-4 py-2 rounded-full bg-red-wine text-oat-milk hover:bg-red-wine/90 flex items-center gap-1.5 text-xs font-arabic font-extrabold shadow-md transition-all cursor-pointer hover:scale-105 shrink-0"
                  title="الذهاب إلى لوحة التحكم"
                >
                  <span>📊 لوحة التحكم</span>
                </button>
              ) : (
                <button
                  onClick={handleGoToHome}
                  className="px-4 py-2 rounded-full bg-white/80 text-red-wine hover:bg-white border border-red-wine/20 flex items-center gap-1.5 text-xs font-arabic font-extrabold shadow-md transition-all cursor-pointer hover:scale-105 shrink-0"
                  title="عرض الموقع (الرئيسية)"
                >
                  <span>🏠 عرض الموقع</span>
                </button>
              )
            ) : (
              activeView === "home" ? (
                <button
                  onClick={handleGoToLogin}
                  className="w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-red-wine/20 flex items-center justify-center text-red-wine hover:scale-110 transition-all shadow-md cursor-pointer shrink-0"
                  title="تسجيل دخول المشرف المسؤول"
                >
                  <span className="text-lg">🔑</span>
                </button>
              ) : (
                <button
                  onClick={handleGoToHome}
                  className="w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-red-wine/20 flex items-center justify-center text-red-wine hover:scale-110 transition-all shadow-md cursor-pointer shrink-0"
                  title="العودة للرئيسية"
                >
                  <span className="text-lg">🏠</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* User Greeting & Logout Bar */}
        {user && activeView !== "login" && (
          <div className="flex justify-center items-center gap-3 px-4 mb-5 text-xs font-arabic font-bold text-red-wine select-none">
            <span className="bg-white/70 py-1.5 px-4 rounded-full border border-rose-quartz/40 backdrop-blur-md shadow-xs text-[11px] sm:text-xs">
              مرحباً بك كمسؤول، {user} ✨
            </span>
            <button
              onClick={() => {
                setUser(null);
                localStorage.removeItem("smoozice_user");
                handleGoToHome();
              }}
              className="text-red-wine hover:text-red-wine/70 underline cursor-pointer hover:scale-105 transition-transform"
            >
              تسجيل الخروج
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeView === "home" ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col w-full"
            >
              {/* Elegant Admin Dashboard Button */}
              {user && (
                <div className="flex justify-center mb-5 px-4 select-none">
                  <motion.button
                    id="dashboard-entry-btn"
                    onClick={handleGoToDashboard}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-md py-3 px-6 rounded-full bg-white/70 hover:bg-white/95 text-red-wine font-arabic font-extrabold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border border-red-wine/25 text-center"
                  >
                    <span>⚙️ لوحة تحكم المشرف (المسجلين وقائمة الانتظار)</span>
                  </motion.button>
                </div>
              )}

              {/* Middle Section: Hero Browser Window */}
              <HeroBrowser />

              {/* Form Section: RTL Arabic Questionnaire & Registration Form */}
              <QuestionnaireForm
                onColorSelected={setSelectedColor}
                onSuccess={handleFormSuccess}
              />

              {/* Bottom Section: Dense Aesthetic Photo Grid Collage */}
              <PhotoGrid highlightColor={selectedColor} />
            </motion.div>
          ) : activeView === "dashboard" ? (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <Dashboard 
                onBack={handleGoToHome} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="login-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <LoginPage
                onLoginSuccess={(username) => {
                  setUser(username);
                  localStorage.setItem("smoozice_user", username);
                  handleGoToDashboard();
                }}
                onSkip={handleGoToHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}

