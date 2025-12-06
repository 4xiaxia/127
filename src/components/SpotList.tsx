
import React, { useRef, useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Route, Spot } from '../types';
import { getReliableImage } from '../services/geminiService';

// [CRITICAL MODULE] 
// High Conversion Route Card Layout
// Implements "One Behind" Symmetrical Loop visual

interface SpotListProps {
  routes: Route[];
  onSelectSpot: (spot: Spot, category: Route['category']) => void;
  onViewMap: () => void;
  children?: React.ReactNode; 
}

const categoryConfig: Record<string, { badge: string }> = {
  '历史文化': { badge: 'bg-red-600/90 text-white shadow-red-500/20' },
  '自然风景': { badge: 'bg-teal-600/90 text-white shadow-teal-500/20' },
  '美食体验': { badge: 'bg-amber-500/90 text-white shadow-amber-500/20' },
};

const RouteSlide: React.FC<{
  route: Route;
  onSelectSpot: (spot: Spot, category: Route['category']) => void;
  isActive: boolean;
}> = ({ route, onSelectSpot, isActive }) => {
  const config = categoryConfig[route.category] || categoryConfig['历史文化'];
  const bgImage = route.imageUrl || getReliableImage(route.imagePrompt);

  return (
    <div 
        className={`
            snap-center shrink-0 w-[60vw] max-w-[260px] relative flex flex-col 
            transition-all duration-500 ease-out transform perspective-1000
            ${isActive ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-60 z-0 grayscale-[20%]'}
        `}
        onClick={() => onSelectSpot(route.spots[0], route.category)}
    >
       {/* 9:16 Aspect Ratio Card */}
       <div 
           className={`
               relative w-full aspect-[9/16] rounded-[24px] overflow-hidden group bg-stone-200
               ${isActive ? 'shadow-2xl ring-1 ring-white/20' : 'shadow-none'}
               transition-all duration-500
           `}
       >
            {/* Background Image - Basic HTML Tag */}
            <img 
                src={bgImage} 
                alt={route.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 select-none pointer-events-none"
            />
            
            {/* Deep Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
            
            {/* Badge - Top Left */}
            <div className="absolute top-4 left-4 z-10">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wide shadow-lg backdrop-blur-md border border-white/10 ${config.badge}`}>
                    {route.category}
                </span>
            </div>

            {/* Bottom Content Area - Styled to match screenshot */}
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-10 flex flex-col justify-end pointer-events-none">
                <h3 className="font-serif-brand text-2xl font-bold text-white drop-shadow-md leading-tight mb-3 tracking-wide">
                    {route.name}
                </h3>
                {/* Visual Separator Line */}
                <div className="w-8 h-1 bg-white/90 rounded-full mb-3 shadow-sm"></div>
                <p className="text-xs text-white/90 font-medium line-clamp-2 leading-relaxed tracking-wide drop-shadow-sm">
                    {route.description}
                </p>
            </div>
       </div>
    </div>
  );
};

const SpotList: React.FC<SpotListProps> = ({ routes, onSelectSpot, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(1); // Default to 1 (The first real item)

  // [STYLE] Force Hide Scrollbar
  useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `;
      document.head.appendChild(style);
      return () => { document.head.removeChild(style); };
  }, []);

  // [LOGIC] Create Infinite Loop Visuals
  // We clone the last item to the start (Index 0), and the first item to the end.
  // This creates the "One Behind" symmetry.
  const displayRoutes = useMemo(() => {
      if (!routes || routes.length === 0) return [];
      if (routes.length < 2) return routes.map((r, i) => ({ ...r, _key: `route-${i}` }));
      
      const last = { ...routes[routes.length - 1], _key: 'clone-last' };
      const first = { ...routes[0], _key: 'clone-first' };

      return [
          last,
          ...routes.map((r, i) => ({ ...r, _key: `route-${i}` })),
          first
      ];
  }, [routes]);

  // [LOGIC] Scroll to center the "Real" First Item (Index 1) on mount
  useLayoutEffect(() => {
      if (containerRef.current && displayRoutes.length > routes.length) {
          // Use requestAnimationFrame to ensure DOM sizing is stable
          requestAnimationFrame(() => {
              if (!containerRef.current) return;
              
              const vw = window.innerWidth;
              const cardWidth = vw * 0.60;
              const gap = 24; // 1.5rem gap (space-x-6)
              
              // Scroll position calculation:
              // Padding-left is 20vw.
              // To center the 2nd card (Index 1), we scroll past the 1st card (Index 0).
              // Scroll Amount = Width of Index 0 + Gap.
              containerRef.current.scrollLeft = cardWidth + gap;
          });
      }
  }, [displayRoutes.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
        const center = container.scrollLeft + container.clientWidth / 2;
        let minDist = Infinity;
        let idx = 0;
        
        const slides = Array.from(container.children).filter((c) => (c as HTMLElement).classList.contains('snap-center'));
        
        slides.forEach((child, index) => {
            const el = child as HTMLElement;
            const childCenter = el.offsetLeft + el.offsetWidth / 2;
            const dist = Math.abs(center - childCenter);
            if (dist < minDist) {
                minDist = dist;
                idx = index;
            }
        });
        if (idx !== activeIndex) setActiveIndex(idx);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  if (!routes || routes.length === 0) return null;

  return (
    <div className="relative w-full">
        <div 
            ref={containerRef}
            className="flex overflow-x-auto snap-x snap-mandatory py-6 px-[20vw] space-x-6 scrollbar-hide"
            style={{ scrollBehavior: 'smooth' }}
        >
            {displayRoutes.map((route, index) => (
                <RouteSlide 
                    key={(route as any)._key || index} 
                    route={route} 
                    onSelectSpot={onSelectSpot}
                    isActive={index === activeIndex}
                />
            ))}

            {children && (
                <div 
                    className={`
                        snap-center shrink-0 w-[60vw] max-w-[260px] relative flex flex-col 
                        transition-all duration-500 ease-out transform perspective-1000
                        ${activeIndex === displayRoutes.length ? 'scale-100 opacity-100 z-10' : 'scale-90 opacity-60 z-0 grayscale-[20%]'}
                    `}
                >
                    <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden shadow-2xl bg-stone-200">
                        {children}
                    </div>
                </div>
            )}
            
            <div className="w-1 shrink-0"></div>
        </div>
    </div>
  );
};

export default SpotList;
