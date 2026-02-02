import { useState, useRef, useEffect, KeyboardEvent } from 'react';

// Emojis populares organizados por categoría
const EMOJI_CATEGORIES = {
  '😊 Caras': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😜', '🤔', '😎', '🤩', '🥳', '😢', '😭', '😤', '😡', '🤯', '😱', '🤗', '🤭', '🫣', '😴'],
  '👍 Gestos': ['👍', '👎', '👏', '🙌', '🤝', '✌️', '🤞', '🤟', '🤙', '👋', '💪', '🙏', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯', '💢', '💥', '💫', '⭐', '🌟', '✨', '🔥', '💀', '👀', '🎉'],
  '🎮 Objetos': ['🎮', '🎯', '🎲', '🏆', '🥇', '📱', '💻', '🖥️', '⌨️', '🔒', '🔑', '💡', '📧', '📦', '🎁', '💰', '💸', '💳', '🛒', '🛡️', '⚡', '🌐', '📡', '🔗', '✅', '❌', '⚠️', '🚀', '💎', '🎵']
};

interface ChatInputProps {
  onSend: (content: string) => Promise<boolean>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isSending, disabled, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [activeCategory, setActiveCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Cerrar emoji picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojis(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const nextHeight = Math.min(
        120,
        Math.max(42, textareaRef.current.scrollHeight)
      );
      textareaRef.current.style.height = `${nextHeight}px`;
    }
  }, [message]);

  const handleSend = async () => {
    if (!message.trim() || isSending || disabled) return;

    const content = message;
    setMessage('');
    
    const success = await onSend(content);
    
    if (!success) {
      // Restaurar mensaje si falló
      setMessage(content);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-zinc-700 bg-zinc-900 p-3 md:p-4 relative">
      {/* Emoji Picker */}
      {showEmojis && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-zinc-800 rounded-2xl shadow-xl border border-zinc-700 overflow-hidden z-50"
        >
          {/* Tabs de categorías */}
          <div className="flex border-b border-zinc-700 bg-zinc-800">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-1 py-2 text-sm transition-colors ${
                  activeCategory === category 
                    ? 'bg-zinc-900 text-purple-400 border-b-2 border-purple-500' 
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {category.split(' ')[0]}
              </button>
            ))}
          </div>
          
          {/* Grid de emojis */}
          <div className="p-2 max-h-[180px] overflow-y-auto">
            <div className="grid grid-cols-10 gap-1">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Composer */}
      <div className="rounded-2xl border border-zinc-700 bg-zinc-800 p-2 shadow-sm">
        <div className="flex items-start gap-2">
          {/* Botón de Emojis */}
          <button
            onClick={() => setShowEmojis(!showEmojis)}
            disabled={disabled || isSending}
            className={`flex-shrink-0 w-10 h-10 md:w-[42px] md:h-[42px] flex items-center justify-center rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${
              showEmojis
                ? 'bg-purple-800 text-white border-purple-700'
                : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-700 hover:text-white border-zinc-700'
            }`}
            title="Emojis"
            aria-label="Emojis"
          >
            <span className="text-xl leading-none">😊</span>
          </button>

          {/* Input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder || 'Escribe tu mensaje...'}
              disabled={disabled || isSending}
              rows={1}
              className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-zinc-100 placeholder-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed leading-5"
              style={{ minHeight: '42px', maxHeight: '120px' }}
            />
          </div>

          {/* Enviar */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending || disabled}
            className="flex-shrink-0 w-10 h-10 md:w-[42px] md:h-[42px] flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-md shadow-black/40 disabled:shadow-none"
            title="Enviar mensaje"
            aria-label="Enviar mensaje"
          >
            {isSending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Ayuda de teclado (oculta en móvil) */}
        <p className="hidden sm:block text-[11px] text-zinc-400 mt-2 px-1">
          Presiona <kbd className="px-1 py-0.5 bg-zinc-800 text-zinc-200 rounded text-[10px]">Enter</kbd> para enviar, <kbd className="px-1 py-0.5 bg-zinc-800 text-zinc-200 rounded text-[10px]">Shift+Enter</kbd> para nueva línea
        </p>
      </div>
    </div>
  );
}
