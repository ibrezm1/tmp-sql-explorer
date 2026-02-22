import React from 'react';
import { Send } from 'lucide-react';

const ChatView = ({ chatMessages, chatEndRef, handleSendMessage, userInput, setUserInput }) => {
    return (
        <div className="h-full flex flex-col bg-white rounded-3xl border overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 border-t flex gap-3">
                <input
                    type="text"
                    className="flex-1 border rounded-xl px-4 py-3"
                    placeholder="Ask AI Architect..."
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                />
                <button className="bg-indigo-600 text-white p-3 rounded-xl">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default ChatView;
