export const TEST_TEAMS = {
  TEAM_RESISTANCE: 86,
  CITRUS_CIRCUITS: 1678,
  ROBONAUTS: 148,
} as const;

export const TEST_YEARS = {
  RECENT: 2023,
  CURRENT: new Date().getFullYear(),
  FIRST: 2002,
} as const;

export const KNOWN_EVENTS = {
  '2023': ['2023flor', '2023flta'],
  '2024': ['2024flor', '2024flta'],
} as const;

export const KNOWN_MATCHES = {
  '2024': ['2024flor_qm20'],
} as const;
