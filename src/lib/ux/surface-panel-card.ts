/** Shared Card styling on the app canvas */
export const SURFACE_PANEL_CARD =
  "surface-panel bg-transparent ring-0 transition-shadow [--card-spacing:--spacing(5)] hover:shadow-[var(--shadow-panel-hover)]";

/** Interactive cards (links, hover lift) */
export const SURFACE_PANEL_CARD_INTERACTIVE =
  `${SURFACE_PANEL_CARD} hover:-translate-y-px`;
