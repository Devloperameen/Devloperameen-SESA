import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/toast';

const Payment: React.FC = () => {
    const { t } = useLanguage();
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'ethio_banks'>('ethio_banks');
    const [ethioBank, setEthioBank] = useState<'telebirr' | 'cbe_birr' | 'awash' | 'boa'>('telebirr');
    const [file, setFile] = useState<File | null>(null);

    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('courseId');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Prepare payload
        const payload: any = { watchedPart1: true };
        // If a screenshot file is selected, convert to base64
        if (paymentMethod === 'ethio_banks' && file) {
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove data URL prefix if present
                    const base64 = result.split(',')[1] || result;
                    resolve(base64);
                };
                reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            try {
                const base64 = await base64Promise;
                payload.paymentProofUrl = base64;
            } catch (err) {
                showError('Failed to read screenshot file');
                setLoading(false);
                return;
            }
        }

        setTimeout(async () => {
            if (courseId && token) {
                try {
                    await axios.post(
                        `${API_URL}/enrollments/request/${courseId}`,
                        payload,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    showSuccess('Payment successful! Enrollment pending admin approval.');
                } catch (error: any) {
                    showError(error?.response?.data?.message || 'Failed to submit enrollment request');
                }
            }
            setLoading(false);
            setStep('success');
        }, 1500);
    };

    if (step === 'success') {
        return (
            <div className="p-4 md:p-8">
                <div className="max-w-md mx-auto text-center py-12 bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-premium">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-6">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h2 className="text-xl font-bold text-dark-bg dark:text-white mb-2">Payment received</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Your enrollment will be activated after admin approval.</p>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-secondary transition-colors"
                        >
                            Go to Dashboard
                            <ArrowLeft className="h-4 w-4 rotate-180" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-xl mx-auto mb-8 text-center">
                <h1 className="text-3xl font-bold text-dark-bg dark:text-white mb-2">{t('checkout')}</h1>
                <p className="text-gray-500 dark:text-gray-400">Secure payment for course enrollments. Complete to unlock remaining parts.</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="max-w-lg mx-auto"
            >
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card p-6 shadow-premium">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Secure AES-256 Encrypted Payment</span>
                    </div>

                    <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('ethio_banks')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${paymentMethod === 'ethio_banks' ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Ethiopian Banks
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${paymentMethod === 'card' ? 'bg-white dark:bg-dark-bg text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            Credit Card
                        </button>
                    </div>

                    {paymentMethod === 'card' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">Card number</label>
                                <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-dark-bg dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">Expiry</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-dark-bg dark:text-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">CVC</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-dark-bg dark:text-white transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">Name on card</label>
                                <input
                                    type="text"
                                    placeholder="Full name"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-dark-bg dark:text-white transition-colors"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">Select Bank / Mobile Money</label>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    { id: 'telebirr', name: 'Telebirr', color: 'border-blue-400' },
                                    { id: 'cbe_birr', name: 'CBE Birr', color: 'border-purple-400' },
                                    { id: 'awash', name: 'Awash Bank', color: 'border-rose-400' },
                                    { id: 'boa', name: 'Bank of Abyssinia', color: 'border-yellow-400' }
                                ].map((bank) => (
                                    <button
                                        key={bank.id}
                                        type="button"
                                        onClick={() => setEthioBank(bank.id as any)}
                                        className={`p-3 text-sm font-semibold rounded-xl border-2 transition-all flex items-center justify-center ${ethioBank === bank.id ? `${bank.color} bg-gray-50 dark:bg-gray-800 text-dark-bg dark:text-white shadow-sm` : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        {bank.name}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">Phone Number / Account ID</label>
                                <input
                                    type="text"
                                    placeholder="+251 9..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-dark-bg dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-dark-bg dark:text-white mb-2">Upload Transfer Screenshot (Required)</label>
<input
    type="file"
    accept="image/*"
    onChange={(e) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
    }}
    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-bg text-dark-bg dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors cursor-pointer"
/>
                            </div>
                            <div className="p-3 mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-sm text-emerald-800 dark:text-emerald-300">
                                Send the amount to the official accounts. Once you've completed the transfer, attach the receipt.
                            </div>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('total')}</span>
                        <span className="text-xl font-bold text-dark-bg dark:text-white">ETB 1,499.00</span>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                    >
                        {loading ? (
                            <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                            <>
                                <CreditCard className="h-5 w-5" />
                                {t('payNow')}
                            </>
                        )}
                    </button>
                </div>
                <p className="mt-6 text-center text-sm text-gray-500">
                    <Link to="/student/browse" className="text-primary hover:text-accent hover:underline flex items-center justify-center gap-1 transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Return to Course Library
                    </Link>
                </p>
            </motion.form>
        </div>
    );
};

export default Payment;
