
import React from 'react';
import { Person } from '../types';
import { PEOPLE_DATA } from '../services/staticData';
import { ASSETS } from '../utils/constants';

interface CelebritySectionProps {
    onNavigateToArticle?: (person: Person) => void;
    embedded?: boolean;
}

const CelebritySection: React.FC<CelebritySectionProps> = ({ onNavigateToArticle, embedded = false }) => {
  
  // Filter for Sages and Martyrs only for the slider
  const celebrities = PEOPLE_DATA.filter(p => p.type === 'martyr' || p.type === 'sage');
  
  // Infinite scroll illusion
  const sliderItems = [...celebrities, ...celebrities];

  // Helper to render card content
  const renderCard = (person: Person, isEmbedded: boolean) => (
      <div 
        onClick={() => onNavigateToArticle && onNavigateToArticle(person)}
        className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95 border-2 border-white shadow-lg"
      >
        <img 
          src={person.imageUrl || ASSETS.FALLBACK_AVATAR} 
          alt={person.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          onError={(e) => {
              e.currentTarget.src = `https://placehold.co/400x600/cbd5e1/64748b?text=${encodeURIComponent(person.name)}`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className={`absolute bottom-0 left-0 right-0 text-white ${isEmbedded ? 'p-3' : 'p-4'}`}>
          <span className={`
              text-[9px] px-2 py-0.5 rounded-full inline-block mb-1.5 backdrop-blur-sm shadow-sm
              ${person.type === 'martyr' ? 'bg-red-600/90' : 'bg-blue-600/90'}
          `}>
              {person.type === 'martyr' ? '先烈' : '乡贤'}
          </span>
          <h4 className={`font-serif-brand font-bold leading-tight mb-1 ${isEmbedded ? 'text-base' : 'text-lg'}`}>{person.name}</h4>
          {!isEmbedded && <p className="text-[10px] opacity-80 line-clamp-1">{person.description}</p>}
        </div>
      </div>
  );

  return (
    <div className="mt-8 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-baseline justify-between mb-4 px-6">
        <div>
           <h2 className="text-xl font-serif-brand font-bold text-slate-800">名人堂</h2>
           <p className="text-[10px] text-slate-500 mt-0.5 font-light tracking-wider">往昔峥嵘 风骨长隽</p>
        </div>
        <span className="text-[10px] text-teal-600 font-medium">自动轮播中</span>
      </div>

      <div 
        className="slider" 
        style={{ 
            "--width": "160px", 
            "--height": "240px", 
            "--quantity": sliderItems.length 
        } as React.CSSProperties}
      >
        <div className="list">
            {sliderItems.map((person, index) => (
                <div 
                    className="item" 
                    key={`${person.id}-${index}`} 
                    style={{ "--position": index + 1 } as React.CSSProperties}
                >
                    {renderCard(person, false)}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CelebritySection;
