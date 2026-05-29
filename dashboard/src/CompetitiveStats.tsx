import { useState, useEffect } from 'react';
import { Trophy, Target, Clock, AlertTriangle, Flame, Medal, X, ChevronRight, Check } from 'lucide-react';

interface CompetitiveStatsProps {
  onBack: () => void;
}

export default function CompetitiveStats({ onBack }: CompetitiveStatsProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/practice')
      .then(res => res.json())
      .then(data => {
        setStats(computeAnalytics(data));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const computeAnalytics = (records: any[]) => {
    const activeDays = new Set<string>();
    const topicCounts = new Map<string, number>();
    const topicStuck = new Map<string, number>();
    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    let totalMinutes = 0;
    
    records.forEach(r => {
      const day = new Date(r.endedAt || r.startedAt || Date.now()).toISOString().slice(0, 10);
      activeDays.add(day);
      if (r.difficulty && (diffCounts as any)[r.difficulty] !== undefined) {
         (diffCounts as any)[r.difficulty]++;
      }
      totalMinutes += (r.timeSpentMinutes || 0);

      (r.topics || []).forEach((t: string) => {
         topicCounts.set(t, (topicCounts.get(t) || 0) + 1);
         if (r.status === 'stuck') {
             topicStuck.set(t, (topicStuck.get(t) || 0) + 1);
         }
      });
    });

    const solved = records.filter(r => r.status === 'solved').length;
    const stuck = records.filter(r => r.status === 'stuck').length;
    const score = solved * 10 + stuck * 2 + diffCounts.hard * 8 + diffCounts.medium * 4;
    let rank = "Beginner";
    if (score >= 1200) rank = "Algorithm Master";
    else if (score >= 700) rank = "Problem Slayer";
    else if (score >= 400) rank = "Competitive Grinder";
    else if (score >= 180) rank = "Advanced Solver";
    else if (score >= 60) rank = "Intermediate Solver";

    const sortedTopics = [...topicCounts.entries()].sort((a, b) => b[1] - a[1]);
    const favTopic = sortedTopics.length > 0 ? sortedTopics[0][0] : '--';
    
    const sortedStuck = [...topicStuck.entries()].sort((a, b) => b[1] - a[1]);
    const weakTopic = sortedStuck.length > 0 ? sortedStuck[0][0] : '--';

    // Simple current streak
    let streak = 0;
    const today = new Date();
    for (let i=0; i<365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (activeDays.has(d.toISOString().slice(0, 10))) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return { records: records.reverse().slice(0, 50), solved, attempted: records.length, stuck, rank, favTopic, weakTopic, streak, totalMinutes, diffCounts };
  };

  if (loading) return <div className="h-full flex items-center justify-center text-white">Loading stats...</div>;
  if (!stats) return <div className="h-full flex items-center justify-center text-white">No data</div>;

  return (
    <div className="h-full flex flex-col p-8 bg-slate-950 overflow-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400" /> Competitive Profile
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Medal className="w-16 h-16 text-indigo-400"/></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Rank</p>
          <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{stats.rank}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-16 h-16 text-emerald-400"/></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Solved</p>
          <p className="text-3xl font-black text-emerald-400">{stats.solved} <span className="text-lg text-slate-500 font-medium">/ {stats.attempted}</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Flame className="w-16 h-16 text-orange-400"/></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Streak</p>
          <p className="text-3xl font-black text-orange-400">{stats.streak} <span className="text-lg text-slate-500 font-medium">days</span></p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-16 h-16 text-rose-400"/></div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Time Spent</p>
          <p className="text-3xl font-black text-rose-400">{Math.floor(stats.totalMinutes / 60)}<span className="text-lg text-slate-500 font-medium">h</span> {stats.totalMinutes % 60}<span className="text-lg text-slate-500 font-medium">m</span></p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Topic Insights</h2>
           <div className="flex flex-col gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                 <span className="text-emerald-400 font-bold">Strongest Topic</span>
                 <span className="text-white capitalize">{stats.favTopic.replace('-', ' ')}</span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
                 <span className="text-rose-400 font-bold">Needs Practice</span>
                 <span className="text-white capitalize">{stats.weakTopic.replace('-', ' ')}</span>
              </div>
           </div>
        </div>

        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
           <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-6">Difficulty Breakdown</h2>
           <div className="flex-1 flex items-end gap-8 pb-4">
              <div className="flex-1 flex flex-col items-center gap-2">
                 <div className="w-16 bg-emerald-400/20 border border-emerald-400/50 rounded-t-lg transition-all" style={{ height: `${Math.max(10, (stats.diffCounts.easy / Math.max(1, stats.attempted)) * 200)}px` }}></div>
                 <span className="text-emerald-400 font-bold text-sm">Easy ({stats.diffCounts.easy})</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                 <div className="w-16 bg-amber-400/20 border border-amber-400/50 rounded-t-lg transition-all" style={{ height: `${Math.max(10, (stats.diffCounts.medium / Math.max(1, stats.attempted)) * 200)}px` }}></div>
                 <span className="text-amber-400 font-bold text-sm">Medium ({stats.diffCounts.medium})</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-2">
                 <div className="w-16 bg-rose-400/20 border border-rose-400/50 rounded-t-lg transition-all" style={{ height: `${Math.max(10, (stats.diffCounts.hard / Math.max(1, stats.attempted)) * 200)}px` }}></div>
                 <span className="text-rose-400 font-bold text-sm">Hard ({stats.diffCounts.hard})</span>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex-1 flex flex-col min-h-[300px]">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Recent Practice History</h2>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {stats.records.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">No practice history found</div>
          ) : (
            stats.records.map((r: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-xl transition-colors mb-1 cursor-pointer">
                <div className="flex items-center gap-4">
                  {r.status === 'solved' ? (
                     <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                       <Check className="w-5 h-5" />
                     </div>
                  ) : (
                     <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                       <AlertTriangle className="w-5 h-5" />
                     </div>
                  )}
                  <div>
                     <p className="text-white font-bold max-w-sm truncate">{r.title || r.slug.replace(/-/g, ' ')}</p>
                     <p className="text-slate-400 text-xs">{(r.topics || []).slice(0,2).join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex flex-col items-end">
                      <span className="text-slate-300 text-sm font-medium">{r.timeSpentMinutes || 0} mins</span>
                      <span className="text-slate-500 text-xs">{new Date(r.startedAt).toLocaleDateString()}</span>
                   </div>
                   <ChevronRight className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
