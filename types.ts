
import { IconName } from './components/common/Icon';

export type CategoryType = 'red' | 'nature' | 'culture' | 'people' | 'media' | 'event';

export interface Spot {
  id: string;
  name: string;
  category: CategoryType;
  subCategory?: string; // e.g., '先烈', '乡贤', '民俗'
  coord: string; // "lng,lat"
  address?: string;
  intro_short: string;
  intro_txt: string; // The main "Book Content"
  imagePrompt: string;
  imageUrl?: string;
  tags?: string[];
  audioUrl?: string; // TTS output
  isLit?: boolean; // User interaction status
  position: { top: string, left: string }; // Position for map view
}

export interface Person {
  id: string;
  name: string;
  type: 'martyr' | 'sage' | 'student'; // 先烈 | 乡贤 | 大学生
  description: string;
  detailText: string;
  imageUrl: string;
  achievement?: string; // For students: "考入清华大学" etc.
  year?: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'video' | 'link';
  coverUrl: string;
  url: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  content: string;
  imageUrl?: string;
}

export interface VoiceResponse {
  text: string;
  audio_base_64?: string;
  need_manual_input?: boolean;
  error?: boolean;
}

export interface RecognitionResponse {
  explanation: string;
  memorial_image?: string;
  audio_base_64?: string;
}

export interface ShoppingInfo {
  recommend_text: string;
  businesses: { name: string; distance: string }[];
  products: { name: string; price: string }[];
}

export interface Celebrity {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  detailText: string;
}

export interface SpecialItem {
  id: string;
  title: string;
  category: string;
  priceOrTime: string;
  imageUrl: string;
  description: string;
}

export interface Route {
  id: string;
  name: string;
  category: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
  spots: Spot[];
}

export interface NavigationInfo {
  route_text: string;
  walking_time: string;
}

export interface RelatedKnowledge {
    title: string;
    content: string;
    imageUrl?: string;
}

// ANP Types
export type AgentID = 'A' | 'B' | 'C' | 'D' | 'USER' | 'RED' | 'ECO' | 'FOOD';
export interface ANPMessage {
  id: string;
  timestamp: number;
  source: AgentID;
  target: AgentID | 'BROADCAST';
  type: 'REQUEST' | 'RESPONSE' | 'EVENT' | 'ERROR';
  action: string;
  payload: any;
}

export interface SharedContext {
  userSession: {
    currentSpot?: string;
    litSpots: string[]; // Track unlocked achievements
    history: string[]; 
  };
  systemStatus: {
    agentHealth: Record<string, string>;
    pendingTasks: number;
  };
}

export interface Agent {
  id: AgentID;
  name: string;
  description: string;
  icon: IconName;
  colorClasses: any;
  imageUrl?: string;
}
