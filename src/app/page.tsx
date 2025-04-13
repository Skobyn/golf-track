'use client'; // This whole page needs to be client-side due to hooks and dynamic import

import { useLocation } from "@/hooks/useLocation";
import { useState, useMemo, useCallback } from "react";
import dynamic from 'next/dynamic';
import L from 'leaflet'; // Import L namespace directly
import CourseFinder from "@/components/CourseFinder";
import { fetchOverpassData, buildCourseDetailsQuery, OverpassElement } from "@/services/overpassApi";
import { getLatLngFromNode, getLatLngArrayFromWay, getElementDescription, findGreenForHole, calculateFMBPoints, calculateDistanceYards } from "@/utils/mapUtils"; // Import needed utils
import DistanceDisplay from "@/components/DistanceDisplay"; // Import DistanceDisplay

// Define locally to avoid import issues
interface CourseInfo {
  id: number;
  name: string;
  type: 'node' | 'way' | 'relation';
  center?: { lat: number; lon: number };
}

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
    ssr: false,
    loading: () => <p className="text-center">Loading Map...</p>,
  });

interface CourseDetails {
    tees: OverpassElement[];
    greens: OverpassElement[];
}
interface MapElement {
    id: number | string;
    position: L.LatLngExpression;
    popupText?: string;
}
interface MapPolygon {
    id: number | string;
    positions: L.LatLngExpression[];
    popupText?: string;
    color?: string;
}

// Type for calculated distances, adding status
interface CalculatedDistances {
    front: number | null;
    middle: number | null;
    back: number | null;
    status: 'ok' | 'no_location' | 'no_details' | 'no_hole_green' | 'calc_error';
}

// Dynamically import the actual page content to avoid SSR issues
const HomeContent = dynamic(() => import('@/components/HomeContent'), {
  ssr: false,
  loading: () => <div className="flex min-h-screen items-center justify-center">Loading...</div>
});

export default function Home() {
  return <HomeContent />;
}
