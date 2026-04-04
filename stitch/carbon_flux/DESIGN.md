# Design System Specification: Operational Elegance

## 1. Overview & Creative North Star
**Creative North Star: The Silent Maître d’**

In the chaotic environment of high-volume restaurant operations, this design system acts as the "Silent Maître d’"—sophisticated, invisible until needed, and impeccably organized. We are moving away from the "Dashboard-as-a-Grid" trope. Instead, we embrace **Layered Intentionality**. 

By utilizing intentional asymmetry, overlapping surfaces, and extreme tonal depth, we create a tool that feels less like software and more like a premium physical workspace. We break the "template" look by prioritizing breathing room (whitespace) over information density, ensuring that the user’s focus is always on the most critical operational task.

---

## 2. Colors & Surface Philosophy

### The Palette
The core of this system is the `background` (`#0b0e11`). It is not a void, but a deep charcoal canvas designed to make the `primary` (`#adc6ff`) and `secondary` (`#9d9da4`) tones feel luminous without being "neon."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Structure is achieved through **Background Shifts**. 
- To separate a sidebar from a main feed, use `surface-container-low` against the `background`. 
- To define a header, use a subtle tonal transition rather than a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent materials. Use the hierarchy below to define importance:
1.  **Base:** `surface` (#0b0e11) - The foundation.
2.  **Sectioning:** `surface-container-low` (#0f1418) - For secondary navigation or side panels.
3.  **Content Cards:** `surface-container` (#141a20) - For the primary work area.
4.  **Prominence:** `surface-container-highest` (#1e272f) - For active modals or floating popovers.

### The "Glass & Gradient" Rule
To achieve a "Signature" feel, main CTAs and hero elements should utilize a **Linear Polish**. Use a subtle gradient from `primary` (#adc6ff) to `primary_container` (#004395) at a 135-degree angle. This adds a "soul" to the interface that flat colors cannot replicate. Floating elements (like Quick Action menus) must use **Backdrop Blur** (12px–20px) combined with a semi-transparent `surface_variant`.

---

## 3. Typography
The typography is driven by **Inter**, utilized in a high-contrast editorial scale to establish an immediate information hierarchy.

| Level | Size | Weight | Role |
| :--- | :--- | :--- | :--- |
| **display-lg** | 3.5rem | 700 | Large hero marketing or high-level analytics. |
| **headline-sm** | 1.5rem | 600 | Page titles and primary section headers. |
| **title-md** | 1.125rem | 500 | Card titles and sub-sectioning. |
| **body-md** | 0.875rem | 400 | Primary reading and operational data. |
| **label-sm** | 0.6875rem | 600 | Metadata, timestamps, and micro-copy. |

**The Editorial Edge:** Use `display-md` for empty states or "Welcome" messages to create a sense of scale and authority, juxtaposed against generous `spacing-12` (4rem) margins.

---

## 4. Elevation & Depth

### The Layering Principle
Forget drop shadows for standard cards. Achieve "lift" by nesting:
*   Place a `surface-container-lowest` (#000000) element inside a `surface-container-low` (#0f1418) container. This creates a "recessed" look that feels architectural.

### Ambient Shadows
When an element must float (e.g., a WhatsApp message preview):
*   **Blur:** 24px–48px.
*   **Opacity:** 4%–6% of `on_surface`.
*   **Color:** Tint the shadow with a hint of `primary` to ensure it feels integrated into the dark-mode environment.

### The "Ghost Border" Fallback
If accessibility requires a border, use the `outline_variant` token at **15% opacity**. It should be a suggestion of a line, not a hard boundary.

---

## 5. Components

### Buttons (The Action Pillars)
*   **Primary:** Gradient fill (`primary` to `primary_container`), `roundness-md` (0.375rem). No border.
*   **Secondary:** `surface-container-highest` background with `on_surface` text.
*   **Tertiary:** Ghost style. No background; `primary` text. Transitions to `surface_bright` on hover.

### Cards & Lists (Operational Feed)
*   **The "No-Divider" Rule:** Explicitly forbid 1px horizontal lines between list items. Instead, use `spacing-3` (1rem) of vertical white space or a subtle hover state shift to `surface_container_high`.
*   **WhatsApp Chat Previews:** Use `surface-container` with a `roundness-lg` (0.5rem). The "unread" indicator should be a subtle `primary` glow, not a harsh red circle.

### Input Fields
*   **State:** Default state uses `surface_container_low`. On focus, transition background to `surface_container` and apply a "Ghost Border" of `primary` at 20% opacity. 
*   **Typography:** Labels must use `label-md` in `on_surface_variant` for a muted, professional look.

### Specific App Components: "The Ticket"
*   **The Live Order Card:** A high-end card utilizing `surface_container_highest`. Use `tertiary` (#e1dcfd) for status labels (e.g., "In Prep") to provide a sophisticated color alternative to standard "Status Yellow."

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `spacing-8` and `spacing-12` for layout margins to create a "Premium" feel.
*   **Do** use `backdrop-filter: blur(16px)` on all floating navigation elements.
*   **Do** use `secondary` (#9d9da4) for all non-essential text to maintain a high signal-to-noise ratio.

### Don't
*   **Don't** use pure white (#FFFFFF) for text. Always use `on_surface` (#dde6f2) to reduce eye strain in dark mode.
*   **Don't** use traditional "Material" style cards with heavy shadows. We prefer tonal shifts.
*   **Don't** use more than one primary CTA per screen. This system relies on extreme focus.
*   **Don't** use icons with fills. Use refined, thin-stroke (1.5pt) outline icons to match the Inter typeface.