# task_layout_always_hamburger_sidebar.md

### **Task ID:** `T_LAYOUT_ALWAYS_HAMBURGER_SIDEBAR`

### **Goal:**

Remove the persistent left sidebar entirely and replace it with a universal hamburger-menu slide-in drawer that works on **all devices**, **all screen sizes**, and **all orientations**. The hamburger button is *always visible*, and navigation is *always inside a drawer only*. Gameplay and all pages must adapt to the absence of a fixed sidebar.

---

# 📝 Task Summary

The app currently uses a persistent sidebar. This task removes that pattern entirely.

**New behavior:**

* There is **no persistent sidebar at any size**
* A **hamburger button is always shown** in the top-left
* Clicking it opens a **slide-in drawer** that contains all navigation items that used to appear in the sidebar
* Every route must function with a full-width layout, since there is no sidebar taking space

This applies universally: desktop, tablets, laptops, ultrawide monitors, mobile — everything uses hamburger navigation only.

---

# 🎯 Detailed Requirements

---

## **1. Remove Persistent Sidebar From All Layouts**

The left sidebar component should no longer appear anywhere.

* Delete or disable the sidebar’s render path in the main layout container
* Remove its CSS footprint (margins, padding, grid columns, etc.)
* All pages should assume full-width content at all times

---

## **2. Add a Global Hamburger Menu Button**

**File:** `src/components/HamburgerButton.tsx`

Requirements:

* Minimal 3-line icon (CSS lines or unicode ☰)
* Always centered vertically in the top navigation row (top-left corner)
* Always visible on all pages and screen sizes
* Clicking toggles a boolean in UI state: `isDrawerOpen`

Must integrate with:

* Global UI store (Zustand, Jotai, Redux, or context depending on app)
* Layout container that renders the drawer

---

## **3. Implement the Universal Slide-In Navigation Drawer**

**File:** `src/components/NavigationDrawer.tsx`

Drawer requirements:

* Slides in from the **left**
* Width: **70–80%** of the screen
* Pushes no content; overlays on top
* Semi-transparent backdrop behind the drawer (clicking closes drawer)
* Uses CSS transitions: **200–300ms**
* Contains all former sidebar navigation items:

  * Profiles
  * Stats
  * Settings
  * Create Your Own
  * Any future/conditional nav items
* Items must preserve routing and highlight states

Drawer closes when:

* User taps outside drawer
* User selects a nav item
* Route changes
* Recording modes activate
* Escape key pressed

---

## **4. Update Main Layout to Work Without a Sidebar**

**File:** `src/layout/LayoutContainer.tsx` (or equivalent)

Requirements:

* Page content should always occupy full width
* Top bar should contain:

  * Hamburger button (far left)
  * Optional page title or status elements
* Everything previously offset by sidebar padding must be realigned

Make sure:

* No leftover grid columns from old sidebar layout
* No horizontal shift occurs when drawer opens (drawer overlays, does not reflow layout)

---

## **5. Update All Major Screens for Full-Width Layout**

Pages to check:

* GameScreen
* CreateYourOwnPage
* SettingsPage
* Profile management
* Stats page
* Recording screens (`/record-signs`, `/review-signs`)

Required adjustments:

* GameScreen centers content using full available width
* Word strip, image container, sign video, and similar UI elements stretch appropriately
* Keyboard expands to full width
* Any top-left profile/settings icons must be removed or moved into the drawer
* Avoid left-side ghost spacing from previous sidebar CSS

---

## **6. Special Behavior for Recording Modes**

Routes:
`/record-signs`, `/review-signs`

Requirements:

* Drawer cannot overlap interactive camera UI
* If the drawer is open when recording starts, auto-close it
* Hamburger must remain accessible at all times
* Layout must not shift or compress the countdown, camera preview, or controls

---

## **7. Animation & Interaction Requirements**

Implement smooth transitions:

* Drawer slide-in/out: **200–300ms**
* Backdrop fade-in/out: matched to drawer timing
* Hamburger icon fade-in on mount (optional)

Interaction requirements:

* Touch-friendly on mobile/tablets
* Keyboard navigation supported
* ESC closes drawer on desktop

---

## **8. Testing Scenarios**

Verify behavior on:

1. Desktop monitors (large + ultrawide)
2. Laptops (macOS, Windows)
3. iPad Safari (portrait + landscape)
4. Modern phones (iOS/Android)
5. `/record-signs` and `/review-signs`
6. Gameplay screen (with/without sign video)
7. Create-Your-Own flow
8. Route changes (drawer must auto-close)

---

# 🧪 ACCEPTANCE CRITERIA

✔ No persistent sidebar exists anywhere
✔ Hamburger button appears on all screen sizes
✔ Drawer animates smoothly and overlays content
✔ All navigation available in the drawer with working routes
✔ All screens layout correctly at full width
✔ Recording pages stay functional and unobstructed
✔ Drawer closes on:

* Backdrop click
* Nav item click
* Route change
* ESC key
* Recording start
  ✔ Works consistently across all modern browsers including iPad Safari

---

# 📦 DELIVERABLES

* `NavigationDrawer.tsx`
* `HamburgerButton.tsx`
* Updated layout container without a sidebar
* Updated routing/navigation structure
* Updated page layouts (GameScreen, recording pages, settings, profiles, stats, etc.)
* Revised global UI state for drawer control
* Clean, full-width layout across the entire application
