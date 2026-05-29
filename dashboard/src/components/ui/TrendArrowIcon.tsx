
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

const TrendArrowIcon = ({ trend }: { trend: 'up'|'down'|'neutral' }) => {
  if (trend === 'up') return <ArrowUpRight className="h-3 w-3 text-emerald-500" />;
  if (trend === 'down') return <ArrowDownRight className="h-3 w-3 text-rose-500" />;
  return <Minus className="h-3 w-3 text-slate-400" />;
};

export default TrendArrowIcon;
