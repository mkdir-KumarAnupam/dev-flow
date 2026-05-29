import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LiveDateTimeClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 "
    >
      <div className="text-[11px] font-mono font-bold text-muted-foreground tabular-nums tracking-wider">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>
      <div className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </motion.div>
  );
};

export default LiveDateTimeClock;
