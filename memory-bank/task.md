-   [x] **Task 1.4:** Implement Basic Location State Management (Store current Lat/Lon via `useLocation` hook).
-   [x] **Task 1.5:** Set up Basic Map Display:
-   [x] Integrate `react-leaflet` MapContainer component.
-   [x] Configure map to use free OSM tiles.
-   [x] Display user's current location marker on the map (conditionally, after location is fetched).
-   [x] Implement map centering/following user location.

## Phase 2: Course Data & Discovery

-   [x] **Task 2.1:** Implement Overpass API Query Service:
    -   [x] Function/hook to construct Overpass QL queries (`buildNearbyCoursesQuery`, `buildCourseDetailsQuery`).
    -   [x] Function to send POST requests to Overpass API endpoint using `fetch` (`fetchOverpassData`).
    -   [x] Handle JSON response parsing (within `fetchOverpassData`).
    -   [x] Include appropriate User-Agent header (Note: Limited control in browser `fetch`).
-   [x] **Task 2.2:** Implement Nearby Course Search:
    -   [x] Component/UI to trigger search (`CourseFinder.tsx`).
    -   [x] Query Overpass API for `golf=course` around the user's current location.
    -   [x] Parse results to get course names and IDs/boundaries.
    -   [x] Display a simple list UI for the user to select a course (dropdown in `CourseFinder`).
-   [x] **Task 2.3:** Implement Course Detail Fetching:
    -   [x] When a course is selected, query Overpass API for elements *within* its boundary (filter for `golf=tee`, `golf=green`) (`fetchDetails` in `page.tsx`).
    -   [x] Parse detailed results into a usable format (Separated tees/greens in `courseDetails` state).
-   [x] **Task 2.4:** Implement Data Caching (Simple Client-Side):
    -   [x] Store the selected course's tee/green data in React state/context for the current session (`courseDetails` state in `page.tsx`).
-   [x] **Task 2.5:** Implement Drawing Course Elements on Map:
    -   [x] Function to parse tee/green coordinates from cached data (`mapUtils.ts` helpers).
    -   [x] Use `react-leaflet` components (`Polygon`, `Marker`) to draw greens and tees on the map (all fetched, not just current hole yet) (`MapComponent.tsx`).

## Phase 3: Distance Calculation & UI

-   [x] **Task 3.1:** Implement Current Hole Logic:
    -   [x] Add "Next Hole" / "Previous Hole" buttons/UI elements.
    -   [x] Maintain state for the `currentHoleNumber` (1-18).
-   [x] **Task 3.2:** Implement Green F/M/B Coordinate Calculation:
    -   [x] Identify the green polygon/node for the *current* hole from cached data (`findGreenForHole` in `mapUtils.ts`).
    -   [x] If polygon: Calculate centroid ("Middle"), closest point on perimeter ("Front"), farthest point ("Back") (`calculatePolygonCentroid`, `findFrontBackPoints` in `mapUtils.ts`).
    -   [x] If node: Use node as "Middle", F/B might be N/A (`calculateFMBPoints` handles this).
-   [x] **Task 3.3:** Implement Distance Calculation Function/Hook:
    -   [x] Use Haversine formula (implement or use library like `haversine-distance`) (`calculateDistanceYards` in `mapUtils.ts`).
    -   [x] Input: User Lat/Lon, Target Lat/Lon.
    -   [x] Output: Distance in yards.
-   [x] **Task 3.4:** Implement UI for Distance Display:
    -   [x] Create React components for displaying distances (`DistanceDisplay.tsx`).
    -   [x] Display "F:", "M:", "B:" labels and calculated distances.
    -   [x] Ensure text is large and legible (using Tailwind CSS).
    -   [x] Update distances reactively when user location changes (via `useMemo` dependencies).
-   [x] **Task 3.5:** Display Current Hole Number on UI.

## Phase 4: Refinement & Testing

-   [x] **Task 4.1:** Basic Error Handling:
        - [x] Handle Geolocation errors (permission denied, unavailable) (Done in `useLocation`).
        - [x] Handle Overpass API errors (network issues, timeouts, bad responses) (Done in `fetchOverpassData` & UI).
        - [x] Handle missing/incomplete OSM data gracefully (Display messages for missing hole green/calc errors).
-   [ ] **Task 4.2:** Units Selection (Optional): Allow user to switch between Yards/Meters.
-   [ ] **Task 4.3:** Basic Testing:
    -   [ ] Test course discovery in different locations (using browser dev tools location simulation).
