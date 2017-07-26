export const INVALID_BOOLEANS = [
  undefined,
  null,
  'true',
  'false',
  1,
  [],
  {}
];

export const INVALID_IDS = [
  //  undefined, // n.b. not included due to default value, but would throw
  null,
  true,
  1,
  [],
  {}
];

export const INVALID_PAGES = [
  undefined,
  null,
  true,
  'page',
  1,
  [],
  {}
];

export const INVALID_RENDERERS = [
  //  undefined, // n.b. not included due to default value, but would throw
  null,
  true,
  'renderer',
  1,
  [],
  {}
];

export const INVALID_STRINGS = [
  undefined,
  null,
  true,
  1,
  [],
  {}
]

export default {
  boolean: INVALID_BOOLEANS,
  id: INVALID_IDS,
  page: INVALID_PAGES,
  renderer: INVALID_RENDERERS,
  string: INVALID_STRINGS
};
