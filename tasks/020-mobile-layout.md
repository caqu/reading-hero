task_mobile_layout_hamburger_sidebar.md

Task ID: T_MOBILE_LAYOUT_HAMBURGER_SIDEBAR
Goal:
Implement a responsive “mobile mode” where the left sidebar collapses into a hamburger menu when the viewport height is below a certain threshold. Replace the persistent sidebar with a slide-in drawer to save space on tablets, iPads, laptops in portrait mode, and smaller displays.

⸻

📝 Task Summary

When the viewport height is too small (e.g., < 600–700px), the UI becomes cramped.
In this state:
	•	The left sidebar should disappear
	•	A hamburger icon should appear in the top-left corner
	•	Clicking it opens a slide-in drawer containing the same navigation

Gameplay layout should automatically adapt to the missing sidebar.

⸻

🎯 Detailed Requirements

⸻

1. Add a Responsive Breakpoint (Height-Based)

Define in:

src/config/layoutConfig.ts

Add:

export const MOBILE_HEIGHT_BREAKPOINT = 650; // px

Behavior:
	•	If window.innerHeight < MOBILE_HEIGHT_BREAKPOINT → activate mobile mode
	•	Else → desktop mode

Important:
This is height-based, not width-based, as requested.

Add a hook:

useViewportMode()

Returning:

{
  isMobile: boolean,
  height: number,
  width: number
}

Update on resize & orientation change.

⸻

2. Hide Sidebar in Mobile Mode

When isMobile === true:
	•	Hide sidebar entirely (CSS: display:none or remove from layout)
	•	Replace with a top-left hamburger icon

⸻

3. Add a Hamburger Menu Button

Create component:

src/components/HamburgerButton.tsx

Requirements:
	•	Simple 3-line icon
	•	Top-left corner
	•	Always visible in mobile mode
	•	Can use emoji (☰) or CSS lines

On click:
	•	Toggles “drawer open” boolean state in a global UI store or local state.

⸻

4. Create Slide-In Drawer for Navigation

Component:

src/components/MobileDrawer.tsx

Requirements:
	•	Covers 70–80% of screen width (left side)
	•	Semi-transparent backdrop behind drawer
	•	Drawer contains all items from the current sidebar:
	•	Profiles
	•	Stats
	•	Settings
	•	Create Your Own (if applicable)
	•	(Any future nav items)
	•	Drawer items must preserve existing route behaviors
	•	Click outside drawer closes it
	•	Opening/closing animated (CSS transitions)

⸻

5. Adjust Main Layout in Mobile Mode

Gameplay and pages must reflow without the left sidebar.

Specific adjustments:
	•	GameScreen should center content horizontally
	•	Word strip, image, and sign video should shift right to fill space
	•	Keyboard should expand to available width
	•	Profile icon (top-left normally) moves into drawer
	•	Settings/Stats accessible only from drawer

Everything should still feel like the desktop layout, just without sidebar.

⸻

6. Prevent Layout Jumps While Recording (Important for /record-signs)

Recording mode (/record-signs and /review-signs):
	•	Must still obey mobile mode
	•	Countdown + camera preview must not be pushed off screen
	•	Hamburger button must stay accessible
	•	Drawer cannot interfere with recording UI

If drawer is open during recording, close it automatically.

⸻

7. Smooth Animation & Transitions

Add transitions for:
	•	Drawer slide (200–300ms)
	•	Sidebar hide/show (optional)
	•	Hamburger icon fade-in

Consistency with existing CSS or Tailwind if used.

⸻

8. Testing Scenarios

Test the following:
	1.	On laptop with browser height < threshold
	2.	On iPad Safari portrait + landscape
	3.	On Windows machine resizing window
	4.	On /record-signs route
	5.	On /review-signs
	6.	On gameplay screen with and without sign video
	7.	On Create-Your-Own page

Drawer must work correctly in all routes.

⸻

🧪 ACCEPTANCE CRITERIA

✔ Sidebar disappears when innerHeight < MOBILE_HEIGHT_BREAKPOINT

✔ Hamburger button appears in top-left

✔ Drawer slides in/out smoothly

✔ All navigation items work correctly inside drawer

✔ Gameplay layout reflows to full width

✔ Recording & review screens remain functional

✔ Drawer closes on route change

✔ Works in all modern browsers, including iPad Safari

⸻

📦 DELIVERABLES
	•	layoutConfig.ts
	•	useViewportMode.ts (or integrated into existing viewport logic)
	•	HamburgerButton.tsx
	•	MobileDrawer.tsx
	•	Updated layout container
	•	Updated styling for GameScreen, CreateYourOwnPage, SettingsPage, etc.
	•	Mobile-compatible navigation experience

