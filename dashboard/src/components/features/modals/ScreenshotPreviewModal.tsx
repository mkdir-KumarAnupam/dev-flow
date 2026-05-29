import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGlobalApp } from '@/context/GlobalAppContext';

const mV: any = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } }, exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.12 } } };

export default function ScreenshotPreviewModal() {
  const { captureModal, setCaptureModal } = useGlobalApp();
  const API_BASE = typeof window !== 'undefined' && window.location.protocol.startsWith('http') && window.location.port !== '5173' ? window.location.origin : 'http://localhost:4000';
  const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  return (
    <AnimatePresence>
        {captureModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6"
            onClick={() => setCaptureModal(null)}>
            <motion.div variants={mV} initial="hidden" animate="show" exit="exit"
              onClick={e => e.stopPropagation()}
              className="glass-modal rounded-2xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="p-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <p className="text-xs font-semibold text-foreground">{captureModal.fileName}</p>
                  <p className="text-[10px] text-slate-400">{captureModal.project}</p>
                </div>
                <button onClick={() => setCaptureModal(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              {/* Image */}
              <div className="overflow-auto flex-1 flex items-center justify-center p-4 bg-slate-50">
                <motion.img
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
                  src={apiUrl(`/api/capture-image?path=${encodeURIComponent(captureModal.path)}`)}
                  alt={captureModal.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
