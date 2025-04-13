import L from 'leaflet';
import { OverpassElement } from '@/services/overpassApi';
import haversine from 'haversine-distance';

/**
 * Gets LatLng from an Overpass node element
 */
export function getLatLngFromNode(element: OverpassElement): L.LatLngExpression | null {
  // For direct nodes
  if (element.type === 'node' && typeof element.lat === 'number' && typeof element.lon === 'number') {
    return [element.lat, element.lon];
  }
  
  // For elements with geometry (ways/relations)
  if (element.geometry && element.geometry.length > 0) {
    const firstPoint = element.geometry[0];
    return [firstPoint.lat, firstPoint.lon];
  }
  
  return null;
}

/**
 * Converts a way's geometry to an array of LatLng for making polygons
 */
export function getLatLngArrayFromWay(element: OverpassElement): L.LatLngExpression[] | null {
  if (element.geometry && element.geometry.length >= 3) {
    return element.geometry.map(point => [point.lat, point.lon] as L.LatLngExpression);
  }
  return null;
}

/**
 * Gets a descriptive string for an element based on its tags
 */
export function getElementDescription(element: OverpassElement): string {
  // Try to get hole number if available
  const holeNumber = element.tags?.['ref'] || element.tags?.['golf:hole'] || 'Unknown';
  const elementType = element.tags?.['golf'] || 'Unknown';
  
  return `${elementType.charAt(0).toUpperCase() + elementType.slice(1)} - Hole ${holeNumber}`;
}

/**
 * Finds the green element for a specific hole
 */
export function findGreenForHole(greens: OverpassElement[], holeNumber: number): OverpassElement | null {
  // First try to find by ref tag
  const byRef = greens.find(g => 
    g.tags?.['ref'] === holeNumber.toString() || 
    g.tags?.['golf:hole'] === holeNumber.toString()
  );

  if (byRef) return byRef;
  
  // If no exact match found, try to guess from element names
  const possibleMatches = greens.filter(g => {
    const name = g.tags?.['name'] || '';
    return name.includes(`Hole ${holeNumber}`) || 
           name.includes(`#${holeNumber}`) ||
           name.includes(`H${holeNumber}`);
  });

  return possibleMatches.length > 0 ? possibleMatches[0] : null;
}

/**
 * Calculate center point of a polygon
 */
function calculatePolygonCentroid(points: L.LatLngExpression[]): L.LatLng {
  let sumLat = 0;
  let sumLon = 0;
  
  points.forEach(point => {
    if (Array.isArray(point)) {
      sumLat += point[0];
      sumLon += point[1];
    } else if ('lat' in point && 'lng' in point) {
      sumLat += point.lat;
      sumLon += point.lng;
    }
  });
  
  return L.latLng(sumLat / points.length, sumLon / points.length);
}

/**
 * Find front and back points of green relative to user position
 */
function findFrontBackPoints(
  polygon: L.LatLngExpression[], 
  userPosition: L.LatLng
): { front: L.LatLng; back: L.LatLng } {
  let frontPoint = null;
  let backPoint = null;
  let minDistance = Infinity;
  let maxDistance = -Infinity;
  
  // Convert all points to LatLng objects
  const points = polygon.map(point => {
    if (Array.isArray(point)) {
      return L.latLng(point[0], point[1]);
    }
    return point as L.LatLng;
  });
  
  // Find closest and farthest points
  for (const point of points) {
    const distance = userPosition.distanceTo(point);
    
    if (distance < minDistance) {
      minDistance = distance;
      frontPoint = point;
    }
    
    if (distance > maxDistance) {
      maxDistance = distance;
      backPoint = point;
    }
  }
  
  return { 
    front: frontPoint as L.LatLng, 
    back: backPoint as L.LatLng 
  };
}

/**
 * Interface for F/M/B points
 */
interface FMBPoints {
  front: L.LatLng | null;
  middle: L.LatLng | null;
  back: L.LatLng | null;
}

/**
 * Calculate Front, Middle, Back points for a green
 */
export function calculateFMBPoints(
  greenElement: OverpassElement, 
  userPosition: L.LatLng
): FMBPoints {
  // If it's a polygon/way with geometry
  const polygonPoints = getLatLngArrayFromWay(greenElement);
  
  if (polygonPoints && polygonPoints.length >= 3) {
    const middle = calculatePolygonCentroid(polygonPoints);
    const { front, back } = findFrontBackPoints(polygonPoints, userPosition);
    
    return { front, middle, back };
  }
  
  // If it's a single node
  const nodePosition = getLatLngFromNode(greenElement);
  if (nodePosition) {
    const middlePoint = Array.isArray(nodePosition) 
      ? L.latLng(nodePosition[0], nodePosition[1]) 
      : nodePosition as L.LatLng;
    
    // For a single point, middle is the point, front/back might be null
    return { front: null, middle: middlePoint, back: null };
  }
  
  // If no valid geometry
  return { front: null, middle: null, back: null };
}

/**
 * Calculate distance in yards between two points
 */
export function calculateDistanceYards(point1: L.LatLng, point2: L.LatLng): number {
  const p1 = { latitude: point1.lat, longitude: point1.lng };
  const p2 = { latitude: point2.lat, longitude: point2.lng };
  
  // Calculate distance in meters
  const distanceInMeters = haversine(p1, p2);
  
  // Convert to yards (1 meter = 1.09361 yards)
  const distanceInYards = distanceInMeters * 1.09361;
  
  return Math.round(distanceInYards);
} 