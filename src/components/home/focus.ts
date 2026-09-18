/**
 * Shared focus ring for the redesigned home. Every interactive element on the
 * page uses it, so keyboard focus is visible against the dark background
 * without each component restating the classes.
 */
export const FOCUS =
  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-accent focus-visible:ring-offset-4 focus-visible:ring-offset-home-bg';
