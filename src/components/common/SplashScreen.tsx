import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Sparkles, Zap } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden select-none"
        >
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-fuchsia-600/20 via-indigo-500/20 to-blue-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-md w-full">
            {/* Official Brand Logo */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-2 flex flex-col items-center justify-center"
            >
              <div className="relative p-1">
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-indigo-500 rounded-[32px] blur-xl opacity-60 animate-pulse" />
                <img
                  src="/zylo-icon.svg"
                  alt="Zylo Logo"
                  className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-2xl object-contain"
                />
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none">
                  Zylo
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-zinc-400 mt-1.5">
                Smart Shopping, Delivered
              </span>
            </motion.div>

            {/* Micro loading progress indicator */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 160, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1.1, ease: 'easeInOut' }}
              className="h-1.5 bg-zinc-800/80 rounded-full mt-6 overflow-hidden border border-zinc-700/50"
            >
              <div className="h-full bg-gradient-to-r from-pink-500 via-indigo-500 to-violet-500 rounded-full animate-pulse" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
