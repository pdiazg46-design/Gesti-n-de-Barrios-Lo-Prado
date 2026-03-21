import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, MessageCircle, AlertTriangle, ShieldCheck, Heart, Trash2, Pencil, Phone, Mail, User, Loader2 } from 'lucide-react';
import { Item } from './ItemCard';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ItemDetailModalProps {
    item: Item;
    onClose: () => void;
    onAsk?: (text: string) => void;
    onResolve?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    isOwner: boolean;
}

export const ItemDetailModal = ({
    item,
    onClose,
    onAsk,
    onResolve,
    onDelete,
    onEdit,
    isOwner
}: ItemDetailModalProps) => {
    const [newQuestion, setNewQuestion] = useState('');
    const [selectedNeighbor, setSelectedNeighbor] = useState<{id?: string, name: string, email: string, phone?: string} | null>(null);
    const [loadingNeighbor, setLoadingNeighbor] = useState(false);

    const handleNeighborClick = async (name: string, email: string) => {
        setSelectedNeighbor({ name, email });
        setLoadingNeighbor(true);
        try {
            const res = await fetch(`/api/profile/by-email?email=${encodeURIComponent(email)}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedNeighbor(prev => prev ? { ...prev, phone: data.phone, id: data.id } : prev);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingNeighbor(false);
        }
    };

    const typeIcons = {
        GIFT: <Heart className="w-5 h-5 text-pink-500" />,
        SALE: <MessageCircle className="w-5 h-5 text-green-500" />,
        SERVICE_OFFER: <ShieldCheck className="w-5 h-5 text-indigo-500" />,
        SERVICE_REQUEST: <MessageCircle className="w-5 h-5 text-indigo-500" />,
        CIVIC_REPORT: <AlertTriangle className="w-5 h-5 text-red-500" />,
        OFFICIAL_ALERT: <AlertTriangle className="w-5 h-5 text-red-600" />,
        SERVICE: <MessageCircle className="w-5 h-5 text-indigo-500" />,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Navbar */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 relative z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200/50">
                            {typeIcons[item.type as keyof typeof typeIcons]}
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">{item.category}</span>
                            <span className="text-sm font-bold text-slate-800">{item.isAnonymous ? "Vecino del Barrio" : item.creatorName}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 sm:p-3 bg-white text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors shadow-sm active:scale-95 border border-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Stream */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {item.images && item.images.length > 0 && (
                        <div className="w-full h-48 sm:h-64 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-2">
                            <img src={item.images[0]} alt={item.title} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                        </div>
                    )}
                    
                    <div className="p-4 sm:p-8 space-y-6">
                        {/* Title Box */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
                                {item.title}
                            </h2>
                            <p className="text-slate-700 font-medium leading-relaxed text-sm sm:text-base">
                                {item.description}
                            </p>
                        </div>

                        {/* Status Grid & Actions */}
                        {item.status === 'COMPLETED' ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-500 text-sm font-bold uppercase tracking-widest">
                                <CheckCircle2 className="w-5 h-5" /> Publicación Archvada
                            </div>
                        ) : (
                            isOwner ? (
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <button
                                        onClick={() => {
                                            if (confirm("¿Estás seguro de que este acuerdo está finalizado? \nEsto cerrará la publicación y la sacará del muro público de los vecinos.")) {
                                                onResolve?.();
                                            }
                                        }}
                                        className="col-span-2 sm:col-span-1 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold py-3 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/20 text-xs sm:text-sm uppercase tracking-widest"
                                    >
                                        <CheckCircle2 className="w-5 h-5" /> Trato Finalizado
                                    </button>
                                    <div className="col-span-2 sm:col-span-1 flex gap-2">
                                        {onEdit && (
                                            <button onClick={onEdit} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-slate-300">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={() => { if (confirm("¿Eliminar publicación por completo?")) onDelete(); }} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-red-100">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : null
                        )}

                        {/* Q&A Thread */}
                        {item.type !== 'CIVIC_REPORT' && item.type !== 'OFFICIAL_ALERT' && (
                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-black text-[11px] sm:text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4" /> Foro de Vecinos
                                </h3>
                                
                                <div className="space-y-3">
                                    {(!item.questions || item.questions.length === 0) ? (
                                        <div className="text-center py-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                            <p className="text-slate-400 text-sm font-medium">No hay consultas todavía. ¡Sé el primero!</p>
                                        </div>
                                    ) : (
                                        item.questions.map(q => (
                                            <div key={q.id} className={cn(
                                                "p-3 sm:p-4 rounded-2xl border",
                                                q.isCreator
                                                    ? "bg-indigo-50 border-indigo-100 ml-4 sm:ml-12"
                                                    : "bg-white border-slate-200 mr-4 sm:mr-12 shadow-sm"
                                            )}>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <span 
                                                        className={cn(
                                                            "font-black text-[10px] sm:text-xs uppercase tracking-wider",
                                                            q.isCreator ? "text-indigo-600" : "text-slate-500",
                                                            (isOwner && !q.isCreator && (q as any).authorEmail) && "hover:text-amber-600 cursor-pointer underline decoration-dotted transition-colors"
                                                        )}
                                                        onClick={() => {
                                                            if (isOwner && !q.isCreator && (q as any).authorEmail) {
                                                                handleNeighborClick(((q as any).authorName || "Vecino(a)"), (q as any).authorEmail);
                                                            }
                                                        }}
                                                        title={isOwner && !q.isCreator ? "Ver ficha para contactar" : ""}
                                                    >
                                                        {q.isCreator ? "Creador (Vendedor)" : ((q as any).authorName || "Vecino(a)")}
                                                    </span>
                                                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{q.time || (q as any).date?.split('T')[0]}</span>
                                                </div>
                                                <p className="text-slate-700 font-medium text-sm leading-relaxed">
                                                    {q.text}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Input Area (Only if status available) */}
                        {item.status !== 'COMPLETED' && onAsk && (
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Escribe tu consulta pública..."
                                    className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && newQuestion.trim()) {
                                            onAsk(newQuestion);
                                            setNewQuestion('');
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (newQuestion.trim()) {
                                            onAsk(newQuestion);
                                            setNewQuestion('');
                                        }
                                    }}
                                    className="shrink-0 px-4 sm:px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20 font-bold text-[10px] sm:text-xs uppercase tracking-widest"
                                >
                                    Enviar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ficha de Contacto Overlay */}
            {selectedNeighbor && (
                <div 
                    className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" 
                    onClick={(e) => { e.stopPropagation(); setSelectedNeighbor(null); }}
                >
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedNeighbor(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
                            <span className="text-3xl font-black uppercase">{selectedNeighbor.name.charAt(0)}</span>
                        </div>
                        
                        <h3 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-1 capitalize truncate px-4">{selectedNeighbor.name}</h3>
                        <p className="text-sm font-medium text-slate-500 text-center mb-6">Vecino del Barrio</p>
                        
                        {loadingNeighbor ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                                <span className="text-xs font-bold text-slate-400">Buscando contacto...</span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedNeighbor.phone ? (
                                    <>
                                        <a href={`tel:${selectedNeighbor.phone}`} className="flex items-center justify-center gap-2 w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 p-4 rounded-2xl font-black transition-all">
                                            <Phone className="w-5 h-5" />
                                            Llamar al {selectedNeighbor.phone}
                                        </a>
                                        {selectedNeighbor.id && (
                                            <button 
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('OPEN_CHAT', { detail: { neighborId: selectedNeighbor.id, neighborName: selectedNeighbor.name } }));
                                                    onClose();
                                                }}
                                                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Chat Privado en la App
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-3">
                                        <p className="text-sm font-bold text-slate-500 mb-1">Sin teléfono registrado</p>
                                        <p className="text-xs text-slate-400 font-medium mb-4">Este vecino no aportó celular en su perfil.</p>
                                        {selectedNeighbor.id && (
                                            <button 
                                                onClick={() => {
                                                    window.dispatchEvent(new CustomEvent('OPEN_CHAT', { detail: { neighborId: selectedNeighbor.id, neighborName: selectedNeighbor.name } }));
                                                    onClose();
                                                }}
                                                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white p-4 rounded-2xl font-black transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                Iniciar Chat Privado
                                            </button>
                                        )}
                                    </div>
                                )}
                                <a href={`mailto:${selectedNeighbor.email}?subject=Sobre tu consulta en Barrio Seguro`} className="flex items-center justify-center gap-2 w-full bg-indigo-50 hover:bg-indigo-100 active:scale-95 dark:bg-indigo-900/10 dark:hover:bg-indigo-900/30 text-indigo-600 p-4 rounded-2xl font-black transition-all">
                                    <Mail className="w-5 h-5" />
                                    Enviar Correo Tradicional
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
