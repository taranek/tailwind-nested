import type { Plugin } from 'vite';

/**
 * Vite plugin to transform twn calls and inject classes directly into Tailwind processing
 * This plugin extracts all classes from twn() function calls and injects them directly
 * into the CSS processing pipeline without creating any files.
 */
export function twnPlugin(): Plugin {
  const classesSet = new Set<string>();
  let cssFilePath: string | null = null;

  return {
    name: 'twn-plugin',
    enforce: 'pre', // Run before other plugins (including Tailwind)

    transform(code: string, id: string) {
      // Track the CSS file that imports Tailwind
      if (id.endsWith('.css') && code.includes('@import "tailwindcss"')) {
        cssFilePath = id;
      }

      // Process TypeScript/JavaScript files to extract twn calls
      if (/\.(ts|tsx|js|jsx)$/.test(id)) {
        const twnRegex = /twn\s*\(\s*[`'"]([^`'"]*)[`'"](?:\s*,\s*\{([^}]*)\})?\s*\)/g;
        let match: RegExpExecArray | null;

        while ((match = twnRegex.exec(code)) !== null) {
          const [, baseClasses, selectorContent] = match;

          try {
            // Add base classes
            if (baseClasses) {
              const baseClassList = baseClasses.split(/\s+/).filter(cls => cls.length > 0);
              baseClassList.forEach(cls => classesSet.add(cls));
            }

            // Parse selector object and collect classes
            if (selectorContent) {
              parseSelectorsObject(selectorContent, classesSet);
            }
          } catch (error) {
            console.warn('Failed to parse twn call:', (error as Error).message);
          }
        }
      }

      // If this is the CSS file and we have classes, inject @source inline
      if (id === cssFilePath && classesSet.size > 0) {
        const classesArray = Array.from(classesSet);
        const inlineSource = `@source inline("${classesArray.join(' ')}");`;

        // Check if already injected to avoid duplicates
        if (!code.includes('@source inline(')) {
          return `${inlineSource}\n${code}`;
        }
      }

      return null;
    }
  };
}

function parseSelectorsObject(selectorContent: string, classesSet: Set<string>): void {
  // Parse nested object structure
  const parseLevel = (content: string, prefix = ''): void => {
    // Match key-value pairs at current level
    const propRegex = /['"]?([^'":,\s{}]+)['"]?\s*:\s*(?:['"]([^'"]*)['"']|\{([^{}]*)\})/g;
    let match: RegExpExecArray | null;

    while ((match = propRegex.exec(content)) !== null) {
      const [, key, stringValue, objectValue] = match;

      if (stringValue !== undefined) {
        // Handle string values
        const currentPrefix = prefix ? `${prefix}:${key}` : key;
        const classes = stringValue.split(/\s+/).filter(cls => cls.length > 0);

        classes.forEach(cls => {
          if (key === '&') {
            // Special case for '&' - use prefix without the key
            classesSet.add(`${prefix}:${cls}`);
          } else {
            classesSet.add(`${currentPrefix}:${cls}`);
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
}
