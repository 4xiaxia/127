
import React, { useState, useEffect } from 'react';
import { Spot } from '../types';
import { Icon } from './common/Icon';
import { openMapNavigation } from '../utils/mapUtils';
import AIBookmark from './AIBookmark';
import { AgentA } from '../services/agentSystem'; 

interface SpotDetailProps {
  spot: Spot;
  onBack: () => void;
}

const SpotDetail: React.FC<SpotDetailProps> = ({ spot, onBack }) => {
  const [showBookmark, setShowBookmark] = useState(false);
  const [isLit, setIsLit] = useState(false);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
      const litSpots = JSON.parse(localStorage.getItem('village_lit_spots') || '[]');
      if (litSpots.includes(spot.id)) setIsLit(true);
      AgentA.processUserRequest(`我正在阅读${spot.name}的介绍`, spot.name, 'text');
  }, [spot.id]);

  const handleTTS = () => {
    if (isReading) {
        window.speechSynthesis.cancel();
        setIsReading(false);
        return;
    }
    const utterance = new SpeechSynthesisUtterance(spot.intro_txt);
    utterance.lang = 'zh-CN';
    utterance.onend = () => setIsReading(false);
    window.speechSynthesis.speak(utterance);
    setIsReading(true);
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] pb-24 font-brand animate-fade-in">
      {/* Header Image */}
      <div className="relative h-[45vh]">
          <img src={spot.imageUrl} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f0fdf4] via-transparent to-transparent"></div>
          
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 w-10 h-10 bg-white/60 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-800 active:scale-90 transition border border-white"
          >
              <Icon name="arrow-left" className="w-5 h-5" />
          </button>
      </div>

      <div className="px-5 -mt-16 relative z-10">
          {/* Title Card - Clay Style */}
          <div className="clay-card p-6 mb-6">
              <div className="flex justify-between items-start">
                  <div>
                      <span className={`clay-tag-small inline-block mb-2 ${spot.category === 'red' ? 'clay-tag-red' : 'clay-tag-green'}`}>
                          {spot.category === 'red' ? '红色文旅' : '自然景观'}
                      </span>
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{spot.name}</h1>
                  </div>
                  {isLit && (
                      <div className="flex flex-col items-center animate-[popOut_0.5s_ease]">
                          <Icon name="check-circle" className="w-8 h-8 text-green-500 drop-shadow-sm" />
                          <span className="text-[10px] text-green-600 font-bold mt-1">已点亮</span>
                      </div>
                  )}
              </div>
              
              <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => {
                         const [lng, lat] = spot.coord.split(',');
                         openMapNavigation(parseFloat(lat), parseFloat(lng), spot.name);
                    }}
                    className="flex-1 py-3 clay-btn clay-btn-primary text-sm shadow-lg active:scale-95 gap-2"
                  >
                      <Icon name="navigation" className="w-4 h-4" />
                      <span>去这里</span>
                  </button>
                  <button 
                    onClick={handleTTS}
                    className={`flex-1 py-3 clay-btn text-sm gap-2 ${isReading ? 'clay-btn-secondary' : 'clay-btn-white'}`}
                  >
                      <Icon name={isReading ? 'pause' : 'play'} className="w-4 h-4" />
                      <span>{isReading ? '停止' : '听讲解'}</span>
                  </button>
              </div>
          </div>

          {/* Content Body */}
          <div className="px-2">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 pl-1">典籍记载</h3>
              <p className="text-slate-700 leading-loose text-justify text-base font-medium">
                  {spot.intro_txt}
              </p>
          </div>

          {/* AI Interaction Zone */}
          <div className="mt-12 clay-card bg-gradient-to-br from-red-50 to-white border-red-100 p-6 text-center relative overflow-hidden">
              <div className="relative z-10">
                  <h3 className="text-red-900 font-bold text-lg mb-2">打卡 · 留念</h3>
                  <p className="text-red-800/70 text-xs mb-6 font-medium">上传照片，生成您的专属旅行印记</p>
                  <button 
                    onClick={() => setShowBookmark(true)}
                    className="w-full py-3.5 clay-btn clay-btn-red text-sm shadow-lg active:scale-95 gap-2"
                  >
                      <Icon name="camera" className="w-5 h-5" />
                      <span>{isLit ? '查看印记' : '制作书签并点亮'}</span>
                  </button>
              </div>
              {/* Decorative Background Icon */}
              <div className="absolute -right-6 -bottom-6 text-red-100 transform rotate-12 pointer-events-none">
                  <Icon name="book-open" className="w-32 h-32" />
              </div>
          </div>
      </div>

      {showBookmark && (
          <AIBookmark spot={spot} onClose={() => setShowBookmark(false)} onSuccess={() => { setIsLit(true); setShowBookmark(false); }} />
      )}
    </div>
  );
};

export default SpotDetail;
