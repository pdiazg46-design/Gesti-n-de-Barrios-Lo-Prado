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
    isSeniorMode: boolean;
    isMunicipalView?: boolean;
    onToggleSenior: () => void;
    onDashboardToggle: () => void;
    onProfileClick?: () => void;
}

export const BrandHeader = ({
    communityName,
    karma,
    isSeniorMode,
    isMunicipalView = false,
    onToggleSenior,
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

                    {/* Contenido Principal - Simplificado */}
                    <div className="flex items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={cn(
                                    "bg-indigo-600 text-white font-black px-4 py-1.5 rounded-full tracking-[0.1em] uppercase shadow-md",
                                    isSeniorMode ? "text-sm" : "text-xs"
                                )}>Identidad Oficial</span>
                                <div className={cn(
                                    "flex items-center gap-2 font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest pl-2",
                                    isSeniorMode ? "text-sm" : "text-xs"
                                )}>
                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                                    Acceso Verificado
                                </div>
                            </div>
                            <h1 className={cn(
                                "font-black tracking-tighter leading-none text-slate-900 dark:text-white transition-all",
                                isSeniorMode ? "text-3xl sm:text-5xl" : "text-2xl sm:text-4xl"
                            )}>
                                {isMunicipalView ? "Gestión Municipal" : "Comunidad Segura"}
                            </h1>
                            <div className="flex items-center gap-2 mt-2 sm:mt-3 text-slate-600 dark:text-slate-400 font-bold">
                                <MapPin className={isSeniorMode ? "w-5 h-5 text-indigo-500" : "w-4 h-4 text-indigo-500"} />
                                <span className={cn(
                                    "italic opacity-90 uppercase font-black tracking-widest leading-none",
                                    isSeniorMode ? "text-xs sm:text-base" : "text-[10px] sm:text-xs"
                                )}>{isMunicipalView ? "Ilustre Municipalidad de Lo Prado" : "Portal Ciudadano - Barrio Lo Prado"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-10">
                        <div className="flex items-center gap-3">
                            {/* Karma Display */}
                            <div className="hidden xs:flex bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-3 rounded-2xl items-center gap-3 shadow-sm transition-all hover:scale-105">
                                <Coins className="w-6 h-6 text-amber-600" />
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest leading-none mb-1",
                                        isSeniorMode ? "text-sm" : "text-xs"
                                    )}>Mi Impacto</span>
                                    <span className={cn("font-black text-amber-700 dark:text-amber-400", isSeniorMode ? 'text-4xl' : 'text-lg')}>{karma} pts</span>
                                </div>
                            </div>

                            {/* User Profile / Login */}
                            <div className="flex items-center gap-3 border-l-2 border-slate-100 dark:border-slate-800 pl-4 sm:pl-8">
                                {session?.user ? (
                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1.5">Bienvenido</p>
                                            <p className="font-black text-slate-900 dark:text-white text-base">{session.user.name?.split(' ')[0]}</p>
                                        </div>
                                        <button
                                            onClick={onProfileClick}
                                            className="relative group w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-400 shadow-lg transition-all hover:scale-110 active:scale-95 bg-white"
                                        >
                                            <img src={session.user.image || ''} alt={session.user.name || ''} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                                            </div>
                                        </button>

                                        <button
                                            onClick={onToggleSenior}
                                            className={cn(
                                                "px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2",
                                                isSeniorMode
                                                    ? "bg-indigo-700 text-white shadow-indigo-500/40 text-xs sm:text-sm"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                                            )}
                                        >
                                            <ShieldAlert className="w-4 h-4 sm:hidden" />
                                            <span className="hidden sm:inline">{isSeniorMode ? 'VISTA SENIOR ACTIVADA' : 'MODO A+ (LECTURA)'}</span>
                                            <span className="sm:hidden">{isSeniorMode ? 'SENIOR ON' : 'A+'}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => signIn('google')}
                                            className="px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <LogIn className="w-5 h-5" />
                                            ENTRAR
                                        </button>
                                        <button
                                            onClick={onToggleSenior}
                                            className={cn(
                                                "px-4 py-2.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2",
                                                isSeniorMode
                                                    ? "bg-indigo-700 text-white shadow-indigo-500/40 text-xs sm:text-sm"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                                            )}
                                        >
                                            <ShieldAlert className="w-4 h-4 sm:hidden" />
                                            <span className="hidden sm:inline">{isSeniorMode ? 'VISTA SENIOR ACTIVADA' : 'MODO A+ (LECTURA)'}</span>
                                            <span className="sm:hidden">{isSeniorMode ? 'SENIOR ON' : 'A+'}</span>
                                        </button>
                                    </div>
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
