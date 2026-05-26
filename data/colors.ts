import { STATUSES } from "./types";

export const STATUS_CLASS_MAP: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  STATUSES.forEach((s) => { map[s] = `status-${s.toLowerCase().replace(/\s+/g, "-")}`; });
  return map;
})();
