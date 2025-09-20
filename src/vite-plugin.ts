import { utimes } from 'node:fs';
import { parseSync } from 'oxc-parser';
import type { Plugin } from 'vite';

function walkAST(node: any, callback: (node: any) => void) {
  callback(node);

  for (const key in node) {
    if (
      key === 'parent' ||
      key === 'leadingComments' ||
      key === 'trailingComments'
    )
      continue;

    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((item) => {
        if (item && typeof item === 'object' && item.type) {
          walkAST(item, callback);
        }
      });
    } else if (child && typeof child === 'object' && child.type) {
      walkAST(child, callback);
    }
  }
}

function extractClassesFromObjectExpression(objNode: any): Set<string> {
  const classes = new Set<string>();

  const extractFromObject = (obj: any, prefix = '') => {
    if (obj.type !== 'ObjectExpression') return;

    obj.properties.forEach((prop: any) => {
      if (prop.type === 'Property') {
        let key = '';
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else if (prop.key.type === 'Literal') {
          key = String(prop.key.value);
        }

        const currentPrefix = prefix ? `${prefix}:${key}` : key;

        if (
          prop.value.type === 'Literal' &&
          typeof prop.value.value === 'string'
        ) {
          // String value - extract classes
          const classNames = prop.value.value
            .split(/\s+/)
            .filter((cls: string) => cls.length > 0);
          classNames.forEach((cls: string) => {
            if (key === '&') {
              classes.add(`${prefix}:${cls}`);
            } else {
              classes.add(`${currentPrefix}:${cls}`);
            }
          });
        } else if (prop.value.type === 'ObjectExpression') {
          // Nested object
          extractFromObject(prop.value, currentPrefix);
        }
      }
    });
  };

  extractFromObject(objNode);
  return classes;
}

export function extractTwnCalls(code: string, id: string): Set<string> {
  const extractedClasses = new Set<string>();

  if (!/\.(ts|tsx|js|jsx)$/.test(id)) {
    return extractedClasses;
  }

  const useTailwindNested = code.includes('tailwind-nested');

  if (useTailwindNested) {
    try {
      const result = parseSync(id, code);
      if (result.errors.length > 0) {
        console.warn('Parse errors:', result.errors);
        return extractedClasses;
      }

      // Walk the AST to find twn() calls
      walkAST(result.program, (node: any) => {
        if (
          node.type === 'CallExpression' &&
          node.callee?.type === 'Identifier' &&
          node.callee.name === 'twn'
        ) {
          const args = node.arguments;
          if (args.length > 0) {
            // First argument - base classes
            if (
              args[0]?.type === 'Literal' &&
              typeof args[0].value === 'string'
            ) {
              const baseClasses = args[0].value
                .split(/\s+/)
                .filter((cls: string) => cls.length > 0);
              baseClasses.forEach((cls) => extractedClasses.add(cls));
            }

            if (args[1]?.type === 'ObjectExpression') {
              const selectorClasses = extractClassesFromObjectExpression(
                args[1],
              );
              selectorClasses.forEach((cls) => extractedClasses.add(cls));
            }
          }
        }
      });
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error('Failed to parse with AST:', error);
      return extractedClasses;
    }
  }

  return extractedClasses;
}

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
          /* eslint-disable-next-line no-console */
          console.error('Failed to update CSS file mtime:', err);
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

  function extractTwnCallsForPlugin(code: string, id: string) {
    const extractedClasses = extractTwnCalls(code, id);
    classesSet = classesSet.union(extractedClasses);
  }

  return {
    enforce: 'pre',
    name: 'twn-plugin',

    transform(code: string, id: string) {
      trackRootCssFile(code, id);
      extractTwnCallsForPlugin(code, id);
      forceReloadOnDev();
      return injectClasses(code, id);
    },
  };
}
