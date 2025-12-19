import React, { useState, useRef, useEffect } from 'react';
import { TripPlan, ChatMessage } from './types';
import { chatWithTravelAgent } from './geminiService';
import { Icons } from './constants';

interface ChatWidgetProps {
  plan: TripPlan;
  language?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ plan, language = 'zh-TW' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithTravelAgent(plan, messages, input, language);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-5 py-4 shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 font-bold"
      >
        {isOpen ? (
            <span className="text-2xl leading-none">×</span>
        ) : (
            <Icons.Sparkles className="w-5 h-5" />
        )}
        <span className="hidden md:inline">{isOpen ? (language === 'zh-TW' ? '關閉' : 'Close') : (language === 'zh-TW' ? 'AI 對話' : 'AI Assistant')}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 md:right-6 w-[90vw] md:w-96 h-[60vh] md:h-[500px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 animate-fade-in-up">
          {/* Header */}
          <div className="bg-indigo-600 p-4 text-white flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
                <Icons.Sparkles className="w-4 h-4" />
            </div>
            <div>
                <h3 className="font-bold">{language === 'zh-TW' ? 'AI 旅遊顧問' : 'Travel Assistant'}</h3>
                <p className="text-xs text-indigo-100 opacity-80">{language === 'zh-TW' ? '提出任何問題' : 'Ask any question'}</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-10 text-sm">
                    <p>{language === 'zh-TW' ? '👋 嗨！對這個行程有什麼想法嗎？' : '👋 Hi! Any thoughts on this itinerary?'}</p>
                    <p className="mt-1">{language === 'zh-TW' ? '我可以幫你解釋或提供建議。' : 'I can help explain or suggest changes.'}</p>
                </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none'
                    }`}
                >
                    {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
               <div className="flex justify-start">
                   <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-1">
                       <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                       <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                   </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={language === 'zh-TW' ? "提出任何問題..." : "Ask anything..."}
                    className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Icons.ArrowRight className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
