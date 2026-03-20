'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldAlert, Users, Recycle, Loader2 } from 'lucide-react';

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        
        // Comprobar si el navegador soporta Service Workers y Push
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    setIsSubscribed(!!sub);
                    setIsLoading(false);
                });
            });
        } else {
            console.log("Navegador no soporta notificaciones push nativas");
            setIsLoading(false);
        }
    }, [isOpen]);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Requerir permiso físico del Sistema Operativo si no lo tiene
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
            });

            // Despachar el Payload con el Token JSON a nuestro BackEnd Auth
            const response = await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription })
            });

            if(response.ok) {
                setIsSubscribed(true);
            } else {
                const errData = await response.json();
                throw new Error("El servidor rechazó el ticket: " + (errData.error || response.status));
            }
        } catch (err: any) {
            console.error("Fallo la suscripcion Push:", err);
            alert("⚠️ Error Técnico Push: " + (err.message || String(err)) + "\n\n1. Si dice 'Registration failed' o llave vacía, Vercel no cargó tu llave.\n2. Si dice 'NotAllowedError', debes hacer click al Candadito de arriba a la izquierda de la URL web y permitir Notificaciones.");
        }
        setIsLoading(false);
    };

    const unsubscribeFromPush = async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                setIsSubscribed(false);
            }
        } catch (err) {
            console.error("Fallo al desuscribir:", err);
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full sm:h-auto sm:max-h-[85vh] sm:mt-20 sm:mr-4 sm:rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right-full sm:slide-in-from-top-4 duration-300 pointer-events-auto border border-slate-200/50 dark:border-slate-800">
                <div className="p-5 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 rounded-t-3xl border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white leading-tight">Centro de Alertas</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Preferencias Push</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-200/50 dark:bg-slate-700 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="p-5 flex flex-col gap-6 overflow-y-auto">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Configura las alertas que deseas recibir directamente en la barra de tu teléfono o PC, incluso cuando la app está cerrada o suspendida.
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Tarjeta de Voz Oficial  */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 shadow-sm flex justify-between items-center">
                            <div>
                                <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white"><ShieldAlert className="w-4 h-4 text-indigo-500" /> Voz Oficial</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">Alertas Críticas y Anuncios de la Municipalidad.</p>
                            </div>
                            
                            <button 
                                onClick={!isSubscribed ? subscribeToPush : unsubscribeFromPush}
                                disabled={isLoading}
                                className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${isSubscribed ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isSubscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Tarjeta de Reportes Cívicos  */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 flex justify-between items-center transition-all">
                            <div>
                                <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white"><Users className="w-4 h-4 text-emerald-500" /> Reportes Cívicos</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">Sucesos reportados por vecinos en tu radio de acción.</p>
                            </div>
                            <button 
                                onClick={!isSubscribed ? subscribeToPush : unsubscribeFromPush}
                                disabled={isLoading}
                                className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${isSubscribed ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isSubscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Tarjeta de Economía Circular  */}
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50 flex justify-between items-center transition-all">
                            <div>
                                <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white"><Recycle className="w-4 h-4 text-amber-500" /> Economía Circular</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">Avisos de trueques, ventas y oficios en el barrio.</p>
                            </div>
                            <button 
                                onClick={!isSubscribed ? subscribeToPush : unsubscribeFromPush}
                                disabled={isLoading}
                                className={`shrink-0 w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ease-in-out ${isSubscribed ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isSubscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                    
                    {isLoading && (
                        <div className="flex flex-col items-center mt-4">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Sincronizando...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
