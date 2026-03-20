"use client";

import { Share2, MessageSquare, Gift, ShoppingBag, ArrowRight, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative">
            {/* Background Glows Dinámicos */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.15, 0.1],
                        x: [0, -30, 0],
                        y: [0, 70, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[100px]"
                />
            </div>

            <motion.main
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 w-full max-w-md bg-white/70 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden"
            >
                <div className="p-8 pb-4">
                    {/* Logo Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 mb-10"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                            <Share2 className="text-white w-7 h-7" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            Barrio Seguro
                        </span>
                    </motion.div>

                    {/* Hero Content */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-[2.5rem] font-black text-slate-900 dark:text-white leading-[1.1] mb-5"
                    >
                        Del caos de WhatsApp al <span className="text-indigo-600 dark:text-indigo-400">orden de tu Barrio</span>.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed"
                    >
                        Visualiza los regalos, ventas y servicios de tus vecinos en un solo lugar. <span className="font-semibold text-slate-900 dark:text-white">¡Sin memes!</span>
                    </motion.p>

                    {/* Feature Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="grid grid-cols-2 gap-4 mb-10"
                    >
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-5 rounded-3xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-sm transition-colors hover:border-indigo-500/30"
                        >
                            <Gift className="text-indigo-500 mb-3 w-6 h-6" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200">Regalos (Karma)</h3>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-5 rounded-3xl bg-white/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm shadow-sm transition-colors hover:border-indigo-500/30"
                        >
                            <ShoppingBag className="text-green-500 mb-3 w-6 h-6" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200">Ventas Locales</h3>
                        </motion.div>
                    </motion.div>

                    {/* Call to Action */}
                    <div className="space-y-4 mb-6">
                        <Link href="/n/lo-prado" className="block w-full">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 group"
                            >
                                Entrar a mi Barrio
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </Link>

                        {/* Botón Maestro Blindado (Indestructible) */}
                        <motion.button
                            initial={{ scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => signIn('google', { callbackUrl: '/n/lo-prado' })}
                            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <img src="https://www.google.com/favicon.ico" className="w-6 h-6 p-1 bg-white rounded-full shadow-sm" alt="Google" />
                            ENTRAR AHORA
                            <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="text-center p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-500/10"
                        >
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                Clic arriba para entrar con Google.<br />
                                Acceso directo y seguro.
                            </p>
                        </motion.div>
                    </div>

                    <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="py-4 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2 font-medium"
                    >
                        Ayuda social primero <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </motion.p>
                </div>

                {/* Footer Premium info */}
                <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md p-7 flex items-center gap-5 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center shadow-inner">
                        <MessageSquare className="text-green-600 dark:text-green-400 w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Efectividad Colectiva</p>
                        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 leading-tight">Conecta tu grupo de WhatsApp en segundos.</p>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}

