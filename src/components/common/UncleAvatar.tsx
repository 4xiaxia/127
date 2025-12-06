
import React from 'react';

// A CSS-Art Avatar of "Uncle A" (Man with glasses)
// Scalable, lightweight, no image dependency.

const UncleAvatar: React.FC<{ className?: string, isTalking?: boolean }> = ({ className = "w-28 h-28", isTalking = false }) => {
  return (
    <div className={`${className} relative rounded-full bg-[#FFE0BD] border-[6px] border-slate-100 shadow-xl overflow-hidden flex items-end justify-center box-border`}>
        {/* Hair */}
        <div className="absolute top-0 w-full h-1/3 bg-slate-800 rounded-t-full z-10"></div>
        <div className="absolute top-2 left-3 w-5 h-5 bg-slate-800 rounded-full z-10"></div>
        
        {/* Glasses */}
        <div className="absolute top-[35%] w-[80%] flex justify-between px-1 z-20">
            <div className="w-[45%] h-7 border-[3px] border-slate-900 rounded-lg bg-white/30 backdrop-blur-[1px] shadow-sm"></div>
            <div className="w-[10%] h-[3px] bg-slate-900 mt-3"></div>
            <div className="w-[45%] h-7 border-[3px] border-slate-900 rounded-lg bg-white/30 backdrop-blur-[1px] shadow-sm"></div>
        </div>

        {/* Eyes - Blink Animation */}
        <div className="absolute top-[44%] w-[60%] flex justify-between px-3 z-10">
            <div className="w-2 h-2 bg-slate-900 rounded-full animate-[blink_4s_infinite]"></div>
            <div className="w-2 h-2 bg-slate-900 rounded-full animate-[blink_4s_infinite]"></div>
        </div>

        {/* Mouth - Talking Animation */}
        <div className={`absolute top-[58%] w-8 h-4 border-b-[3px] border-slate-800/80 rounded-b-full transition-all duration-100 ${isTalking ? 'animate-[talk_0.2s_infinite]' : ''}`}></div>

        {/* Shirt */}
        <div className="w-full h-[32%] bg-blue-500 z-10 relative shadow-inner">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-t-[18px] border-t-[#FFE0BD] border-r-[12px] border-r-transparent"></div>
        </div>
    </div>
  );
};

export default UncleAvatar;
