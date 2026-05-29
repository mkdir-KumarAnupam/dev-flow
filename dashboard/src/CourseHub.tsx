import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, BookOpen, Layers, Clock, Code, Folder, ExternalLink, Save } from 'lucide-react';
import { Card } from './components/ui/card';

interface Course {
  id: string;
  name: string;
  platform: string;
  url: string;
  progress: number;
  totalTime: number; // in seconds
  workspacePath: string;
}

export default function CourseHub() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseUrl, setNewCourseUrl] = useState('');
  const [newCoursePlatform, setNewCoursePlatform] = useState('');
  
  // Active session state
  const [sessionTime, setSessionTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('devos_courses');
    if (saved) {
      try { setCourses(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('devos_courses', JSON.stringify(courses));
  }, [courses]);

  const activeCourse = courses.find(c => c.id === activeCourseId);

  // Load notes when session starts
  useEffect(() => {
    if (activeCourse) {
      setSessionTime(0);
      const ipc = (window as any).require?.('electron')?.ipcRenderer;
      if (ipc) {
        ipc.invoke('read-course-file', activeCourse.name, 'notes.md').then((content: string) => {
          setNotes(content);
        });
      }
      
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCourseId]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;

    const ipc = (window as any).require?.('electron')?.ipcRenderer;
    let workspacePath = '';
    
    if (ipc) {
      const res = await ipc.invoke('create-course-workspace', newCourseName);
      if (res.success) workspacePath = res.path;
      else { alert('Failed to create workspace: ' + res.error); return; }
    } else {
      // Fallback for non-electron env
      workspacePath = `/mock/path/${newCourseName}`;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      name: newCourseName,
      platform: newCoursePlatform || 'YouTube',
      url: newCourseUrl,
      progress: 0,
      totalTime: 0,
      workspacePath
    };

    setCourses([...courses, newCourse]);
    setIsAddingCourse(false);
    setNewCourseName('');
    setNewCourseUrl('');
    setNewCoursePlatform('');
  };

  const saveNotes = async () => {
    if (!activeCourse) return;
    setIsSaving(true);
    const ipc = (window as any).require?.('electron')?.ipcRenderer;
    if (ipc) {
      await ipc.invoke('write-course-file', activeCourse.name, 'notes.md', notes);
    }
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleEndSession = async () => {
    if (!activeCourse) return;
    await saveNotes();
    setCourses(prev => prev.map(c => 
      c.id === activeCourse.id ? { ...c, totalTime: c.totalTime + sessionTime } : c
    ));
    setActiveCourseId(null);
  };

  const insertTimestamp = () => {
    // Insert a blank timestamp bracket so the user can fill it if they have the youtube URL
    const timeStr = `[${formatTime(sessionTime)}] `;
    setNotes(prev => prev + '\n' + timeStr);
  };

  const formatTime = (seconds: number) => {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = Math.floor(seconds % 60);
    if (hh > 0) return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  };


  const openVSCode = (courseName: string) => {
    const ipc = (window as any).require?.('electron')?.ipcRenderer;
    if (ipc) ipc.send('open-in-vscode', courseName);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  if (activeCourse) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-140px)] flex flex-col p-6 gap-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              {activeCourse.name}
            </h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><Folder className="w-4 h-4" /> {activeCourse.workspacePath}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Session Time</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-xl text-emerald-400 font-mono text-xl font-bold shadow-inner">
                <Clock className="w-5 h-5 text-emerald-500/50" />
                {formatTime(sessionTime)}
              </div>
            </div>
            <button onClick={handleEndSession} className="px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold transition-colors">
              End Session
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          <Card className="flex-[2] glass-panel h-full flex flex-col rounded-2xl shadow-xl overflow-hidden border border-slate-200/50 dark:border-white/5 relative">
            <div className="p-3 border-b border-slate-200/50 dark:border-white/5 bg-white/20 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                notes.md
              </div>
              <div className="flex items-center gap-2">
                <button onClick={insertTimestamp} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-white/10 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-colors">
                  <Clock className="w-3 h-3" /> Timestamp
                </button>
                <button onClick={saveNotes} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-md flex items-center gap-1.5 transition-colors">
                  <Save className="w-3 h-3" /> {isSaving ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNotes(); } }}
              className="flex-1 w-full bg-transparent p-6 text-sm text-slate-800 dark:text-slate-200 resize-none focus:outline-none font-mono leading-relaxed"
              placeholder="# Notes\n\nStart typing your notes here..."
            />
          </Card>

          <div className="flex-[1] flex flex-col gap-4">
             <Card className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center border border-white/5">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-200">Course Workspace</h3>
                <p className="text-xs text-slate-400 mb-2">Write code and follow along with the course inside a dedicated VS Code workspace.</p>
                <button onClick={() => openVSCode(activeCourse.name)} className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2">
                  <ExternalLink className="w-4 h-4" /> Open VS Code
                </button>
             </Card>
             
             {activeCourse.url && (
               <Card className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center border border-white/5">
                 <h3 className="font-bold text-slate-200">Course Link</h3>
                 <a href={activeCourse.url} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all truncate px-4">
                   {activeCourse.url}
                 </a>
               </Card>
             )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="h-[calc(100vh-140px)] flex flex-col p-6 gap-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Course Hub</h2>
          <p className="text-sm font-medium text-slate-400 mt-1">Active trackers and local workspaces for your learning.</p>
        </div>
        <button onClick={() => setIsAddingCourse(!isAddingCourse)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all">
          <Plus className="w-4 h-4" /> New Course
        </button>
      </div>

      <AnimatePresence>
        {isAddingCourse && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <Card className="glass-panel p-6 mb-6 border border-emerald-500/30 rounded-2xl bg-emerald-500/5">
              <form onSubmit={handleCreateCourse} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Course Name</label>
                  <input autoFocus type="text" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} required className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="e.g. Next.js Masterclass" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">URL (Optional)</label>
                  <input type="text" value={newCourseUrl} onChange={e => setNewCourseUrl(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500" placeholder="YouTube or Course URL" />
                </div>
                <button type="submit" className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg shadow-md transition-all h-[42px]">
                  Create Workspace
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {courses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <Layers className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-bold">No Courses Yet</p>
          <p className="text-xs mt-2">Click New Course to create a workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <motion.div key={course.id} variants={itemVariants}>
              <Card className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-slate-200 mb-1 truncate">{course.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <span className="px-2 py-0.5 bg-white/5 rounded-md">{course.platform}</span>
                      <span>{formatTime(course.totalTime)} spent</span>
                    </div>
                  </div>
                  <button onClick={() => openVSCode(course.name)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Open VS Code">
                    <Code className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-auto pt-4 flex gap-3">
                  <button onClick={() => setActiveCourseId(course.id)} className="flex-1 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Start Session
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
