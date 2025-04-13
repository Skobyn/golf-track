'use client';

import { useState, useMemo, useCallback } from "react";
import L from 'leaflet';
import { useLocation } from "@/hooks/useLocation";
import CourseFinder from "@/components/CourseFinder";
import { fetchOverpassData, buildCourseDetailsQuery, OverpassElement } from "@/services/overpassApi";
import { getLatLngFromNode, getLatLngArrayFromWay, getElementDescription, findGreenForHole, calculateFMBPoints, calculateDistanceYards } from "@/utils/mapUtils";
import DistanceDisplay from "@/components/DistanceDisplay";
import dynamic from 'next/dynamic';

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <p className="text-center">Loading Map...</p>,
});

// Define locally to avoid import issues
interface CourseInfo {
  id: number;
  name: string;
  type: 'node' | 'way' | 'relation';
  center?: { lat: number; lon: number };
}

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

export default function HomeContent() {
  const { coordinates } = useLocation();
  const [selectedCourse, setSelectedCourse] = useState<CourseInfo | null>(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [currentHoleNumber, setCurrentHoleNumber] = useState<number>(1);

  const mapCenter = useMemo<L.LatLngExpression>(() => {
    if (coordinates) {
        return [coordinates.lat, coordinates.lon];
    }
    if (selectedCourse?.center) {
        return [selectedCourse.center.lat, selectedCourse.center.lon];
    }
    return [51.505, -0.09]; // Default fallback (London)
  }, [coordinates, selectedCourse]);

  const fetchDetails = useCallback(async (courseId: number) => {
    setDetailsLoading(true);
    setDetailsError(null);
    setCourseDetails(null);
    console.log(`Fetching details for course ID: ${courseId}`);
    try {
        const query = buildCourseDetailsQuery(courseId);
        const response = await fetchOverpassData(query);
        const tees = response.elements.filter(el => el.tags?.['golf'] === 'tee');
        const greens = response.elements.filter(el => el.tags?.['golf'] === 'green');
        console.log(`Found ${tees.length} tees and ${greens.length} greens.`);
        setCourseDetails({ tees, greens });
        setCurrentHoleNumber(1);
    } catch (err) {
        console.error("Error fetching course details:", err);
        setDetailsError(err instanceof Error ? err.message : 'Failed to fetch course details');
    } finally {
        setDetailsLoading(false);
    }
  }, []);

  const handleCourseSelect = useCallback((course: CourseInfo) => {
    console.log("Course selected:", course);
    setSelectedCourse(course);
    setCourseDetails(null);
    fetchDetails(course.id);
  }, [fetchDetails]);

  const goToPreviousHole = () => {
      setCurrentHoleNumber(prev => Math.max(1, prev - 1));
  };
  const goToNextHole = () => {
      setCurrentHoleNumber(prev => Math.min(18, prev + 1));
  };

  const mapTeeMarkers = useMemo((): MapElement[] => {
    if (!courseDetails?.tees) return [];
    
    const markers: MapElement[] = [];
    
    for (const tee of courseDetails.tees) {
      const position = getLatLngFromNode(tee);
      if (position) {
        markers.push({
          id: `tee-${tee.id}`,
          position: position,
          popupText: getElementDescription(tee)
        });
      }
    }
    
    return markers;
  }, [courseDetails]);

  const mapGreenPolygons = useMemo((): MapPolygon[] => {
    if (!courseDetails?.greens) return [];
    
    const polygons: MapPolygon[] = [];
    
    for (const green of courseDetails.greens) {
      const positions = getLatLngArrayFromWay(green);
      if (positions && positions.length >= 3) {
        polygons.push({
          id: `green-poly-${green.id}`,
          positions: positions,
          popupText: getElementDescription(green),
          color: '#228B22'
        });
      }
    }
    
    return polygons;
  }, [courseDetails]);

  const currentDistances = useMemo((): CalculatedDistances => {
    if (!coordinates) {
        return { front: null, middle: null, back: null, status: 'no_location' };
    }
    if (!courseDetails?.greens) {
        return { front: null, middle: null, back: null, status: 'no_details' };
    }

    const userLatLng = L.latLng(coordinates.lat, coordinates.lon);
    const currentGreenElement = findGreenForHole(courseDetails.greens, currentHoleNumber);

    if (!currentGreenElement) {
        console.warn(`No green found for hole ${currentHoleNumber}`);
        return { front: null, middle: null, back: null, status: 'no_hole_green' };
    }

    try {
        const fmbPoints = calculateFMBPoints(currentGreenElement, userLatLng);

        // Check if calculation yielded any points
        if (!fmbPoints.front && !fmbPoints.middle && !fmbPoints.back) {
             console.error(`F/M/B calculation failed for green ${currentGreenElement.id} on hole ${currentHoleNumber}`);
             return { front: null, middle: null, back: null, status: 'calc_error' };
        }

        const distF = fmbPoints.front ? calculateDistanceYards(userLatLng, fmbPoints.front) : null;
        const distM = fmbPoints.middle ? calculateDistanceYards(userLatLng, fmbPoints.middle) : null;
        const distB = fmbPoints.back ? calculateDistanceYards(userLatLng, fmbPoints.back) : null;

        return { front: distF, middle: distM, back: distB, status: 'ok' };

    } catch (calcError) {
        console.error(`Error during distance calculation for hole ${currentHoleNumber}:`, calcError);
        return { front: null, middle: null, back: null, status: 'calc_error' };
    }

  }, [coordinates, courseDetails, currentHoleNumber]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-2">Golf Track</h1>
      {selectedCourse && (
          <h2 className="text-xl font-semibold mb-1 text-green-700">{selectedCourse.name}</h2>
      )}

      {/* Hole Navigation UI - Shown only when course is selected */} 
      {selectedCourse && (
        <div className="flex items-center justify-center gap-4 my-2 w-full max-w-xs">
            <button onClick={goToPreviousHole} disabled={currentHoleNumber <= 1 || detailsLoading} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Prev</button>
            <span className="text-xl font-bold">Hole {currentHoleNumber}</span>
            <button onClick={goToNextHole} disabled={currentHoleNumber >= 18 || detailsLoading} className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {/* Map Area */}
      <div className="relative w-full h-[50vh] max-w-5xl border border-gray-300 rounded overflow-hidden mb-4 bg-gray-200">
        <MapComponent
          center={mapCenter}
          userMarkerPosition={coordinates ? [coordinates.lat, coordinates.lon] : undefined}
          userMarkerPopupText="You are here"
          teeMarkers={mapTeeMarkers}
          greenPolygons={mapGreenPolygons}
        />
      </div>

      {/* Course Finder / Change Course Button */} 
      {!selectedCourse && coordinates && (
          <div className="w-full max-w-4xl">
            <CourseFinder userCoords={coordinates} onCourseSelect={handleCourseSelect} />
          </div>
      )}
       {selectedCourse && (
           <div className="w-full max-w-4xl mb-4 flex justify-between items-center">
                <button
                   onClick={() => {
                       setSelectedCourse(null);
                       setCourseDetails(null);
                       setDetailsError(null);
                       setCurrentHoleNumber(1);
                   }}
                   disabled={detailsLoading} // Disable while loading new course
                   className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
               >
                   Change Course
               </button>
           </div>
       )}

      {/* Distance Display Area - Conditional Rendering based on status */}
      {selectedCourse && (
          <div className="w-full max-w-md mt-0">
            {detailsLoading && <p className="text-center p-4 bg-gray-100 rounded shadow">Loading course data...</p>}
            {detailsError && <p className="text-center p-4 bg-red-100 text-red-700 rounded shadow">Error loading course data: {detailsError}</p>}
            {!detailsLoading && !detailsError && courseDetails && (
                <> 
                    {currentDistances.status === 'ok' && (
                        <DistanceDisplay
                            front={currentDistances.front}
                            middle={currentDistances.middle}
                            back={currentDistances.back}
                        />
                    )}
                    {currentDistances.status === 'no_location' && (
                         <p className="text-center p-4 bg-yellow-100 text-yellow-800 rounded shadow">Waiting for location to calculate distances...</p>
                    )}
                    {currentDistances.status === 'no_hole_green' && (
                         <p className="text-center p-4 bg-orange-100 text-orange-700 rounded shadow">Green data not found for Hole {currentHoleNumber}.</p>
                    )}
                     {currentDistances.status === 'calc_error' && (
                         <p className="text-center p-4 bg-red-100 text-red-700 rounded shadow">Could not calculate distances for Hole {currentHoleNumber}.</p>
                    )}
                </>
            )}
             {!detailsLoading && !detailsError && !courseDetails && (
                 <p className="text-center p-4 bg-gray-100 rounded shadow">Course selected, waiting for details...</p>
             )}
          </div>
      )}
    </main>
  );
} 