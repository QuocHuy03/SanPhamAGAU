import React, { useState } from 'react';
import { FaComments, FaTimes, FaFacebookMessenger } from 'react-icons/fa';
import { SiZalo } from 'react-icons/si';

const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Cấu hình link ở đây
    const links = {
        zalo: 'https://zalo.me/your_phone_number',
        messenger: 'https://m.me/your_fb_id_or_username'
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* Sub-buttons (Zalo/Messenger) */}
            <div className={`flex flex-col gap-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <a
                    href={links.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-[#0068ff] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group relative"
                    title="Chat Zalo"
                >
                    <SiZalo className="text-2xl" />
                    <span className="absolute right-full mr-3 px-3 py-1 bg-white text-gray-900 text-xs font-black rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                        Zalo: 0123 456 789
                    </span>
                </a>

                <a
                    href={links.messenger}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-gradient-to-tr from-[#006aff] to-[#00d2ff] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group relative"
                    title="Chat Messenger"
                >
                    <FaFacebookMessenger className="text-2xl" />
                    <span className="absolute right-full mr-3 px-3 py-1 bg-white text-gray-900 text-xs font-black rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-100">
                        Facebook Messenger
                    </span>
                </a>
            </div>

            {/* Main toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform active:scale-90 ${isOpen ? 'bg-gray-900 rotate-90' : 'bg-indigo-600 animate-bounce-slow'}`}
            >
                {isOpen ? (
                    <FaTimes className="text-white text-2xl" />
                ) : (
                    <FaComments className="text-white text-2xl" />
                )}

                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                    </span>
                )}
            </button>
        </div>
    );
};

export default FloatingChat;
