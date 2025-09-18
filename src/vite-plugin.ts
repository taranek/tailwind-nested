import { utimes } from 'fs';
import type { Plugin } from 'vite';

/**
 * Vite plugin to transform twn calls and inject classes directly into Tailwind processing
 * This plugin extracts all classes from twn() function calls and injects them directly
 * into the CSS processing pipeline without creating any files.
 */
export function twnPlugin(): Plugin {
  let classesSet = new Set<string>();
  let lastClassesSnapshot = new Set<string>();
  let cssFilePath: string | null = null;

  function forceReloadOnDev() {
    // Check if classes have changed and update mtime if needed
    const hasClassesChanged =
      classesSet.size !== lastClassesSnapshot.size ||
      !Array.from(classesSet).every((cls) => lastClassesSnapshot.has(cls));

    if (hasClassesChanged && cssFilePath && classesSet.size > 0) {
      const now = new Date();
      utimes(cssFilePath, now, now, (err) => {
        if (err) {
          console.warn('Failed to update CSS file mtime:', err);
        }
      });

      lastClassesSnapshot = new Set(classesSet);
    }
  }

  function injectClasses(code: string, id: string) {
    // If this is the CSS file and we have classes, inject @source inline
    if (id === cssFilePath && classesSet.size > 0) {
      const classesArray = Array.from(classesSet);
      const inlineSource = `@source inline("${classesArray.join(' ')}");`;

      // Check if already injected to avoid duplicates
      if (!code.includes('@source inline(')) {
        return `${inlineSource}\n${code}`;
      }
    }
    return code;
  }

  function trackRootCssFile(code: string, id: string) {
    // Track the CSS file that imports Tailwind
    if (id.endsWith('.css') && code.includes('@import "tailwindcss"')) {
      cssFilePath = id;
    }
  }

  function extractTwnCalls(code: string, id: string) {
    if (/\.(ts|tsx|js|jsx)$/.test(id)) {
      const twnRegex =
        /twn\s*\(\s*[`'"]([^`'"]*)[`'"](?:\s*,\s*\{([^}]*)\})?\s*\)/g;
      let match: RegExpExecArray | null;

      while ((match = twnRegex.exec(code)) !== null) {
        const [, baseClasses, selectorContent] = match;
        try {
          // Add base classes
          if (baseClasses) {
            classesSet = classesSet.union(new Set(baseClasses
              .split(/\s+/)
              .filter((cls) => cls.length > 0)))
          }

          // Parse selector object and collect classes
          if (selectorContent) {
            classesSet = classesSet.union(
              parseSelectorsObject(selectorContent),
            );
          }
        } catch (error) {
          console.warn('Failed to parse twn call:', (error as Error).message);
        }
      }
    }
  }

  return {
    name: 'twn-plugin',
    enforce: 'pre',

    transform(code: string, id: string) {
      trackRootCssFile(code, id);
      extractTwnCalls(code, id);
      forceReloadOnDev();
      return injectClasses(code, id);
    },
  };
}

export function parseSelectorsObject(selectorContent: string) {
  const parsedClasses = new Set<string>();
  // Parse nested object structure
  const parseLevel = (content: string, prefix = ''): void => {
    // Match key-value pairs at current level
    const propRegex =
      /['"]?([^'":,\s{}]+)['"]?\s*:\s*(?:['"]([^'"]*)['"']|\{([^{}]*)\})/g;

    let match: RegExpExecArray | null;

    while ((match = propRegex.exec(content)) !== null) {
      const [, key, stringValue, objectValue] = match;

      if (stringValue !== undefined) {
        // Handle string values
        const currentPrefix = prefix ? `${prefix}:${key}` : key;
        const classes = stringValue
          .split(/\s+/)
          .filter((cls) => cls.length > 0);

        classes.forEach((cls) => {
          if (key === '&') {
            // Special case for '&' - use prefix without the key
            parsedClasses.add(`${prefix}:${cls}`);
          } else {
            parsedClasses.add(`${currentPrefix}:${cls}`);
          }
        });
      } else if (objectValue !== undefined) {
        // Handle nested objects
        const currentPrefix = prefix ? `${prefix}:${key}` : key;
        parseLevel(objectValue, currentPrefix);
      }
    }
  };

  parseLevel(selectorContent);
  return parsedClasses;
}
