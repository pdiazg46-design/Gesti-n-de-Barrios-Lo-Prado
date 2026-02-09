import React from 'react';
import { MapPin, Shield, Bell, Search, Coins, LogOut, LogIn, ShieldAlert } from 'lucide-react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BrandHeaderProps {
    communityName: string;
    karma: number;
    isMunicipalView?: boolean;
    onDashboardToggle: () => void;
    onProfileClick?: () => void;
}

export const BrandHeader = ({
    communityName,
    karma,
    isMunicipalView = false,
    onDashboardToggle,
    onProfileClick,
}: BrandHeaderProps) => {
    const { data: session } = useSession();
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
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                    <div className="relative group">
                        <div className="absolute -inset-3 bg-gradient-to-tr from-white/50 to-indigo-200/50 rounded-3xl blur-2xl opacity-70 transition duration-1000 group-hover:opacity-100"></div>
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white/98 dark:bg-white/98 backdrop-blur-md rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden p-3 sm:p-4 transform transition-transform group-hover:scale-110">
                            <img
                                src="/images/logo_municipalidad.png"
                                alt="Ilustre Municipalidad de Lo Prado"
                                className="w-full h-full object-contain drop-shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Logo "Lo Prado Por ti" - Esquina Superior Derecha */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-tl from-white/40 to-amber-200/40 rounded-2xl blur-xl opacity-60 transition duration-1000 group-hover:opacity-90"></div>
                        <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-white/50 dark:border-slate-700/50 p-3 sm:p-4 transform transition-transform group-hover:scale-105">
                            <img
                                src="/images/logo_por_ti.png"
                                alt="Lo Prado por ti"
                                className="h-10 sm:h-16 w-auto object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Glassmorphic Identity Card - Simplificado */}
            <div className="max-w-5xl mx-auto px-4 -mt-16 sm:-mt-24 relative z-10 transition-all duration-700">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 transition-all hover:shadow-indigo-500/10">

                    {/* Contenido Principal - Identidad Municipal */}
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-indigo-600 text-white font-black px-4 py-1.5 rounded-full tracking-[0.1em] uppercase shadow-md text-xs sm:text-sm">Identidad Oficial</span>
                                <div className="flex items-center gap-2 font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest pl-2 text-xs sm:text-sm">
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    Acceso Verificado
                                </div>
                            </div>
                            <h1 className="font-black tracking-tighter leading-none text-slate-900 dark:text-white transition-all text-3xl sm:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
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

                    <div className="flex items-center gap-4 sm:gap-10">
                        {/* Karma Display */}
                        <div className="hidden md:flex bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-6 py-4 rounded-[2rem] items-center gap-4 shadow-sm transition-all hover:scale-105">
                            <Coins className="w-7 h-7 text-amber-600" />
                            <div className="flex flex-col">
                                <span className="font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest leading-none mb-1 text-xs">Mi Impacto</span>
                                <span className="font-black text-amber-700 dark:text-amber-400 text-2xl">{karma} pts</span>
                            </div>
                        </div>

                        {/* User Avatar */}
                        {session?.user && (
                            <button
                                onClick={onProfileClick}
                                className="relative group w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-400 shadow-lg transition-all hover:scale-110 active:scale-95 bg-white shrink-0"
                            >
                                <img src={session.user.image || ''} alt={session.user.name || ''} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                                </div>
                            </button>
                        )}

                        {!session?.user && (
                            <button
                                onClick={() => signIn('google')}
                                className="px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] bg-indigo-600 text-white shadow-xl active:scale-95 flex items-center gap-3 whitespace-nowrap"
                            >
                                <LogIn className="w-5 h-5" />
                                ENTRAR
                            </button>
                        )}


                        <div className="flex items-center gap-3 border-l-2 border-slate-100 dark:border-slate-800 pl-4 sm:pl-8">
                            <button className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-md transition-all hover:shadow-lg">
                                <Search className="w-6 h-6" />
                            </button>
                            <button className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-amber-500 border border-slate-200 dark:border-slate-700 shadow-md transition-all hover:shadow-lg relative group">
                                <Bell className="w-6 h-6 group-hover:animate-bounce transition-all" />
                                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 shadow-xl" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
