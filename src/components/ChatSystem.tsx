import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Search, ChevronLeft, Send, Users, UserRound, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ChatSystemProps {
    currentUserId: string;
}

type ViewState = 'CLOSED' | 'LIST' | 'DIRECTORY' | 'CHAT';

export const ChatSystem = ({ currentUserId }: ChatSystemProps) => {
    const [view, setView] = useState<ViewState>('CLOSED');
    
    const [conversations, setConversations] = useState<any[]>([]);
    const [neighbors, setNeighbors] = useState<any[]>([]);
    
    const [activeConversation, setActiveConversation] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Búsquedas
    const [searchQuery, setSearchQuery] = useState('');

    // Load Conversations and Listen for updates
    useEffect(() => {
        if (!currentUserId || view === 'CLOSED') return;

        fetchConversations();
        fetchNeighbors();

        // No need to subscribe to conversations table changes right now, just refresh on open
    }, [currentUserId, view]);

    // Listen to messages of active conversation
    useEffect(() => {
        if (!activeConversation) return;

        fetchMessages(activeConversation.id);

        const channel = supabase
            .channel(`messages_${activeConversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${activeConversation.id}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
                scrollToBottom();
            })
            .subscribe();

        const handleOpenChat = (e: any) => {
            const { neighborId, neighborName } = e.detail;
            if (neighborId) {
                // If it's already open and same person, do nothing
                if (activeConversation?.other_user?.id === neighborId) return;
                
                // Construct a mock neighbor to start chat
                const mockNeighbor = { id: neighborId, full_name: neighborName, avatar_url: '' };
                startChat(mockNeighbor);
            }
        };

        window.addEventListener('OPEN_CHAT', handleOpenChat);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('OPEN_CHAT', handleOpenChat);
        };
    }, [activeConversation, conversations, currentUserId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const fetchConversations = async () => {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant_a.eq.${currentUserId},participant_b.eq.${currentUserId}`)
            .order('created_at', { ascending: false });

        if (data) {
            // Fetch names of the OTHER participants
            const promises = data.map(async (conv) => {
                const otherParticipantId = conv.participant_a === currentUserId ? conv.participant_b : conv.participant_a;
                const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', otherParticipantId).single();
                return { ...conv, other_user: profile ? { id: otherParticipantId, ...profile } : { id: otherParticipantId, full_name: 'Vecino Misterioso' } };
            });
            const enriched = await Promise.all(promises);
            setConversations(enriched);
        }
    };

    const fetchNeighbors = async () => {
        const res = await fetch('/api/chat/neighbors');
        if (res.ok) {
            const data = await res.json();
            setNeighbors(data.neighbors || []);
        }
    };

    const fetchMessages = async (convId: string) => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
        
        if (data) {
            setMessages(data);
            scrollToBottom();
        }
    };

    const startChat = async (neighbor: any) => {
        // Find if conversation already exists
        const existing = conversations.find(c => c.other_user.id === neighbor.id);
        if (existing) {
            setActiveConversation(existing);
            setView('CHAT');
            return;
        }

        // Create new
        const { data, error } = await supabase.from('conversations').insert({
            participant_a: currentUserId,
            participant_b: neighbor.id
        }).select().single();

        if (data) {
            const newConv = { ...data, other_user: neighbor };
            setConversations([newConv, ...conversations]);
            setActiveConversation(newConv);
            setView('CHAT');
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !activeConversation) return;

        const content = inputText.trim();
        setInputText('');

        await supabase.from('messages').insert({
            conversation_id: activeConversation.id,
            sender_id: currentUserId,
            content
        });
    };

    if (view === 'CLOSED') {
        return (
            <button
                onClick={() => setView('LIST')}
                className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-indigo-500 hover:scale-110 transition-all z-50 group border-[3px] border-white active:scale-95"
            >
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse" />
                {/* Notification Badge Example */}
                {/* <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white" /> */}
            </button>
        );
    }

    return (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-10 sm:right-10 sm:w-[400px] sm:h-[650px] bg-white sm:rounded-[2rem] shadow-2xl z-[500] flex flex-col overflow-hidden sm:border border-slate-200">
            {/* Header */}
            <div className="bg-indigo-600 p-4 shrink-0 flex items-center gap-3 relative overflow-hidden text-white shadow-md">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <MessageCircle className="w-24 h-24 text-white" />
                </div>
                
                {view !== 'LIST' && (
                    <button onClick={() => view === 'CHAT' ? setView('LIST') : setView('LIST')} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                )}

                <div className="flex-1 min-w-0 z-10">
                    {view === 'LIST' && <h3 className="font-black text-xl tracking-tight">Chats Vecinales</h3>}
                    {view === 'DIRECTORY' && <h3 className="font-bold text-lg truncate">Nuevo Mensaje</h3>}
                    {view === 'CHAT' && activeConversation && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                                {activeConversation.other_user.avatar_url ? (
                                    <img src={activeConversation.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserRound className="w-5 h-5 text-white" />
                                )}
                            </div>
                            <div className="truncate">
                                <span className="font-bold text-base block truncate capitalize leading-tight">{activeConversation.other_user.full_name}</span>
                                <span className="text-xs text-indigo-100 font-medium tracking-widest uppercase">En Línea</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 z-10">
                    <button onClick={() => setView('CLOSED')} className="p-2 hover:bg-white/20 rounded-xl transition-colors shrink-0">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* VIEWS */}
            <div className="flex-1 overflow-hidden relative bg-slate-50 flex flex-col">
                <AnimatePresence mode="wait">
                    
                    {/* LIST OF CHATS */}
                    {view === 'LIST' && (
                        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 flex flex-col bg-white">
                            <button onClick={() => setView('DIRECTORY')} className="m-4 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0 shadow-sm active:scale-95">
                                <div className="flex items-center gap-3 font-bold text-sm">
                                    <div className="bg-indigo-600 text-white p-2 rounded-full shadow-md"><Users className="w-4 h-4" /></div>
                                    Buscar Vecino para Chatear
                                </div>
                                <ArrowRight className="w-5 h-5 opacity-50" />
                            </button>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {conversations.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 font-medium text-sm flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                            <MessageCircle className="w-8 h-8 text-slate-300" />
                                        </div>
                                        Aún no tienes chats privados. Habla con un vecino para comenzar.
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <button key={conv.id} onClick={() => { setActiveConversation(conv); setView('CHAT'); }} className="w-full p-4 flex items-center gap-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left group">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full border border-indigo-200 shadow-inner flex items-center justify-center shrink-0">
                                                {conv.other_user.avatar_url ? (
                                                    <img src={conv.other_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-indigo-600 font-black text-lg uppercase">{conv.other_user.full_name?.charAt(0) || 'V'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate capitalize text-sm">{conv.other_user.full_name}</h4>
                                                <p className="text-slate-500 text-xs truncate mt-0.5 group-hover:text-indigo-500 transition-colors">Ver mensajes...</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* NEIGHBOR DIRECTORY */}
                    {view === 'DIRECTORY' && (
                        <motion.div key="directory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute inset-0 flex flex-col bg-white">
                            <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50 backdrop-blur-sm z-10 sticky top-0">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                {neighbors.filter(n => n.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(neighbor => (
                                    <button key={neighbor.id} onClick={() => startChat(neighbor)} className="w-full p-3 flex items-center gap-4 hover:bg-slate-50 rounded-2xl transition-all text-left group border border-transparent hover:border-slate-100">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                           {neighbor.avatar_url ? <img src={neighbor.avatar_url} className="w-full h-full object-cover" /> : <UserRound className="w-5 h-5 text-slate-400" /> }
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-sm capitalize">{neighbor.full_name || 'Desconocido'}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Vecino(a)</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ACTIVE CHAT ROOM */}
                    {view === 'CHAT' && activeConversation && (
                        <motion.div key="chat" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 flex flex-col bg-slate-50">
                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {messages.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="bg-indigo-100 text-indigo-800 text-xs font-bold inline-block px-4 py-2 rounded-full uppercase tracking-widest shadow-sm">Inicio de la conversación</div>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.sender_id === currentUserId;
                                        return (
                                            <div key={msg.id || i} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                                <div className={cn(
                                                    "max-w-[85%] sm:max-w-[75%] px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl sm:rounded-[1.5rem] shadow-sm text-[13px] sm:text-[15px] leading-relaxed relative",
                                                    isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                                                )}>
                                                    {msg.content}
                                                    <span className={cn("text-[8px] sm:text-[10px] absolute bottom-1 sm:bottom-1.5 right-3 opacity-60 font-medium", isMe ? "text-indigo-100" : "text-slate-400")}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                    {/* Espacio reservado para la hora */}
                                                    <div className="h-2 sm:h-3 w-10 float-right opacity-0">-</div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} className="h-1" />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={sendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 flex items-end gap-2 sm:gap-3 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
                                <div className="flex-1 bg-slate-100 rounded-2xl sm:rounded-[1.5rem] border border-slate-200 overflow-hidden flex items-end shadow-inner">
                                    <textarea
                                        rows={1}
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) { 
                                                e.preventDefault(); 
                                                sendMessage(e as any); 
                                            }
                                        }}
                                        placeholder="Escribe un mensaje..."
                                        className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 sm:py-4 px-4 sm:px-5 text-[13px] sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 max-h-32 custom-scrollbar"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-3 sm:p-4 bg-indigo-600 text-white rounded-2xl sm:rounded-[1.5rem] hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:bg-slate-300 disabled:cursor-not-allowed shrink-0 shadow-md active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
