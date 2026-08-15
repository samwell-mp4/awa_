# Premium Kids Songs UI Refinement

Finalize the "Cânticos Infantis Pataxó" interface according to the high-fidelity mockup, ensuring a 3D-vibrant, wood-textured aesthetic specifically for children.

## User Review Required

> [!IMPORTANT]
> The "AWÃ MIRIM" star system (125 ⭐) is currently a visual placeholder. Should these stars be earned by finishing songs or is it a static decorative element for now?

- **Visual Fidelity**: Does the wood plaque header and parchment board match your expectations?
- **Character Selection**: The mockup shows two characters (boy/girl). I've added them as decorative bounces. Would you like them to be selectable avatars?

## Proposed Changes

### Styling and Assets
- Add wood texture and tribal pattern utilities to `src/styles.css`.
- Implement responsive layout for the two-column lyrics (Patxôhã in green, Portuguese in brown).
- Enhance the "Kids Song Player" with 3D-style buttons and animated character elements.

### Route Refinement
- Finalize `src/routes/musicas-infantil.tsx` with full layout integration.
- Ensure smooth scrolling of synced lyrics in both columns simultaneously.
- Integrate the `MiniPlayer` component for quick previews from the song grid.

### Integration
- Verify the `requireArea("infantil")` guard allows correct access for users with the Infantil plan.
- Ensure "OUVIR" and "CANTAR JUNTO" buttons trigger the appropriate audio/narrator behavior.

## Technical Details
- **CSS Variables**: Using Tailwind v4 for custom utilities like `wood-board` and `tribal-divider`.
- **Framer Motion**: Handling the board entry/exit and character bounce animations.
- **Audio Logic**: Using `lyric-sync.ts` and `audioRef` to manage progress and column highlighting.
