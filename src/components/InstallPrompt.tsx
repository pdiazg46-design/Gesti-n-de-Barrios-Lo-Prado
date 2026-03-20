'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Optional: Check if already installed
        window.addEventListener('appinstalled', () => {
            setDeferredPrompt(null);
            setShowPrompt(false);
            console.log('PWA fue instalada exitosamente');
        });

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Muestra el prompt "nativo" (iOS/Android/Chrome)
        deferredPrompt.prompt();
        // Espera por la decisión
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('Usuario aceptó instalar PWA');
        } else {
            console.log('Usuario ignoró instalar PWA');
        }
        // Una vez usado el trigger, no sirve de nuevo en esta sesión.
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-[9999] animate-in slide-in-from-bottom-8 duration-500 flex justify-center pb-6 sm:pb-6 pointer-events-none">
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] p-4 sm:p-5 flex items-center justify-between gap-4 max-w-sm w-full pointer-events-auto transition-all">
                <div className="flex items-center gap-4">
                    <img 
                        src="/images/app-icon.png" 
                        alt="Barrio Seguro App Icon" 
                        className="w-10 h-10 rounded-xl object-contain drop-shadow-md bg-transparent" 
                    />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">Barrio Seguro</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">App Oficial del Barrio</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                        onClick={() => setShowPrompt(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 dark:bg-slate-800 rounded-full active:scale-90 transition-transform"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleInstallClick}
                        className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-transform"
                    >
                        <Download className="w-4 h-4" />
                        Instalar
                    </button>
                </div>
            </div>
        </div>
    );
}
