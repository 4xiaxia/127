
import React, { useState, useEffect } from 'react';
import { CategoryType, Spot, Person } from '../types';
import UncleAvatar from './common/UncleAvatar';

interface HomeProps {
  onNavigateToCategory: (cat: CategoryType) => void;
  onSelectSpot: (spot: Spot) => void;
  onSelectPerson: (person: Person) => void;
  onSkip: () => void;
}

const FloatingTag: React.FC<{ 
  label: string; 
  className: string; 
  delay: string; 
  onClick: () => void 
}> = ({ label, className, delay, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            absolute opacity-0 animate-[popOut_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]
            px-6 py-3 rounded-full font-bold text-sm tracking-wide
            transform hover:scale-110 active:scale-95 transition-all
            pointer-events-auto cursor-pointer
            ${className}
        `}
        style={{ animationDelay: delay }}
        aria-label={`导航到${label}分类`}
    >
        {label} »
    </button>
);

const Home: React.FC<HomeProps> = ({ onNavigateToCategory, onSkip }) => {
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
      const timer = setTimeout(() => setShowTags(true), 600);
      return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col items-center pt-28 px-4 overflow-hidden" role="main" aria-label="主页面">
        {/* Soft Blobs Background */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-green-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-[100px] right-[-30px] w-48 h-48 bg-yellow-200/40 rounded-full blur-3xl"></div>

        {/* 1. Uncle A Avatar (Central) */}
        <div className="relative z-10 mb-10 transform scale-125 origin-bottom">
             <UncleAvatar />
        </div>

        {/* 2. Welcome Bubble - Clay Style */}
        <div className="bg-white px-8 py-6 rounded-[24px] rounded-t-none shadow-xl border-2 border-white/60 text-center max-w-[280px] animate-fade-in-up z-20 clay-card">
            <p className="text-slate-800 font-bold mb-2 text-lg">我是A叔 ~</p>
            <div className="text-left text-sm text-slate-500 space-y-2 leading-relaxed font-medium">
                <p>🚩 红色文旅 深度导游</p>
                <p>🌿 风景自然 伴你同游</p>
                <p>🎓 村子历史 乡贤故事</p>
            </div>
        </div>

        {/* 3. Floating Tags (Play-Doh Buttons) */}
        {showTags && (
            <div className="absolute inset-0 pointer-events-none z-30">
                {/* Inner container must be pointer-events-none to not block footer, but tags are auto */}
                <div className="relative w-full h-full max-w-[500px] mx-auto pointer-events-none">
                    {/* Top Left - Red */}
                    <div className="absolute top-[180px] left-[8%] pointer-events-auto">
                        <FloatingTag 
                            label="红色文旅" 
                            className="clay-tag-red" 
                            delay="0s"
                            onClick={() => onNavigateToCategory('red')}
                        />
                    </div>

                    {/* Top Right - Yellow */}
                    <div className="absolute top-[200px] right-[8%] pointer-events-auto">
                        <FloatingTag 
                            label="便民服务" 
                            className="clay-tag-yellow" 
                            delay="0.1s"
                            onClick={() => onNavigateToCategory('media')}
                        />
                    </div>

                    {/* Bottom Left - Green */}
                    <div className="absolute top-[340px] left-[12%] pointer-events-auto">
                        <FloatingTag 
                            label="伴你游" 
                            className="clay-tag-green" 
                            delay="0.2s"
                            onClick={() => onNavigateToCategory('nature')}
                        />
                    </div>

                    {/* Bottom Right - Blue */}
                    <div className="absolute top-[310px] right-[10%] pointer-events-auto">
                        <FloatingTag 
                            label="名人乡贤" 
                            className="clay-tag-blue" 
                            delay="0.3s"
                            onClick={() => onNavigateToCategory('people')}
                        />
                    </div>
                </div>
            </div>
        )}
        
        {/* Footer Actions - Raised Z-Index to ensure clickability */}
        <div className="absolute bottom-32 w-full px-8 flex justify-between items-end z-40 pointer-events-none">
             <button 
                onClick={onSkip}
                className="text-xs text-slate-500 font-bold clay-btn-white px-4 py-2 rounded-full active:scale-95 transition pointer-events-auto cursor-pointer shadow-md hover:bg-slate-50"
             >
                 跳过动画
             </button>
             <div className="text-right opacity-80 pointer-events-auto">
                <p className="text-xs text-slate-500 font-medium">有事儿点右下角</p>
                <p className="text-[10px] text-slate-400">A叔一直在哦</p>
             </div>
        </div>
    </div>
  );
};

export default Home;
