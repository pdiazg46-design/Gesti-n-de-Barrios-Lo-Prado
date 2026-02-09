import React, { useState } from 'react';
import { Gift, ShoppingBag, ArrowRight, Heart, Share2, MessageCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ItemType = 'GIFT' | 'SALE' | 'SERVICE_OFFER' | 'SERVICE_REQUEST' | 'CIVIC_REPORT';

export type ItemStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED';

interface Question {
    id: string;
    text: string;
    isCreator?: boolean;
    time: string;
}

export interface Item {
    id: string;
    title: string;
    description: string;
    type: ItemType;
    category: string;
    price: number;
    creatorName: string;
    status?: ItemStatus;
    lat?: number;
    lng?: number;
    onClaim?: () => void;
    onConfirm?: () => void;
    isSeniorMode?: boolean;
    isAnonymous?: boolean;
    questions?: Question[];
    onAsk?: (text: string) => void;
}

interface ItemCardInternalProps extends Item { }

export const ItemCard = ({
    title,
    price,
    type,
    category,
    creatorName,
    description,
    status = 'AVAILABLE',
    onClaim,
    onConfirm,
    isSeniorMode,
    isAnonymous = false,
    questions = [],
    onAsk,
}: ItemCardInternalProps) => {
    const [showQA, setShowQA] = useState(false);
    const [newQuestion, setNewQuestion] = useState('');
    const typeStyles = {
        GIFT: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        SALE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        SERVICE_OFFER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        SERVICE_REQUEST: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        CIVIC_REPORT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };

    const typeIcons = {
        GIFT: <Gift className="w-4 h-4" />,
        SALE: <ShoppingBag className="w-4 h-4" />,
        SERVICE_OFFER: <MessageCircle className="w-4 h-4" />,
        SERVICE_REQUEST: <MessageCircle className="w-4 h-4" />,
        CIVIC_REPORT: <AlertTriangle className="w-4 h-4" />,
    };

    const typeLabels = {
        GIFT: 'Regalo',
        SALE: 'Venta',
        SERVICE_OFFER: 'Ofrezco',
        SERVICE_REQUEST: 'Necesito',
        CIVIC_REPORT: 'Reporte Cívico',
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Visual Header / Placeholder for image */}
            <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                <span className="text-slate-400 dark:text-slate-600 font-medium text-sm">Sin imagen</span>

                {/* Type Badge */}
                <div className={cn(
                    "absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-md",
                    typeStyles[type as keyof typeof typeStyles]
                )}>
                    {React.cloneElement(typeIcons[type as keyof typeof typeIcons] as React.ReactElement, { className: "w-5 h-5" })}
                    {typeLabels[type as keyof typeof typeLabels]}
                </div>

                {/* Price/Karma Badge */}
                {type === 'SALE' && price !== undefined && (
                    <div className={cn(
                        "absolute bottom-3 right-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-slate-900 dark:text-white shadow-md",
                        isSeniorMode ? "text-base sm:text-lg" : "text-xs sm:text-sm"
                    )}>
                        ${price.toLocaleString()}
                    </div>
                )}
                {type === 'GIFT' && (
                    <div className={cn(
                        "absolute bottom-3 right-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-black text-white shadow-md flex items-center gap-2",
                        status === 'COMPLETED' ? "bg-slate-500" : "bg-pink-500",
                        isSeniorMode ? "text-base sm:text-lg" : "text-xs sm:text-sm"
                    )}>
                        <Heart className={cn("fill-current", isSeniorMode ? "w-4 h-4" : "w-3 h-3")} />
                        {status === 'COMPLETED' ? "Karma Sumado" : "+50 Karma"}
                    </div>
                )}
                {type === 'CIVIC_REPORT' && (
                    <div className={cn(
                        "absolute bottom-3 right-3 px-4 py-2 rounded-xl font-black text-white bg-red-600 shadow-sm flex items-center gap-2",
                        isSeniorMode ? "text-lg" : "text-sm"
                    )}>
                        <AlertTriangle className={isSeniorMode ? "w-4 h-4" : "w-3 h-3"} />
                        +20 Karma
                    </div>
                )}

                {/* Questions Counter */}
                {questions.length > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowQA(!showQA);
                        }}
                        className="absolute top-3 right-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 shadow-md border-2 border-indigo-100 dark:border-indigo-900/30"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {questions.length} {questions.length === 1 ? 'Pregunta' : 'Preguntas'}
                    </button>
                )}
            </div>

            <div className="p-5">
                <div className={cn(
                    "flex items-center gap-2 mb-3 font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest",
                    isSeniorMode ? "text-base" : "text-xs"
                )}>
                    <span>{category}</span>
                    <span className="opacity-40">•</span>
                    <span className={cn(isAnonymous && "italic opacity-90 decoration-indigo-600/40 underline")}>
                        {isAnonymous ? "Vecino(a) del barrio" : creatorName}
                    </span>
                </div>

                <h3 className={cn(
                    "font-black text-slate-900 dark:text-white mb-2 sm:mb-3 line-clamp-1 h-7 sm:h-8",
                    isSeniorMode ? "text-xl sm:text-3xl" : "text-lg sm:text-xl"
                )}>
                    {title}
                </h3>

                <p className={cn(
                    "text-slate-800 dark:text-slate-200 mb-4 sm:mb-6 line-clamp-2 min-h-[40px] sm:min-h-[48px]",
                    isSeniorMode ? "text-base sm:text-xl font-black" : "text-xs sm:text-sm font-bold"
                )}>
                    {description}
                </p>

                {status === 'AVAILABLE' && onClaim && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClaim();
                        }}
                        className={cn(
                            "w-full bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2",
                            isSeniorMode ? "py-4 text-lg" : "py-2.5 text-sm"
                        )}
                    >
                        Me interesa
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}

                {status === 'CLAIMED' && onConfirm && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfirm();
                        }}
                        className={cn(
                            "w-full bg-green-600 text-white rounded-xl font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2",
                            isSeniorMode ? "py-4 text-lg" : "py-2.5 text-sm"
                        )}
                    >
                        ¡Lo recibí!
                    </button>
                )}

                {status === 'COMPLETED' && (
                    <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-green-700 dark:text-green-500 rounded-xl font-black text-sm flex items-center justify-center gap-3 uppercase tracking-widest border border-green-100 dark:border-green-900/30">
                        <CheckCircle2 className="w-5 h-5" /> Entregado con éxito
                    </div>
                )}

                {/* Anonymous Q&A Section */}
                {showQA && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preguntas y Respuestas</span>
                            <MessageCircle className="w-3 h-3 text-slate-300" />
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar text-[11px]">
                            {questions.map(q => (
                                <div key={q.id} className={cn(
                                    "p-2 rounded-xl border",
                                    q.isCreator
                                        ? "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 ml-4"
                                        : "bg-slate-100/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 mr-4"
                                )}>
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <span className={cn(
                                            "font-black text-[9px] uppercase tracking-tighter transition-colors",
                                            q.isCreator ? "text-indigo-600" : "text-slate-500"
                                        )}>
                                            {q.isCreator ? "Creador" : "Vecino(a)"}
                                        </span>
                                        <span className="text-[8px] text-slate-400">{q.time}</span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                                        {q.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {onAsk && status === 'AVAILABLE' && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Haz una pregunta..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                />
                                <button
                                    onClick={() => {
                                        if (newQuestion.trim()) {
                                            onAsk(newQuestion);
                                            setNewQuestion('');
                                        }
                                    }}
                                    className="p-2 bg-indigo-600 text-white rounded-lg active:scale-95 transition-all shadow-md"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
