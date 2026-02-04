"use client";

import React from 'react';
import { Share2, MessageSquare, Gift, ShoppingBag, ArrowRight, Heart, LogIn } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function WelcomePage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Share2 className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">BarrioLoop</span>
                    </div>

                    {/* Hero Content */}
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                        Del caos de WhatsApp al <span className="text-indigo-600 dark:text-indigo-400">orden de tu Barrio</span>.
                    </h1>

                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                        Visualiza los regalos, ventas y servicios de tus vecinos en un solo lugar. ¡Sin memes!
                    </p>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <Gift className="text-pink-500 mb-2" />
                            <h3 className="font-semibold text-sm">Regalos (Karma)</h3>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <ShoppingBag className="text-green-500 mb-2" />
                            <h3 className="font-semibold text-sm">Ventas Locales</h3>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="space-y-4">
                        <Link href="/n/lo-prado" className="block w-full">
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/25 group">
                                Entrar a mi Barrio
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>

                        {/* Botón Maestro Blindado (Indestructible) */}
                        <button
                            onClick={() => signIn('google', { callbackUrl: '/n/lo-prado' })}
                            className="w-full py-5 bg-indigo-600 hover:bg-black text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-95 group"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-6 h-6 p-1 bg-white rounded-full" alt="Google" />
                            ENTRAR AHORA
                        </button>

                        <div className="text-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
                                Clic arriba para entrar con Google.<br />
                                Acceso directo y seguro.
                            </p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                        Ayuda social primero <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </p>
                </div>

                {/* Footer info */}
                <div className="bg-slate-100 dark:bg-slate-800/50 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <MessageSquare className="text-green-600 dark:text-green-400 w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">El "Killer" del caos</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Conecta tu grupo de WhatsApp en segundos.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
