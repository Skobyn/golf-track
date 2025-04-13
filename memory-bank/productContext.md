# productContext.md - Product Context

## Problem Solved

Many golfers want basic distance information (primarily to the green) while playing, but don't want to pay for expensive dedicated GPS devices or subscription-based mobile apps. Existing free options might be limited or lack accuracy.

## How it Works

The application uses the user's smartphone GPS to determine their location on the golf course. It fetches golf course layout data (tee boxes, greens) from the free, crowd-sourced OpenStreetMap database via the Overpass API. Using the user's location and the course data, it calculates the distance to the front, middle, and back (F/M/B) of the current hole's green and displays this information clearly on a map interface.

## User Experience Goals

*   **Simplicity:** Easy to start and use with minimal setup.
*   **Clarity:** Distances displayed large and legibly for quick glances during play.
*   **Accessibility:** Free to use, leveraging readily available technology (smartphone) and free data sources.
*   **Focus:** Deliver the core F/M/B distance information reliably.

## Target User Journey

1.  User arrives at a golf course.
2.  Opens the app.
3.  Grants location permission.
4.  App automatically detects location and suggests nearby courses (or user selects one).
5.  App loads course data and displays the map centered on the user.
6.  User plays their round, glancing at the app for F/M/B distances to the green for the current hole.
7.  User can manually advance to the next hole if needed. 