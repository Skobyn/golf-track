# Golf Track - Free Web-Based Golf GPS

## Overview

Golf Track is a simple, free web application designed to provide golfers with basic distance information (Front, Middle, Back of the green) using their smartphone's browser and GPS.

It leverages:

*   Device GPS via the Browser Geolocation API.
*   OpenStreetMap (OSM) data for course layouts, fetched via the Overpass API.
*   Leaflet maps for displaying the course and user location.

This application is built with Next.js, TypeScript, and Tailwind CSS, intended for deployment on Vercel.

## Features (MVP Target)

*   Detect user location.
*   Search for nearby golf courses using OSM data.
*   Display selected course map with user location.
*   Calculate and display distances to Front/Middle/Back of the current green.
*   Manual hole navigation.

## Getting Started

### Prerequisites

*   Node.js (Check `.nvmrc` or `package.json` engines field if specified)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url> # TODO: Add repo URL later
    cd golf-track
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1.  Open the application in your browser.
2.  Allow location permissions when prompted.
3.  The app will attempt to find nearby courses.
4.  Select your course.
5.  The map will display your location and calculated distances to the green for the current hole.

## Important Notes

*   **Accuracy:** Distance accuracy depends on your device's GPS signal quality and the completeness/accuracy of OpenStreetMap data for the specific course.
*   **Data:** Not all courses have detailed data (like green polygons) in OpenStreetMap. Functionality may be limited on such courses.
*   **Connectivity:** Requires an internet connection to load maps and course data.

## Development Details

*   See `memory-bank/` directory for detailed planning, context, and progress tracking.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
