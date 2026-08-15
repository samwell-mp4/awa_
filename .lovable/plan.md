# Plan for Correcting the Children's Music Player

The objective is to align the children's music player (`src/routes/musicas-infantil.tsx`) with the user-provided reference image, ensuring the design, layout, and colors are accurate.

## Proposed Changes

### 1. Refine Layout and UI in `src/routes/musicas-infantil.tsx`
- **Columns Alignment**: Ensure the two-column layout (Patxôhã/Português) matches the mockup's proportions and spacing.
- **Center Divider**: Enhance the "tribal-divider" strip with accurate colors and the central Play/Pause button styling.
- **Typography and Colors**: Apply specific colors (#2f6d3a for Patxôhã, #c4632a for Portuguese) and font weights to match the reference.
- **Lyrics Scrolling**: Verify the `lyrics-scroll` utility correctly handles vertical scrolling while maintaining the centered active line.
- **Character Avatars**: Replace generic emojis with character assets if available (using `anciao-josa.png` or `crianca-cocar.jpg` as high-quality placeholders if specific ones are missing).

### 2. Update Design Tokens in `src/styles.css`
- **Wood Board Texture**: Refine the `wood-board` utility to match the reference's specific brown tones and shadow depth.
- **Tribal Patterns**: Adjust the SVG patterns used for dividers and borders.
- **Button Styles**: Ensure `kids-btn` and specialized player buttons (OUVIR, CANTAR JUNTO) have the correct gradients and 3D effect.

### 3. Verification
- **Visual Check**: Use Playwright to capture a screenshot of the player in the preview and compare it against the reference metadata.
- **Functional Check**: Verify audio playback, lyric synchronization, and the "back" button functionality.

## Technical Details
- Use React `useMemo` for heavy lyric processing.
- Apply `framer-motion` for smooth transitions between song selection and playback.
- Ensure responsiveness across mobile and tablet viewports.
