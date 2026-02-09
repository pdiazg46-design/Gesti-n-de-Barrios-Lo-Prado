import React from 'react';
import { ItemCard, type ItemType, type ItemStatus } from './ItemCard';
import { Heart, Package, History, ArrowLeft, Coins, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserActivityPanelProps {
    items: any[];
    karma: number;
    userName: string;
    onBack: () => void;
    onConfirm: (id: string) => void;
    onDelete?: (id: string) => void;
    onNuclearReset?: () => void;
    isSeniorMode?: boolean;
}

export const UserActivityPanel = ({
    items,
    karma,
    userName,
    onBack,
    onConfirm,
    onDelete,
    onNuclearReset,
    isSeniorMode
}: UserActivityPanelProps) => {
    // Mock identification: Anything with creatorName: 'Yo (Vecino)' is an offer
    const myOffers = items.filter(item => item.creatorName === 'Yo (Vecino)');
    // Mock identification: For demo, let's say anything with status 'CLAIMED' or 'COMPLETED' that is NOT an offer
    // In a real app, this would be based on a 'claimerId'
    const myClaims = items.filter(item => item.creatorName !== 'Yo (Vecino)' && (item.status === 'CLAIMED' || item.status === 'COMPLETED'));

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className={cn("font-black text-slate-900 dark:text-white leading-none", isSeniorMode ? "text-2xl" : "text-xl")}>
                        Mis Actividades
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Gestión de mi vida de barrio
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
                {/* Karma Stats */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Coins className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className={cn("fill-white animate-pulse", isSeniorMode ? "w-6 h-6" : "w-4 h-4")} />
                            <span className={cn("font-black uppercase tracking-widest opacity-80", isSeniorMode ? "text-sm" : "text-xs")}>Mi Impacto Social</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={cn("font-black", isSeniorMode ? "text-6xl" : "text-4xl")}>{karma}</span>
                            <span className={cn("font-bold opacity-80 tracking-widest uppercase", isSeniorMode ? "text-lg" : "text-sm")}>Karma Points</span>
                        </div>
                        <p className={cn("mt-4 opacity-90 font-medium max-w-sm", isSeniorMode ? "text-xl leading-relaxed" : "text-sm leading-normal")}>
                            ¡Gracias por ser un buen vecino, {userName}!
                        </p>
                    </div>
                </div>

                {/* My Offers Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <Package className="w-5 h-5 text-indigo-500" />
                        <h3 className={cn("font-black text-slate-900 dark:text-white", isSeniorMode ? "text-xl" : "text-lg")}>
                            Lo que ofrezco
                        </h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {myOffers.length}
                        </span>
                    </div>

                    {myOffers.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400 font-medium text-sm">Aún no has publicado nada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {myOffers.map(item => (
                                <ItemCard
                                    key={item.id}
                                    {...item}
                                    isSeniorMode={isSeniorMode}
                                    isAnonymous={false} // Identity revealed in owner's panel
                                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* My Claims Section */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <History className="w-5 h-5 text-green-500" />
                        <h3 className={cn("font-black text-slate-900 dark:text-white", isSeniorMode ? "text-xl" : "text-lg")}>
                            Lo que he pedido
                        </h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {myClaims.length}
                        </span>
                    </div>

                    {myClaims.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-slate-400 font-medium text-sm">No tienes solicitudes activas.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {myClaims.map(item => (
                                <ItemCard
                                    key={item.id}
                                    {...item}
                                    isSeniorMode={isSeniorMode}
                                    isAnonymous={false} // Identity revealed for claims
                                    onConfirm={() => onConfirm(item.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>


                {/* Footer Actions */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <button
                        onClick={() => window.location.href = '/api/manual-logout'}
                        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase tracking-widest text-[10px] transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
