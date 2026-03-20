import React, { useState, useEffect } from 'react';
import { MapPin, Shield, Bell, Search, Coins, LogOut, LogIn, ShieldAlert, QrCode } from 'lucide-react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { NotificationCenter } from '@/components/NotificationCenter';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BrandHeaderProps {
    communityName: string;
    karma: number;
    avatarUrl?: string;
    isMunicipalView?: boolean;
    onDashboardToggle: () => void;
    onProfileClick?: () => void;
    onInviteClick?: () => void;
    onSearch?: (query: string) => void;
}

export const BrandHeader = ({
    communityName,
    karma,
    avatarUrl,
    isMunicipalView = false,
    onDashboardToggle,
    onProfileClick,
    onInviteClick,
    onSearch
}: BrandHeaderProps) => {
    const { data: session } = useSession();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    
    // Motor de Búsqueda Reactivo Local
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [localQuery, setLocalQuery] = useState('');

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (onSearch) {
                onSearch(localQuery.trim());
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [localQuery, onSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Fallback prevent
    };
    return (
        <header className="relative w-full overflow-hidden">
            {/* Main Banner with Parallax-like effect */}
            <div className="relative h-48 sm:h-64 w-full group overflow-hidden">
                <img
                    src="/images/banner_municipalidad.png"
                    alt="Municipalidad de Lo Prado"
                    className="w-full h-full object-cover object-[center_20%] transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradient Overlays for Elegance */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/10 dark:to-slate-950/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 via-transparent to-transparent" />

                {/* Logo Municipalidad - Esquina Superior Izquierda */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-none">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center p-3 shadow-xl border border-white/20">
                        <img
                            src="/images/logo_municipalidad.png"
                            alt="Ilustre Municipalidad de Lo Prado"
                            className="w-full h-full object-contain drop-shadow-sm"
                        />
                    </div>
                </div>

                {/* Logo "Lo Prado Por ti" - Esquina Superior Derecha */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 py-2 sm:px-6 sm:py-3 shadow-xl border border-white/20">
                        <img
                            src="/images/logo_por_ti.png"
                            alt="Lo Prado por ti"
                            className="h-10 sm:h-14 w-auto object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* Floating Glassmorphic Identity Card - Simplificado */}
            <div className="max-w-7xl mx-auto px-4 -mt-16 sm:-mt-24 relative z-10 transition-all duration-700">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 transition-all hover:shadow-indigo-500/10">

                    {/* Contenido Principal - Identidad Municipal */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="w-full text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 flex-wrap">
                                <span className="bg-indigo-600 text-white font-black px-3 py-1 rounded-full tracking-[0.05em] uppercase shadow-md text-[10px] sm:text-sm">Identidad Oficial</span>
                                <div className="flex items-center gap-1.5 font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest pl-1 text-[10px] sm:text-sm">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    Acceso Verificado
                                </div>
                            </div>
                            <h1 className="font-black tracking-tighter leading-none text-slate-900 dark:text-white transition-all text-2xl sm:text-5xl" style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)' }}>
                                {isMunicipalView ? "Gestión Municipal" : "Comunidad Segura"}
                            </h1>
                            <div className="flex items-center gap-2 mt-4 sm:mt-5 text-slate-600 dark:text-slate-400 font-bold">
                                <MapPin className="w-5 h-5 text-indigo-500" />
                                <span className="italic opacity-90 uppercase font-black tracking-[0.2em] leading-none text-[10px] sm:text-sm">
                                    {isMunicipalView ? "Ilustre Municipalidad de Lo Prado" : "Portal Ciudadano • Barrio Lo Prado"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 w-full sm:w-auto">
                        {/* User Info & Karma Display */}
                        {session?.user && (
                            <div className="flex items-center gap-3 sm:gap-4 bg-indigo-600/90 dark:bg-indigo-900/70 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xl border border-indigo-500/30 dark:border-indigo-700/50 transition-all hover:shadow-indigo-500/30 w-full sm:w-auto">
                                <div className="flex flex-col items-center shrink-0">
                                    <div className="p-1.5 bg-white/10 dark:bg-white/5 rounded-lg mb-0.5 backdrop-blur-md">
                                        <Shield className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300/20" />
                                    </div>
                                    <span className="text-[8px] font-semibold text-white/60 uppercase tracking-widest leading-none">Karma</span>
                                    <span className="text-base sm:text-lg font-bold text-white tracking-tight leading-none mt-0.5">{karma}</span>
                                </div>
                                <div className="w-px h-8 bg-indigo-400/30 self-center" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <span className="text-[8px] font-semibold text-indigo-200 uppercase tracking-wider bg-indigo-800/40 px-1.5 py-0.5 rounded-md border border-indigo-400/20">Vecino</span>
                                    </div>
                                    <h2 className="text-sm sm:text-lg font-bold text-white truncate leading-none mb-0.5">{session.user.name}</h2>
                                    <p className="text-[8px] text-white/70 font-semibold uppercase tracking-wide truncate">Lo Prado</p>
                                </div>
                                <button
                                    onClick={onProfileClick}
                                    className="relative group w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden border border-indigo-200 dark:border-indigo-400 shadow-lg transition-all hover:scale-110 active:scale-95 bg-slate-100 dark:bg-slate-800 shrink-0"
                                >
                                    {(avatarUrl || session.user.image) ? (
                                        <img src={avatarUrl || session.user.image || ''} alt={session.user.name || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center font-black text-slate-400 dark:text-slate-500 text-xl uppercase">
                                            {session.user.name?.[0] || '?'}
                                        </div>
                                    )}
                                </button>
                            </div>
                        )}

                        {!session?.user && (
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-indigo-600 text-white shadow-xl active:scale-95 flex items-center gap-3 whitespace-nowrap"
                            >
                                <LogIn className="w-5 h-5" />
                                ENTRAR
                            </button>
                        )}


                        <div className="flex items-center gap-3 border-l-2 border-slate-100 dark:border-slate-800 pl-4 sm:pl-8 sm:ml-0">
                            {onInviteClick && (
                                <button onClick={onInviteClick} className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-700 shadow-sm transition-all group relative mr-2">
                                    <QrCode className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                                </button>
                            )}
                            
                            <form onSubmit={handleSearch} className={cn("flex items-center transition-all ease-out duration-300 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden", isSearchOpen ? 'w-40 sm:w-56 px-3 ml-2' : 'w-0 border-none opacity-0')}>
                                <input value={localQuery} onChange={(e) => setLocalQuery(e.target.value)} type="text" placeholder="Encontrar..." className="w-full h-10 bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none" />
                            </form>
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-sm transition-all ml-2">
                                <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                            </button>

                            <button onClick={() => setIsNotificationOpen(true)} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-sm transition-all relative group ml-2">
                                <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-slate-800 shadow-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Inyección del Centro de Notificaciones Nativo */}
            <NotificationCenter isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        </header>
    );
};
