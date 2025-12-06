
import React, { useState, useEffect } from 'react';
import { Spot, Route, Celebrity } from '../types';
import * as geminiService from '../services/geminiService';
import SpotList from './SpotList';
import SpotDetail from './SpotDetail';
import BottomChatWidget from './BottomChatWidget';
import CelebritySection from './CelebritySection';
import LocalSpecialsSection from './LocalSpecialsSection';
import FunctionEntryGrid from './FunctionEntryGrid'; 
import PresenterMode from './PresenterMode';
import ArticleDetail from './ArticleDetail'; // [NEW]
import { ASSETS, PAGE_HOOKS_CONFIG } from '../utils/constants'; 
import { Icon } from './common/Icon';

interface TourGuideProps {
  userId: string;
  onLogout: () => void;
  coordinates: { lat: number; lng: number } | null;
  geoLoading: boolean;
  geoError: GeolocationPositionError | null;
  initialView?: string | null;
}

const TourGuide: React.FC<TourGuideProps> = ({ userId, onLogout, coordinates, geoLoading, initialView }) => {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // View Routing State
  const [viewMode, setViewMode] = useState<'home' | 'map' | 'spot_detail' | 'article'>('home');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);

  // Agent State
  const [activeHooks, setActiveHooks] = useState<string[]>(PAGE_HOOKS_CONFIG['home']);
  const [pendingIntent, setPendingIntent] = useState<string | null>(null);
  const [headerAvatarSrc, setHeaderAvatarSrc] = useState(ASSETS.AVATAR_A);

  useEffect(() => {
      if (!geoLoading) {
          geminiService.getRoutes("118.2,25.2", "Dongli").then(data => {
              setRoutes(data.routes);
              setIsLoading(false);
          }).catch(() => setIsLoading(false));
      }
  }, [geoLoading]);

  // Handle Initial Deep Link
  useEffect(() => {
      if (initialView && !isLoading) {
          setTimeout(() => {
              if (initialView === 'guide' || initialView === 'route-red' || initialView === 'route-nature') {
                  document.getElementById('routes-section')?.scrollIntoView({ behavior: 'smooth' });
              } else if (initialView === 'celebrity') {
                  // Scroll to celebrity section
                  document.getElementById('celebrity-section')?.scrollIntoView({ behavior: 'smooth' });
              } else if (initialView === 'map') {
                  setViewMode('map');
              }
          }, 300);
      }
  }, [initialView, isLoading]);

  // Dynamic Hooks Updater
  useEffect(() => {
      if (viewMode === 'home') setActiveHooks(PAGE_HOOKS_CONFIG['home']);
      else if (viewMode === 'map') setActiveHooks(PAGE_HOOKS_CONFIG['map_view']);
      else if (viewMode === 'spot_detail') setActiveHooks(PAGE_HOOKS_CONFIG['spot_detail']);
      else if (viewMode === 'article') setActiveHooks(PAGE_HOOKS_CONFIG['article_celebrity']);
  }, [viewMode, selectedSpot]);

  // Navigation Handlers
  const handleSelectSpot = (spot: Spot, category: Route['category']) => {
      setSelectedSpot(spot);
      setViewMode('spot_detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToArticle = (celebrity: Celebrity) => {
      setSelectedCelebrity(celebrity);
      setViewMode('article');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
      setViewMode('home');
      setSelectedSpot(null);
      setSelectedCelebrity(null);
  };

  const handleGridNavigate = (id: string) => {
      if (id === 'route-red' || id === 'route-nature') {
          document.getElementById('routes-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (id === 'celebrity') {
          document.getElementById('celebrity-section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (id === 'map') {
          setViewMode('map');
      }
  };

  // Main Render Logic
  const renderContent = () => {
      if (viewMode === 'map') {
          return <PresenterMode routes={routes} activeSpot={null} activeSpotCategory={null} onSelectSpotFromMap={(s: Spot | null) => s && handleSelectSpot(s, '历史文化')} isLoading={false} error={null} geoError={null} />;
      }
      
      if (viewMode === 'spot_detail' && selectedSpot) {
          return <SpotDetail spot={selectedSpot} onBack={handleBackToHome} />;
      }

      if (viewMode === 'article' && selectedCelebrity) {
          return <ArticleDetail data={selectedCelebrity} onBack={handleBackToHome} onHookTrigger={(h) => setPendingIntent(h)} />;
      }

      return (
          <div className="space-y-6 pt-4 pb-24">
             <FunctionEntryGrid onNavigate={handleGridNavigate} />
             
             <div id="routes-section" className="px-0">
                 <div className="flex items-baseline justify-between px-6 mb-2">
                     <div>
                         <h2 className="text-xl font-serif-brand font-bold text-stone-800">推荐路线</h2>
                         <p className="text-[10px] text-stone-500 mt-0.5 font-light tracking-wider">红色之旅 不忘时代精神</p>
                     </div>
                     <span className="text-[10px] text-teal-600 animate-pulse font-medium">左滑查看更多 &rarr;</span>
                 </div>
                 {routes && (
                     <SpotList 
                        routes={routes} 
                        onSelectSpot={handleSelectSpot} 
                        onViewMap={() => setViewMode('map')}
                     />
                 )}
             </div>

             {/* [MOVED] Inline Map Button (Route Overview) - Placed after routes, before Celebrity/Specials */}
             <div className="px-6 my-6">
                 <button 
                     onClick={() => setViewMode('map')}
                     className="w-full bg-stone-800 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-2 hover:bg-black transition transform active:scale-95 border border-stone-700"
                 >
                     <Icon name="map" className="w-5 h-5" />
                     <span>路线地图总览</span>
                 </button>
             </div>
             
             {/* [RESTORED] Standalone Celebrity Section */}
             <div id="celebrity-section">
                <CelebritySection onNavigateToArticle={(person) => handleNavigateToArticle({ ...person, title: person.name })} />
             </div>
             
             <div className="px-4 mt-8">
                <LocalSpecialsSection />
             </div>
          </div>
      );
  };

  return (
    // [CRITICAL] Global 1200px Constraint
    <div className="max-w-[1200px] mx-auto bg-stone-50 min-h-screen relative shadow-2xl overflow-hidden">
       {/* Header */}
       <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-between p-4 px-5">
            <div className="flex items-center space-x-3">
                 <img 
                    src={headerAvatarSrc} 
                    onError={() => setHeaderAvatarSrc(ASSETS.AVATAR_A)}
                    className="w-9 h-9 rounded-full border border-teal-100 object-cover shadow-sm"
                 />
                 <div>
                    <h1 className="text-lg font-bold text-stone-800 font-serif-brand leading-none">村官智能体</h1>
                    <span className="text-[10px] text-teal-600 font-medium">AI 为您服务</span>
                 </div>
            </div>
            {viewMode !== 'home' && (
                <button onClick={handleBackToHome} className="text-sm font-medium text-stone-500 bg-stone-100 px-3 py-1 rounded-full">返回首页</button>
            )}
       </header>

       <main>
           {renderContent()}
       </main>

       {/* [COMPONENT] Persistent Global Follow Bar */}
       <BottomChatWidget 
           spot={selectedSpot}
           hookWords={activeHooks}
           pendingIntent={pendingIntent}
           onIntentHandled={(t) => setPendingIntent(null)}
           bottomOffset={viewMode === 'home' ? 20 : 0} 
       />
    </div>
  );
};

export default TourGuide;
