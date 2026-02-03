"use client";

import React, { useState } from 'react';
import { User, Phone, Mail, Home, ShieldCheck, Search, CheckCircle2, Users } from 'lucide-react';

interface EnrollmentFormProps {
    communityName: string;
    isSeniorMode?: boolean;
    onComplete: (data: any) => void;
}

export const EnrollmentForm = ({ communityName, onComplete, isSeniorMode }: EnrollmentFormProps) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        street: '',
        number: '',
        commune: '',
    });

    const [selectedNeighbors, setSelectedNeighbors] = useState<string[]>([]);

    const mockNeighbors = [
        { id: 'n1', name: 'Ricardo Aguilera', address: 'Dinamarca 5424', proximity: 'Vecino directo' },
        { id: 'n2', name: 'Laura Sepúlveda', address: 'Dinamarca 5410', proximity: 'Cercano' },
        { id: 'n3', name: 'Carlos Morales', address: 'Av. Las Condes 10200', proximity: 'Misma calle' },
    ];

    const formatPhone = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Ensure it starts with 569 if not empty
        let formatted = '+56 9';

        // Extract the main 8 digits (after +56 9)
        const coreDigits = digits.startsWith('569') ? digits.slice(3) : digits.startsWith('9') ? digits.slice(1) : digits;

        const part1 = coreDigits.slice(0, 4);
        const part2 = coreDigits.slice(4, 8);

        if (part1) formatted += ' ' + part1;
        if (part2) formatted += ' ' + part2;

        return formatted;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Don't allow deleting the prefix +56
        if (!value.startsWith('+56')) {
            setFormData({ ...formData, phone: '+56' });
            return;
        }
        const formatted = formatPhone(value);
        setFormData({ ...formData, phone: formatted });
    };

    const toggleNeighbor = (id: string) => {
        setSelectedNeighbors(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleNext = () => setStep(s => s + 1);

    return (
        <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            {/* Progress Header */}
            <div className="bg-indigo-600 p-6 text-white">
                <h2 className="text-xl font-bold mb-1">Unirse a {communityName}</h2>
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-white' : 'bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="p-8">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                            <User className="text-indigo-600 w-5 h-5" /> Datos Personales
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</label>
                                <div className="relative">
                                    <User className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 ${isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                    <input
                                        type="text"
                                        placeholder="Ej: Patricio Diaz"
                                        className={`w-full pr-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isSeniorMode
                                                ? 'pl-12 py-4 font-bold text-lg'
                                                : 'pl-10 py-3 font-medium text-sm'
                                            } text-slate-900 dark:text-white`}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</label>
                                    <div className="relative">
                                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 ${isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                        <input
                                            type="tel"
                                            placeholder="+56 9 1234 5678"
                                            onFocus={() => {
                                                if (!formData.phone) setFormData({ ...formData, phone: '+56' });
                                            }}
                                            className={`w-full pr-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isSeniorMode
                                                    ? 'pl-12 py-4 font-bold text-lg'
                                                    : 'pl-10 py-3 font-medium text-sm'
                                                } text-slate-900 dark:text-white`}
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gmail / Correo</label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 ${isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                        <input
                                            type="email"
                                            placeholder="comunidad.segura.ejemplo@gmail.com"
                                            className={`w-full pr-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isSeniorMode
                                                    ? 'pl-12 py-4 font-bold text-lg'
                                                    : 'pl-10 py-3 font-medium text-sm'
                                                } text-slate-900 dark:text-white`}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calle</label>
                                    <div className="relative">
                                        <Home className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 ${isSeniorMode ? 'w-5 h-5' : 'w-4 h-4'}`} />
                                        <input
                                            type="text"
                                            placeholder="Ej: Dinamarca"
                                            className={`w-full pr-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isSeniorMode
                                                    ? 'pl-12 py-4 font-bold text-lg'
                                                    : 'pl-10 py-3 font-medium text-sm'
                                                } text-slate-900 dark:text-white`}
                                            value={formData.street}
                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número</label>
                                        <input
                                            type="text"
                                            placeholder="5424"
                                            className={`w-full px-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isSeniorMode
                                                    ? 'py-4 font-bold text-lg'
                                                    : 'py-3 font-medium text-sm'
                                                } text-slate-900 dark:text-white`}
                                            value={formData.number}
                                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Comuna</label>
                                        <input
                                            type="text"
                                            placeholder="Vitacura"
                                            className={`w-full px-4 bg-slate-100 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isSeniorMode
                                                    ? 'py-4 font-bold text-lg'
                                                    : 'py-3 font-medium text-sm'
                                                } text-slate-900 dark:text-white`}
                                            value={formData.commune}
                                            onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!formData.name || !formData.street || !formData.number}
                            className={`w-full mt-8 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50 ${isSeniorMode ? 'py-5 font-black text-xl' : 'py-4 font-bold text-lg'
                                }`}
                        >
                            Siguiente paso
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Users className="text-indigo-600 w-5 h-5" /> Validación por Vecinos
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Selecciona un vecino conocido que viva cerca de tu dirección para validar tu ingreso.
                        </p>

                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o dirección..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2 mb-8 max-h-[250px] overflow-y-auto pr-1">
                            {mockNeighbors.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => toggleNeighbor(n.id)}
                                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${selectedNeighbors.includes(n.id)
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                                        }`}
                                >
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{n.name}</p>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{n.address}</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-tight mt-1">{n.proximity}</p>
                                    </div>
                                    {selectedNeighbors.includes(n.id) && <CheckCircle2 className="text-indigo-600 w-5 h-5" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={selectedNeighbors.length < 2}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl active:scale-95 transition-all disabled:opacity-50 disabled:bg-slate-300"
                        >
                            Pedir validación ({selectedNeighbors.length}/2)
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="text-green-600 w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Petición Enviada</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 px-4 text-sm">
                            Hemos enviado una solicitud a <strong>{selectedNeighbors.length} vecinos</strong> para que confirmen que vives en {formData.street} {formData.number}.
                        </p>

                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 text-left mb-8 border border-slate-200 dark:border-slate-700">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Estado de Validación (Social)</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center animate-pulse">
                                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Vouch de Vecinos ({selectedNeighbors.length}/2)</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-slate-200 rounded-full" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400 italic">Validación de Sistema (Geofencing)</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onComplete(formData)}
                            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
