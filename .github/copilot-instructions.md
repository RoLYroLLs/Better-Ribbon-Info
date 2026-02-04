# Copilot Instructions for Better Ribbon Info

## Project Overview
- This is a Sid Meier's Civilization VII mod that enhances the player ribbon UI with additional information: Production, Citizens, Combat Power, and Food.
- The mod is implemented in JavaScript and integrates with the game's modding API and UI system.
- Key mod metadata and load order are defined in `src/better-ribbon-info.modinfo`.

## Key Components
- **UI Scripts**: All ribbon logic is in `src/scripts/ui/ribbon/` (e.g., `player-production.js`, `player-combat-power.js`). Each file patches the diplo ribbon to inject new data points.
- **Options**: User-configurable options are managed in `src/scripts/ui/options/bri-options.js` and `mod-options.js`. These files define which ribbon elements are visible and persist user choices.
- **Assets**: Custom icons are in `src/assets/icons/`.
- **Text**: Localized strings are in `src/text/en_US/`.

## Patterns & Conventions
- **Patching**: UI enhancements are done by monkey-patching prototype methods (e.g., `createPlayerYieldsData`) after a short timeout to ensure the base game UI is loaded.
- **Options**: All mod options are namespaced under `better-ribbon-info` and use a consistent getter/setter pattern.
- **Resource Safety**: Always check for null/undefined before accessing nested properties from the game API.
- **Logging**: Use `console.warn` and `console.error` for mod-specific diagnostics, always prefixed with the mod ID.

## Developer Workflows
- **No build step**: Scripts are loaded directly by the game engine; no transpilation or bundling is required.
- **Testing**: Launch Civ VII with the mod enabled. Use the in-game mod options to toggle features and verify UI changes.
- **Debugging**: Use the in-game console (if available) or log output to inspect mod behavior.

## Integration Points
- **Game API**: Relies on `/base-standard/ui/diplo-ribbon/model-diplo-ribbon.chunk.js` and `/core/ui/options/` for UI and options integration.
- **Dependencies**: Declared in `better-ribbon-info.modinfo` (depends on `base-standard`).

## Examples
- To add a new ribbon stat, follow the pattern in `player-production.js`: patch the ribbon data method, check the relevant option, and push a new data object with label, value, and icon.
- To add a new option, extend the `defaults` in `bri-options.js` and update the UI as needed.

## References
- See `README.md` for user-facing mod description and credits.
- See `src/better-ribbon-info.modinfo` for mod metadata and load order.

---
For questions about mod structure or Civ VII integration, review the above files for established patterns before introducing new dependencies or workflows.
