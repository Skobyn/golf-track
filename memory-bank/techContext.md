# techContext.md - Technology & Setup

## Repository

*   **URL:** https://github.com/Skobyn/golf-track.git

## Core Technology Stack

*   **Framework:** Next.js (with App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **UI Components:** Standard HTML / React components initially. May introduce a library like Shadcn/UI later if needed.
*   **Linting/Formatting:** ESLint (configured by `create-next-app`)
*   **Package Manager:** npm (or yarn, default with `create-next-app`)

## Key Libraries & APIs

*   **Mapping:** Leaflet (lightweight, good for OSM) with `react-leaflet` wrapper. Need to install (`npm install leaflet react-leaflet @types/leaflet`).
*   **Location Services:** Browser Geolocation API (`navigator.geolocation`). No separate install needed.
*   **Data Fetching (OSM):** Overpass API (via standard `fetch` API).
*   **Geospatial Calculations:** Haversine formula implementation or a small library like `haversine-distance`.

## Deployment

*   **Target Platform:** Vercel (aligns well with Next.js).

## Development Environment

*   **Setup:** Standard Node.js environment.
*   **Run Locally:** `npm run dev`
*   **Build:** `npm run build`

## Constraints & Considerations

*   Must use only freely available resources (OSM, Overpass API, free map tiles).
*   Browser Geolocation API accuracy varies and requires user permission.
*   Overpass API has usage limits; implement client-side caching for course data during a session.
*   Respect map tile provider usage policies. 