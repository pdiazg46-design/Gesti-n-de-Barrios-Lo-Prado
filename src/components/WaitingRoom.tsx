"use client";

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WaitingRoomProps {
    userId: string;
    onApproved: () => void;
}

export const WaitingRoom = ({ userId, onApproved }: WaitingRoomProps) => {
    const [status, setStatus] = useState<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');
    const [votes, setVotes] = useState(0);

    useEffect(() => {
        // Initial Fetch
        const fetchStatus = async () => {
            const { data } = await supabase
                .from('neighbor_approvals')
                .select('status')
                .eq('applicant_id', userId)
                .eq('status', 'APPROVED');
                
            if (data && data.length >= 2) {
                setStatus('APPROVED');
                setTimeout(onApproved, 2000);
            } else if (data) {
                setVotes(data.length);
            }
        };

        fetchStatus();

        // Realtime Subscription on neighbor_approvals
        const channel = supabase
            .channel('waiting_room')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'neighbor_approvals',
                filter: `applicant_id=eq.${userId}`
            }, (payload) => {
                if (payload.new.status === 'APPROVED') {
                    setVotes(prev => {
                        const newVotes = prev + 1;
                        if (newVotes >= 2) {
                            setStatus('APPROVED');
                            setTimeout(onApproved, 2000);
                        }
                        return newVotes;
                    });
                } else if (payload.new.status === 'REJECTED') {
                    setStatus('REJECTED');
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, onApproved]);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 text-center">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center animate-in zoom-in duration-500">
                {status === 'PENDING' && (
                    <>
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="text-amber-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Sala de Espera</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            Has tocado a la puerta del barrio. Por seguridad, no puedes ver el mapa ni los vecinos hasta que <strong>dos personas</strong> verifiquen tu identidad.
                        </p>
                        
                        <div className="bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Avales Recibidos</span>
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-xs">{votes} / 2</span>
                            </div>
                            <div className="flex gap-2 w-full">
                                {[1, 2].map((i) => (
                                    <div key={i} className={`flex-1 h-2 rounded-full transition-all duration-1000 ${i <= votes ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                ))}
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Esperando aprobación...
                            </div>
                        </div>
                    </>
                )}

                {status === 'REJECTED' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="text-red-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            Los vecinos han reportado que no te reconocen como residente del sector.
                        </p>
                    </>
                )}

                {status === 'APPROVED' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 className="text-green-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-green-500 mb-2 uppercase tracking-tighter">Acceso Concedido</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            El candado se ha abierto. Entrando al barrio...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
