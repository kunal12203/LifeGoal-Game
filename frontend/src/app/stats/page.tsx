"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  Trophy, TrendingUp, BarChart3, Medal, 
  Target, Zap, ChevronLeft, Award 
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user-service";
import { xpService } from "@/services/xp-service";
import { Button } from "@/components/ui/button";

export default function StatsPage() {
  // 1. Fetch Leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => userService.getLeaderboard(10),
  });

  // 2. Fetch User Profile for personal stats
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getProfile(),
  });

  // Mock data for XP Progression Chart (to be replaced by daily_run history)
  const xpData = [
    { day: "Mon", xp: 120 }, { day: "Tue", xp: 340 }, { day: "Wed", xp: 280 },
    { day: "Thu", xp: 450 }, { day: "Fri", xp: 600 }, { day: "Sat", xp: 900 },
    { day: "Sun", xp: 1250 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ChevronLeft className="mr-2 w-4 h-4" /> Back to Command Center
            </Button>
          </Link>
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">
              Hall of Fame
            </h1>
          </div>
        </div>

        {/* 1. TOP STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Current Level", val: profile?.current_level || 1, icon: Trophy, color: "text-amber-500" },
            { label: "Total XP", val: profile?.total_xp || 0, icon: Zap, color: "text-emerald-500" },
            { label: "Global Rank", val: `#${profile?.rank || "---"}`, icon: Award, color: "text-indigo-500" },
            { label: "Percentile", val: `${profile?.percentile || 0}%`, icon: TrendingUp, color: "text-rose-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md"
            >
              <stat.icon className={`${stat.color} w-5 h-5 mb-2`} />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black mt-1">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. XP PROGRESSION CHART */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-8">
              <BarChart3 className="text-emerald-400 w-5 h-5" />
              <h2 className="text-xl font-bold">XP Progression</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={xpData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 3. GLOBAL LEADERBOARD */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden"
          >
            <div className="p-6 border-b border-slate-800 bg-slate-800/20">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Medal className="text-amber-500" /> Top Adventurers
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {leaderboard?.map((user: any, idx: number) => (
                <div 
                  key={user.username}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                    user.username === profile?.username ? "bg-emerald-500/10 border border-emerald-500/30" : "hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-6 text-center font-black ${idx < 3 ? "text-amber-500" : "text-slate-600"}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm">{user.username}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">LVL {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-emerald-400">{user.total_xp.toLocaleString()}</p>
                    <p className="text-[8px] text-slate-500 uppercase">Total XP</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}