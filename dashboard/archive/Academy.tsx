// Archived 2026-05-29: Academy mode is temporarily disabled and hidden from
// the dashboard after Electron/YouTube iframe performance issues.
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Focus,
  Link as LinkIcon,
  ListVideo,
  Maximize2,
  Pause,
  Play,
  Plus,
  Save,
  StickyNote,
  Target,
  Trash2,
} from 'lucide-react';
import { Card } from './components/ui/card';

type Chapter = {
  id: string;
  title: string;
  time: number;
};

type Course = {
  id: string;
  title: string;
  url: string;
  videoId: string;
  notes: string;
  sideNotes: string;
  chapters: Chapter[];
  lastTime: number;
  duration: number;
  updatedAt: string;
  completed: boolean;
};

type AcademyStore = {
  activeCourseId: string | null;
  courses: Course[];
};

const STORE_KEY = 'devos.academy.v2';
const DEFAULT_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const starterNotes = `# Study Notes

Use Cmd/Ctrl + J to insert the current timestamp.

Key ideas:
- 

Questions:
- 
`;

function safeParseStore(): AcademyStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { activeCourseId: null, courses: [] };
    const parsed = JSON.parse(raw) as AcademyStore;
    return {
      activeCourseId: parsed.activeCourseId ?? null,
      courses: Array.isArray(parsed.courses) ? parsed.courses : [],
    };
  } catch {
    return { activeCourseId: null, courses: [] };
  }
}

function extractVideoId(raw: string): string {
  try {
    const url = new URL(raw.trim());
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '').split('?')[0];
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v') || '';
    return '';
  } catch {
    return '';
  }
}

function normalizeYoutubeUrl(raw: string): string {
  const videoId = extractVideoId(raw);
  if (!videoId) return raw.trim();
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function extractStartTime(raw: string): number {
  try {
    const url = new URL(raw.trim());
    const t = url.searchParams.get('t') || url.searchParams.get('start') || '0';
    if (/^\d+$/.test(t)) return Number(t);
    const parts = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!parts) return 0;
    return Number(parts[1] || 0) * 3600 + Number(parts[2] || 0) * 60 + Number(parts[3] || 0);
  } catch {
    return 0;
  }
}

function titleFromUrl(raw: string): string {
  const id = extractVideoId(raw);
  return id ? `YouTube Course ${id.slice(0, 6)}` : 'Untitled Course';
}

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function parseTimestampToken(token: string): number | null {
  const clean = token.replace('[', '').replace(']', '').trim();
  const parts = clean.split(':').map(Number);
  if (parts.some(Number.isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function progressPercent(course: Course | null): number {
  if (!course?.duration) return 0;
  return Math.min(100, Math.round((course.lastTime / course.duration) * 100));
}

function timestampSegments(notes: string) {
  return notes.split(/(\[(?:\d{1,2}:)?\d{1,2}:\d{2}\])/g).filter(Boolean);
}

export default function Academy() {
  const playerRef = useRef<ReactPlayer>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const lastPersistedTimeRef = useRef(0);
  const readySeekedRef = useRef<string | null>(null);

  const [store, setStore] = useState<AcademyStore>(() => safeParseStore());
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [activePanel, setActivePanel] = useState<'notes' | 'chapters'>('notes');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);

  const activeCourse = useMemo(
    () => store.courses.find((course) => course.id === store.activeCourseId) ?? store.courses[0] ?? null,
    [store],
  );

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    setSavedPulse(true);
    const timer = window.setTimeout(() => setSavedPulse(false), 700);
    return () => window.clearTimeout(timer);
  }, [store]);

  useEffect(() => {
    if (!activeCourse) {
      setUrlInput('');
      setTitleInput('');
      setCurrentTime(0);
      return;
    }
    setUrlInput(activeCourse.url);
    setTitleInput(activeCourse.title);
    setCurrentTime(activeCourse.lastTime || 0);
    lastPersistedTimeRef.current = activeCourse.lastTime || 0;
    readySeekedRef.current = null;
  }, [activeCourse?.id]);

  useEffect(() => {
    const ipc = (window as any).require?.('electron')?.ipcRenderer;
    if (!ipc) return;
    ipc.send('set-blur-hide', false);
    return () => {
      ipc.send('webview-lost-focus');
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        insertTimestamp();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const updateCourse = (id: string, patch: Partial<Course>) => {
    setStore((prev) => ({
      ...prev,
      activeCourseId: id,
      courses: prev.courses.map((course) =>
        course.id === id ? { ...course, ...patch, updatedAt: new Date().toISOString() } : course,
      ),
    }));
  };

  const createCourse = () => {
    const normalized = normalizeYoutubeUrl(urlInput || DEFAULT_URL);
    const videoId = extractVideoId(normalized);
    const startTime = extractStartTime(urlInput);
    const course: Course = {
      id: `${Date.now()}-${videoId || 'course'}`,
      title: titleInput.trim() || titleFromUrl(normalized),
      url: normalized,
      videoId,
      notes: starterNotes,
      sideNotes: '',
      chapters: [
        { id: `${Date.now()}-intro`, title: 'Start here', time: startTime },
      ],
      lastTime: startTime,
      duration: 0,
      updatedAt: new Date().toISOString(),
      completed: false,
    };
    setStore((prev) => ({ activeCourseId: course.id, courses: [course, ...prev.courses] }));
    setPlaying(false);
  };

  const deleteCourse = (id: string) => {
    setStore((prev) => {
      const courses = prev.courses.filter((course) => course.id !== id);
      return { courses, activeCourseId: courses[0]?.id ?? null };
    });
  };

  const seekTo = (seconds: number) => {
    protectEmbeddedFocus();
    playerRef.current?.seekTo(seconds, 'seconds');
    setCurrentTime(seconds);
    if (activeCourse) updateCourse(activeCourse.id, { lastTime: seconds });
    setPlaying(true);
  };

  const protectEmbeddedFocus = () => {
    try {
      const ipc = (window as any).require?.('electron')?.ipcRenderer;
      ipc?.send('set-blur-hide', false);
    } catch {}
  };

  const playerConfig = useMemo(() => ({
    youtube: {
      playerVars: {
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1,
      },
    },
  }), []);

  const insertTimestamp = () => {
    if (!activeCourse || !notesRef.current) return;
    const stamp = `[${formatTime(currentTime)}] `;
    const target = notesRef.current;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextNotes = `${activeCourse.notes.slice(0, start)}${stamp}${activeCourse.notes.slice(end)}`;
    updateCourse(activeCourse.id, { notes: nextNotes });
    requestAnimationFrame(() => {
      target.focus();
      target.selectionStart = target.selectionEnd = start + stamp.length;
    });
  };

  const addChapter = () => {
    if (!activeCourse) return;
    const title = chapterTitle.trim() || `Checkpoint ${activeCourse.chapters.length + 1}`;
    updateCourse(activeCourse.id, {
      chapters: [...activeCourse.chapters, { id: `${Date.now()}`, title, time: currentTime }]
        .sort((a, b) => a.time - b.time),
    });
    setChapterTitle('');
  };

  const deleteChapter = (id: string) => {
    if (!activeCourse) return;
    updateCourse(activeCourse.id, {
      chapters: activeCourse.chapters.filter((chapter) => chapter.id !== id),
    });
  };

  const courseProgress = progressPercent(activeCourse);
  const lastStudied = activeCourse?.updatedAt
    ? new Date(activeCourse.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Never';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      className={`relative isolate h-full min-h-0 overflow-hidden rounded-[32px] border border-white/10 bg-black p-4 text-slate-100 shadow-[0_26px_80px_rgba(0,0,0,0.55)] ${focusMode ? 'fixed inset-4 z-50' : ''}`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,rgba(139,92,246,0.34),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(20,184,166,0.18),transparent_30%),radial-gradient(circle_at_50%_95%,rgba(236,72,153,0.18),transparent_34%),linear-gradient(135deg,#020617,#000_55%,#050014)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.13]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
          <div className="flex min-w-0 items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -6, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-500/20 text-violet-100 shadow-[0_18px_38px_rgba(124,58,237,0.28)]"
            >
              <BookOpen className="h-5 w-5" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Academy Mode</p>
              <h2 className="truncate text-xl font-black tracking-tight text-white">
                {activeCourse?.title || 'Auto Course Tracker'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300 md:block">
              {savedPulse ? 'Saved now' : `Last study ${lastStudied}`}
            </div>
            <button
              onClick={() => setFocusMode((value) => !value)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.08] px-3 py-2 text-[11px] font-extrabold text-slate-100 transition-all hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-500/15 hover:text-white"
            >
              {focusMode ? <MinimizeIcon /> : <Maximize2 className="h-4 w-4" />}
              {focusMode ? 'Exit Focus' : 'Focus'}
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1.65fr)_minmax(360px,0.95fr)]">
          {!focusMode && (
            <Card className="min-h-0 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
              <div className="border-b border-white/10 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Course Vault</p>
                <div className="space-y-2">
                  <input
                    value={titleInput}
                    onChange={(event) => setTitleInput(event.target.value)}
                    placeholder="Course name"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-violet-300/50 focus:bg-black/50"
                  />
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={urlInput}
                      onChange={(event) => setUrlInput(event.target.value)}
                      placeholder="YouTube URL"
                      className="w-full rounded-2xl border border-white/10 bg-black/35 py-2 pl-9 pr-3 text-xs font-semibold text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-violet-300/50 focus:bg-black/50"
                    />
                  </div>
                  <button
                    onClick={createCourse}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-3 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_14px_34px_rgba(124,58,237,0.28)] transition-all hover:-translate-y-0.5 hover:bg-fuchsia-500"
                  >
                    <Plus className="h-4 w-4" />
                    Track Course
                  </button>
                </div>
              </div>

              <div className="max-h-full space-y-2 overflow-y-auto p-3">
                {store.courses.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.04] p-4 text-center text-xs font-semibold text-slate-400">
                    Add a course URL to begin tracking progress, notes, and chapters.
                  </div>
                )}
                {store.courses.map((course) => (
                  <motion.button
                    key={course.id}
                    whileHover={{ scale: 1.015, y: -1 }}
                    onClick={() => setStore((prev) => ({ ...prev, activeCourseId: course.id }))}
                    className={`group w-full rounded-2xl border p-3 text-left transition-all ${
                      activeCourse?.id === course.id
                        ? 'border-violet-300/35 bg-violet-500/15 text-white shadow-[0_14px_35px_rgba(124,58,237,0.16)]'
                        : 'border-white/10 bg-white/[0.045] text-slate-200 hover:border-white/20 hover:bg-white/[0.075]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-slate-100">{course.title}</p>
                        <p className="mt-1 text-[10px] font-semibold text-slate-400">
                          {formatTime(course.lastTime)} / {course.duration ? formatTime(course.duration) : 'loading'}
                        </p>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteCourse(course.id);
                        }}
                        className="rounded-lg p-1 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: `${progressPercent(course)}%` }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          )}

          <div className={`flex min-h-0 flex-col gap-4 ${focusMode ? 'xl:col-span-2' : ''}`}>
            <Card
              onPointerDownCapture={protectEmbeddedFocus}
              onFocusCapture={protectEmbeddedFocus}
              className="relative min-h-[360px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.55)] ring-1 ring-violet-400/10"
            >
              {activeCourse ? (
                <>
                  <div className="absolute inset-0 bg-black">
                    <ReactPlayer
                      ref={playerRef}
                      url={activeCourse.url}
                      width="100%"
                      height="100%"
                      playing={playing}
                      controls
                      pip
                      progressInterval={1000}
                      config={playerConfig}
                      onReady={() => {
                        protectEmbeddedFocus();
                        if (readySeekedRef.current !== activeCourse.id && activeCourse.lastTime > 0) {
                          playerRef.current?.seekTo(activeCourse.lastTime, 'seconds');
                          readySeekedRef.current = activeCourse.id;
                        }
                      }}
                      onPlay={() => {
                        protectEmbeddedFocus();
                        setPlaying(true);
                      }}
                      onPause={() => setPlaying(false)}
                      onDuration={(duration) => updateCourse(activeCourse.id, { duration })}
                      onProgress={(state) => {
                        setCurrentTime(state.playedSeconds);
                        if (Math.abs(state.playedSeconds - lastPersistedTimeRef.current) > 6) {
                          lastPersistedTimeRef.current = state.playedSeconds;
                          updateCourse(activeCourse.id, { lastTime: state.playedSeconds });
                        }
                      }}
                    />
                  </div>
                  <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_28px_rgba(0,0,0,0.3)]">
                    <span className={`h-2 w-2 rounded-full ${playing ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {playing ? 'Studying' : 'Paused'}
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
                  <ListVideo className="mb-4 h-14 w-14 opacity-30" />
                  <p className="text-sm font-black text-white">No course loaded</p>
                  <p className="mt-2 max-w-sm text-xs font-medium text-slate-400">
                    Paste a YouTube course URL to create a persistent learning workspace.
                  </p>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Progress" value={`${courseProgress}%`} icon={<Target className="h-4 w-4" />} />
              <StatCard label="Current Time" value={formatTime(currentTime)} icon={<Clock className="h-4 w-4" />} />
              <StatCard label="Notes" value={`${activeCourse?.notes.match(/\[(?:\d{1,2}:)?\d{1,2}:\d{2}\]/g)?.length ?? 0}`} icon={<StickyNote className="h-4 w-4" />} />
            </div>
          </div>

          <Card className="flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.055] shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
            <div className="border-b border-white/10 p-3">
              <div className="grid grid-cols-2 rounded-2xl bg-black/30 p-1">
                {(['notes', 'chapters'] as const).map((panel) => (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(panel)}
                    className={`relative rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition-all ${
                      activePanel === panel ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {activePanel === panel && <motion.div layoutId="academy-panel" className="absolute inset-0 rounded-xl bg-violet-500 shadow-[0_10px_28px_rgba(124,58,237,0.22)]" />}
                    <span className="relative z-10">{panel}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activePanel === 'notes' ? (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 p-3">
                    <button
                      onClick={insertTimestamp}
                      disabled={!activeCourse}
                      className="flex items-center gap-2 rounded-2xl bg-violet-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Insert Timestamp
                    </button>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <Save className="h-3.5 w-3.5" />
                      Autosaved
                    </div>
                  </div>

                  <textarea
                    ref={notesRef}
                    value={activeCourse?.notes ?? ''}
                    onChange={(event) => activeCourse && updateCourse(activeCourse.id, { notes: event.target.value })}
                    placeholder="Write timestamped notes here..."
                    className="min-h-[260px] flex-1 resize-none bg-black/20 px-4 py-3 text-sm font-medium leading-6 text-slate-200 outline-none placeholder:text-slate-500"
                  />

                  <div className="max-h-40 overflow-y-auto border-t border-white/10 bg-black/25 p-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Clickable timestamps</p>
                    <div className="flex flex-wrap gap-2">
                      {timestampSegments(activeCourse?.notes ?? '').map((part, index) => {
                        const seconds = part.startsWith('[') ? parseTimestampToken(part) : null;
                        if (seconds === null) return null;
                        return (
                          <button
                            key={`${part}-${index}`}
                            onClick={() => seekTo(seconds)}
                            className="rounded-xl border border-violet-300/20 bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-black text-violet-200 transition-all hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-violet-500/20"
                          >
                            {part}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chapters"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="border-b border-white/10 p-3">
                    <div className="flex gap-2">
                      <input
                        value={chapterTitle}
                        onChange={(event) => setChapterTitle(event.target.value)}
                        placeholder={`Chapter at ${formatTime(currentTime)}`}
                        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-xs font-bold text-slate-100 outline-none placeholder:text-slate-500 focus:border-violet-300/50 focus:bg-black/50"
                      />
                      <button
                        onClick={addChapter}
                        disabled={!activeCourse}
                        className="rounded-2xl bg-violet-500 px-3 py-2 text-white transition-all hover:-translate-y-0.5 hover:bg-fuchsia-500 disabled:bg-slate-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                    {(activeCourse?.chapters ?? []).map((chapter, index) => (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 transition-all hover:border-violet-300/25 hover:bg-violet-500/10"
                      >
                        <button
                          onClick={() => seekTo(chapter.time)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white transition-all group-hover:bg-violet-500"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-slate-100">{index + 1}. {chapter.title}</p>
                          <p className="text-[10px] font-bold text-slate-400">{formatTime(chapter.time)}</p>
                        </div>
                        <button
                          onClick={() => deleteChapter(chapter.id)}
                          className="rounded-lg p-1 text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-white/10 p-3">
                    <textarea
                      value={activeCourse?.sideNotes ?? ''}
                      onChange={(event) => activeCourse && updateCourse(activeCourse.id, { sideNotes: event.target.value })}
                      placeholder="Side notes, resources, links, doubts..."
                      className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/35 p-3 text-xs font-medium text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-300/50 focus:bg-black/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {activeCourse && (
              <div className="flex items-center justify-between border-t border-white/10 p-3">
                <button
                  onClick={() => setPlaying((value) => !value)}
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-slate-200 transition-all hover:border-violet-300/30 hover:text-white"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button
                  onClick={() => updateCourse(activeCourse.id, { completed: !activeCourse.completed })}
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all ${
                    activeCourse.completed ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-slate-400 hover:bg-emerald-400/10 hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {activeCourse.completed ? 'Completed' : 'Mark Complete'}
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 shadow-[0_14px_38px_rgba(0,0,0,0.28)]">
      <div className="mb-2 flex items-center justify-between text-slate-400">
        <span className="text-[10px] font-black uppercase tracking-[0.16em]">{label}</span>
        {icon}
      </div>
      <p className="text-lg font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function MinimizeIcon() {
  return <Focus className="h-4 w-4" />;
}
