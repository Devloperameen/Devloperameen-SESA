import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Menu, X, Sun, Moon, LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const { user, logout, isAuthenticated } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };

    React.useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const element = document.querySelector(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, []);

    const navLinks = [
        { name: t('home'), path: '/', isHash: false },
        { name: t('motivation'), path: '/#motivation', isHash: true },
        { name: t('subjects'), path: '/#subjects', isHash: true },
        { name: t('marketplace'), path: '/marketplace', isHash: false },
        { name: t('gallery'), path: '/#gallery', isHash: true },
        { name: t('faq'), path: '/faq', isHash: false },
        { name: t('dashboard'), path: '/dashboard', isHash: false },
    ];

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string, isHash: boolean) => {
        if (isHash && window.location.pathname === '/') {
            e.preventDefault();
            const hash = path.startsWith('/#') ? path.slice(2) : path.replace('/', '');
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setIsOpen(false);
            }
        } else {
            setIsOpen(false);
        }
    };

    return (
        <nav className="bg-white dark:bg-dark-card shadow-premium sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <GraduationCap className="text-primary w-8 h-8" />
                    </motion.div>
                    <span className="font-bold text-xl text-dark-bg dark:text-light">SESA Academy</span>
                </Link>

                <div className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link, i) => (
                        <motion.div key={link.name} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <Link
                                to={link.path}
                                onClick={(e) => handleNavClick(e, link.path, link.isHash)}
                                className="font-medium text-dark-bg dark:text-dark-text hover:text-primary transition-colors relative group inline-block py-1"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                            </Link>
                        </motion.div>
                    ))}

                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-primary text-white' : 'text-gray-500'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLanguage('am')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${language === 'am' ? 'bg-primary text-white' : 'text-gray-500'}`}
                        >
                            AM
                        </button>
                    </div>

                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-primary/20 text-yellow-400 ring-2 ring-primary/30' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 fill-current" /> : <Moon className="w-5 h-5 fill-current" />}
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium">Hello, {user?.name}</span>
                            <button
                                onClick={logout}
                                className="btn-primary flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-all"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/auth"
                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-secondary transition-all shadow-md inline-flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            {t('loginRegister')}
                        </Link>
                    )}
                </div>

                <div className="lg:hidden flex items-center space-x-4">
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                        {isDarkMode ? <Sun className="w-6 h-6 fill-current" /> : <Moon className="w-6 h-6 fill-current" />}
                    </button>
                    <button onClick={() => setIsOpen((prev) => !prev)}>
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800 px-4 py-4"
                    >
                        <div className="flex flex-col space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={(e) => handleNavClick(e, link.path, link.isHash)}
                                    className="font-medium text-dark-bg dark:text-light hover:text-primary transition-colors py-2"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-primary text-white' : 'text-gray-500'}`}
                                >
                                    English
                                </button>
                                <button
                                    onClick={() => setLanguage('am')}
                                    className={`flex-1 px-3 py-2 text-xs font-bold rounded-lg transition-all ${language === 'am' ? 'bg-primary text-white' : 'text-gray-500'}`}
                                >
                                    Amharic
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <div className="text-center py-2 text-sm font-medium text-dark-bg dark:text-light">
                                            Hello, {user?.name}
                                        </div>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            className="btn-primary text-center flex items-center justify-center"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" /> {t('logout')}
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/auth"
                                        onClick={() => setIsOpen(false)}
                                        className="btn-primary text-center"
                                    >
                                        {t('loginRegister')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
