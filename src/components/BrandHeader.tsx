import React from 'react';
import { MapPin, Shield, Bell, Search, Coins, LogOut, LogIn } from 'lucide-react';
import { useSession, signOut, signIn } from 'next-auth/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BrandHeaderProps {
    communityName: string;
    karma: number;
    isSeniorMode: boolean;
    onToggleSenior: () => void;
    onDashboardToggle: () => void;
}

export const BrandHeader = ({
    communityName,
    karma,
    isSeniorMode,
    onToggleSenior,
    onDashboardToggle,
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
            </div>

            {/* Floating Glassmorphic Identity Card */}
            <div className="max-w-5xl mx-auto px-4 -mt-20 sm:-mt-24 relative z-10 transition-all duration-700">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col sm:flex-row items-center justify-between gap-8 transition-all hover:shadow-indigo-500/10">

                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/30 to-indigo-600/30 rounded-3xl blur-xl opacity-40 transition duration-1000 group-hover:opacity-70"></div>
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700 p-2 sm:p-3 transform transition-transform group-hover:scale-105">
                                <img
                                    src="/images/logo_municipalidad.png"
                                    alt="Ilustre Municipalidad de Lo Prado"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "bg-indigo-600 text-white font-black px-3 py-1 rounded-full tracking-[0.2em] uppercase shadow-sm",
                                    isSeniorMode ? "text-xs" : "text-[10px]"
                                )}>ESTADO OFICIAL</span>
                                <div className={cn(
                                    "flex items-center gap-1.5 font-black text-amber-500 uppercase tracking-widest pl-2",
                                    isSeniorMode ? "text-xs" : "text-[10px]"
                                )}>
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    Portal Verificado
                                </div>
                            </div>
                            <h1 className={cn(
                                "font-black tracking-tighter leading-none text-slate-900 dark:text-white transition-all",
                                isSeniorMode ? "text-5xl" : "text-3xl sm:text-4xl"
                            )}>
                                {communityName}
                            </h1>
                            <div className="flex items-center gap-2 mt-3 text-slate-600 dark:text-slate-400 font-bold">
                                <MapPin className={isSeniorMode ? "w-5 h-5 text-indigo-500" : "w-4 h-4 text-indigo-500"} />
                                <span className={cn(
                                    "tracking-tight italic opacity-80 uppercase font-black tracking-widest leading-none",
                                    isSeniorMode ? "text-sm" : "text-[11px]"
                                )}>Gestión Ilustre Municipalidad de Lo Prado</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-10">
                        {/* Secondary Logo (Por Ti) - Matched to Main Logo size */}
                        <div className="flex items-center justify-center p-1 sm:p-2 border-r-2 border-slate-50 dark:border-slate-800 pr-6 sm:pr-10">
                            <img
                                src="/images/logo_por_ti.png"
                                alt="Lo Prado por ti"
                                className="h-16 sm:h-24 w-auto object-contain transition-all hover:scale-105 drop-shadow-lg"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Karma Display */}
                            <div className="hidden xs:flex bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-3 rounded-2xl items-center gap-3 shadow-sm transition-all hover:scale-105">
                                <Coins className="w-6 h-6 text-amber-600" />
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest leading-none mb-1",
                                        isSeniorMode ? "text-xs" : "text-[9px]"
                                    )}>MI IMPACTO</span>
                                    <span className={cn("font-black text-amber-700 dark:text-amber-300", isSeniorMode ? 'text-3xl' : 'text-base')}>{karma} pts</span>
                                </div>
                            </div>

                            {/* User Profile / Login */}
                            <div className="flex items-center gap-3 border-l-2 border-slate-100 dark:border-slate-800 pl-4 sm:pl-8">
                                {session?.user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bienvenido</p>
                                            <p className="font-black text-slate-900 dark:text-white text-sm">{session.user.name?.split(' ')[0]}</p>
                                        </div>
                                        <button
                                            onClick={() => signOut()}
                                            className="relative group w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-100 dark:border-indigo-800/50 shadow-md transition-all hover:scale-105"
                                        >
                                            <img src={session.user.image || ''} alt={session.user.name || ''} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <LogOut className="w-4 h-4 text-white" />
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => signIn('google')}
                                            className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            ENTRAR
                                        </button>
                                        <button
                                            onClick={onToggleSenior}
                                            className={cn(
                                                "px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 hidden sm:block",
                                                isSeniorMode
                                                    ? "bg-indigo-600 text-white shadow-indigo-500/40"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"
                                            )}
                                        >
                                            {isSeniorMode ? 'VISTA SENIOR' : 'MODO A+'}
                                        </button>
                                    </div>
                                )}

                                {isSeniorMode && session?.user && (
                                    <button
                                        onClick={onToggleSenior}
                                        className="px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg active:scale-95"
                                    >
                                        VISTA SENIOR
                                    </button>
                                )}

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
            </div>
        </header>
    );
};
