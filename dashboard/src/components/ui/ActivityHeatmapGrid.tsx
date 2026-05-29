
import { motion } from 'framer-motion';

const ActivityHeatmapGrid = ({ data, onDateClick }: { data: { date: string; count: number; dow: number; week: number }[], onDateClick?: (date: string) => void }) => {
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
  const maxWeek = Math.max(...data.map(d => d.week), 0);
  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-emerald-200';
    if (count <= 3) return 'bg-emerald-400';
    return 'bg-emerald-600';
  };
  // Build grid: 7 rows (days) A- N cols (weeks)
  const grid: (typeof data[0] | null)[][] = [];
  for (let w = 0; w <= maxWeek; w++) {
    const col: (typeof data[0] | null)[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = data.find(c => c.week === w && c.dow === d);
      col.push(cell || null);
    }
    grid.push(col);
  }
  return (
    <div className="flex gap-0.5">
      {/* Day labels */}
      <div className="flex flex-col gap-[3px] pr-1.5 pt-0">
        {dayLabels.map((l, i) => <span key={i} className="text-[8px] text-slate-400 h-[13px] flex items-center">{l}</span>)}
      </div>
      {/* Grid */}
      {grid.map((col, w) => (
        <motion.div key={w} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: w * 0.01 }} className="flex flex-col gap-[3px]">
          {col.map((cell, d) => (
            <div key={d} className={`w-[11px] h-[11px] rounded-[3px] ${cell ? getColor(cell.count) : 'bg-transparent'} transition-all hover:scale-125 duration-200 cursor-pointer`}
              title={cell ? `${cell.date}: ${cell.count} contributions` : ''} onClick={() => cell && onDateClick?.(cell.date)} />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityHeatmapGrid;
