import React from 'react';
import { ItemCard, type ItemType, type ItemStatus } from './ItemCard';
import { Heart, Package, History, ArrowLeft, Coins, LogOut, Camera, User, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UserActivityPanelProps {
    items: any[];
    karma: number;
    userName: string;
    userEmail?: string;
    userId?: string;
    avatarUrl?: string;
    onAvatarUpdate?: (newUrl: string) => void;
    onBack: () => void;
    onConfirm: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    onEdit?: (item: any) => void;
    onItemClick?: (item: any) => void;
    onNuclearReset?: () => void;
    isCommunityAdmin?: boolean;
    onModerationClick?: () => void;
    onReactivate?: (id: string) => void;
}

export const UserActivityPanel = ({
    items,
    karma,
    userName,
    userEmail,
    userId,
    avatarUrl,
    onAvatarUpdate,
    onBack,
    onConfirm,
    onDelete,
    onEdit,
    onItemClick,
    onNuclearReset,
    isCommunityAdmin = false,
    onModerationClick,
    onReactivate
}: UserActivityPanelProps) => {
    
    const isMine = (item: any) => item.author_email?.toLowerCase() === userEmail?.toLowerCase() || item.creator_id === userId;
    
    // Filtramos las ofertas mías
    const myOffers = items.filter(item => isMine(item));
    // Hack para "Mis pedidos" simulados de los que no son míos
    const myClaims = items.filter(item => !isMine(item) && (item.status === 'CLAIMED' || item.status === 'COMPLETED'));

    const activeOffers = myOffers.filter(item => item.type !== 'CIVIC_REPORT');
    const civicReports = myOffers.filter(item => item.type === 'CIVIC_REPORT');
    const [showCivicHistory, setShowCivicHistory] = React.useState(false);
    const [showOffers, setShowOffers] = React.useState(false);
    const [showClaims, setShowClaims] = React.useState(false);

    const [isCompressing, setIsCompressing] = React.useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onAvatarUpdate) return;

        setIsCompressing(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const SIZE = 256;
                canvas.width = SIZE;
                canvas.height = SIZE;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const minSize = Math.min(img.width, img.height);
                    const sx = (img.width - minSize) / 2;
                    const sy = (img.height - minSize) / 2;
                    ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, SIZE, SIZE);
                    
                    const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
                    onAvatarUpdate(compressedBase64);
                    setIsCompressing(false);
                }
            };
        };
    };

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
                    <h2 className="font-bold text-slate-900 dark:text-white leading-none text-xl tracking-tight">
                        Mis Actividades
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Gestión de mi vida de barrio
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-32">
                {/* Avatar Updater Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <User className="w-24 h-24" />
                    </div>
                    
                    <div className="relative group z-10 mb-4">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id="activityAvatarUpload" 
                            onChange={handleAvatarChange}
                            disabled={isCompressing}
                        />
                        <label 
                            htmlFor="activityAvatarUpload" 
                            className={cn(
                                "w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-indigo-100 dark:border-indigo-900/40 shadow-xl flex items-center justify-center relative overflow-hidden transition-all group-hover:border-indigo-400 dark:group-hover:border-indigo-500",
                                isCompressing ? "cursor-wait opacity-70" : "cursor-pointer"
                            )}
                        >
                            {isCompressing ? (
                                <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white p-2">
                                    <Loader2 className="w-6 h-6 animate-spin mb-1 text-indigo-400" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-center leading-none">Procesando</span>
                                </div>
                            ) : avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <span className="font-black text-slate-400 dark:text-slate-500 text-3xl uppercase tracking-tighter">
                                        {userName?.[0] || '?'}
                                    </span>
                                </div>
                            )}
                            
                            {!isCompressing && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-6 h-6 text-white mb-1" />
                                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Cambiar</span>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Karma Stats */}
                <div className="bg-indigo-600 dark:bg-indigo-900/40 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden border border-indigo-500/20">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                        <Coins className="w-20 h-20" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="fill-white/80 w-4 h-4" />
                            <span className="font-bold uppercase tracking-widest text-[10px] text-white/70">Mi Impacto Social</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="font-black text-4xl">{karma}</span>
                            <span className="font-bold opacity-60 tracking-widest uppercase text-xs">Karma Points</span>
                        </div>
                        <p className="mt-3 opacity-90 font-medium max-w-sm text-sm leading-relaxed">
                            ¡Gracias por ser un buen vecino, {userName}!
                        </p>
                    </div>
                </div>

                {/* Admin Role Section */}
                {isCommunityAdmin && onModerationClick && (
                    <div className="bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/50 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:bg-indigo-100 transition-colors" onClick={onModerationClick}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <h3 className="font-black text-indigo-900 dark:text-indigo-100 text-lg uppercase tracking-tight flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Gestionar Vecinos
                                </h3>
                                <p className="text-xs font-medium text-indigo-700/70 dark:text-indigo-300/70 mt-1 max-w-[80%]">
                                    Modera faltas de comportamiento, suspende infractores o perdona strikes en tiempo real.
                                </p>
                            </div>
                            <button className="bg-indigo-600 text-white rounded-full p-2.5 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                )}

                {/* My Offers Section */}
                <section>
                    <div 
                        className="flex items-center justify-between mb-4 px-2 cursor-pointer group"
                        onClick={() => setShowOffers(!showOffers)}
                    >
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                                Lo que ofrezco
                            </h3>
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {activeOffers.length}
                            </span>
                        </div>
                        <button className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full p-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                            <ArrowLeft className={cn("w-4 h-4 transition-transform", showOffers ? "-rotate-90" : "rotate-180")} />
                        </button>
                    </div>

                    {showOffers && (
                        activeOffers.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 fade-in duration-200">
                                <p className="text-slate-400 font-medium text-sm">Aún no has publicado nada.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 animate-in slide-in-from-top-4 fade-in duration-200">
                                {activeOffers.map(item => (
                                    <ItemCard
                                        key={item.id}
                                        {...item}
                                        compact={true}
                                        onDelete={onDelete ? () => onDelete(item.id) : undefined}
                                        onClickCard={() => onItemClick?.(item)}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </section>

                {/* Civic History Section */}
                {civicReports.length > 0 && (
                    <section>
                        <div 
                            className="flex items-center justify-between mb-4 px-2 cursor-pointer group"
                            onClick={() => setShowCivicHistory(!showCivicHistory)}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                                    Mis Alertas y Reportes
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {civicReports.length}
                                </span>
                            </div>
                            <button className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full p-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                <ArrowLeft className={cn("w-4 h-4 transition-transform", showCivicHistory ? "-rotate-90" : "rotate-180")} />
                            </button>
                        </div>

                        {showCivicHistory && (
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 mt-4 animate-in slide-in-from-top-4 fade-in duration-200">
                                {civicReports.map(item => {
                                    const isExpired = new Date().getTime() - new Date((item as any).createdAt || (item as any).created_at || (item as any).date).getTime() > 24 * 60 * 60 * 1000;
                                    return (
                                        <div key={item.id} className="relative">
                                            <div className={cn("transition-opacity", isExpired && "opacity-60")}>
                                                <ItemCard
                                                    {...item}
                                                    compact={true}
                                                    onDelete={onDelete ? () => onDelete(item.id) : undefined}
                                                    onClickCard={() => onItemClick?.(item)}
                                                />
                                            </div>
                                            
                                            {isExpired && (
                                                <div className="absolute top-3 left-3 z-30">
                                                    <button 
                                                        onClick={() => onReactivate?.(item.id)}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all active:scale-95 border border-indigo-400"
                                                    >
                                                        Reactivar 24h
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* My Claims Section */}
                {myClaims.length > 0 && (
                    <section>
                        <div 
                            className="flex items-center justify-between mb-4 px-2 cursor-pointer group"
                            onClick={() => setShowClaims(!showClaims)}
                        >
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-green-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                                    Lo que he pedido
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {myClaims.length}
                                </span>
                            </div>
                            <button className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full p-1.5 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                                <ArrowLeft className={cn("w-4 h-4 transition-transform", showClaims ? "-rotate-90" : "rotate-180")} />
                            </button>
                        </div>

                        {showClaims && (
                            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 animate-in slide-in-from-top-4 fade-in duration-200">
                                {myClaims.map(item => (
                                    <ItemCard
                                        key={item.id}
                                        {...item}
                                        compact={true}
                                        isAnonymous={false}
                                        onConfirm={() => onConfirm(item.id)}
                                        onDelete={() => onDelete?.(item.id)}
                                        onClickCard={() => onItemClick?.(item)}
                                        onEdit={() => onEdit?.(item)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}


                {/* Footer Actions */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '/api/manual-logout';
                        }}
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
