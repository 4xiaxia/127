
import React from 'react';
import MapView from './MapView';
import { Spot, Route } from '../types';
import { Spinner } from './common/Spinner';

interface PresenterModeProps {
  routes: Route[] | null;
  activeSpot: Spot | null;
  activeSpotCategory: string | null;
  onSelectSpotFromMap: (spot: Spot | null) => void;
  isLoading: boolean;
  error: string | null;
  geoError: GeolocationPositionError | null;
}

const PresenterMode: React.FC<PresenterModeProps> = ({ 
  routes, 
  activeSpot, 
  onSelectSpotFromMap, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-stone-100">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
       <MapView 
          routes={routes || []} 
          onSelectSpot={onSelectSpotFromMap} 
          activeSpotId={activeSpot?.id || null} 
       />
    </div>
  );
};

export default PresenterMode;
