import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  Headphones,
  MessageSquare,
  Bot,
  UserCheck,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export const LiveSupportModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    siteSettings,
    user,
    chatMessages,
    sendChatMessage
  } = useApp();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getGuestId = () => {
    let gid = typeof window !== 'undefined' ? localStorage.getItem('limowin_guest_id') : null;
    if (!gid) {
      gid = 'guest-' + Math.random().toString(36).substring(2, 9);
      if (typeof window !== 'undefined') localStorage.setItem('limowin_guest_id', gid);
    }
    return gid;
  };

  const currentUserId = user ? user.id : getGuestId();

  // Filter messages for current user session + global announcements
  const myMessages = chatMessages.filter(
    m => m.userId === currentUserId || m.userId === 'all'
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeModal === 'support') {
      scrollToBottom();
    }
  }, [activeModal, myMessages.length]);

  if (activeModal !== 'support') return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    await sendChatMessage(text, false);

    // AI concierge instant reply if no live human answers immediately
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const lower = text.toLowerCase();
      let botReply = '';

      if (lower.includes('deposit') || lower.includes('upi') || lower.includes('gpay')) {
        botReply = `💡 For instant deposits, select UPI Pay or Google Pay (GPay) in the Cashier! Deposits credit automatically in 1-3 minutes.`;
      } else if (lower.includes('withdraw') || lower.includes('payout')) {
        botReply = `⚡ Withdrawals are processed 24/7! Limits are min ₹100 / $10 up to ₹5,00,000 (5 Lac) per transaction. Remember that claimed deposit bonuses require 5 games played to unlock.`;
      } else if (lower.includes('bonus') || lower.includes('5 game') || lower.includes('promo')) {
        botReply = `🎁 You can claim our Instant Deposit Bonus at any time! To prevent promotional abuse, play any 5 3D games (Slots, Roulette, Aviator, etc.) to immediately unlock withdrawal.`;
      }

      if (botReply) {
        await sendChatMessage(botReply, true, currentUserId);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[620px] max-h-[92vh]">
        {/* Support Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-sm text-white">{siteSettings.siteName} 24/7 VIP Live Support</h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[11px] text-slate-300 flex items-center space-x-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline" />
                <span>Encrypted • Connected directly to Admin Desk</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Help Prompts */}
        <div className="bg-slate-50 border-b border-slate-200 p-2.5 flex items-center space-x-2 overflow-x-auto shrink-0">
          {[
            'How to deposit with UPI & GPay?',
            'What is the 5-game bonus rule?',
            'How fast are withdrawals processed?',
            'Speak with Live Admin Agent'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-bold bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-900 border border-slate-200 rounded-full px-3 py-1 whitespace-nowrap transition-all shadow-2xs shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {myMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bot className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>Type your message below to chat live with our VIP Concierge and Admin.</p>
            </div>
          ) : (
            myMessages.map(m => {
              const isAdmin = m.sender === 'admin' || m.sender === 'support_bot';
              return (
                <div
                  key={m.id}
                  className={`flex items-end space-x-2 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  {isAdmin && (
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      👑
                    </div>
                  )}

                  <div className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                    isAdmin
                      ? 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-medium rounded-br-xs'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] font-bold opacity-75 mb-1 space-x-3">
                      <span>{isAdmin ? 'VIP Support Agent' : 'You'}</span>
                      <span className="font-mono">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{m.message}</p>
                  </div>
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs pl-2">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-bold">Admin is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask anything about deposits, games, or withdrawals..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
