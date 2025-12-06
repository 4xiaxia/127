
import React from 'react';
import { Icon } from './common/Icon';
import { getReliableImage } from '../services/geminiService';

// [MODULE] Navigation Grid (3-Block Layout)
// Updated to use the custom CSS grid layout requested by the user
// Now includes basic HTML img tags for backgrounds

const FunctionEntryGrid: React.FC<{ onNavigate: (id: string) => void; className?: string }> = ({ onNavigate, className = "mb-6" }) => {
  return (
    <div className={`w-full px-2 ${className}`}>
        <div className="cards">
            {/* Red: 红色文旅 (Grid Area A) */}
            <div 
                className="card card-red relative overflow-hidden group" 
                onClick={() => onNavigate('route-red')}
            >
                <img 
                    src="http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/640%20%281%29.webp?e=1763669811&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:_o4-enIGCd1VQCX9fQGKaOnR0NQ="
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay transition-opacity group-hover:opacity-40"
                    alt="Red Tourism"
                />
                <div className="absolute top-2 right-2 opacity-50 z-10">
                    <Icon name="map" className="w-8 h-8 text-white" />
                </div>
                <p className="tip relative z-10">红色文旅</p>
                <p className="second-text relative z-10">追忆峥嵘岁月</p>
            </div>

            {/* Blue: 名人堂 (Grid Area B - Right Column) */}
            <div 
                className="card card-blue relative overflow-hidden group" 
                onClick={() => onNavigate('celebrity')}
            >
                <img 
                    src="http://t61i76pjk.hn-bkt.clouddn.com/dongli/pic/%E6%9D%8E%E9%93%81%E6%B0%91.jpg?e=1763669601&token=KPjDX5JKdPj4uqjNpBSO-Eln4XWXDvgjed5-J4kE:vshvF183VpJxjmV69Qy3ac2wngs="
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay transition-opacity group-hover:opacity-40 grayscale"
                    alt="Celebrity Hall"
                />
                <div className="absolute bottom-[-10px] right-[-10px] opacity-20 rotate-12 z-10">
                    <Icon name="user" className="w-16 h-16 text-white" />
                </div>
                <p className="tip text-xl relative z-10">名人堂</p>
                <p className="second-text relative z-10">先辈风骨长隽</p>
            </div>

            {/* Green: 风景自然游 (Grid Area C) */}
            <div 
                className="card card-green relative overflow-hidden group" 
                onClick={() => onNavigate('route-nature')}
            >
                <img 
                    src={getReliableImage("Green terraced fields mountains misty china village")}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay transition-opacity group-hover:opacity-40"
                    alt="Nature Scenery"
                />
                <div className="absolute top-2 right-2 opacity-50 z-10">
                    <Icon name="camera" className="w-8 h-8 text-white" />
                </div>
                <p className="tip relative z-10">风景自然</p>
                <p className="second-text relative z-10">生态田园乐</p>
            </div>
        </div>
    </div>
  );
};

export default FunctionEntryGrid;
