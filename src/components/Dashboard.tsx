
import React from 'react';
import FunctionEntryGrid from './FunctionEntryGrid';
import SpotList from './SpotList';
import CelebritySection from './CelebritySection';
import LocalSpecialsSection from './LocalSpecialsSection';
import { Route, Spot, Celebrity, CategoryType, Person } from '../types';
import { Icon } from './common/Icon';

interface DashboardProps {
    routes: Route[];
    onNavigateToCategory: (cat: CategoryType) => void; // Simplified nav handler
    onSelectSpot: (spot: Spot) => void;
    onSelectPerson: (person: Person) => void; // Kept for consistency, though sections might handle it
    onViewMap: () => void;
}

// Helper to bridge the Grid click to the Category Nav
const Dashboard: React.FC<DashboardProps> = ({ routes, onNavigateToCategory, onSelectSpot, onViewMap }) => {
    
    const handleGridNavigate = (id: string) => {
        if (id === 'route-red') onNavigateToCategory('red');
        if (id === 'route-nature') onNavigateToCategory('nature');
        if (id === 'celebrity') onNavigateToCategory('people');
        if (id === 'media') onNavigateToCategory('media');
    };

    return (
        <div className="pb-32 pt-2 animate-fade-in">
            {/* 1. Header Grid */}
            <FunctionEntryGrid onNavigate={handleGridNavigate} className="mb-8" />

            {/* 2. Recommended Routes */}
            <div className="mb-8">
                 <div className="flex items-baseline justify-between px-6 mb-4">
                     <div>
                         <h2 className="text-xl font-serif-brand font-bold text-slate-800">推荐路线</h2>
                         <p className="text-[10px] text-slate-500 mt-0.5 font-light tracking-wider">红色之旅 不忘时代精神</p>
                     </div>
                     <span className="text-[10px] text-teal-600 animate-pulse font-medium">左滑查看更多 &rarr;</span>
                 </div>
                 {routes.length > 0 && (
                     <SpotList 
                        routes={routes} 
                        onSelectSpot={(spot) => onSelectSpot(spot)} 
                        onViewMap={onViewMap}
                     />
                 )}
            </div>

            {/* 3. Map Entry Button (Clay Style) */}
            <div className="px-6 mb-8">
                 <button 
                     onClick={onViewMap}
                     className="w-full clay-btn clay-btn-primary py-4 text-sm shadow-lg active:scale-95 gap-2"
                 >
                     <Icon name="map" className="w-5 h-5" />
                     <span>进入路线地图总览</span>
                 </button>
            </div>

            {/* 4. Celebrity Section */}
            <CelebritySection onNavigateToArticle={(c) => {
                // Convert Celebrity to Person format for compatibility if needed, 
                // or the App logic handles the routing based on ID/Type
                // For now, let's just trigger the category view or specialized article
                onNavigateToCategory('people');
            }} />

            {/* 5. Specials */}
            <LocalSpecialsSection />
        </div>
    );
};

export default Dashboard;
