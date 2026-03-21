import React, { useState } from 'react';
import { ShieldAlert, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TermsModalProps {
    onAccept: () => void;
}

export const TermsModal = ({ onAccept }: TermsModalProps) => {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white max-w-2xl w-full max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
                {/* Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-6 sm:p-8 flex items-center gap-4 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="font-black text-slate-900 text-xl sm:text-2xl tracking-tight">Términos y Condiciones Legales</h2>
                        <p className="text-slate-500 font-medium text-sm">Plataforma "Comunidad Segura" de Lo Prado</p>
                    </div>
                </div>

                {/* Body (Scrollable Terms) */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar text-slate-700 space-y-6 text-sm sm:text-base leading-relaxed">
                    <p>
                        Bienvenido a <strong>Comunidad Segura</strong>. Al utilizar esta aplicación, usted acepta los siguientes términos y condiciones de uso, los cuales constituyen un acuerdo vinculante entre usted y la Ilustre Municipalidad de Lo Prado (en adelante, "El Municipio") conforme a la legislación chilena vigente.
                    </p>
                    
                    <section className="space-y-2">
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-widest text-xs">1. Naturaleza de la Plataforma</h3>
                        <p>
                            Esta plataforma es una herramienta digital de participación vecinal, seguridad y economía circular exclusiva para los residentes verificados de Lo Prado. El Municipio actúa únicamente como proveedor tecnológico del espacio virtual y moderador cívico.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-widest text-xs">2. Exención de Responsabilidad Civil y Comercial</h3>
                        <p>
                            Conforme a la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores y el Código Civil chileno, <strong>El Municipio no es parte, mediador, intermediario, ni garante</strong> en ninguna transacción comercial, intercambio, regalo o prestación de servicios que se acuerde entre los vecinos a través de esta plataforma. Las publicaciones de "Venta", "Regalo", "Ofrezco" y "Necesito" son de exclusiva responsabilidad de quienes las emiten.
                        </p>
                        <p>
                            En consecuencia, El Municipio no se hace responsable por estafas, incumplimientos de contrato, calidad de los productos, o cualquier perjuicio material o inmaterial derivado de acuerdos tomados por medio del chat o las interacciones de esta aplicación.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-widest text-xs">3. Conducta y Sanciones</h3>
                        <p>
                            Queda estrictamente prohibido el uso de la plataforma para fines ilícitos, acoso, venta de productos ilegales, o difusión de noticias falsas que alteren el orden público. El Municipio se reserva el derecho de eliminar contenido y <strong>suspender de forma permanente y sin previo aviso</strong> las cuentas que infrinjan estas normas, pudiendo derivar los antecedentes al Ministerio Público si los hechos revisten carácter de delito.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h3 className="font-black text-slate-900 text-base uppercase tracking-widest text-xs">4. Privacidad y Tratamiento de Datos</h3>
                        <p>
                            De acuerdo a la Ley N° 19.628 sobre Protección de la Vida Privada, sus datos de GPS y actividad pública serán tratados confidencialmente para fines de seguridad y gestión municipal. Ciertas interacciones (como la mensajería de transacciones) ocultan temporalmente su identidad pública para su protección perimetral, la cual solo será revelada voluntariamente al cerrar un trato.
                        </p>
                    </section>
                </div>

                {/* Footer (Action) */}
                <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 shrink-0 space-y-6">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-center justify-center mt-1 shrink-0">
                            <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                            />
                            <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors flex items-center justify-center group-hover:border-indigo-400">
                                <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <span className="text-slate-700 text-sm select-none leading-snug">
                            Declaro haber leído, comprendido y <strong className="text-slate-900">acepto la totalidad de los Términos y Condiciones</strong>, asumiendo la responsabilidad exclusiva por mis interacciones y transacciones en esta plataforma.
                        </span>
                    </label>

                    <button
                        onClick={onAccept}
                        disabled={!accepted}
                        className={cn(
                            "w-full py-4 rounded-2xl font-black text-white transition-all duration-300 transform shadow-xl flex items-center justify-center gap-2",
                            accepted 
                                ? "bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] shadow-indigo-600/20" 
                                : "bg-slate-300 cursor-not-allowed shadow-none"
                        )}
                    >
                        Ingresar a la Plataforma
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
