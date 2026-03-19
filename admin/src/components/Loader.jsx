import React from "react";
import { motion } from "framer-motion";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Animated Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-4 border-[6px] border-slate-100 border-t-emerald-500 rounded-full"
        />
        
        {/* Center Pulsing Logo/Dot */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-4 h-4 bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Syncing Data</h2>
        <p className="text-slate-500 text-sm mt-1 font-medium italic">Fetching latest analytics...</p>
      </motion.div>
    </div>
  );
};

export default Loader;
