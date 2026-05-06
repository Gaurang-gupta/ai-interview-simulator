"use client";
import Link from "next/link";
import { signOut } from "@/actions/authActions";
import { History, LogOut, Trophy } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
            A
          </div>
          <span className="font-bold tracking-tight text-white">AI PREP</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/history"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <History size={16} />
            <span className="hidden sm:block">History</span>
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 group"
          >
            <Trophy
              size={16}
              className="group-hover:text-amber-400 transition-colors"
            />
            <span className="hidden sm:block">Leaderboard</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-white/5"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
