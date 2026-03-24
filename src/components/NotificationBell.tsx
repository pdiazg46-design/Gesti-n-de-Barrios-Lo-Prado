"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Check, X, ShieldAlert, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationCenter } from '@/components/NotificationCenter';

export const NotificationBell = ({ userId }: { userId: string }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [showPrefs, setShowPrefs] = useState(false);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (data) setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();

        const channel = supabase
            .channel('user-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    const [pendingApproval, setPendingApproval] = useState<{ notifId: string, approvalId: string } | null>(null);

    const handleApprovalResponse = async (notificationId: string, approvalId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const { error: approvalError } = await supabase
                .from('neighbor_approvals')
                .update({ status })
                .eq('id', approvalId);
            
            if (approvalError) throw approvalError;

            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Error managing approval", error);
            alert("No se pudo procesar el voto. Inténtalo de nuevo.");
        }
        setPendingApproval(null);
    };

    const unreadCount = notifications.length;

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-colors relative shadow-sm border border-slate-100 dark:border-slate-700"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 top-16 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                        >
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                                <h3 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Bell className="w-4 h-4 text-indigo-500" /> Alertas Cívicas
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsOpen(false);
                                        setShowPrefs(true);
                                    }} 
                                    className="p-2 bg-slate-200/50 dark:bg-slate-700/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-500 rounded-xl transition-colors" 
                                    title="Configurar Alertas Push"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-bold text-sm">
                                        No tienes notificaciones pendientes.
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-5 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            {notif.type === 'APPROVAL_REQUEST' ? (
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                                            <ShieldAlert className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{notif.title}</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mb-4 ml-11">{notif.message}</p>
                                                    
                                                    {/* Botones de Veto civil */}
                                                    <div className="flex gap-2 ml-11">
                                                        <button 
                                                            onClick={() => setPendingApproval({ notifId: notif.id, approvalId: notif.reference_id })}
                                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <Check className="w-3 h-3" /> Conozco
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApprovalResponse(notif.id, notif.reference_id, 'REJECTED')}
                                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-[10px] font-black uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" /> Falso
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{notif.title}</h4>
                                                    <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                                                    <button 
                                                        onClick={() => {
                                                            supabase.from('notifications').update({ is_read: true }).eq('id', notif.id).then(() => fetchNotifications());
                                                        }}
                                                        className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-2 hover:underline"
                                                    >
                                                        Marcar leída
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {pendingApproval && (
                    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border-4 border-red-500/20 text-center"
                        >
                            <div className="w-20 h-20 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-6">
                                <ShieldAlert className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Responsabilidad Solidaria</h2>
                            <p className="text-slate-600 dark:text-slate-300 font-medium mb-8">
                                Te estás haciendo responsable legal y civilmente de incorporar a una persona que declaras conocer, y le darás acceso al grupo cerrado de seguridad de Barrio Seguro.
                                <br/><br/>
                                <strong>¿Estás absolutamente seguro de que conoces a este vecino?</strong>
                            </p>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => handleApprovalResponse(pendingApproval.notifId, pendingApproval.approvalId, 'APPROVED')}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-colors"
                                >
                                    SÍ, DECLARO CONOCERLO
                                </button>
                                <button 
                                    onClick={() => setPendingApproval(null)}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold tracking-wider uppercase py-4 rounded-2xl transition-colors"
                                >
                                    CANCELAR - NO ESTOY SEGURO
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <NotificationCenter isOpen={showPrefs} onClose={() => setShowPrefs(false)} />
        </div>
    );
};
