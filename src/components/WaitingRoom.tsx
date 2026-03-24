"use client";

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Loader2, CheckCircle2, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface WaitingRoomProps {
    userId: string;
    onApproved: () => void;
}

interface Neighbor {
    id: string;
    full_name: string;
    used_vip_code: string;
}

export const WaitingRoom = ({ userId, onApproved }: WaitingRoomProps) => {
    const [step, setStep] = useState<'LOADING' | 'SELECT_VALIDATORS' | 'WAITING'>('LOADING');
    const [status, setStatus] = useState<'PENDING' | 'REJECTED' | 'APPROVED'>('PENDING');
    const [votes, setVotes] = useState(0);
    const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
    const [selectedValidators, setSelectedValidators] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            // 1. Check if user already has pending approvals
            const { data: existing } = await supabase
                .from('neighbor_approvals')
                .select('status, validator_id')
                .eq('applicant_id', userId);
                
            if (existing && existing.length > 0) {
                const approvedCount = existing.filter(e => e.status === 'APPROVED').length;
                const rejectedCount = existing.filter(e => e.status === 'REJECTED').length;
                
                if (approvedCount >= 2) {
                    setStatus('APPROVED');
                    setTimeout(onApproved, 2000);
                } else if (rejectedCount > 0) {
                    setStatus('REJECTED');
                } else {
                    setVotes(approvedCount);
                    setStep('WAITING');
                }
            } else {
                // 2. No pending approvals, fetch verified neighbors to choose from
                const { data: nbs } = await supabase
                    .from('profiles')
                    .select('id, full_name, used_vip_code')
                    .eq('is_verified', true)
                    .neq('id', userId);
                
                if (nbs) {
                    setNeighbors(nbs);
                }
                setStep('SELECT_VALIDATORS');
            }
        };

        fetchStatus();

        // Realtime Subscription
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

    const handleSubmitValidators = async () => {
        if (selectedValidators.length !== 2) return;
        setIsSubmitting(true);
        
        const inserts = selectedValidators.map(vid => ({
            applicant_id: userId,
            validator_id: vid,
            status: 'PENDING'
        }));
        
        const { data: insertedApprovals, error } = await supabase.from('neighbor_approvals').insert(inserts).select();
        
        if (!error && insertedApprovals) {
            // Push Notification to each validator
            const notifs = insertedApprovals.map(approval => ({
                user_id: approval.validator_id,
                title: 'Solicitud de Ingreso al Barrio',
                message: 'Un nuevo vecino solicita acceder al grupo cerrado de seguridad y ha indicado que tú puedes recomendarlo.',
                type: 'APPROVAL_REQUEST',
                reference_id: approval.id,
                is_read: false
            }));
            await supabase.from('notifications').insert(notifs);

            setStep('WAITING');
        } else {
            alert('Error al enviar la solicitud. Intenta nuevamente.');
        }
        setIsSubmitting(false);
    };

    const toggleValidator = (id: string) => {
        if (selectedValidators.includes(id)) {
            setSelectedValidators(selectedValidators.filter(v => v !== id));
        } else {
            if (selectedValidators.length < 2) {
                setSelectedValidators([...selectedValidators, id]);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 text-center overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl border-4 border-slate-100 dark:border-slate-800 flex flex-col items-center animate-in zoom-in duration-500 my-auto">
                
                {step === 'LOADING' && (
                    <div className="flex flex-col items-center py-10">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Verificando Estado...</p>
                    </div>
                )}

                {step === 'SELECT_VALIDATORS' && (
                    <>
                        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
                            <Users className="text-indigo-600 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Aval Vecinal</h2>
                        <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">
                            El barrio es un entorno cerrado. Selecciona a <strong>dos vecinos</strong> que te conozcan para que aprueben tu ingreso a la plataforma.
                        </p>

                        <div className="w-full text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vecinos Disponibles</span>
                                <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{selectedValidators.length}/2 Seleccionados</span>
                            </div>
                            
                            {neighbors.length > 0 ? (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    {neighbors.map(n => (
                                        <label 
                                            key={n.id} 
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                                selectedValidators.includes(n.id) 
                                                ? 'bg-white shadow-sm border-indigo-200 border-2' 
                                                : 'bg-white shadow-sm border-transparent hover:border-slate-300 border-2'
                                            }`}
                                        >
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 accent-indigo-600 cursor-pointer"
                                                checked={selectedValidators.includes(n.id)}
                                                onChange={() => toggleValidator(n.id)}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                                    {n.full_name || 'Vecino Anónimo'}
                                                </span>
                                                {n.used_vip_code && (
                                                    <span className="text-[9px] font-black tracking-widest uppercase text-indigo-500">
                                                        Fundador {n.used_vip_code}
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4 italic font-medium">
                                    Aún no hay vecinos registrados para validarte.
                                </p>
                            )}
                        </div>

                        <button 
                            disabled={selectedValidators.length !== 2 || isSubmitting}
                            onClick={handleSubmitValidators}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black tracking-widest uppercase text-xs py-4 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                        >
                            {isSubmitting ? 'Enviando Solicitud...' : 'Solicitar Acceso'}
                        </button>
                    </>
                )}

                {step === 'WAITING' && status === 'PENDING' && (
                    <>
                        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="text-amber-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Petición Enviada</h2>
                        <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">
                            Tus avales han sido notificados. Comunícate con ellos indicándoles que te aprueben desde su panel de moderación.
                        </p>
                        
                        <div className="bg-slate-50 dark:bg-slate-800 w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Avales Recibidos</span>
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full text-xs">{votes} / 2</span>
                            </div>
                            <div className="flex gap-2 w-full">
                                {[1, 2].map((i) => (
                                    <div key={i} className={`flex-1 h-3 rounded-full transition-all duration-1000 ${i <= votes ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                ))}
                            </div>
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 animate-pulse">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Esperando aprobación en tiempo real...
                            </div>
                        </div>
                    </>
                )}

                {step === 'WAITING' && status === 'REJECTED' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                            <ShieldAlert className="text-red-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-tighter">Acceso Denegado</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            Los avales seleccionados no te han reconocido como residente del sector.
                        </p>
                    </>
                )}

                {step === 'WAITING' && status === 'APPROVED' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
                            <CheckCircle2 className="text-green-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-green-500 mb-2 uppercase tracking-tighter">Acceso Concedido</h2>
                        <p className="text-slate-500 font-medium text-sm">
                            Identidad verificada exitosamente. Abriendo la bóveda...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
