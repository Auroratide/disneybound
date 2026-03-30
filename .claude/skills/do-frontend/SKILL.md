---
name: do-frontend
description: Writes accessibly-minded and responsive browser frontend code with the goal of matching provided designs.
---

When you are writing frontend browser code, each time you make a set of changes follow these steps in order to ensure you are matching designs, creating an aesthetic interface, and keeping to WCAG accessibility principles.

1. First decide on an HTML structure that uses appropriate semantic HTML elements and maintains the accessibility of what's being built. Your goal is to start with universal functionality, then extend to make it aesthetic. Refer to the Accessibility Principles section for notes on what is important for accessibility.
2. Enhance the structure with interface design and styling using whatever frontend framework the codebase uses (for example, tailwind). Of course, use discretion when adding divs/spans to make advanced layouts possible.
3. Use the agent-browser skills to take a snapshot of the page or component you are editing.
4. If a design file was provided, compare the snapshot to the design and note any major differences.
5. Repeat changes until the snapshots you take both match closely with the design and in general look aesthetic (good spacing, sizing, colors, etc). NOTE: If the user provides feedback that contradicts the design, always defer to the user's feedback, as the designs may not be perfect.
6. Ask the user for feedback and repeat.

If you need to design a component in isolation, you may:

1. Create a temporary page at `/sandbox` which has just the component you are implementing.
2. Perform the feedback loop described earlier until the component is aesthetic and accessible.
3. Before removing the page, ask the user to go to the sandbox page to review the component and provide feedback.
4. When the user is happy, remove the `/sandbox` page and any temporary code that was necessary.

## Accessibility Principles

* Ensure media has text alternatives (images require alt text, symbols are accompanied by screenreader text).
* Inputs have visible labels that are properly associated.
* Semantic sectional tags are used when (e.g. one main per page, nav for navigation or a set of links, search for searching/filtering, ul/li for lists including grids of images and posts, and so on).
* All pages have logical outline order for headers (h1 -> h2 -> h3). Do not skip headers, and every page has exactly one h1 indicating the page's purpose.
* Tabbing order is logical and generally in order of the page's flow, top to bottom, left to right.
* Modals always use the dialog element in order to get many accessibility features "for free".
