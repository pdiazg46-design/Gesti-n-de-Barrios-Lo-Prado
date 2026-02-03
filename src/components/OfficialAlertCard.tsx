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
    isSeniorMode?: boolean;
}

export const OfficialAlertCard = ({
    title,
    message,
    type,
    muniName,
    date,
    isSeniorMode = false
}: OfficialAlertProps) => {
    const typeConfigs = {
        EMERGENCY: {
            icon: <AlertTriangle className="w-5 h-5" />,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            borderColor: 'border-red-500',
            textColor: 'text-red-700 dark:text-red-300',
            iconColor: 'text-red-600',
            label: 'Emergencia'
        },
        INFO: {
            icon: <Info className="w-5 h-5" />,
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-700 dark:text-blue-300',
            iconColor: 'text-blue-600',
            label: 'Comunicado'
        },
        PUBLIC_SERVICE: {
            icon: <Bell className="w-5 h-5" />,
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            borderColor: 'border-amber-500',
            textColor: 'text-amber-700 dark:text-amber-300',
            iconColor: 'text-amber-600',
            label: 'Servicios Públicos'
        },
        EVENT: {
            icon: <Calendar className="w-5 h-5" />,
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-500',
            textColor: 'text-purple-700 dark:text-purple-300',
            iconColor: 'text-purple-600',
            label: 'Evento Comunal'
        }
    };

    const config = typeConfigs[type];

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border-2 transition-all shadow-xl",
            config.borderColor,
            config.bgColor,
            isSeniorMode && "scale-105 my-4"
        )}>
            {/* Golden Header for Officiality */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 px-4 py-2 flex items-center gap-2 text-white shadow-inner">
                <ShieldCheck className="w-4 h-4 fill-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Entidad Municipal Verificada</span>
            </div>

            <div className={cn(
                isSeniorMode ? "p-8" : "p-5"
            )}>
                <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                        "flex items-center gap-2",
                        config.iconColor,
                        isSeniorMode ? "text-sm" : "text-xs"
                    )}>
                        {React.cloneElement(config.icon as React.ReactElement, { className: isSeniorMode ? "w-6 h-6" : "w-5 h-5" })}
                        <span className="font-black uppercase tracking-widest">{config.label}</span>
                    </div>
                    <span className={cn("font-medium text-slate-400", isSeniorMode ? "text-xs" : "text-[10px]")}>{date}</span>
                </div>

                <h3 className={cn(
                    "font-black tracking-tight mb-4 leading-tight",
                    isSeniorMode ? "text-3xl" : "text-lg",
                    config.textColor
                )}>
                    {title}
                </h3>

                <p className={cn(
                    "text-slate-600 dark:text-slate-400 leading-relaxed",
                    isSeniorMode ? "text-xl font-medium" : "text-sm font-normal"
                )}>
                    {message}
                </p>

                <div className="mt-4 flex items-center gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        Todo el Barrio
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
