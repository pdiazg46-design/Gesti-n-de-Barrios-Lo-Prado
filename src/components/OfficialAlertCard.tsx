import React from 'react';
import { ShieldCheck, Calendar, Bell, AlertTriangle, Info, MapPin } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type OfficialAlertType = 'EMERGENCY' | 'INFO' | 'PUBLIC_SERVICE' | 'EVENT';

interface OfficialAlertProps {
    title: string;
    message: string;
    type: OfficialAlertType;
    muniName: string;
    date: string;
}

export const OfficialAlertCard = ({
    title,
    message,
    type,
    muniName,
    date,
}: OfficialAlertProps) => {
    const typeConfigs = {
        EMERGENCY: {
            icon: <AlertTriangle className="w-5 h-5" />,
            bgColor: 'bg-white',
            borderColor: 'border-red-500',
            textColor: 'text-slate-900',
            iconColor: 'text-red-600',
            label: 'ALERTA CRÍTICA'
        },
        INFO: {
            icon: <Info className="w-5 h-5" />,
            bgColor: 'bg-white',
            borderColor: 'border-blue-500',
            textColor: 'text-slate-900',
            iconColor: 'text-blue-600',
            label: 'INFO INSTITUCIONAL'
        },
        PUBLIC_SERVICE: {
            icon: <Bell className="w-5 h-5" />,
            bgColor: 'bg-white',
            borderColor: 'border-amber-500',
            textColor: 'text-slate-900',
            iconColor: 'text-amber-600',
            label: 'SERVICIO PÚBLICO'
        },
        EVENT: {
            icon: <Calendar className="w-5 h-5" />,
            bgColor: 'bg-white',
            borderColor: 'border-purple-500',
            textColor: 'text-slate-900',
            iconColor: 'text-purple-600',
            label: 'ACTIVIDAD COMUNA'
        }
    };

    const config = typeConfigs[type];

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border-2 transition-all shadow-xl",
            config.borderColor,
            config.bgColor
        )}>
            {/* Golden Header for Officiality */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 px-4 py-2 flex items-center gap-2 text-white shadow-inner">
                <ShieldCheck className="w-4 h-4 fill-white/20" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Entidad Municipal Verificada</span>
            </div>

            <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "flex items-center gap-2",
                        config.iconColor,
                        "text-sm"
                    )}>
                        {React.cloneElement(config.icon as React.ReactElement, { className: "w-5 h-5" })}
                        <span className="font-bold uppercase tracking-[0.1em] leading-none">{config.label}</span>
                    </div>
                    <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider whitespace-nowrap">{date}</span>
                </div>

                <h3 className={cn(
                    "font-black tracking-tight mb-4 leading-tight text-lg sm:text-2xl",
                    config.textColor
                )}>
                    {title}
                </h3>

                <p className="text-slate-700 leading-relaxed font-bold text-sm sm:text-lg">
                    {message}
                </p>

                <div className="mt-4 flex items-center gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <MapPin className="w-3.5 h-3.5" />
                        Distribución Comunal
                    </div>
                </div>

            </div>

            {/* Background Shield Watermark */}
            <div className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
                <ShieldCheck className="w-32 h-32" />
            </div>
        </div>
    );
};
