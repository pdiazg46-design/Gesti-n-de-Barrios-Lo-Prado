"use client";

import React, { useState } from 'react';
import { Share2, MessageSquare, Gift, ShoppingBag, ArrowRight, Heart, Sparkles, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function WelcomePage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(formData.email.toLowerCase().trim(), {
                redirectTo: `${window.location.origin}/update-password`,
            });
            if (error) throw error;
            setSuccessMessage("¡Correo de recuperación enviado! Revisa tu bandeja de entrada o la carpeta de spam.");
            setIsForgotPassword(false);
        } catch (err: any) {
            setError(err.message || "No se pudo enviar el correo limitando por seguridad.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const cleanEmail = formData.email.toLowerCase().trim();

        try {
            if (!isLogin) {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Las contraseñas no coinciden. Intenta escribirlas de nuevo.");
                }
                if (formData.password.length < 6) {
                    throw new Error("La contraseña debe tener al menos 6 caracteres.");
                }
                
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: cleanEmail,
                        password: formData.password
                    })
                });
                
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al registrar la cuenta.");
            }

            const result = await signIn('credentials', {
                email: cleanEmail,
                password: formData.password,
                redirect: false,
                callbackUrl: '/lobby'
            });

            if (result?.error) {
                throw new Error(result.error);
            } else if (result?.url) {
                window.location.href = result.url;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

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

            <main
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

                    {/* Call to Action - Formulario Nativo */}
                    <div className="space-y-4 mb-6">
                        {!isForgotPassword && (
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full mb-6">
                                <button
                                    onClick={() => { setIsLogin(true); setError(''); setSuccessMessage(''); }}
                                    className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${isLogin ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Iniciar Sesión
                                </button>
                                <button
                                    onClick={() => { setIsLogin(false); setError(''); setSuccessMessage(''); }}
                                    className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${!isLogin ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                    Regístrate
                                </button>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {isForgotPassword ? (
                                <motion.form
                                    key="forgot"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleForgotPassword}
                                    className="space-y-3"
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Recuperar Acceso</h3>
                                        <p className="text-sm text-slate-500 mt-1">Ingresa el correo de tu cuenta</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Tu Correo Electrónico"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    
                                    {error && (
                                        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <p className="text-red-600 dark:text-red-400 text-sm font-bold text-center">{error}</p>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isLoading}
                                        type="submit"
                                        className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'ENVIAR ENLACE'}
                                    </motion.button>

                                    <button 
                                        type="button" 
                                        onClick={() => { setIsForgotPassword(false); setError(''); }}
                                        className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    >
                                        Volver al inicio de sesión
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key={isLogin ? 'login' : 'register'}
                                    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSubmit}
                                className="space-y-3"
                            >
                                {!isLogin && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Tu Nombre (Ej: Juan)"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        placeholder="Tu Correo Electrónico"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="Contraseña"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {isLogin && (
                                    <div className="flex justify-end pt-1">
                                        <button 
                                            type="button" 
                                            onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}
                                            className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                )}

                                {!isLogin && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            placeholder="Repite tu Contraseña"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-red-600 dark:text-red-400 text-sm font-bold text-center">{error}</p>
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                        <p className="text-green-600 dark:text-green-400 text-sm font-bold text-center">{successMessage}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full py-4 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            {isLogin ? 'ENTRAR AL BARRIO' : 'CREAR MI CUENTA'}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </motion.button>
                            </motion.form>
                            )}
                        </AnimatePresence>
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
            </main>
        </div>
    );
}

