'use client';

import React from 'react';

interface DistanceDisplayProps {
  front: number | null;
  middle: number | null;
  back: number | null;
}

const DistanceDisplay: React.FC<DistanceDisplayProps> = ({ front, middle, back }) => {

    const formatDistance = (dist: number | null): string => {
        if (dist === null || isNaN(dist)) return "-";
        return Math.round(dist).toString();
    }

  return (
    <div className="flex justify-around items-center text-center bg-gray-100 p-4 rounded shadow">
      <div>
        <p className="text-sm text-gray-500">Front</p>
        <p className="text-3xl font-bold text-blue-600">{formatDistance(front)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Middle</p>
        <p className="text-4xl font-bold text-green-700">{formatDistance(middle)}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Back</p>
        <p className="text-3xl font-bold text-red-600">{formatDistance(back)}</p>
      </div>
      {/* Units Label */} 
      {(front !== null || middle !== null || back !== null) && 
        <div className="absolute bottom-1 right-2 text-xs text-gray-400">yards</div>
      }
    </div>
  );
};

export default DistanceDisplay; 