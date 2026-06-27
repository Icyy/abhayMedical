export const qs = (val: unknown): string =>
  Array.isArray(val) ? String(val[0]) : String(val ?? '')