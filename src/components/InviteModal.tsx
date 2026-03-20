import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { X, Mail, Copy, CheckCircle2 } from 'lucide-react';

interface InviteModalProps {
    communityName: string;
    onClose: () => void;
}

export const InviteModal = ({ communityName, onClose }: InviteModalProps) => {
    const inviteUrl = `https://lo-prado.vercel.app/n/${communityName.toLowerCase().replace(/\s+/g, '-')}`;
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState('');

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEmailInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        
        const subject = encodeURIComponent(`Únete a nuestra comunidad vecinal en ${communityName}`);
        const body = encodeURIComponent(
            `Hola,\n\nTe invito a unirte a la plataforma oficial de nuestra comunidad para organizarnos en el barrio.\n\nSimplemente regístrate aquí con tu cuenta de Google:\n${inviteUrl}\n\n¡Te esperamos!`
        );
        
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        setEmail('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative animate-in slide-in-from-bottom-8">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center border-b border-slate-100 dark:border-slate-800 space-y-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        Invita a tus<br />
                        <span className="text-indigo-600 dark:text-indigo-400">Vecinos</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Muéstrales este código QR para escanear, o envíales el link oficial del barrio directamente al correo.
                    </p>
                </div>

                <div className="p-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 mb-8 max-w-[200px] w-full aspect-square flex items-center justify-center">
                        <QRCode
                            value={inviteUrl}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            level="H"
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                    </div>

                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mb-8"
                    >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                        {copied ? '¡Enlace copiado!' : 'Copiar enlace oficial'}
                    </button>

                    <div className="w-full relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-white dark:bg-slate-900 text-slate-400 font-bold uppercase tracking-widest text-[10px]">O ingresa su correo</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailInvite} className="w-full mt-6 flex gap-2">
                        <input
                            type="email"
                            placeholder="correo@vecino.cl"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-900 dark:text-white text-sm"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center"
                        >
                            <Mail className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
