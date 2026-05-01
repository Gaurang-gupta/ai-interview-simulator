import { signUp } from "@/actions/authActions";
import Link from "next/link";
import { ArrowRight, Lock, Mail, Sparkles, UserPlus } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
      {/* Signup Card */}
      <div className="w-full max-w-md animate-slide-up">
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl shadow-purple-500/10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <UserPlus size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-slate-400 mt-2 text-center">
              Join AI Prep and start mastering new topics today
            </p>
          </div>

          <form action={signUp} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Create Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                  size={18}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500/40 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 text-white font-semibold transition-all hover:bg-purple-500 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-500/20"
            >
              Get Started
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

        {/* Subtle trust indicator */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs uppercase tracking-widest">
          <Sparkles size={12} className="text-purple-500" />
          <span>AI-Powered Assessments</span>
          <Sparkles size={12} className="text-purple-500" />
        </div>
      </div>
    </div>
  );
}
