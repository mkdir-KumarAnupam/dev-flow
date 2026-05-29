
import { motion } from 'framer-motion';

const fadeUp: any = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const SectionHeader = ({ children }: any) => (
  <motion.h2 variants={fadeUp} className="text-[10px] font-bold text-slate-600 dark:text-slate-200 uppercase tracking-[0.2em] pt-2 pb-1">{children}</motion.h2>
);

export default SectionHeader;
