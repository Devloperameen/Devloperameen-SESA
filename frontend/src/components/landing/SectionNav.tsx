import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, BookOpen, GraduationCap, Play, ImageIcon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const SECTIONS = [
    { id: 'motivation', labelKey: 'motivation' as const, icon: Sparkles },
    { id: 'why-sesa', labelKey: 'whyChooseSesa' as const, icon: Zap },
    { id: 'subjects', labelKey: 'subjects' as const, icon: BookOpen },
    { id: 'grades', labelKey: 'highSchoolPrep' as const, icon: GraduationCap },
    { id: 'demo-videos', labelKey: 'demos' as const, icon: Play },
    { id: 'gallery', labelKey: 'gallery' as const, icon: ImageIcon },
] as const;

const SectionNav: React.FC = () => {
    const { t } = useLanguage();

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="fixed right-4 top-1/2 z-30 -translate-y-1/2 hidden xl:flex flex-col gap-1"
            aria-label="Section navigation"
        >
            {SECTIONS.map((section, i) => (
                <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    whileHover={{ x: 4, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollTo(section.id)}
                    className="flex items-center gap-2 rounded-full bg-white/10 dark:bg-dark-card/90 backdrop-blur-md border border-white/20 dark:border-gray-700 px-3 py-2 text-left text-xs font-medium text-white hover:bg-primary/80 hover:border-primary/50 transition-colors shadow-lg"
                    title={t(section.labelKey)}
                >
                    <section.icon className="h-3.5 w-3.5 flex-shrink-0 text-cyan-300" />
                    <span className="max-w-[80px] truncate">{t(section.labelKey)}</span>
                </motion.button>
            ))}
        </motion.nav>
    );
};

export default SectionNav;
