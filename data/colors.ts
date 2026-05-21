/**
 * Brand / semantic colour palette.
 *
 * All hex constants used across the application should be imported from
 * this file.  If a colour is also exposed as a CSS variable (in globals.css),
 * use the CSS variable in component styles and use the exported constant only
 * for SVG / chart / recharts attributes that cannot reference CSS vars.
 */

// ─── Background / surface ────────────────────────────────────────────────
export const COLOR_BG_PAGE       = "#f0f4f8";  // --background root
export const COLOR_BG_CARD       = "#ffffff";  // --card-bg
export const COLOR_BG_SIDEBAR    = "#1e293b";  // --bg-sidebar
export const COLOR_BG_SUBTLE     = "#f8fafc";  // section headers, hover rows
export const COLOR_BG_INPUT      = "#ffffff";  // form inputs
export const COLOR_BORDER         = "#e2e8f0";
export const COLOR_DIVIDER       = "#e2e8f0";  // charts grid lines

// ─── Text ───────────────────────────────────────────────────────────────
export const COLOR_FG            = "#1a2744";  // --foreground
export const COLOR_TEXT_MUTED    = "#94a3b8";  // --text-muted
export const COLOR_TEXT_SEC      = "#64748b";  // --text-secondary
export const COLOR_SIDEBAR_TEXT  = "#e2e8f0";  // --sidebar-text

// ─── Brand / primary ────────────────────────────────────────────────────
export const COLOR_PRIMARY       = "#2563eb";  // --primary
export const COLOR_PRIMARY_HOVER = "#1d4ed8";  // --primary-hover
export const COLOR_PRIMARY_LIGHT = "#dbeafe";  // --primary-light

// ─── Semantic signals ───────────────────────────────────────────────────
export const COLOR_RED           = "#ef4444";  // --accent-red
export const COLOR_RED_LIGHT     = "#fee2e2";  // --accent-red-light
export const COLOR_GREEN_PASS    = "#22c55e";
export const COLOR_GREEN_PASS_BG = "#dcfce7";
export const COLOR_AMBER         = "#f59e0b";
export const COLOR_AMBER_BG      = "#fef9c3";
export const COLOR_GRAY          = "#9ca3af";
export const COLOR_GRAY_BG       = "#f1f5f9";

// ─── Status badge exact colours (must match globals.css) ─────────────────
export const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  "Applied":        { bg: "#eff6ff", fg: "#2563eb" },
  "Not Suitable":   { bg: "#f1f5f9", fg: "#64748b" },
  "Shortlisted":    { bg: "#eff6ff", fg: "#1d4ed8" },
  "1st Interview":  { bg: "#fef9c3", fg: "#ca8a04" },
  "2nd Interview":  { bg: "#fef9c3", fg: "#a16207" },
  "Not Selected":   { bg: "#fee2e2", fg: "#ef4444" },
  "Selected":       { bg: "#dcfce7", fg: "#16a34a" },
  "Offer Accepted": { bg: "#dcfce7", fg: "#15803d" },
  "Offer Declined": { bg: "#fee2e2", fg: "#dc2626" },
  "Hired":          { bg: "#dcfce7", fg: "#166534" },
  "Not Hired":      { bg: "#f1f5f9", fg: "#64748b" },
};

// ─── Stage funnel colours ────────────────────────────────────────────────
export const COLOR_FUNNEL = {
  shortlisted:  "#22c55e",
  notSuitable:  "#ef4444",
  applied:      "#9ca3af",
  selected:     "#22c55e",
  notSelected:  "#ef4444",
  offerAcc:     "#22c55e",
  offerDec:     "#ef4444",
  hired:        "#22c55e",
  notHired:     "#ef4444",
};

// ─── Pre-built status → CSS class name map ─────────────────────────────
// Built once at module load. Consumers use: STATUS_CLASS_MAP[row.status]
import { STATUSES } from "./types";

export const STATUS_CLASS_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  STATUSES.forEach((s) => { map[s] = `status-${s.toLowerCase().replace(/\s+/g, "-")}`; });
  return map;
})();
