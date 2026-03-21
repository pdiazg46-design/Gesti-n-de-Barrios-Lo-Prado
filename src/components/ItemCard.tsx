import React, { useState } from 'react';
import { Gift, ShoppingBag, ArrowRight, Heart, Share2, MessageCircle, CheckCircle2, AlertTriangle, Trash2, Pencil } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ItemType = 'GIFT' | 'SALE' | 'SERVICE_OFFER' | 'SERVICE_REQUEST' | 'CIVIC_REPORT' | 'OFFICIAL_ALERT' | 'SERVICE';

export type ItemStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'ACTIVE' | 'ARCHIVED';

interface Question {
    id: string;
    text: string;
    isCreator?: boolean;
    time: string;
    authorName?: string;
    authorEmail?: string;
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
    images?: string[];
    onClaim?: () => void;
    onConfirm?: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    isAnonymous?: boolean;
    date?: string;
    creator_id?: string;
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
    onDelete,
    onEdit,
    isAnonymous = false,
    date,
    questions = [],
    onAsk,
    images = [],
    onClickCard
}: ItemCardInternalProps & { onClickCard?: () => void }) => {
    const typeStyles = {
        GIFT: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        SALE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        SERVICE_OFFER: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        SERVICE_REQUEST: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        CIVIC_REPORT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        OFFICIAL_ALERT: 'bg-red-600 text-white shadow-xl animate-pulse',
        SERVICE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    };

    const typeIcons = {
        GIFT: <Gift className="w-4 h-4" />,
        SALE: <ShoppingBag className="w-4 h-4" />,
        SERVICE_OFFER: <MessageCircle className="w-4 h-4" />,
        SERVICE_REQUEST: <MessageCircle className="w-4 h-4" />,
        CIVIC_REPORT: <AlertTriangle className="w-4 h-4" />,
        OFFICIAL_ALERT: <AlertTriangle className="w-4 h-4" />,
        SERVICE: <MessageCircle className="w-4 h-4" />,
    };

    const typeLabels = {
        GIFT: 'Regalo',
        SALE: 'Venta',
        SERVICE_OFFER: 'Ofrezco',
        SERVICE_REQUEST: 'Necesito',
        CIVIC_REPORT: 'Reporte Cívico',
        OFFICIAL_ALERT: 'Alerta Oficial',
        SERVICE: 'Servicio',
    };

    return (
        <div 
            onClick={onClickCard}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
        >
            {/* Visual Header / Placeholder for image */}
            <div className="h-32 sm:h-44 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {images && images.length > 0 ? (
                    <img
                        src={images[0]}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-slate-400 dark:text-slate-600 font-medium text-xs">Imagen referencial</span>
                )}

                {/* Type Badge */}
                <div className={cn(
                    "absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.15em] flex items-center gap-1 sm:gap-1.5 shadow-sm border border-black/5",
                    typeStyles[type as keyof typeof typeStyles]
                )}>
                    {React.cloneElement(typeIcons[type as keyof typeof typeIcons] as React.ReactElement, { className: "w-3 h-3 sm:w-3.5 sm:h-3.5" })}
                    {typeLabels[type as keyof typeof typeLabels]}
                </div>

                {onDelete && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Estás seguro de que deseas eliminar esta publicación?')) {
                                onDelete();
                            }
                        }}
                        className={cn(
                            "absolute top-2 sm:top-3 p-1.5 sm:p-2 bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500 rounded-lg sm:rounded-xl shadow-md transition-all active:scale-90 z-10",
                            questions.length > 0 ? "right-24 sm:right-32" : "right-2 sm:right-3"
                        )}
                        title="Eliminar publicación"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}

                {/* Price/Karma Badge */}
                {type === 'SALE' && price !== undefined && (
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-bold text-slate-900 dark:text-white shadow-sm text-xs sm:text-sm">
                        ${price.toLocaleString()}
                    </div>
                )}
                {type === 'GIFT' && (
                    <div className={cn(
                        "absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-bold text-white shadow-sm flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs",
                        status === 'COMPLETED' ? "bg-slate-500" : "bg-pink-500"
                    )}>
                        <Heart className="fill-current w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {status === 'COMPLETED' ? "Karma Sumado" : "+50 Karma"}
                    </div>
                )}
                {type === 'CIVIC_REPORT' && (
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-bold text-white bg-red-600 shadow-sm flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                        <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        +20 Karma
                    </div>
                )}

                {/* Questions Counter Flag */}
                {(questions && questions.length > 0) ? (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-indigo-600 flex items-center gap-1 sm:gap-2 shadow-md border-2 border-indigo-100 dark:border-indigo-900/30">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        {questions.length}
                    </div>
                ) : onAsk ? (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-slate-500 flex items-center gap-1 sm:gap-2 shadow-md border-2 border-slate-100 dark:border-slate-800">
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        Abre un chat
                    </div>
                ) : null}
            </div>

            <div className="p-3 sm:p-6">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest sm:tracking-[0.2em] text-[8px] sm:text-[10px] truncate w-full">
                    <span>{category}</span>
                    <span className="opacity-40 font-normal hidden sm:inline">•</span>
                    <span className={cn("font-bold truncate max-w-[50%]", isAnonymous && "italic opacity-80 decoration-indigo-600/30 underline")}>
                        {isAnonymous ? "Vecino(a) del barrio" : creatorName}
                    </span>
                    {date && (
                        <>
                            <span className="opacity-40">•</span>
                            <span className="opacity-60 text-[9px] font-medium">{date}</span>
                        </>
                    )}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2 line-clamp-2 sm:line-clamp-1 h-auto sm:h-7 text-sm sm:text-xl tracking-tight leading-[1.15]">
                    {title}
                </h3>

                <p className="text-slate-500 dark:text-slate-400 mb-3 sm:mb-6 line-clamp-2 min-h-[34px] sm:min-h-[40px] text-xs sm:text-sm font-medium leading-relaxed">
                    {description}
                </p>

                {status === 'AVAILABLE' && onClaim && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClaim();
                        }}
                        className="w-full bg-slate-900 dark:bg-indigo-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg shadow-indigo-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 py-2 sm:py-3 text-[11px] sm:text-sm"
                    >
                        Me interesa
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}

                {(onEdit || onDelete) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                            >
                                <Pencil className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> <span className="hidden sm:inline">Editar</span>
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
                                        onDelete();
                                    }
                                }}
                                className="px-3 sm:px-4 bg-red-50 dark:bg-red-900/10 text-red-600 py-2 sm:py-3 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}

                {status === 'CLAIMED' && onConfirm && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfirm();
                        }}
                        className="w-full bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 py-3 text-sm"
                    >
                        ¡Lo recibí!
                    </button>
                )}

                {status === 'COMPLETED' && (
                    <div className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 text-green-600 dark:text-green-500 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 uppercase tracking-[0.2em] border border-green-100 dark:border-green-900/20">
                        <CheckCircle2 className="w-4 h-4" /> Entregado con éxito
                    </div>
                )}

            </div>
        </div>
    );
};
