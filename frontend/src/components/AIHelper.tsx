import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, User } from 'lucide-react';

interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

const AIHelper: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Hi there! I am the SESA AI Assistant. How can I help you today?',
            sender: 'ai'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const generateAIResponse = (input: string): string => {
        const lowerInput = input.trim().toLowerCase();
        
        // Extended Knowledge Base Map
        const knowledgeBase = [
            {
                pattern: /\b(?:hi|hello|hey|greetings|morning|afternoon|evening|wassup|ola)\b/i,
                responses: [
                    "Hello! I am SESA's intelligent assistant. Ready to learn something new today?",
                    "Hi there! How can I assist you with your SESA learning journey today?",
                    "Greetings! Let me know if you need help finding a course, understanding billing, or navigating the platform."
                ]
            },
            {
                pattern: /\b(?:enroll|pay|upgrade|buy|purchase|part 1|part 2|premium|price|cost|free|money|birr|bank|telebirr)\b/i,
                responses: [
                    "To enroll in a course, you can start by watching the first few parts for free! Once you're ready, click 'Pay & Enroll' to unlock the rest. We support multiple payment methods including Telebirr, CBE Birr, Awash Bank, Bank of Abyssinia, and Credit/Debit Cards. You can even upload a screenshot of your bank transfer receipt for verification!",
                    "Our payment process is flexible! High school courses offer 2 free preview videos, while general tech courses offer 1. After the preview, you can pay via local Ethiopian banks (like CBE, Awash, Telebirr) or Card. Just upload your receipt on the payment page for admin approval."
                ]
            },
            {
                pattern: /\b(?:dashboard|progress|track|navigate|where|find|xp|level|certificates?|resources?|chart|graph)\b/i,
                responses: [
                    "Your Dashboard is your personalized learning hub! It features dynamic charts tracking your average progress, XP points, and course completions. You can also access generated Certificates and Study Resources directly from the sidebar. Is there a specific metric you want to find?",
                    "We've made the dashboard highly visual! You can see your learning journey through interactive graphs and animations. Just navigate to 'Dashboard' from the sidebar to view your XP, enrolled courses, and download certificates."
                ]
            },
            {
                pattern: /\b(?:teach|instructor|create|upload|publish|teacher|add course)\b/i,
                responses: [
                    "Instructors play a huge role here! If you have instructor access, you can build structured courses by going to 'Create Course'. You can add multiple lessons by entering titles and YouTube video URLs. Once submitted, our Admin team will review your curriculum and either approve it or provide feedback before it goes live."
                ]
            },
            {
                pattern: /\b(?:grade 9|grade 10|grade 11|grade 12|high school|grade|class|category|categories|filter)\b/i,
                responses: [
                    "SESA categorizes content intelligently. We have dedicated sections for High School (Grades 9-12) and General Tech courses. If you are a standard student, your view defaults to Grade 9, but Premium students can access all grades! Use the dropdown in 'Browse Courses' to filter by your exact grade level."
                ]
            },
            {
                pattern: /\b(?:admin|approve|reject|feedback|comment|verify)\b/i,
                responses: [
                    "Our platform includes a robust Admin approval workflow. Admins review student payment receipts and instructor course submissions. If something isn't right, Admins can reject it and provide specific feedback comments so students and teachers know exactly what to fix!"
                ]
            },
            {
                pattern: /\b(?:video|youtube|embed|watch|play|locked|unlock|lesson)\b/i,
                responses: [
                    "Courses are structured lesson-by-lesson! When you browse a course, you can smoothly transition between unlocked video lessons. Locked lessons will clearly show an overlay. Just complete your enrollment to instantly unlock all the secure embed videos for the curriculum!"
                ]
            },
            {
                pattern: /\b(?:error|bug|fail|not working|broken|help|support|contact|issue|crash|load)\b/i,
                responses: [
                    "I'm sorry you're running into issues! Sometimes 'Failed to load' errors can happen if the server is restarting or if your authorization token expired. Try logging out and logging back in, or checking your internet connection. If you still see 'Fail to create category' or similar errors, please reach out to support@sesa.academy with a screenshot!"
                ]
            },
            {
                pattern: /\b(?:learn|study|subject|math|science|physics|chemistry|biology|english|react|node|mern|programming)\b/i,
                responses: [
                    "SESA offers everything from core academics (Physics, Math, Biology) to advanced Tech stacks (MERN, React, Node.js). Explore our catalog to find structured curriculums taught by experts."
                ]
            },
            {
                pattern: /\b(?:who are you|what are you|ai|bot|name|intelligent|smart|holistic)\b/i,
                responses: [
                    "I am the SESA AI Assistant! I have been holistically upgraded to understand the entire ecosystem of our platform—from student enrollment and structured video lessons to instructor course creation and admin payment verification workflows. How can I intelligently assist you today?"
                ]
            }
        ];

        // Search for matches
        for (const kb of knowledgeBase) {
            if (kb.pattern.test(lowerInput)) {
                // Return a random response from the matched category pattern
                return kb.responses[Math.floor(Math.random() * kb.responses.length)];
            }
        }

        // Catch-all Holisitic Fallback Analysis
        if (lowerInput.length > 30) {
            return "That's a very detailed question! While I analyze the specifics, I can tell you that SESA is designed with structured lessons, an admin approval workflow, and flexible payment options for both High School and Tech categories. Can you break down your question into smaller parts regarding courses, payments, or your dashboard?";
        }

        const fallbacks = [
            "I'm continuously learning to be more intelligent! Could you provide a bit more context? Are you asking about the student experience, instructor course creation, or admin approvals?",
            "That's an interesting question! I am best equipped to help you with the SESA platform—like how to enroll via local Ethiopian banks, how the structured lesson curriculum works, or how to navigate your dynamic dashboard.",
            "I might need a little more clarification. SESA offers a rich, dynamic learning environment. Tell me if you need help finding categorized courses or understanding the free preview limits!"
        ];
        
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking delay for a more natural feel
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: generateAIResponse(userMsg.text),
                sender: 'ai'
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 800);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
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
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg shadow-cyan-900/20 text-white flex items-center justify-center transition-all ${
                    isOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/30'
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
                        className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-32px)] md:w-[400px] h-[500px] max-h-[calc(100vh-100px)] bg-white dark:bg-[#112240] rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-cyan-200" />
                                <h3 className="font-semibold">SESA AI Assistant</h3>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md hover:bg-white/20 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0a192f]">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300'}`}>
                                        {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div 
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                            msg.sender === 'user' 
                                                ? 'bg-blue-600 text-white rounded-tr-sm' 
                                                : 'bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-tl-sm'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex items-start gap-2">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-300 flex items-center justify-center">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-[#112240] border-t border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 rounded-full border border-gray-200 dark:border-slate-600 p-1 pl-4 focus-within:border-cyan-500 dark:focus-within:border-cyan-400 transition-colors">
                                <input 
                                    type="text" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about courses, enrollment..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIHelper;
