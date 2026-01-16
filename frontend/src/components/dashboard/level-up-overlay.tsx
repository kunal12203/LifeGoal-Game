"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LevelUpProps {
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export const LevelUpOverlay: React.FC<LevelUpProps> = ({ newLevel, isOpen, onClose }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // Generate random particles for the celebration effect
  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        x: Math.random() * 400 - 200,
        y: Math.random() * 400 - 200,
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
          />

          {/* Celebration Content */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="relative bg-slate-900 border-2 border-emerald-500/50 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center max-w-sm w-full pointer-events-auto"
          >
            {/* Particle Burst */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 w-2 h-2 bg-emerald-400 rounded-full"
              />
            ))}

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/40"
                  >
                    <Trophy className="text-white w-12 h-12 stroke-[2.5]" />
                  </motion.div>
                  <Sparkles className="absolute -top-4 -right-4 text-amber-400 w-8 h-8 animate-pulse" />
                </div>
              </div>

              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">
                Rank Upward
              </h2>
              <h1 className="text-5xl font-black text-white mb-4">
                LEVEL {newLevel}
              </h1>
              
              <div className="flex items-center justify-center gap-2 mb-8 text-slate-400 text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Attribute points gained</span>
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>

              <Button 
                onClick={onClose}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl group"
              >
                Continue Journey 
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};