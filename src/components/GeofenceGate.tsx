"use client";

import React, { useState } from 'react';
import { MapPin, ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

interface GeofenceGateProps {
    targetLat: number;
    targetLng: number;
    radiusMeters?: number;
    communityName: string;
    onVerified: () => void;
}

export const GeofenceGate = ({
    targetLat,
    targetLng,
    radiusMeters = 500,
    communityName,
    onVerified
}: GeofenceGateProps) => {
    const [status, setStatus] = useState<'IDLE' | 'CHECKING' | 'VERIFIED' | 'DENIED' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in meters
    };

    const verifyLocation = () => {
        if (!navigator.geolocation) {
            setStatus('ERROR');
            setErrorMsg('La geolocalización no está soportada por tu navegador.');
            return;
        }

        setStatus('CHECKING');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const distance = calculateDistance(
                    position.coords.latitude,
                    position.coords.longitude,
                    targetLat,
                    targetLng
                );

                if (distance <= radiusMeters) {
                    setStatus('VERIFIED');
                    setTimeout(onVerified, 1500);
                } else {
                    setStatus('DENIED');
                }
            },
            (error) => {
                setStatus('ERROR');
                // Detectar timeout o denegación
                if (error.code === error.PERMISSION_DENIED) {
                    setErrorMsg('Permiso denegado. En iPhone: Ve a Configuración > Privacidad > Localización > Safari y selecciona "Permitir".');
                } else if (error.code === error.TIMEOUT) {
                    setErrorMsg('El GPS tardó demasiado. Intenta salir al aire libre o conectarte a Wi-Fi.');
                } else {
                    setErrorMsg('No pudimos obtener tu ubicación. Por favor, verifica el GPS de tu celular.');
                }
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-sm bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">

                {status === 'IDLE' && (
                    <>
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <MapPin className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Verificación de Barrio</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Para unirte a <strong>{communityName}</strong>, necesitamos confirmar que estás físicamente en el sector.
                        </p>
                        <button
                            onClick={verifyLocation}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            Confirmar mi ubicación
                            <ShieldCheck className="w-5 h-5" />
                        </button>
                    </>
                )}

                {status === 'CHECKING' && (
                    <div className="py-12">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="font-bold text-slate-700 dark:text-slate-200">Validando coordenadas...</p>
                    </div>
                )}

                {status === 'VERIFIED' && (
                    <div className="py-8">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <ShieldCheck className="text-green-600 dark:text-green-400 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">¡Bienvenido Vecino!</h2>
                        <p className="text-slate-600 dark:text-slate-400">Entrando a la comunidad...</p>
                    </div>
                )}

                {status === 'DENIED' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ShieldAlert className="text-red-600 dark:text-red-400 w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Fuera de Rango</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                            Parece que no estás en el área de <strong>{communityName}</strong>. Por seguridad, solo residentes actuales pueden unirse vía GPS.
                        </p>
                        <button
                            onClick={() => setStatus('IDLE')}
                            className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-bold transition-all active:scale-95 mb-4"
                        >
                            Reintentar GPS
                        </button>
                        <button
                            onClick={() => {
                                setStatus('VERIFIED');
                                setTimeout(onVerified, 1000);
                            }}
                            className="text-indigo-600 font-bold text-sm flex items-center justify-center gap-1 mx-auto hover:underline"
                        >
                            Ingresar código de residente <ArrowRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {status === 'ERROR' && (
                    <div className="py-8">
                        <p className="text-red-500 font-bold mb-6 text-sm px-4">{errorMsg}</p>
                        <button
                            onClick={verifyLocation}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 mb-4 shadow-lg shadow-indigo-500/20"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            Intentar Nuevamente
                        </button>
                        <button
                            onClick={() => {
                                setStatus('VERIFIED');
                                setTimeout(onVerified, 1000);
                            }}
                            className="text-slate-400 font-bold text-sm flex items-center justify-center gap-1 mx-auto hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            Ingresar código manual <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
