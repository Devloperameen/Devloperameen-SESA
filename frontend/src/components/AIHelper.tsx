import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, User, Trash2, ChevronRight } from 'lucide-react';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const QUICK_ACTIONS = [
    { label: '📚 How to enroll?', query: 'How do I enroll in a course?' },
    { label: '💳 Payment options', query: 'What payment methods do you accept?' },
    { label: '📊 My dashboard', query: 'What can I see in my dashboard?' },
    { label: '🎓 Certificates', query: 'How do I get a certificate?' },
    { label: '👨‍🏫 Become instructor', query: 'How can I become an instructor?' },
];

const AIHelper: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Hi there! I am the SESA AI Assistant 🎓 How can I help you today?',
            sender: 'ai',
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const generateAIResponse = (input: string): string => {
        const lowerInput = input.trim().toLowerCase();
        
        const knowledgeBase = [
            {
                pattern: /\b(?:hi|hello|hey|greetings|morning|afternoon|evening|wassup|ola)\b/i,
                responses: [
                    "Hello! I am SESA's intelligent assistant. Ready to learn something new today? 🚀",
                    "Hi there! How can I assist you with your SESA learning journey today?",
                    "Greetings! Let me know if you need help finding a course, understanding billing, or navigating the platform. 😊"
                ]
            },
            {
                pattern: /\b(?:enroll|pay|upgrade|buy|purchase|part 1|part 2|premium|price|cost|free|money|birr|bank|telebirr|payment)\b/i,
                responses: [
                    "To enroll in a course, start by watching the first part for free! Once you're ready, click 'Pay & Enroll' to unlock everything. 💳 We support Telebirr, CBE Birr, Awash Bank, Bank of Abyssinia, and Credit/Debit Cards. Just upload your receipt screenshot for verification!",
                    "Our payment process is flexible! High school courses offer 2 free preview videos, while general tech courses offer 1. After the preview, pay via local Ethiopian banks (CBE, Awash, Telebirr) or Card. Upload your receipt on the payment page for admin approval. ✅"
                ]
            },
            {
                pattern: /\b(?:dashboard|progress|track|navigate|where|find|xp|level|chart|graph)\b/i,
                responses: [
                    "Your Dashboard is your personalized learning hub! 📊 It features dynamic charts tracking your average progress, XP points, and course completions. Navigate to 'Dashboard' from the sidebar to see everything. Is there a specific metric you want to find?",
                    "We've made the dashboard highly visual! You can see your learning journey through interactive graphs and animations showing XP, enrolled courses, and your streak. 🔥"
                ]
            },
            {
                pattern: /\b(?:certificate|certificates?|diploma)\b/i,
                responses: [
                    "Certificates 🏆 are automatically generated when you complete a course. Just navigate to 'Certificates' in your student dashboard sidebar to download your PDF certificate! Make sure you've completed all lessons first.",
                ]
            },
            {
                pattern: /\b(?:teach|instructor|create|upload|publish|teacher|add course)\b/i,
                responses: [
                    "Instructors play a huge role here! 👨‍🏫 If you have instructor access, build structured courses by going to 'Create Course'. Add multiple lessons with YouTube video URLs. Our Admin team reviews your curriculum before it goes live! 🎬"
                ]
            },
            {
                pattern: /\b(?:grade 9|grade 10|grade 11|grade 12|high school|grade|class|category|categories)\b/i,
                responses: [
                    "SESA has dedicated sections for High School (Grades 9–12) and General Tech courses. 📘 Standard students default to Grade 9, Premium students access all grades! Use the dropdown in 'Browse Courses' to filter by your exact grade level."
                ]
            },
            {
                pattern: /\b(?:admin|approve|reject|feedback|comment|verify)\b/i,
                responses: [
                    "Our platform includes a robust Admin approval workflow. 🔒 Admins review student payment receipts and instructor course submissions. If something isn't right, Admins provide specific feedback so students and teachers know exactly what to fix!"
                ]
            },
            {
                pattern: /\b(?:video|youtube|embed|watch|play|locked|unlock|lesson)\b/i,
                responses: [
                    "Courses are structured lesson-by-lesson! 🎬 When you browse a course, you can smoothly transition between unlocked video lessons. Locked lessons clearly show an overlay — just complete your enrollment to instantly unlock all secure embedded videos!"
                ]
            },
            {
                pattern: /\b(?:error|bug|fail|not working|broken|help|support|contact|issue|crash|load)\b/i,
                responses: [
                    "I'm sorry you're running into issues! 😔 Sometimes 'Failed to load' errors happen if the server is restarting or your token expired. Try logging out and back in. If issues persist, reach out to support@sesa.academy with a screenshot!"
                ]
            },
            {
                pattern: /\b(?:learn|study|subject|math|science|physics|chemistry|biology|english|react|node|mern|programming|python|javascript)\b/i,
                responses: [
                    "SESA offers everything from core academics (Physics, Math, Biology) to advanced Tech stacks (MERN, React, Node.js, Python). 💻 Explore our catalog to find structured curriculums taught by expert Ethiopian instructors!"
                ]
            },
            {
                pattern: /\b(?:who are you|what are you|ai|bot|name|intelligent|smart)\b/i,
                responses: [
                    "I am the SESA AI Assistant! 🤖 I understand our entire platform ecosystem — from student enrollment and structured video lessons to instructor course creation and admin payment verification workflows. How can I intelligently assist you today?"
                ]
            },
            {
                pattern: /\b(?:streak|fire|daily|habit|consistent)\b/i,
                responses: [
                    "Your daily learning streak 🔥 is tracked on your dashboard! Log in and watch at least one lesson per day to keep your streak alive. The longer your streak, the more XP you earn! Consistency is the key to mastery. 💪"
                ]
            }
        ];

        for (const kb of knowledgeBase) {
            if (kb.pattern.test(lowerInput)) {
                return kb.responses[Math.floor(Math.random() * kb.responses.length)];
            }
        }

        if (lowerInput.length > 30) {
            return "That's a great detailed question! 🤔 While I analyze the specifics, SESA is designed with structured lessons, an admin approval workflow, and flexible payment options for both High School and Tech categories. Can you break it down into smaller parts — about courses, payments, or your dashboard?";
        }

        const fallbacks = [
            "I'm continuously learning to be more intelligent! 💡 Could you provide a bit more context? Are you asking about the student experience, instructor course creation, or admin approvals?",
            "That's an interesting question! I'm best equipped to help with the SESA platform — like enrolling via local Ethiopian banks, how our structured lesson curriculum works, or how to navigate your dynamic dashboard. 🎓",
            "I might need a little more clarification. 😊 SESA offers a rich learning environment. Tell me if you need help finding categorized courses or understanding the free preview limits!"
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: text.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        setShowQuickActions(false);

        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: generateAIResponse(userMsg.text),
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 900 + Math.random() * 700);
    };

    const handleSend = () => sendMessage(inputValue);
    const handleKeyPress = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSend(); };

    const clearChat = () => {
        setMessages([{
            id: Date.now().toString(),
            text: 'Chat cleared! How can I help you? 😊',
            sender: 'ai',
            timestamp: new Date(),
        }]);
        setShowQuickActions(true);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg text-white flex items-center justify-center transition-all ${
                    isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/30 hover:shadow-xl'
                }`}
            >
                <Bot className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] md:w-[420px] h-[540px] max-h-[calc(100vh-80px)] bg-white dark:bg-[#112240] rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-cyan-200" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-tight">SESA AI Assistant</h3>
                                    <span className="text-[10px] text-cyan-200 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={clearChat}
                                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                    title="Clear chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-[#0a192f]">
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                                            msg.sender === 'user'
                                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                                                : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                                        }`}>
                                            {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className={`group max-w-[78%]`}>
                                            <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                                msg.sender === 'user'
                                                    ? 'bg-blue-600 text-white rounded-tr-sm'
                                                    : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-tl-sm text-slate-700 dark:text-slate-200'
                                            }`}>
                                                {msg.text}
                                            </div>
                                            <p className={`text-[10px] text-slate-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                {formatTime(msg.timestamp)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-2"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <div className="flex gap-1 items-center">
                                            {[0, 1, 2].map(i => (
                                                <motion.div
                                                    key={i}
                                                    className="w-2 h-2 bg-cyan-500 rounded-full"
                                                    animate={{ y: [0, -6, 0] }}
                                                    transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        <AnimatePresence>
                            {showQuickActions && messages.length <= 1 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-3 py-2 bg-white dark:bg-[#112240] border-t border-gray-100 dark:border-slate-700 flex-shrink-0"
                                >
                                    <p className="text-[10px] text-slate-400 mb-2 font-medium uppercase tracking-wider">Quick questions</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_ACTIONS.map((action) => (
                                            <button
                                                key={action.label}
                                                onClick={() => sendMessage(action.query)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:text-cyan-700 dark:hover:text-cyan-300 text-slate-600 dark:text-slate-300 text-[11px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all"
                                            >
                                                {action.label}
                                                <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-[#112240] border-t border-gray-100 dark:border-slate-700 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-200 dark:border-slate-600 p-1 pl-4 focus-within:border-cyan-500 dark:focus-within:border-cyan-400 transition-colors">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about courses, enrollment..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40 transition-all flex-shrink-0 shadow-sm"
                                >
                                    {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIHelper;
