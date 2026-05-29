import { motion, AnimatePresence } from 'framer-motion';
import Whiteboard from '@/Whiteboard';
import { useGlobalApp } from '@/context/GlobalAppContext';

export default function SketchUpdateModal() {
  const { sketchModal, setSketchModal, fetchAll, projects } = useGlobalApp();

  return (
    <AnimatePresence>
        {sketchModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6" onClick={() => setSketchModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full h-full glass-modal rounded-2xl overflow-hidden flex flex-col relative">
              <Whiteboard sketch={sketchModal.sketch} sketchIndex={sketchModal.index} projects={projects} onClose={() => setSketchModal(null)} onSave={() => fetchAll()} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}
