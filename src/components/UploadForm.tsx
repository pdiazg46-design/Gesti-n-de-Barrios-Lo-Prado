"use client";

import React, { useState } from 'react';
import { X, Gift, Tag, Briefcase, Camera, Info, CheckCircle2, Coins, AlertTriangle, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UploadFormProps {
    isSeniorMode?: boolean;
    communityId: string | null;
    onClose: () => void;
    onUpload: (data: any) => void;
}

export const UploadForm = ({ onClose, onUpload, isSeniorMode, communityId }: UploadFormProps) => {
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<'GIFT' | 'SALE' | 'SERVICE_OFFER' | 'SERVICE_REQUEST' | 'CIVIC_REPORT'>('SALE');
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        address: '',
        image: null as File | null,
    });

    // Geocodificación real usando Nominatim (OpenStreetMap)
    const getRealCoordinates = async (address: string) => {
        try {
            const query = encodeURIComponent(`${address}, Lo Prado, Santiago, Chile`);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }

        // Fallback: Centro de Lo Prado con ligero jitter para evitar superposición total
        return {
            lat: -33.4489 + (Math.random() - 0.5) * 0.005,
            lng: -70.7256 + (Math.random() - 0.5) * 0.005
        };
    };

    const getGPSLocation = (): Promise<{ lat: number, lng: number }> => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ lat: -33.4489, lng: -70.7256 });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve({ lat: -33.4489, lng: -70.7256 }),
                { enableHighAccuracy: true }
            );
        });
    };

    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!communityId) {
            alert("❌ Error: No se pudo identificar la comunidad");
            return;
        }

        if (!session?.user?.id) {
            alert("❌ Debes iniciar sesión para publicar");
            return;
        }

        setIsUploading(true);

        try {
            // Geocodificar la dirección o usar GPS
            let coords = { lat: -33.4489, lng: -70.7256 };

            if (type === 'CIVIC_REPORT') {
                // Para reportes cívicos, priorizamos el GPS si no hay dirección, 
                // o intentamos geocodificar si la hay.
                if (formData.address) {
                    coords = await getRealCoordinates(formData.address);
                } else {
                    coords = await getGPSLocation();
                }
            } else if (formData.address) {
                coords = await getRealCoordinates(formData.address);
            }

            // Obtener el UUID del perfil (ya que session.user.id puede ser el ID numérico de Google)
            let creatorUuid: string | null = session.user.id;

            // Si no parece un UUID, lo ponemos como null para evitar errores de base de datos
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (creatorUuid && !uuidRegex.test(creatorUuid)) {
                creatorUuid = null;
            }

            const { error } = await supabase
                .from('items')
                .insert([{
                    community_id: communityId,
                    creator_id: creatorUuid,
                    author_email: session?.user?.email, // Guardamos el email para trazabilidad municipal
                    title: formData.title,
                    description: formData.description,
                    price: formData.price ? parseFloat(formData.price) : 0,
                    type: (type === 'SERVICE_OFFER' || type === 'SERVICE_REQUEST') ? 'SERVICE' : type,
                    category: type === 'CIVIC_REPORT' ? 'Reporte Cívico' : 'Comunidad',
                    status: 'AVAILABLE',
                    lat: coords.lat,
                    lng: coords.lng
                }]);

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }

            setIsSuccess(true);
            setTimeout(() => {
                onUpload({ ...formData, type });
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error("Error uploading item:", error);
            alert(`❌ Error al publicar: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="p-10 text-center animate-in zoom-in duration-500 h-full overflow-y-auto">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-green-600 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">¡Publicado con éxito!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Tu anuncio ya está disponible para toda la comunidad.
                </p>
                {type === 'GIFT' && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <Coins className="text-amber-600 w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">+50 Puntos de Karma</p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300">Sumados a tu perfil de vecino.</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden flex flex-col h-full max-h-full">
            {/* Premium Vibrant Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-700 p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-40 h-40 text-white" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Conexión Vecinal Segura</span>
                        </div>
                        <h2 className={cn(
                            "font-black text-white tracking-tighter leading-none mb-1 sm:mb-2",
                            isSeniorMode ? "text-3xl sm:text-5xl" : "text-2xl sm:text-3xl"
                        )}>
                            Publicar Anuncio
                        </h2>
                        <p className={cn(
                            "text-white/80 font-medium",
                            isSeniorMode ? "text-lg sm:text-xl" : "text-xs sm:text-sm"
                        )}>
                            Llega a todos tus vecinos de {isSeniorMode ? 'Lo Prado' : 'barrio'} al instante.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all group active:scale-90"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={cn("space-y-8 flex-1 overflow-y-auto custom-scrollbar", isSeniorMode ? "p-10" : "p-8")}>
                {/* Type Selection */}
                <div className="space-y-5">
                    <label className={cn(
                        "font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2",
                        isSeniorMode ? "text-2xl mb-6" : "text-xs mb-2"
                    )}>¿Qué quieres compartir hoy?</label>
                    <div className="grid grid-cols-2 gap-4 pb-2">
                        {[
                            { id: 'GIFT', label: 'Regalar', icon: Gift, color: 'amber' },
                            { id: 'SALE', label: 'Vender', icon: Tag, color: 'indigo' },
                            { id: 'SERVICE_OFFER', label: 'Ofrezco', sub: 'servicio', icon: Briefcase, color: 'indigo' },
                            { id: 'SERVICE_REQUEST', label: 'Necesito', sub: 'servicio', icon: Briefcase, color: 'indigo' },
                            { id: 'REPORT', label: 'Reportar', sub: 'problema', icon: AlertTriangle, color: 'red' },
                        ].map((item: any) => {
                            const actualId = item.id === 'REPORT' ? 'CIVIC_REPORT' : item.id;
                            return (
                                <motion.button
                                    key={item.id}
                                    type="button"
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setType(actualId as any)}
                                    className={cn(
                                        "flex items-center gap-3 sm:gap-5 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group",
                                        isSeniorMode ? "p-5 sm:p-8" : "p-4 sm:p-5",
                                        type === actualId
                                            ? `border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 shadow-xl shadow-${item.color}-500/10`
                                            : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                    )}
                                >
                                    <item.icon className={isSeniorMode ? "w-8 h-8 sm:w-10 sm:h-10" : "w-5 h-5 sm:w-6 sm:h-6"} />
                                    <div>
                                        <p className={cn("font-black tracking-tight leading-none", isSeniorMode ? "text-xl sm:text-3xl" : "text-sm sm:text-base")}>
                                            {item.label}
                                        </p>
                                        {item.sub && (
                                            <p className={cn("font-bold opacity-80 mt-1 sm:mt-1.5", isSeniorMode ? "text-xs sm:text-base" : "text-[9px] sm:text-xs")}>
                                                {item.sub}
                                            </p>
                                        )}
                                    </div>
                                    {type === actualId && (
                                        <div className={`absolute top-2 right-2 w-2 h-2 bg-${item.color}-500 rounded-full animate-ping`} />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {type === 'GIFT' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-4 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border-2 border-amber-100 dark:border-amber-900/30"
                    >
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-2xl">
                            <Coins className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className={cn("text-amber-700 dark:text-amber-400 leading-relaxed font-bold", isSeniorMode ? "text-xl" : "text-sm")}>
                            ¡Buen vecino detectado! Al regalar ganas <strong className="text-amber-600">+50 puntos de Karma</strong> y fortaleces la comunidad.
                        </p>
                    </motion.div>
                )}

                {type === 'CIVIC_REPORT' && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border-2 border-red-100 dark:border-red-900/30"
                    >
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <p className={cn("text-red-700 dark:text-red-400 leading-relaxed font-bold", isSeniorMode ? "text-2xl" : "text-base")}>
                            <strong className="text-red-700 dark:text-red-500 uppercase tracking-widest text-xs block mb-2 underline decoration-2">Ojos del Municipio</strong>
                            Tu reporte será enviado directamente al panel oficial de Lo Prado. Capturaremos tu GPS. Ganas <strong className="text-red-600 dark:text-red-400">+20 Karma</strong>.
                        </p>
                    </motion.div>
                )}

                {/* Main Fields */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className={cn("font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2", isSeniorMode ? "text-2xl" : "text-xs")}>Título del anuncio</label>
                        <input
                            required
                            type="text"
                            placeholder="Ej: Taladro Bosch, Clases de Yoga..."
                            className={cn(
                                "w-full px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300",
                                isSeniorMode ? "py-6 text-2xl" : "py-4 text-base"
                            )}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {type === 'SALE' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <label className={cn("font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2", isSeniorMode ? "text-2xl" : "text-xs")}>Precio estimado</label>
                            <div className="relative group">
                                <span className={cn("absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black", isSeniorMode ? "text-3xl" : "text-xl")}>$</span>
                                <input
                                    required
                                    type="number"
                                    placeholder="0"
                                    className={cn(
                                        "w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-black text-slate-900 dark:text-white placeholder:text-slate-300",
                                        isSeniorMode ? "pl-14 py-6 text-4xl" : "pl-12 py-4 text-2xl"
                                    )}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        <label className={cn("font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2", isSeniorMode ? "text-2xl" : "text-xs")}>Descripción detallada</label>
                        <textarea
                            rows={3}
                            placeholder="Cuéntale un poco más a tus vecinos..."
                            className={cn(
                                "w-full px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[2.5rem] outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 resize-none",
                                isSeniorMode ? "py-6 text-2xl" : "py-4 text-base"
                            )}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className={cn("font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2", isSeniorMode ? "text-2xl" : "text-xs")}>
                            📍 Dirección o Ubicación
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Calle Las Torres 123, Lo Prado"
                            className={cn(
                                "w-full px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300",
                                isSeniorMode ? "py-6 text-2xl" : "py-4 text-base"
                            )}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                        <p className={cn("text-slate-400 px-2 font-medium", isSeniorMode ? "text-base" : "text-xs")}>
                            💡 Tu publicación aparecerá en el mapa del barrio
                        </p>
                    </div>

                    {/* Photo Section */}
                    <div className="space-y-3 pb-4">
                        <label className={cn("font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2", isSeniorMode ? "text-2xl" : "text-xs")}>Agregar Fotografías</label>
                        <div className="grid grid-cols-4 gap-4">
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.9 }}
                                className="aspect-square rounded-[2rem] border-3 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
                            >
                                <Camera className={cn("text-slate-300 group-hover:text-indigo-400 transition-colors", isSeniorMode ? "w-10 h-10" : "w-6 h-6")} />
                                <span className={cn("font-black text-slate-300 group-hover:text-indigo-400", isSeniorMode ? "text-xs" : "text-[8px]")}>SUBIR</span>
                            </motion.button>
                        </div>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01, boxShadow: "0 20px 25px -5px rgb(79 70 229 / 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isUploading || !formData.title}
                    className={cn(
                        "w-full rounded-[2.5rem] flex items-center justify-center gap-3 transition-all shadow-2xl font-black",
                        isSeniorMode ? "py-8 text-3xl" : "py-5 text-xl",
                        isUploading
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-indigo-500/30'
                    )}
                >
                    {isUploading ? (
                        <>
                            <div className="w-8 h-8 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
                            <span>Publicando...</span>
                        </>
                    ) : (
                        <span>Publicar Anuncio Ahora</span>
                    )}
                </motion.button>
            </form>
        </div>
    );
};
