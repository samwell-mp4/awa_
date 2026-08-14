# Plan: Premium Kids Songs UI Redesign

Redesign the `musicas-infantil.tsx` page to strictly match the user-provided reference image (indigenous Pixar/kids style), replacing the current "animal grid" layout with the high-fidelity lyrics player shown in the screenshot.

## Proposed Changes

### Assets
- Register the reference image `kids-song-ui-reference.png` as a project asset for inspiration and potential overlay use.
- Create or reuse existing Pataxó character avatars (boy and girl with maracas) to match the layout.

### UI Components (src/routes/musicas-infantil.tsx)
- **Background**: Change to a warm, wood-textured parchment background with jungle elements as seen in the photo.
- **Header**: Implement the wood-panel header with "Cânticos Infantis Pataxó" flanked by musical notes.
- **Character Avatars**: Add the boy and girl characters on the left and right sides of the lyrics area.
- **Dual-Column Lyrics**: 
    - Left column for **Patxôhã** (indigenous language) with green headings.
    - Right column for **Português** (translation) with orange/brown headings.
    - Centered tribal divider with a musical note icon.
- **Action Buttons**:
    - "OUVIR" (Listen) and "CANTAR JUNTO" (Sing Along) buttons with specific colors (green/orange) and icons.
- **Top Navigation**: Add the back and home circular buttons (brown/wood style) and the "AWÃ MIRIM" score badge in the top right.

### Logic & Functionality
- Maintain existing `speak.ts` integration for narration.
- Keep the synchronized lyrics highlighting logic (`lyric-sync.ts`).
- Update the `Song` type and data fetching to ensure it populates both language columns.
- Ensure "OUVIR" plays the narration/audio and "CANTAR JUNTO" plays the karaoke version (or highlights lyrics more aggressively).

## Technical Details
- Use Tailwind CSS v4 for layout and custom component styling.
- Create a new `KidsSongPlayer` component to encapsulate this specific UI.
- Use `framer-motion` for the "Pixar-like" animations (bounce, float) requested previously to make the UI feel "alive".
- Responsive design: The two-column layout will stack vertically on mobile while maintaining the decorative elements.

## User Review Required
- Should the "AWÃ MIRIM" score badge (top right) be functional (connected to user points) or just decorative for now?
- The reference shows specific characters; should we use generic indigenous character assets or try to match the "Pixar" style of the image exactly?
