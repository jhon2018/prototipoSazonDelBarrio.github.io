
import React from 'react';
import { WHATSAPP_LINK } from '../constants';

const FloatingWhatsApp: React.FC = () => {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-all transform hover:scale-110 flex items-center justify-center animate-bounce group"
      aria-label="Chat on WhatsApp"
    >
      <i className="fab fa-whatsapp text-3xl"></i>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 font-semibold whitespace-nowrap">
        ¿Necesitas ayuda?
      </span>
    </a>
  );
};

export default FloatingWhatsApp;
