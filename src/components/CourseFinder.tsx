'use client';

import React, { useState, useCallback } from 'react';
import { fetchOverpassData, buildNearbyCoursesQuery } from '@/services/overpassApi';

interface Coordinates {
  lat: number;
  lon: number;
}

interface CourseInfo {
  id: number;
  name: string;
  type: 'node' | 'way' | 'relation';
  center?: { lat: number; lon: number }; // Center point if available
}

interface CourseFinderProps {
  userCoords: Coordinates | null;
  onCourseSelect: (course: CourseInfo) => void;
}

const SEARCH_RADIUS_METERS = 15000; // 15km search radius

const CourseFinder: React.FC<CourseFinderProps> = ({ userCoords, onCourseSelect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundCourses, setFoundCourses] = useState<CourseInfo[]>([]);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleFindCourses = useCallback(async () => {
    if (!userCoords) {
      setError('Current location not available yet.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchAttempted(true);
    setFoundCourses([]);

    try {
      const query = buildNearbyCoursesQuery(userCoords.lat, userCoords.lon, SEARCH_RADIUS_METERS);
      const response = await fetchOverpassData(query);

      const courses = response.elements
        .filter(el => el.tags?.name) // Only include courses with names
        .map((el): CourseInfo => ({
          id: el.id,
          name: el.tags?.name || 'Unnamed Course',
          type: el.type,
          // Extract center if available (especially useful for ways/relations)
          center: el.center ? 
                  { lat: el.center.lat, lon: el.center.lon } : 
                  (el.lat !== undefined && el.lon !== undefined ? 
                    { lat: el.lat, lon: el.lon } : 
                    undefined)
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

      setFoundCourses(courses);

    } catch (err) {
      console.error("Error finding nearby courses:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [userCoords]);

  return (
    <div className="my-4 p-4 border border-gray-200 rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">Find Nearby Courses</h2>
      {!userCoords && (
        <p className="text-sm text-gray-500">Waiting for location...</p>
      )}
      {userCoords && (
        <button
          onClick={handleFindCourses}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search Nearby'}
        </button>
      )}

      {isLoading && <p className="mt-2 text-sm">Searching within {SEARCH_RADIUS_METERS / 1000}km...</p>}
      {error && <p className="mt-2 text-sm text-red-500">Error: {error}</p>}

      {searchAttempted && !isLoading && foundCourses.length === 0 && !error && (
        <p className="mt-2 text-sm text-gray-600">No named courses found nearby.</p>
      )}

      {foundCourses.length > 0 && (
        <div className="mt-4">
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">Select a Course:</label>
          <select
            id="course-select"
            onChange={(e) => {
              const selectedId = parseInt(e.target.value, 10);
              const selectedCourse = foundCourses.find(c => c.id === selectedId);
              if (selectedCourse) {
                onCourseSelect(selectedCourse);
              }
            }}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            defaultValue=""
          >
            <option value="" disabled>-- Select Course --</option>
            {foundCourses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CourseFinder; 