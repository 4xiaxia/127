
import React, { useState } from 'react';
import { ASSETS } from '../utils/constants'; // [MODULE] Global Constants for Images
import FunctionEntryGrid from './FunctionEntryGrid';

// [CRITICAL] Restore "Flow Splitting" logic (Split flow in popup)
// Replaced single button with Module Entry Grid

const WelcomeModal: React.FC<{ onClose: () => void; onNavigate: (target: string) => void }> = ({ onClose, onNavigate }) => {
  // [FIX] Image Fallback Handler
  const [imgSrc, setImgSrc] = useState(ASSETS.AVATAR_A);

  const handleNavigation = (id: string) => {
      onNavigate(id);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 px-8">
      {/* Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Main Card */}
      <div className="relative bg-white w-full max-w-[340px] rounded-[32px] pt-12 pb-6 px-2 text-center shadow-2xl animate-fade-in-up flex flex-col items-center overflow-hidden">
         
         {/* [LAYOUT] Floating Avatar (Half out of box) */}
         <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
             <div className="w-20 h-20 rounded-full p-1 bg-white shadow-lg overflow-hidden">
                 <img 
                    src={imgSrc} 
                    onError={() => setImgSrc(ASSETS.FALLBACK_AVATAR)} 
                    className="w-full h-full rounded-full object-cover" 
                    alt="Village Official Agent"
                 />
             </div>
             {/* Online Status Dot */}
             <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
         </div>

         {/* Text Content */}
         <h2 className="mt-4 text-xl font-bold text-stone-800 font-brand">欢迎来到东里村</h2>
         <p className="text-stone-500 text-xs mt-2 mb-6 leading-relaxed px-4">
             我是您的 AI 导游村官小A。<br/>
             请选择您感兴趣的内容开启旅程：
         </p>

         {/* [RESTORED] Flow Splitting - Module Grid */}
         {/* Using the new 3-block layout */}
         <div className="w-full px-2 mb-2">
             <FunctionEntryGrid onNavigate={handleNavigation} />
         </div>

         <div className="mt-2">
             <button onClick={() => { onNavigate('guide'); onClose(); }} className="text-xs text-stone-400 hover:text-stone-600 underline">
                 直接进入首页
             </button>
         </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
