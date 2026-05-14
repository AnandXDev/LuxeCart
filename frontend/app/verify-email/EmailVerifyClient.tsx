  "use client";

  import { useState, useEffect } from "react";
  import { Mail, KeyRound, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
  import axios from "axios";
  import { useRouter, useSearchParams } from "next/navigation";

  export default function EmailVerify() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState("Verifying...");
// ⏳ NAYE STATES FOR TIMER
  const [timeLeft, setTimeLeft] = useState(0); // 0 means no cooldown
    

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const emailFromUrl = decodeURIComponent(searchParams.get("email") || "");
    
    
    const tokenFromUrl = searchParams.get("token");

    const [email, setEmail] = useState(emailFromUrl.trim().toLowerCase());
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (tokenFromUrl) {
        verifyWithToken();
      }
    }, [tokenFromUrl]);
    // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup
  }, [timeLeft]);

  // Seconds ko MM:SS format mein dikhane ke liye helper
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

    const verifyWithToken = async () => {
      try {
        setLoading(true);

        await axios.get(
          `${API_URL}/api/auth/verify-email?token=${tokenFromUrl}`
        );

        alert("✅ Email verified successfully");
        router.push("/login");

      } catch (err: any) {
        console.error(err);

        alert(
          err?.response?.data?.message ||
          "❌ Invalid or expired verification link"
        );

      } finally {
        setLoading(false);
      }
    };
    
    const sendOtp = async () => {
      if (!email) {
        alert("Please enter email");
        return;
      }

      try {
        const res = await axios.post(
          `${API_URL}/api/auth/send-otp`,
          { email }
        );

        alert(res.data.message);
        setTimeLeft(120); // 120 seconds = 2 minutes ka timer start kar do
       setStep(2);

      } catch (err: any) {
        console.error(err);

        alert(
          err?.response?.data?.message ||
          "Error sending OTP"
        );
      }
    };

    const verifyOtp = async () => {
      if (!otp) {
        alert("Enter OTP");
        return;
      }

      try {
        const res = await axios.post(
          `${API_URL}/api/auth/verify-otp`,
          { email, otp }
        );

        alert(res.data.message);
        router.push("/login");

      } catch (err: any) {
        console.error(err);

        alert(
          err?.response?.data?.message ||
          "Invalid OTP"
        );
      }
    };

    if (loading) {
      return <h2 style={{ padding: "20px" }}>Verifying email...</h2>;
    }

    return (
  <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 p-4 font-sans">
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
      
      {/* 🔹 Header Section */}
      <div className="bg-gray-900 px-8 py-10 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-white/10 p-3 rounded-2xl mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Verification</h2>
          <p className="text-gray-300 text-sm">Please verify your identity to continue shopping securely.</p>
        </div>
      </div>

      {/* 🔹 Body Section */}
      <div className="p-8">
        {tokenFromUrl ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-gray-600 font-medium animate-pulse">Verifying your secure link...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* STEP 1: Email Input */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your registered email"
                      disabled
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-gray-900 bg-gray-50 focus:bg-white outline-none"
                    />
                  </div>
                </div>
                
                <button
                  onClick={sendOtp}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(34,211,238,0.39)] text-sm font-semibold text-black bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all active:scale-[0.98]"
                >
                  Send Verification Code
                </button>
              </div>
            )}

            {/* STEP 2: OTP Input */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ml-1">Security Code (OTP)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all text-center tracking-[0.5em] font-mono text-xl text-gray-900 bg-gray-50 focus:bg-white outline-none placeholder:tracking-normal placeholder:font-sans placeholder:text-base placeholder:text-left"
                    />
                  </div>
                </div>

                <button
                  onClick={verifyOtp}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Verify & Continue
                </button>

                <div className="pt-2 text-center">
                  <p className="text-sm text-gray-500">
                    Didn't receive the code?{" "}
                    <button 
                      onClick={sendOtp} 
                      className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline transition-all"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>
    </div>
  </div>
);
  }