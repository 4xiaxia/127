
import React, { useState } from 'react';
import { SpecialItem } from '../types';
import { Icon } from './common/Icon';
import { getReliableImage } from '../services/geminiService';

// Mock Data for "Fengwuzhi"
const mockSpecials: SpecialItem[] = [
  {
    id: 's1',
    title: '东里红菇',
    category: '特产',
    priceOrTime: '¥120/斤',
    imageUrl: getReliableImage('wild red mushroom forest nature food photography'),
    description: '生长在深山密林中的野生红菇，营养丰富，煲汤鲜美无比。每年夏秋季节限量供应，是馈赠亲友的佳品。'
  },
  {
    id: 's2',
    title: '油桐花蜜',
    category: '特产',
    priceOrTime: '¥50/罐',
    imageUrl: getReliableImage('golden honey jar white flowers background'),
    description: '采集自东里村千亩油桐花海，色泽金黄，口感清甜，带有淡淡的花香。具有润肺止咳、美容养颜的功效。'
  },
  {
    id: 's3',
    title: '春季采茶',
    category: '活动',
    priceOrTime: '3月-5月',
    imageUrl: getReliableImage('tea plantation green leaves picking tea china'),
    description: '体验亲手采摘铁观音春茶的乐趣，学习传统制茶工艺，品尝第一口春茶的鲜爽。适合亲子家庭和摄影爱好者。'
  },
  {
    id: 's4',
    title: '迎龙灯会',
    category: '活动',
    priceOrTime: '农历正月',
    imageUrl: getReliableImage('traditional chinese dragon dance festival night fire'),
    description: '东里村最隆重的传统民俗活动，村民自发组织舞龙灯，祈求风调雨顺。现场锣鼓喧天，热闹非凡。'
  },
  {
    id: 's5',
    title: '芦柑',
    category: '特产',
    priceOrTime: '¥8/斤',
    imageUrl: getReliableImage('fresh mandarin orange fruit orchard'),
    description: '永春芦柑，果肉汁多脆嫩，风味独特，被誉为“东方佳果”。'
  },
   {
    id: 's6',
    title: '白番鸭',
    category: '美食',
    priceOrTime: '时价',
    imageUrl: getReliableImage('white duck farm rural'),
    description: '农家散养白番鸭，肉质紧实，滋补养生。'
  }
];

const LocalSpecialsSection: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<SpecialItem | null>(null);

  return (
    <div className="mt-8 mb-12 px-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-baseline justify-between mb-4">
        <div>
           <h2 className="text-2xl font-serif-brand font-bold text-gray-800">风物志</h2>
           <p className="text-xs text-gray-500 mt-1 tracking-widest font-light">地道风物 人间烟火</p>
        </div>
        <button 
            className="text-xs text-teal-600 font-medium"
        >
            查看全部 &rarr;
        </button>
      </div>

      {/* [LAYOUT STRICT] 1 Row, 3 Columns */}
      <div className="grid grid-cols-3 gap-2">
        {/* Sliced to 3 to ensure exactly one row as requested */}
        {mockSpecials.slice(0, 3).map(item => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group btn-press shadow-sm"
          >
            <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/600x600/e2e8f0/64748b?text=${item.title}`;
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-2 left-2 right-2 text-white">
                <h4 className="font-bold text-xs shadow-black drop-shadow-sm line-clamp-1">{item.title}</h4>
                <p className="text-[9px] opacity-90 font-light mt-0.5">{item.category}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Detail/Feed Modal */}
      {selectedItem && (
         <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col animate-slide-up-sheet max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md p-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
                <h3 className="font-serif-brand font-bold text-lg text-gray-800">东里风物</h3>
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"
                >
                    <Icon name="x" className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6 pb-24 scrollbar-hide">
                 <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <div className="h-64 relative">
                            <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                            <span className={`
                                absolute top-4 left-4 text-xs px-2 py-1 rounded-md backdrop-blur-md text-white
                                ${selectedItem.category === '特产' ? 'bg-orange-500/90' : 'bg-teal-500/90'}
                            `}>
                                {selectedItem.category}
                            </span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xl font-bold text-gray-900 font-serif-brand">{selectedItem.title}</h4>
                                <span className="text-teal-600 font-bold text-sm bg-teal-50 px-2 py-1 rounded-lg">{selectedItem.priceOrTime}</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed text-justify font-light">
                                {selectedItem.description}
                            </p>
                            <button className="mt-4 w-full py-3 rounded-xl bg-stone-800 text-white text-sm font-bold shadow-lg hover:bg-black transition flex items-center justify-center space-x-2">
                                <Icon name="bag" className="w-4 h-4"/>
                                <span>联系农户购买</span>
                            </button>
                        </div>
                    </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default LocalSpecialsSection;
