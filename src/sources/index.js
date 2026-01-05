import { SmolSource } from './smol.js';

/**
 * Available news sources
 * Add new sources here as they are implemented
 */
export const sources = {
  smol: SmolSource,
};

/**
 * Get all available source names
 * @returns {Array<string>}
 */
export function getAvailableSources() {
  return Object.keys(sources);
}

/**
 * Create a source instance
 * @param {string} name - Source name
 * @param {Object} config - Source configuration
 * @returns {BaseSource}
 */
export function createSource(name, config = {}) {
  const SourceClass = sources[name];
  if (!SourceClass) {
    throw new Error(`Unknown source: ${name}`);
  }
  return new SourceClass(config);
}
