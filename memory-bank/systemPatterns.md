# systemPatterns.md - Architecture & Design Patterns

## Overall Architecture

*   **Client-Side Focus:** All core logic (location tracking, data fetching, parsing, distance calculation, map rendering) resides within the Next.js application running in the browser.
*   **Framework:** Next.js with the App Router architecture.
*   **Rendering:** Primarily Client-Side Rendering (CSR) for dynamic components like the map and location updates. Server Components might be used for static layout elements.

## Data Flow

1.  **App Load:** Request location permission via Browser Geolocation API.
2.  **Location Acquired:** Get current coordinates.
3.  **Course Discovery (User Action):**
    *   Fetch nearby courses from Overpass API based on current location.
    *   Display results.
4.  **Course Selection (User Action):**
    *   Fetch detailed course data (tees, greens) from Overpass API for the selected course.
    *   Parse and store relevant GeoJSON data in client-side state (e.g., React Context or Zustand) for the session.
5.  **Map Display:**
    *   Render Leaflet map via `react-leaflet`.
    *   Center map on user location.
    *   Render current hole's green/tee (once course data is loaded).
6.  **Location Update:**
    *   Browser Geolocation API provides updates.
    *   Recalculate distances to the current hole's green F/M/B points.
    *   Update the UI display.

## State Management

*   **Initial:** Use React's built-in state (`useState`) and potentially Context API for sharing global state like user location, course data, and current hole.
*   **Future Consideration:** If state management becomes complex, consider a dedicated library like Zustand or Jotai.

## Key Components (Conceptual)

*   `MapComponent`: Wraps `react-leaflet`, handles map display, markers, polygons.
*   `LocationService`: Manages interaction with the Browser Geolocation API, provides location updates.
*   `OverpassService`: Handles constructing and sending queries to the Overpass API, parses responses.
*   `DistanceDisplay`: Renders the calculated F/M/B distances.
*   `CourseSelector`: UI for finding and selecting nearby courses.
*   `HoleNavigator`: Buttons/logic for changing the current hole.

## UI Patterns

*   **Layout:** Single-page application feel. Map likely dominant, with overlays or side panels for controls and distance information.
*   **Styling:** Tailwind CSS for utility-first styling. 