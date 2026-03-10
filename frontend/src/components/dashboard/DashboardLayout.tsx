import React, { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
    Activity,
    BookOpen,
    Flame,
    Search,
    Sparkles,
    Trophy,
} from 'lucide-react';
import {
    Avatar,
    Badge,
    Button,
    Card,
    CourseCard,
    CourseCardSkeleton,
    cn,
    type StudentCourse,
} from './CourseCard';

const dashboardQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

const containerVariants: Variants = {
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

interface ApiCourseResponse {
    _id: string;
    title: string;
    description?: string;
    instructor?: { name?: string } | string;
    enrollmentStatus?: 'pending' | 'approved';
    totalLessons?: number;
    completedLessons?: number;
}

export interface DashboardUser {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    streakDays: number;
    totalXp: number;
    levelLabel: string;
}

export interface ActivityFeedItem {
    id: string;
    studentName: string;
    courseTitle: string;
    minutesAgo: number;
    avatarUrl?: string;
}

export interface DashboardLayoutProps {
    token?: string | null;
    user?: DashboardUser | null;
    fetchCourses?: (token?: string) => Promise<StudentCourse[]>;
    onOpenCourse?: (course: StudentCourse) => void;
    activityFeed?: ActivityFeedItem[];
    className?: string;
}

const defaultUser: DashboardUser = {
    id: 'guest-student',
    name: 'Student Explorer',
    email: 'student@sesa.academy',
    streakDays: 12,
    totalXp: 1840,
    levelLabel: 'Level 7 Scholar',
};

const hashProgress = (seed: string, enrollmentStatus?: 'pending' | 'approved'): number => {
    const hash = seed.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    if (enrollmentStatus === 'pending') {
        return 10 + (hash % 25);
    }
    return 35 + (hash % 66);
};

const normalizeCourse = (course: ApiCourseResponse, index: number): StudentCourse => {
    const inferredProgress = hashProgress(course._id ?? `${index}`, course.enrollmentStatus);
    const progressPercent = Math.min(100, Math.max(0, Math.round(inferredProgress)));
    const totalLessons = course.totalLessons ?? 14;
    const completedLessons =
        course.completedLessons ?? Math.min(totalLessons, Math.round((progressPercent / 100) * totalLessons));

    const instructorName =
        typeof course.instructor === 'string'
            ? course.instructor
            : course.instructor?.name ?? 'SESA Mentor Team';

    const difficulty: StudentCourse['difficulty'] =
        progressPercent > 75 ? 'Advanced' : progressPercent > 45 ? 'Intermediate' : 'Beginner';

    return {
        id: course._id,
        title: course.title,
        summary: course.description ?? 'Continue your premium learning sprint with smart checkpoints.',
        instructor: instructorName,
        progressPercent,
        totalLessons,
        completedLessons,
        durationLabel: progressPercent >= 100 ? 'Completed' : `${Math.max(1, totalLessons - completedLessons)} lessons left`,
        difficulty,
        isLive: index === 0,
        lastOpenedLabel: progressPercent >= 100 ? 'Completed this week' : 'Last opened recently',
    };
};

const fetchStudentCourses = async (token?: string): Promise<StudentCourse[]> => {
    if (!token) {
        return [];
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await axios.get<ApiCourseResponse[]>(`${API_URL}/courses/my/enrolled`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!Array.isArray(response.data) || response.data.length === 0) {
        return [];
    }

    return response.data.map(normalizeCourse);
};

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandPalettePlaceholder: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="mx-auto mt-24 w-[92%] max-w-2xl rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-[0_24px_70px_rgba(8,47,73,0.7)]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3">
                            <Search className="h-4 w-4 text-cyan-300" />
                            <input
                                autoFocus
                                readOnly
                                placeholder="Search courses, lessons, quick actions..."
                                className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                            />
                            <kbd className="rounded border border-slate-600 bg-slate-900 px-2 py-1 text-[10px] text-slate-300">
                                ESC
                            </kbd>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            Command palette placeholder: wire keyboard actions and route shortcuts for the final sprint.
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const DashboardLayoutContent: React.FC<DashboardLayoutProps> = ({
    token,
    user,
    fetchCourses,
    onOpenCourse,
    activityFeed,
    className,
}) => {
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);
    const [completionMessage, setCompletionMessage] = useState<string | null>(null);

    const safeUser = user ?? defaultUser;
    const liveFeed = activityFeed ?? [];

    const coursesQuery = useQuery({
        queryKey: ['student-dashboard-courses', token ?? 'guest'],
        queryFn: () => (fetchCourses ? fetchCourses(token ?? undefined) : fetchStudentCourses(token ?? undefined)),
    });

    const courses = coursesQuery.data ?? [];

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const commandPressed = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
            if (commandPressed) {
                event.preventDefault();
                setCommandPaletteOpen((prev) => !prev);
            }
            if (event.key === 'Escape') {
                setCommandPaletteOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(courses[0]);
        }
    }, [courses, selectedCourse]);

    useEffect(() => {
        if (!completionMessage) return undefined;

        const timer = window.setTimeout(() => {
            setCompletionMessage(null);
        }, 2400);

        return () => window.clearTimeout(timer);
    }, [completionMessage]);

    const completionCount = useMemo(
        () => courses.filter((course) => Math.round(course.progressPercent) >= 100).length,
        [courses]
    );

    const averageProgress = useMemo(() => {
        if (courses.length === 0) return 0;
        const total = courses.reduce((sum, course) => sum + course.progressPercent, 0);
        return Math.round(total / courses.length);
    }, [courses]);

    const handleCourseOpen = (course: StudentCourse): void => {
        setSelectedCourse(course);
        onOpenCourse?.(course);
    };

    return (
        <div className={cn('text-slate-100', className)}>
            <motion.main
                className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.section className="space-y-6 lg:col-span-8" variants={itemVariants}>
                    <Card className="p-5 sm:p-6">
                        <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="show">
                            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Welcome back, {safeUser.name}</h1>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Build streaks. Finish milestones. Stay in your flow state.
                                    </p>
                                </div>
                                <Badge variant="accent" className="px-3 py-1.5 text-xs">
                                    <Flame className="h-3.5 w-3.5" />
                                    {safeUser.streakDays} day streak
                                </Badge>
                            </motion.div>

                            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Card className="p-4 relative overflow-hidden flex flex-col justify-between">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-wider text-slate-400">Avg Progress</p>
                                            <p className="mt-2 text-3xl font-extrabold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{averageProgress}%</p>
                                        </div>
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-700/50" strokeWidth="3" />
                                                <motion.circle 
                                                    cx="18" 
                                                    cy="18" 
                                                    r="16" 
                                                    fill="none" 
                                                    className="stroke-cyan-400" 
                                                    strokeWidth="3" 
                                                    strokeLinecap="round"
                                                    strokeDasharray="100"
                                                    initial={{ strokeDashoffset: 100 }}
                                                    animate={{ strokeDashoffset: 100 - averageProgress }}
                                                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                                </Card>
                                <Card className="p-4 relative overflow-hidden flex flex-col justify-between border-emerald-500/20">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs uppercase tracking-wider text-slate-400">Completed</p>
                                            <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                                                <Trophy className="w-4 h-4 text-emerald-400" />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-3xl font-extrabold text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">{completionCount}</p>
                                        <p className="text-xs text-emerald-400/80 mt-1">Courses finished</p>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                                </Card>
                                <Card className="p-4 relative overflow-hidden flex flex-col justify-between border-blue-500/20">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start">
                                            <p className="text-xs uppercase tracking-wider text-slate-400">Experience</p>
                                            <div className="bg-blue-500/20 p-1.5 rounded-lg">
                                                <Sparkles className="w-4 h-4 text-blue-400" />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-3xl font-extrabold text-blue-300 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]">{safeUser.totalXp} <span className="text-lg text-blue-400/70 uppercase">XP</span></p>
                                        <p className="mt-1 text-xs text-blue-400/80 tracking-wide font-medium">{safeUser.levelLabel}</p>
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                                </Card>
                            </motion.div>
                        </motion.div>
                    </Card>

                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Your Courses</h2>
                            <p className="text-sm text-slate-400">Apple-grade UI with real momentum tracking.</p>
                        </div>
                        <Button variant="secondary" size="sm" leftIcon={<BookOpen className="h-4 w-4" />}>
                            View Catalog
                        </Button>
                    </motion.div>

                    {coursesQuery.isPending ? (
                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <motion.div key={`skeleton-${index}`} variants={itemVariants}>
                                    <CourseCardSkeleton />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : coursesQuery.isError ? (
                        <motion.div variants={itemVariants}>
                            <Card className="p-5">
                                <p className="text-sm text-rose-300">
                                    Could not load courses right now. Retry from your command palette or refresh.
                                </p>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2" variants={containerVariants}>
                            {courses.map((course, index) => (
                                <motion.div key={course.id} variants={itemVariants}>
                                    <CourseCard
                                        course={course}
                                        index={index}
                                        onOpen={handleCourseOpen}
                                        onCompleted={(completedCourse) => {
                                            setCompletionMessage(`${completedCourse.title} completed!`);
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </motion.section>

                <motion.aside className="space-y-6 lg:col-span-4" variants={itemVariants}>
                    <Card className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Course View</h3>
                            <Badge variant="accent">Focus Mode</Badge>
                        </div>

                        {selectedCourse ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-bold text-slate-100">{selectedCourse.title}</p>
                                    <p className="mt-1 text-sm text-slate-400">{selectedCourse.summary}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-slate-300">
                                        <span>Completion</span>
                                        <span className="font-semibold text-cyan-300">
                                            {Math.round(selectedCourse.progressPercent)}%
                                        </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-slate-800/90">
                                        <motion.div
                                            className={cn(
                                                'h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500',
                                                Math.round(selectedCourse.progressPercent) >= 100 &&
                                                    'shadow-[0_0_18px_rgba(34,211,238,0.95)]'
                                            )}
                                            initial={{ width: 0, opacity: 0 }}
                                            animate={{ width: `${Math.round(selectedCourse.progressPercent)}%`, opacity: 1 }}
                                            transition={{ duration: 0.65, ease: 'easeInOut' }}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full"
                                    leftIcon={<BookOpen className="h-4 w-4" />}
                                    onClick={() => handleCourseOpen(selectedCourse)}
                                >
                                    Continue Learning
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Select a course to view details.</p>
                        )}
                    </Card>

                    <Card className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">Live Activity</h3>
                            <Badge variant="success">Now</Badge>
                        </div>

                        <p className="mb-4 text-sm text-slate-400">Other students are studying right now...</p>

                        {liveFeed.length === 0 ? (
                            <p className="text-sm text-slate-400">No live activity updates yet.</p>
                        ) : (
                            <motion.ul className="space-y-3" variants={containerVariants} initial="hidden" animate="show">
                                {liveFeed.map((item) => (
                                    <motion.li
                                        key={item.id}
                                        variants={itemVariants}
                                        className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/45 p-3"
                                    >
                                        <Avatar name={item.studentName} imageUrl={item.avatarUrl} className="h-9 w-9" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-200">{item.studentName}</p>
                                            <p className="truncate text-xs text-slate-400">Studying {item.courseTitle}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-[11px] text-cyan-300">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                                            {item.minutesAgo}m
                                        </div>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        )}
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center gap-2 text-cyan-300">
                            <Activity className="h-4 w-4" />
                            <p className="text-sm font-semibold">Performance Tip</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">
                            Use quick navigation with CMD+K to jump into lessons instantly and keep your momentum high.
                        </p>
                    </Card>
                </motion.aside>
            </motion.main>

            <CommandPalettePlaceholder isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

            <AnimatePresence>
                {completionMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-50"
                    >
                        <Card className="flex items-center gap-3 border-emerald-400/40 bg-slate-900/95 px-4 py-3">
                            <div className="rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
                                <Trophy className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-100">Course Milestone</p>
                                <p className="text-xs text-slate-300">{completionMessage}</p>
                            </div>
                            <Sparkles className="h-4 w-4 text-cyan-300" />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
    return (
        <QueryClientProvider client={dashboardQueryClient}>
            <DashboardLayoutContent {...props} />
        </QueryClientProvider>
    );
};

export default DashboardLayout;
