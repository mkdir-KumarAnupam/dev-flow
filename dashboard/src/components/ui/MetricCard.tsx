
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

const iV: any = { hidden: { opacity: 0, y: 14, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } } };

const MetricCard = ({ icon: Icon, label, value, sub, color, trend, elevate }: any) => {
  let spotlight = '';
  if (trend === 'good') spotlight = 'bg-emerald-400/25 dark:bg-emerald-400/25';
  else if (trend === 'bad') spotlight = 'bg-rose-500/25 dark:bg-rose-500/25';
  else if (trend === 'warning') spotlight = 'bg-amber-400/25 dark:bg-amber-400/25';

  return (
    <motion.div variants={iV} whileHover={{ scale: 1.04, y: -3, transition: { type: "spring", stiffness: 500, damping: 20 } }}>
      <Card className={`glass-panel shadow-sm h-full hover:shadow-md transition-shadow duration-200 relative overflow-hidden group ${elevate ? 'border border-violet-400/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] ring-1 ring-violet-400/20 dark:bg-violet-900/10' : ''}`}>
        {spotlight && <div className={`absolute -top-12 -right-12 w-28 h-28 blur-[24px] rounded-full pointer-events-none transition-opacity opacity-70 group-hover:opacity-100 ${spotlight}`} />}
        <CardContent className="pt-4 pb-3 px-4 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${elevate ? 'text-violet-600 dark:text-violet-300' : 'text-slate-500'}`}>{label}</span>
            <div className={`p-1 rounded-md ${color}`}><Icon className="h-3 w-3 relative z-10" /></div>
          </div>
          <div className={`font-bold tracking-tight ${elevate ? 'text-2xl text-violet-700 dark:text-violet-400 drop-shadow-sm' : 'text-xl text-foreground'}`}>{value}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;
