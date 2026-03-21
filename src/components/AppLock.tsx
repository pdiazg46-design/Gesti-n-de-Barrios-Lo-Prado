"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Fingerprint, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AppLock = ({ children }: { children: React.ReactNode }) => {
    const { status } = useSession();
    const [isLocked, setIsLocked] = useState(false);
    const [showSetup, setShowSetup] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [credentialId, setCredentialId] = useState<string | null>(null);

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        // Check if device is mobile. User requested this ONLY on mobile phones, NEVER on PC.
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            setIsSupported(false);
            setIsLocked(false);
            return;
        }

        // Check WebAuthn support
        if (window.PublicKeyCredential) {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                .then((available) => {
                    setIsSupported(available);
                })
                .catch(() => setIsSupported(false));
        }

        const isAppLocked = localStorage.getItem('app_locked') === 'true';
        const savedId = localStorage.getItem('app_credential_id');
        const setupDismissed = localStorage.getItem('app_lock_dismissed') === 'true';

        if (isAppLocked && savedId) {
            setCredentialId(savedId);
            setIsLocked(true); // Lock the app
        } else if (!isAppLocked && !setupDismissed) {
             // Only suggest setup if supported and authenticated
            if (status === 'authenticated') {
                 setShowSetup(true);
            }
        }
    }, [status]);

    // ArrayBuffer to Base64 utility
    const bufferToBase64url = (buffer: ArrayBuffer) => {
        const bytes = new Uint8Array(buffer);
        let str = '';
        for (let i = 0; i < bytes.length; i++) {
            str += String.fromCharCode(bytes[i]);
        }
        return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    };

    const base64urlToBuffer = (base64url: string) => {
        const padding = '='.repeat((4 - base64url.length % 4) % 4);
        const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const handleSetup = async () => {
        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const userId = new Uint8Array(16);
            crypto.getRandomValues(userId);

            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: "Barrio Seguro",
                        id: window.location.hostname
                    },
                    user: {
                        id: userId,
                        name: "Vecino",
                        displayName: "Vecino de Barrio Seguro"
                    },
                    pubKeyCredParams: [
                        { type: "public-key", alg: -7 }, // ES256
                        { type: "public-key", alg: -257 } // RS256
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required"
                    },
                    timeout: 60000
                }
            }) as PublicKeyCredential;

            if (credential) {
                localStorage.setItem('app_locked', 'true');
                localStorage.setItem('app_credential_id', credential.rawId ? bufferToBase64url(credential.rawId) : credential.id);
                setShowSetup(false);
                alert("✅ Bloqueo configurado con éxito. Tu app ahora está más segura.");
            }
        } catch (error) {
            console.error(error);
            alert("No se pudo configurar el bloqueo. Asegúrate de tener un PIN, Huella o reconocimiento facial configurado en tu dispositivo.");
        }
    };

    const handleUnlock = async () => {
        if (!credentialId) {
            setIsLocked(false);
            return;
        }

        try {
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    rpId: window.location.hostname,
                    allowCredentials: [{
                        type: 'public-key',
                        id: base64urlToBuffer(credentialId),
                    }],
                    userVerification: 'required',
                    timeout: 60000
                }
            });

            if (assertion) {
                setIsLocked(false);
            }
        } catch (error) {
            console.error(error);
            // If they fail, they stay on the lock screen
            alert("Acceso denegado. Intenta nuevamente.");
        }
    };

    const dismissSetup = () => {
        localStorage.setItem('app_lock_dismissed', 'true');
        setShowSetup(false);
    };

    // If app is locked, render ONLY the lock screen overlaying everything securely
    if (isLocked) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 p-6 text-white overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="w-full max-w-sm text-center space-y-8 relative z-10">
                    <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border border-white/20">
                        <Lock className="w-12 h-12 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black mb-2">Comunidad Protegida</h1>
                        <p className="text-slate-400 font-medium text-sm">Desbloquea la aplicación usando tu huella o patrón de dispositivo.</p>
                    </div>
                    <button
                        onClick={handleUnlock}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        <Fingerprint className="w-6 h-6" />
                        Tocar para Desbloquear
                    </button>
                    
                    <button 
                        onClick={() => {
                            if(confirm("¿Estás seguro que deseas cerrar sesión? Tendrás que volver a ingresar con email y contraseña, lo que desactivará el bloqueo automático.")) {
                                localStorage.removeItem('app_locked');
                                localStorage.removeItem('app_credential_id');
                                window.location.href = '/api/auth/signout';
                            }
                        }}
                        className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Cerrar Sesión Global
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {children}
            
            <AnimatePresence>
                {showSetup && isSupported && status === 'authenticated' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] p-6 z-[9000] border border-slate-100 dark:border-slate-800"
                    >
                        <button onClick={dismissSetup} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white leading-tight">Privacidad Total</h3>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Bloqueo Biométrico</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            Asegura tu aplicación usando la contraseña, huella o reconocimiento facial de tu celular sin necesidad de iniciar sesión cada vez.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={dismissSetup} className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
                                Posponer
                            </button>
                            <button onClick={handleSetup} className="flex-[2] py-3 px-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95">
                                Proteger App
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
