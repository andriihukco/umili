// Project type mapping utilities
// Maps between Ukrainian display values and English database values

export const PROJECT_TYPE_MAPPING = {
  // Ukrainian to English (for database storage)
  "Одноразовий": "one_time",
  "Довгостроковий": "ongoing", 
  "Погодинна співпраця": "consultation"
} as const;

export const PROJECT_TYPE_DISPLAY_MAPPING = {
  // English to Ukrainian (for display)
  "one_time": "Одноразовий",
  "ongoing": "Довгостроковий",
  "consultation": "Погодинна співпраця"
} as const;

export type ProjectTypeDb = keyof typeof PROJECT_TYPE_DISPLAY_MAPPING;
export type ProjectTypeDisplay = keyof typeof PROJECT_TYPE_MAPPING;

/**
 * Convert Ukrainian project type to database value
 */
export function mapProjectTypeToDb(ukrainianType: string): ProjectTypeDb | null {
  return PROJECT_TYPE_MAPPING[ukrainianType as ProjectTypeDisplay] || null;
}

/**
 * Convert database project type to Ukrainian display value
 */
export function mapProjectTypeToDisplay(dbType: string): ProjectTypeDisplay | null {
  return PROJECT_TYPE_DISPLAY_MAPPING[dbType as ProjectTypeDb] || null;
}

/**
 * Get all available project types for forms
 */
export function getProjectTypes(): ProjectTypeDisplay[] {
  return Object.keys(PROJECT_TYPE_MAPPING) as ProjectTypeDisplay[];
}
