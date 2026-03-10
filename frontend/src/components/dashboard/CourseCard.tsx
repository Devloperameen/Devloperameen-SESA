import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Clock3, PlayCircle, Sparkles, Trophy } from 'lucide-react';
import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SafeImage } from '../ui/SafeImage';

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export interface StudentCourse {
    id: string;
    title: string;
    summary: string;
    instructor: string;
    progressPercent: number;
    totalLessons: number;
    completedLessons: number;
    durationLabel: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    thumbnail?: string;
    tags?: string[];
    isLive?: boolean;
    lastOpenedLabel?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const buttonVariantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
        'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_10px_30px_rgba(34,211,238,0.28)] hover:from-cyan-400 hover:to-blue-400',
    secondary:
        'bg-slate-800/85 text-cyan-100 border border-slate-700 hover:border-cyan-500/60 hover:text-white',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-cyan-200 border border-transparent',
};

const buttonSizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-sm',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            leftIcon,
            rightIcon,
            children,
            type = 'button',
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
                    buttonVariantStyles[variant],
                    buttonSizeStyles[size],
                    className
                )}
                {...props}
            >
                {leftIcon}
                {children}
                {rightIcon}
            </button>
        );
    }
);

Button.displayName = 'Button';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
    <div
        className={cn(
            'rounded-2xl border border-slate-800/80 bg-slate-900/35 backdrop-blur-xl shadow-[0_12px_40px_rgba(3,10,20,0.45)]',
            className
        )}
        {...props}
    >
        {children}
    </div>
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'accent' | 'success' | 'warning';
}

const badgeVariantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-slate-800 text-slate-200 border border-slate-700',
    accent: 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-400/30',
};

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => (
    <span
        className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
            badgeVariantStyles[variant],
            className
        )}
        {...props}
    >
        {children}
    </span>
);

export interface AvatarProps {
    name: string;
    imageUrl?: string;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, imageUrl, className }) => {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

    const fallback = <span className="text-xs font-bold text-cyan-100">{initials || 'ST'}</span>;

    return (
        <div
            className={cn(
                'relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan-400/30 bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-cyan-100',
                className
            )}
        >
            {imageUrl ? (
                <SafeImage
                    src={imageUrl}
                    alt={name}
                    wrapperClassName="rounded-full"
                    fallback={fallback}
                />
            ) : (
                <span>{initials || 'ST'}</span>
            )}
        </div>
    );
};

interface ConfettiPiece {
    id: number;
    x: number;
    y: number;
    rotate: number;
    delay: number;
    color: string;
}

const confettiColors = ['#22d3ee', '#38bdf8', '#818cf8', '#34d399', '#e879f9', '#fbbf24'];

const ConfettiBurst: React.FC<{ active: boolean }> = ({ active }) => {
    const pieces = useMemo<ConfettiPiece[]>(() => {
        return Array.from({ length: 24 }, (_, index) => {
            const angle = (index / 24) * Math.PI * 2;
            const radius = 42 + (index % 6) * 16;
            return {
                id: index,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius - 36,
                rotate: (index * 37) % 360,
                delay: (index % 8) * 0.025,
                color: confettiColors[index % confettiColors.length],
            };
        });
    }, []);

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    className="pointer-events-none absolute inset-0 z-40"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {pieces.map((piece) => (
                        <motion.span
                            key={piece.id}
                            className="absolute left-1/2 top-1/2 h-2.5 w-1.5 rounded-sm"
                            style={{ backgroundColor: piece.color }}
                            initial={{ x: 0, y: 0, opacity: 0, rotate: 0, scale: 0 }}
                            animate={{
                                x: piece.x,
                                y: piece.y,
                                opacity: [0, 1, 1, 0],
                                rotate: piece.rotate,
                                scale: [0, 1, 1, 0.8],
                            }}
                            transition={{ duration: 1.1, delay: piece.delay, ease: 'easeOut' }}
                        />
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export interface CourseCardProps {
    course: StudentCourse;
    index?: number;
    onOpen?: (course: StudentCourse) => void;
    onCompleted?: (course: StudentCourse) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, index = 0, onOpen, onCompleted }) => {
    const normalizedProgress = Math.min(100, Math.max(0, Math.round(course.progressPercent)));
    const isCompleted = normalizedProgress >= 100;
    const [showConfetti, setShowConfetti] = useState(false);
    const celebratedRef = useRef(false);

    useEffect(() => {
        if (isCompleted && !celebratedRef.current) {
            celebratedRef.current = true;
            setShowConfetti(true);
            onCompleted?.(course);

            const timer = window.setTimeout(() => {
                setShowConfetti(false);
            }, 1600);

            return () => window.clearTimeout(timer);
        }

        if (!isCompleted) {
            celebratedRef.current = false;
        }

        return undefined;
    }, [isCompleted, course, onCompleted]);

    const difficultyVariant: BadgeProps['variant'] =
        course.difficulty === 'Advanced' ? 'warning' : course.difficulty === 'Intermediate' ? 'accent' : 'default';

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.34, ease: 'easeOut' }}
            className="relative"
        >
            <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/45 hover:shadow-[0_18px_44px_rgba(14,165,233,0.2)]">
                <ConfettiBurst active={showConfetti} />

                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-100">{course.title}</h3>
                            {course.isLive && <Badge variant="accent">Live</Badge>}
                        </div>
                        <p className="line-clamp-2 text-sm text-slate-300/90">{course.summary}</p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2.5 text-cyan-300">
                        {isCompleted ? <Trophy className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant={difficultyVariant}>{course.difficulty}</Badge>
                    <Badge variant="default">
                        <Clock3 className="h-3.5 w-3.5" />
                        {course.durationLabel}
                    </Badge>
                    <Badge variant={isCompleted ? 'success' : 'accent'}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {course.completedLessons}/{course.totalLessons} lessons
                    </Badge>
                </div>

                <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
                    <span>Progress</span>
                    <span className={cn('font-semibold', isCompleted ? 'text-emerald-300' : 'text-cyan-300')}>
                        {normalizedProgress}%
                    </span>
                </div>

                <div className="mb-5 h-2.5 rounded-full bg-slate-800/90">
                    <motion.div
                        className={cn(
                            'h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500',
                            isCompleted &&
                                'from-emerald-300 via-cyan-300 to-blue-300 shadow-[0_0_22px_rgba(45,212,191,0.95)]'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${normalizedProgress}%` }}
                        transition={{ duration: 0.7, ease: 'easeInOut' }}
                    />
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                        <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-cyan-300" />
                        <span className="truncate">{course.lastOpenedLabel ?? `Instructor: ${course.instructor}`}</span>
                    </div>

                    <Button
                        size="sm"
                        leftIcon={<PlayCircle className="h-4 w-4" />}
                        onClick={() => onOpen?.(course)}
                        className="flex-shrink-0"
                    >
                        {isCompleted ? 'Review' : 'Continue'}
                    </Button>
                </div>
            </Card>
        </motion.article>
    );
};

export const CourseCardSkeleton: React.FC = () => {
    return (
        <Card className="animate-pulse p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div className="w-full space-y-2">
                    <div className="h-5 w-3/4 rounded-md bg-slate-700/60" />
                    <div className="h-4 w-full rounded-md bg-slate-800/60" />
                    <div className="h-4 w-5/6 rounded-md bg-slate-800/60" />
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-700/60" />
            </div>

            <div className="mb-4 flex gap-2">
                <div className="h-6 w-20 rounded-full bg-slate-700/60" />
                <div className="h-6 w-24 rounded-full bg-slate-700/60" />
                <div className="h-6 w-28 rounded-full bg-slate-700/60" />
            </div>

            <div className="mb-3 h-2.5 w-full rounded-full bg-slate-800/70" />

            <div className="flex items-center justify-between">
                <div className="h-4 w-40 rounded-md bg-slate-800/60" />
                <div className="h-9 w-24 rounded-xl bg-slate-700/60" />
            </div>
        </Card>
    );
};
