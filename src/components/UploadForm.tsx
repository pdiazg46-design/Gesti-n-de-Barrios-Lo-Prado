"use client";

import React, { useState } from 'react';
import { X, Gift, Tag, Briefcase, Camera, Info, CheckCircle2, Coins, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

const DynamicMiniMap = dynamic(() => import('./MiniMapSelector').then(mod => mod.MiniMapSelector), {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
});

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UploadFormProps {
    communityId: string | null;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
    staticUserId?: string | null;
    staticUserEmail?: string | null;
}

export const UploadForm = ({ onClose, onSuccess, communityId, initialData, staticUserId, staticUserEmail }: UploadFormProps) => {
    const { data: session } = useSession();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<'GIFT' | 'SALE' | 'SERVICE_OFFER' | 'SERVICE_REQUEST' | 'CIVIC_REPORT'>('SALE');
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        address: '',
        lat: -33.4489,
        lng: -70.7256,
        locationMode: 'GPS' as 'GPS' | 'ADDRESS' | 'MAP',
        image: null as string | null, // Base64 after compression
    });

    // Cargar datos iniciales si es edición
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                price: initialData.price?.toString() || '',
                description: initialData.description || '',
                address: initialData.address || '',
                lat: initialData.lat || -33.4489,
                lng: initialData.lng || -70.7256,
                locationMode: initialData.lat ? 'GPS' : 'ADDRESS',
                image: (initialData.images && initialData.images.length > 0) ? initialData.images[0] : null,
            });
            const rawType = initialData.type === 'SERVICE' ? 'SERVICE_OFFER' : initialData.type;
            setType(rawType);
        }
    }, [initialData]);

    // Geocodificación real usando Nominatim (OpenStreetMap)
    const getRealCoordinates = async (address: string) => {
        const queries = [
            `${address}, Lo Prado, Santiago, Chile`,
            `${address}, Lo Prado, Chile`,
            address
        ];

        for (const q of queries) {
            try {
                const query = encodeURIComponent(q);
                // Nominatim requiere un User-Agent (simulado aquí con el fetch estándar o headers si fuera necesario)
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
                    headers: {
                        'Accept-Language': 'es'
                    }
                });
                const data = await response.json();

                if (data && data.length > 0) {
                    console.log(`📍 Ubicación encontrada con query: ${q}`);
                    return {
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    };
                }
            } catch (error) {
                console.error(`Geocoding error for query ${q}:`, error);
            }
        }

        return null; // No encontrado
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onerror = () => reject(new Error("Error al cargar la imagen seleccionada."));
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024; // Lower for better mobile compatibility
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error("No se pudo crear el contexto del canvas."));
                        return;
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8)); // slightly higher quality
                };
            };
            reader.onerror = () => reject(new Error("Error al leer el archivo."));
        });
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
                { enableHighAccuracy: true, timeout: 5000 }
            );
        });
    };

    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow null communityId for Global Plaza fallback


        const activeUserId = staticUserId || session?.user?.id;
        const activeUserEmail = staticUserEmail || session?.user?.email;

        if (!activeUserId) {
            alert("❌ Debes iniciar sesión para publicar");
            return;
        }

        if (!formData.title.trim()) {
            alert("❌ Por favor, ingresa un título para el anuncio.");
            return;
        }

        if (type === 'CIVIC_REPORT' && formData.locationMode === 'ADDRESS' && !formData.address.trim()) {
            alert("❌ Para reportes cívicos, por favor ingresa una dirección o usa el mapa/GPS.");
            return;
        }

        setIsUploading(true);

        try {
            // Usar coordenadas finales del estado
            let finalCoords = { lat: formData.lat, lng: formData.lng };

            // Si es por dirección, intentar geocodificar antes
            if (formData.locationMode === 'ADDRESS' && formData.address) {
                const result = await getRealCoordinates(formData.address);
                if (result) finalCoords = result;
            }

            // Intentar usar el ID de la sesión como UUID. 
            // Si no es un UUID válido (ej. ID de Google), intentamos obtener el perfil real de Supabase o dejamos que falle el RLS si no hay perfil.
            let creatorUuid: string | null = activeUserId || null;
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

            if (creatorUuid && !uuidRegex.test(creatorUuid)) {
                console.log("⚠️ ID de sesión no es UUID, buscando perfil vinculado...");
                // Podríamos intentar buscar por autor_email si el ID no es UUID
            }

            const priceNum = formData.price ? parseFloat(formData.price) : 0;

            if (initialData?.id) {
                const response = await fetch('/api/items/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: initialData.id,
                        updates: {
                            title: formData.title,
                            description: formData.description,
                            price: priceNum,
                            type: (type === 'SERVICE_OFFER' || type === 'SERVICE_REQUEST') ? 'SERVICE' : type,
                            images: formData.image ? [formData.image] : [],
                            lat: finalCoords.lat,
                            lng: finalCoords.lng,
                            status: 'AVAILABLE'
                        }
                    }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Fallo al actualizar el item');
                }
            } else {
                // Determine valid UUID format for Postgres
                let safeCreatorId: string | undefined = creatorUuid || undefined;
                if (creatorUuid && !uuidRegex.test(creatorUuid)) {
                    safeCreatorId = undefined; // Prevent Supabase cast error, rely purely on author_email
                }

                const payload = {
                    community_id: communityId,
                    creator_id: safeCreatorId,
                    author_email: activeUserEmail,
                    author_name: session?.user?.name || "Vecino/a",
                    title: formData.title,
                    description: formData.description,
                    price: formData.price ? parseFloat(formData.price) : 0,
                    type: (type === 'SERVICE_OFFER' || type === 'SERVICE_REQUEST') ? 'SERVICE' : type,
                    category: type === 'CIVIC_REPORT' ? 'Reporte Cívico' : 'Comunidad',
                    status: 'AVAILABLE',
                    images: formData.image ? [formData.image] : [],
                    lat: finalCoords.lat,
                    lng: finalCoords.lng
                };

                const { error } = await supabase.from('items').insert([payload]);
                if (error) {
                    console.error("Supabase insert error:", error);
                    throw new Error(error.message || 'Error guardando en la base de datos');
                }
            }

            // Award Karma if it's a CIVIC_REPORT
            if (type === 'CIVIC_REPORT' && activeUserId) {
                await fetch('/api/karma/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: activeUserId,
                        amount: 20,
                        email: activeUserEmail
                    })
                });
            }

            setIsSuccess(true);
            setTimeout(() => {
                // Ensure the user sees the update by forcing a slight delay or explicit refresh hint
                onSuccess?.();
                onClose();
            }, 1000);
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
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-700 p-6 sm:p-10 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                    <ShieldCheck className="w-40 h-40 text-white" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                            <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Conexión Vecinal Segura</span>
                        </div>
                        <h2 className="font-black text-white tracking-tighter leading-none mb-2 text-3xl sm:text-4xl">
                            Publicar Anuncio
                        </h2>
                        <p className="text-white/80 font-medium text-sm sm:text-base">
                            Llega a todos tus vecinos de barrio al instante.
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

            <form onSubmit={handleSubmit} className="space-y-8 flex-1 overflow-y-auto custom-scrollbar p-8">
                {/* Type Selection */}
                <div className="space-y-5">
                    <label className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2 text-xs mb-2">¿Qué quieres compartir hoy?</label>
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
                                        "flex items-center gap-3 sm:gap-5 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group p-5 sm:p-6",
                                        type === actualId
                                            ? `border-${item.color}-500 bg-${item.color}-50 text-${item.color}-600 shadow-xl shadow-${item.color}-500/10`
                                            : 'border-slate-100 text-slate-500 hover:border-slate-300'
                                    )}
                                >
                                    <item.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                                    <div>
                                        <p className="font-black tracking-tight leading-none text-base sm:text-lg">
                                            {item.label}
                                        </p>
                                        {item.sub && (
                                            <p className="font-bold opacity-80 mt-1 sm:mt-1.5 text-[10px] sm:text-xs">
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
                        <p className="text-amber-700 dark:text-amber-400 leading-relaxed font-bold text-sm sm:text-base">
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
                        <p className="text-red-700 dark:text-red-400 leading-relaxed font-bold text-sm sm:text-base">
                            <strong className="text-red-700 dark:text-red-500 uppercase tracking-widest text-xs block mb-2 underline decoration-2">Ojos del Municipio</strong>
                            Tu reporte será enviado directamente al panel oficial de Lo Prado. Capturaremos tu GPS. Ganas <strong className="text-red-600 dark:text-red-400">+20 Karma</strong>.
                        </p>
                    </motion.div>
                )}

                {/* Main Fields */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2 text-xs">Título del anuncio</label>
                        <input
                            type="text"
                            placeholder="Ej: Taladro Bosch, Clases de Yoga..."
                            className={cn(
                                "w-full px-6 bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300 py-4 text-base"
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
                            <label className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2 text-xs">Precio estimado</label>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                                <input
                                    type="number"
                                    placeholder="0"
                                    className={cn(
                                        "w-full bg-slate-50 border-2 border-transparent rounded-[2rem] outline-none focus:border-indigo-500 focus:bg-white transition-all font-black text-slate-900 placeholder:text-slate-300 pl-12 py-4 text-2xl"
                                    )}
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-3">
                        <label className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2 text-xs">Descripción detallada</label>
                        <textarea
                            rows={3}
                            placeholder="Cuéntale un poco más a tus vecinos..."
                            className={cn(
                                "w-full px-6 bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-[2.5rem] outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 resize-none py-4 text-base"
                            )}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2 text-xs">
                            📍 Ubicación del Reporte/Anuncio
                        </label>

                        {type !== 'CIVIC_REPORT' ? (
                            <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Ubicación Escudada</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Asociado a tu Dirección Validada y Junta Vecinal</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
                                    {[
                                        { id: 'GPS', label: 'Mi GPS' },
                                        { id: 'MAP', label: 'En el Mapa' }
                                    ].map(mode => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={async () => {
                                                setFormData({ ...formData, locationMode: mode.id as any });
                                                if (mode.id === 'GPS') {
                                                    const coords = await getGPSLocation();
                                                    setFormData(prev => ({ ...prev, locationMode: 'GPS', lat: coords.lat, lng: coords.lng }));
                                                }
                                            }}
                                            className={cn(
                                                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                                                formData.locationMode === mode.id
                                                    ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                                                    : "text-slate-400 hover:text-indigo-600"
                                            )}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>

                                {formData.locationMode === 'GPS' && (
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                            {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const coords = await getGPSLocation();
                                                setFormData(prev => ({ ...prev, lat: coords.lat, lng: coords.lng }));
                                            }}
                                            className="text-[10px] font-black text-indigo-700 underline uppercase tracking-widest"
                                        >
                                            Actualizar
                                        </button>
                                    </div>
                                )}

                                {formData.locationMode === 'MAP' && (
                                    <div className="aspect-video relative z-0 mt-4">
                                        <DynamicMiniMap
                                            lat={formData.lat}
                                            lng={formData.lng}
                                            onLocationChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                                        />
                                        <div className="absolute bottom-2 left-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl border border-slate-100 dark:border-slate-800 z-[1000] pointer-events-none">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                                                Arrastra el marcador o toca el mapa
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="space-y-3 pb-4">
                        <label className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block px-2 text-xs">Fotografía del reporte/objeto</label>
                        <div className="flex gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                id="image-upload"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        try {
                                            const compressed = await compressImage(file);
                                            setFormData({ ...formData, image: compressed });
                                        } catch (err: any) {
                                            alert("❌ Fallo al procesar la imagen: " + err.message);
                                        }
                                    }
                                }}
                            />
                            <label
                                htmlFor="image-upload"
                                className={cn(
                                    "aspect-square w-24 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group",
                                    formData.image
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                        : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30"
                                )}
                            >
                                {formData.image ? (
                                    <div className="relative w-full h-full p-2">
                                        <img src={formData.image} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="text-slate-300 group-hover:text-indigo-400 transition-colors w-6 h-6" />
                                        <span className="font-black text-slate-300 group-hover:text-indigo-400 text-[8px] uppercase">Agregar</span>
                                    </>
                                )}
                            </label>

                            {formData.image && (
                                <div className="flex-1 flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-green-600 dark:text-green-500 uppercase tracking-widest">Imagen Lista</p>
                                    <p className="text-[9px] text-slate-400">Capturada y optimizada</p>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: null })}
                                        className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-1 text-left"
                                    >
                                        Quitar foto
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01, boxShadow: "0 20px 25px -5px rgb(79 70 229 / 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isUploading}
                    className={cn(
                        "w-full rounded-[2.5rem] flex items-center justify-center gap-3 transition-all shadow-2xl font-black py-5 text-xl",
                        isUploading
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
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
