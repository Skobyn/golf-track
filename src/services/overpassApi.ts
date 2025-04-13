// Overpass API endpoint
const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"; // Using the .de instance, common choice

/**
 * Represents a generic element returned by the Overpass API.
 * Enhance this later with specific types for nodes, ways, relations and tags.
 */
export interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number; // For nodes
  lon?: number; // For nodes
  timestamp: string;
  version: number;
  changeset: number;
  user: string;
  uid: number;
  tags?: { [key: string]: string };
  nodes?: number[]; // For ways
  members?: { 
    type: 'node' | 'way' | 'relation';
    ref: number;
    role: string;
  }[]; // For relations (with more specific type)
  geometry?: { lat: number; lon: number }[]; // For ways/relations with geometry
  center?: { lat: number; lon: number }; // Center point returned by Overpass when using 'out center'
}

/**
 * Represents the structure of the JSON response from the Overpass API.
 */
export interface OverpassApiResponse {
  version: number;
  generator: string;
  osm3s: {
    timestamp_osm_base: string;
    copyright: string;
  };
  elements: OverpassElement[];
}

/**
 * Fetches data from the Overpass API using a provided query.
 *
 * @param query The Overpass QL query string.
 * @returns A promise that resolves to the parsed Overpass API response.
 * @throws An error if the fetch operation fails or the API returns an error status.
 */
export async function fetchOverpassData(query: string): Promise<OverpassApiResponse> {
  console.log("Overpass Query:", query); // Log the query for debugging

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      // Note: Setting User-Agent from browser JS is typically blocked or ignored.
      // The server might see the browser's default User-Agent.
    },
    body: `data=${encodeURIComponent(query)}`,
  };

  try {
    const response = await fetch(OVERPASS_API_URL, options);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Overpass API Error Body:", errorBody);
      throw new Error(`Overpass API request failed: ${response.status} ${response.statusText}`);
    }

    const data: OverpassApiResponse = await response.json();
    // Basic validation
    if (!data || !Array.isArray(data.elements)) {
        throw new Error("Invalid response structure received from Overpass API.");
    }

    console.log("Overpass Response (first 10 elements):", data.elements.slice(0, 10)); // Log partial response
    return data;

  } catch (error) {
    console.error("Error fetching from Overpass API:", error);
    if (error instanceof Error) {
        throw error; // Re-throw known errors
    } else {
        throw new Error("An unknown error occurred while fetching from Overpass API.");
    }
  }
}

// --- Query Builder Functions --- 

/**
 * Builds an Overpass QL query to find golf courses near a given location.
 *
 * @param lat Latitude of the center point.
 * @param lon Longitude of the center point.
 * @param radius Search radius in meters.
 * @param timeout Optional timeout for the query in seconds (default: 30).
 * @returns The Overpass QL query string.
 */
export function buildNearbyCoursesQuery(lat: number, lon: number, radius: number, timeout: number = 30): string {
  return `
    [out:json][timeout:${timeout}];
    (
      node["golf"="course"](around:${radius},${lat},${lon});
      way["golf"="course"](around:${radius},${lat},${lon});
      relation["golf"="course"](around:${radius},${lat},${lon});
    );
    out body center;
    >;
    out skel qt;
  `;
}

/**
 * Builds an Overpass QL query to find greens and tees within a given course area.
 *
 * @param courseOsmId The OpenStreetMap ID of the course (must be a way or relation).
 * @param timeout Optional timeout for the query in seconds (default: 30).
 * @returns The Overpass QL query string.
 */
export function buildCourseDetailsQuery(courseOsmId: number, timeout: number = 30): string {
  // Note: Overpass requires adjusting the ID for ways/relations in area queries.
  // Ways need +2400000000, Relations need +3600000000.
  // We assume the ID provided might be a way or relation, but the Overpass API
  // area(...) function usually handles this if you reference the original object first.
  // Let's use a simpler approach first by directly referencing the object ID.

  // Approach 1: Query elements inside the area defined by the course ID.
  // This relies on the course being mapped as a closed way or relation.
  return `
    [out:json][timeout:${timeout}];
    (
      // Define the area of the course (adjust ID if necessary, or use derived areas)
      // Let's first get the course itself to make area creation easier
      nw(id:${courseOsmId}); // Get the node/way/relation object
      // Now query for tees and greens within its area
      (
         node(area)["golf"="tee"];
         way(area)["golf"="tee"]; // Tees can be ways too (e.g., area of tee box)
         node(area)["golf"="green"];
         way(area)["golf"="green"]; // Greens are often ways (polygons)
      );
    );
    // Output the geometry of the found elements
    out body geom;
    >;
    out skel qt;
  `;

  // Alternative approach (more robust if course ID refers to node, or if area doesn't work):
  // Find the course object, then find tees/greens that might be *part* of it (for relations)
  // or simply near its center (less accurate).
  // This is more complex and might be needed if the above fails often.
} 