import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, MessageCircle, AlertTriangle, ShieldCheck, Heart, Trash2, Pencil } from 'lucide-react';
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
            <div className="bg-white dark:bg-slate-950 w-full max-w-2xl max-h-[90vh] rounded-3xl sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header Navbar */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700">
                            {typeIcons[item.type as keyof typeof typeIcons]}
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">{item.category}</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.isAnonymous ? "Vecino del Barrio" : item.creatorName}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 sm:p-3 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Stream */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {item.images && item.images.length > 0 && (
                        <div className="w-full h-48 sm:h-64 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <div className="p-4 sm:p-8 space-y-6">
                        {/* Title Box */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                                {item.title}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm sm:text-base">
                                {item.description}
                            </p>
                        </div>

                        {/* Status Grid & Actions */}
                        {item.status === 'COMPLETED' ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-500 text-sm font-bold uppercase tracking-widest">
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
                                            <button onClick={onEdit} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-600">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={() => { if (confirm("¿Eliminar publicación por completo?")) onDelete(); }} className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-red-100 dark:border-red-900/20">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : null
                        )}

                        {/* Q&A Thread */}
                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="font-black text-[11px] sm:text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" /> Foro de Vecinos
                            </h3>
                            
                            <div className="space-y-3">
                                {(!item.questions || item.questions.length === 0) ? (
                                    <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/50">
                                        <p className="text-slate-400 text-sm font-medium">No hay consultas todavía. ¡Sé el primero!</p>
                                    </div>
                                ) : (
                                    item.questions.map(q => (
                                        <div key={q.id} className={cn(
                                            "p-3 sm:p-4 rounded-2xl border",
                                            q.isCreator
                                                ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 ml-4 sm:ml-12"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 mr-4 sm:mr-12 shadow-sm"
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
                                                            window.location.href = `mailto:${(q as any).authorEmail}?subject=Sobre tu consulta en Barrio Seguro`;
                                                        }
                                                    }}
                                                    title={isOwner && !q.isCreator ? "Click para contactar en privado" : ""}
                                                >
                                                    {q.isCreator ? "Creador (Vendedor)" : ((q as any).authorName || "Vecino(a)")}
                                                </span>
                                                <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{q.time || (q as any).date?.split('T')[0]}</span>
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium text-sm leading-relaxed">
                                                {q.text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Input Area (Only if status available) */}
                        {item.status !== 'COMPLETED' && onAsk && (
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Escribe tu consulta pública al vendedor..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 dark:text-white"
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
                                    className="px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20 font-bold text-[10px] sm:text-xs uppercase tracking-widest"
                                >
                                    Enviar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
