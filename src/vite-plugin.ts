import { utimes } from 'node:fs';
import { dirname, relative } from 'node:path';
import type {
  Argument,
  CallExpression,
  IdentifierName,
  IdentifierReference,
  ImportDeclaration,
  ImportDeclarationSpecifier,
  Node,
  ObjectExpression,
  ObjectProperty,
  Program,
  StringLiteral,
} from '@oxc-project/types';
import { parseSync } from 'oxc-parser';
import type { Plugin } from 'vite';

interface Transformation {
  end: number;
  replacement: string;
  start: number;
}

/**
 * Escapes the first character of a string using hex notation.
 * e.g., "hover" becomes "\x68over"
 */
function escapeFirstChar(str: string): string {
  if (str.length === 0) {
    return str;
  }
  const firstChar = str.charCodeAt(0).toString(16).padStart(2, '0');
  return `\\x${firstChar}${str.slice(1)}`;
}

/**
 * Escapes the first character of each class in a space-separated string.
 * e.g., "bg-red-500 text-white" becomes "\x62g-red-500 \x74ext-white"
 */
function escapeAllClasses(str: string): string {
  return str
    .split(/\s+/)
    .filter((cls) => cls.length > 0)
    .map((cls) => escapeFirstChar(cls))
    .join(' ');
}

/**
 * Transforms twn() calls in source code to obfuscate string literals in the selector object.
 * This prevents Tailwind's content scanner from detecting object keys and values as class names.
 * The extraction is handled separately by extractTwnCalls and injected via @source inline().
 */
function isImportDeclaration(node: Node): node is ImportDeclaration {
  return node.type === 'ImportDeclaration';
}

function isCallExpression(node: Node): node is CallExpression {
  return node.type === 'CallExpression';
}

function isIdentifier(
  node: Node,
): node is IdentifierReference | IdentifierName {
  return node.type === 'Identifier';
}

function isObjectExpression(node: Node): node is ObjectExpression {
  return node.type === 'ObjectExpression';
}

function isObjectProperty(node: Node): node is ObjectProperty {
  return node.type === 'Property';
}

function isStringLiteral(node: Node): node is StringLiteral {
  return (
    node.type === 'Literal' && typeof (node as StringLiteral).value === 'string'
  );
}

function getImportedName(spec: ImportDeclarationSpecifier): string | null {
  if (spec.type === 'ImportSpecifier') {
    const imported = spec.imported;
    if (imported.type === 'Identifier') {
      return imported.name;
    }
  }
  return null;
}

function getLocalName(spec: ImportDeclarationSpecifier): string {
  return spec.local.name;
}

export function transformTwnSource(code: string, id: string): string {
  if (!/\.(ts|tsx|js|jsx)$/.test(id)) {
    return code;
  }

  if (!code.includes('tailwind-nested')) {
    return code;
  }

  try {
    const result = parseSync(id, code);
    if (result.errors.length > 0) {
      return code;
    }

    // Collect all string literals in twn() second arguments that need transformation
    const transformations: Transformation[] = [];

    // First pass: collect twn import aliases
    const twnAliases = new Set<string>();
    let hasTailwindNestedImport = false;

    walkAST(result.program, (node: Node) => {
      if (
        isImportDeclaration(node) &&
        isStringLiteral(node.source) &&
        node.source.value === 'tailwind-nested'
      ) {
        hasTailwindNestedImport = true;

        if (node.specifiers.length === 0) {
          twnAliases.add('twn');
        } else {
          node.specifiers.forEach((spec) => {
            const importedName = getImportedName(spec);
            if (importedName === 'twn') {
              twnAliases.add(getLocalName(spec));
            } else if (spec.type === 'ImportDefaultSpecifier') {
              twnAliases.add(getLocalName(spec));
            }
          });
        }
      }
    });

    if (!hasTailwindNestedImport || twnAliases.size === 0) {
      return code;
    }

    // Second pass: find twn() calls and collect transformations
    walkAST(result.program, (node: Node) => {
      if (
        isCallExpression(node) &&
        isIdentifier(node.callee) &&
        twnAliases.has(node.callee.name)
      ) {
        const args: Argument[] = node.arguments;

        // Transform first argument (base classes) to hide from Tailwind scanner
        if (args.length >= 1) {
          const firstArg = args[0];
          if (firstArg && isStringLiteral(firstArg)) {
            const escapedValue = escapeAllClasses(firstArg.value);
            const originalStr = firstArg.raw || `"${firstArg.value}"`;
            const quoteChar = originalStr[0];
            transformations.push({
              end: firstArg.end,
              replacement: `${quoteChar}${escapedValue}${quoteChar}`,
              start: firstArg.start,
            });
          }
        }

        // Transform second argument (selector object)
        if (args.length > 1) {
          const secondArg = args[1];
          if (secondArg && isObjectExpression(secondArg)) {
            collectStringTransformations(secondArg, transformations);
          }
        }
      }
    });

    // Apply transformations in reverse order (to preserve positions)
    if (transformations.length === 0) {
      return code;
    }

    transformations.sort((a, b) => b.start - a.start);

    let transformedCode = code;
    for (const { end, replacement, start } of transformations) {
      transformedCode =
        transformedCode.slice(0, start) +
        replacement +
        transformedCode.slice(end);
    }

    return transformedCode;
  } catch {
    return code;
  }
}

/**
 * Recursively collects string literals in an object expression that need transformation.
 */
function collectStringTransformations(
  objNode: ObjectExpression,
  transformations: Transformation[],
): void {
  objNode.properties.forEach((prop) => {
    if (!isObjectProperty(prop)) {
      return;
    }

    // Transform the key if it's a string literal
    if (isStringLiteral(prop.key)) {
      const originalValue = prop.key.value;
      const escapedValue = escapeFirstChar(originalValue);
      // Determine the quote character used
      const originalStr = prop.key.raw || `"${originalValue}"`;
      const quoteChar = originalStr[0];
      transformations.push({
        end: prop.key.end,
        replacement: `${quoteChar}${escapedValue}${quoteChar}`,
        start: prop.key.start,
      });
    }
    // Transform the key if it's an identifier (convert to computed property with escaped string)
    else if (isIdentifier(prop.key)) {
      const keyName = prop.key.name;
      const escapedKey = escapeFirstChar(keyName);
      // We need to transform `hover:` to `["\x68over"]:`
      // Check if it's already a computed property
      if (!prop.computed) {
        transformations.push({
          end: prop.key.end,
          replacement: `["${escapedKey}"]`,
          start: prop.key.start,
        });
      }
    }

    // Transform the value - escape first char of each class to hide from Tailwind scanner
    if (isStringLiteral(prop.value)) {
      const originalValue = prop.value.value;
      const escapedValue = escapeAllClasses(originalValue);
      const originalStr = prop.value.raw || `"${originalValue}"`;
      const quoteChar = originalStr[0];
      transformations.push({
        end: prop.value.end,
        replacement: `${quoteChar}${escapedValue}${quoteChar}`,
        start: prop.value.start,
      });
    } else if (isObjectExpression(prop.value)) {
      // Recursively process nested objects
      collectStringTransformations(prop.value, transformations);
    }
  });
}

function walkAST(node: Node | Program, callback: (node: Node) => void) {
  callback(node as Node);

  for (const key in node) {
    if (
      key === 'parent' ||
      key === 'leadingComments' ||
      key === 'trailingComments'
    ) {
      continue;
    }

    const child = (node as unknown as Record<string, unknown>)[key];
    if (Array.isArray(child)) {
      child.forEach((item: unknown) => {
        if (item && typeof item === 'object' && 'type' in item) {
          walkAST(item as Node, callback);
        }
      });
    } else if (child && typeof child === 'object' && 'type' in child) {
      walkAST(child as Node, callback);
    }
  }
}

function extractClassesFromObjectExpression(
  objNode: ObjectExpression,
): Set<string> {
  const classes = new Set<string>();

  const extractFromObject = (obj: ObjectExpression, prefix = '') => {
    obj.properties.forEach((prop) => {
      if (!isObjectProperty(prop)) {
        return;
      }

      let key = '';
      if (isIdentifier(prop.key)) {
        key = prop.key.name;
      } else if (isStringLiteral(prop.key)) {
        key = prop.key.value;
      }

      const currentPrefix = prefix ? `${prefix}:${key}` : key;

      if (isStringLiteral(prop.value)) {
        // String value - extract classes
        const classNames = prop.value.value
          .split(/\s+/)
          .filter((cls) => cls.length > 0);
        classNames.forEach((cls) => {
          if (key === '&') {
            classes.add(`${prefix}:${cls}`);
          } else {
            classes.add(`${currentPrefix}:${cls}`);
          }
        });
      } else if (isObjectExpression(prop.value)) {
        // Nested object
        extractFromObject(prop.value, currentPrefix);
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

      // First pass: collect twn import aliases
      const twnAliases = new Set<string>();
      let hasTailwindNestedImport = false;

      walkAST(result.program, (node: Node) => {
        if (
          isImportDeclaration(node) &&
          isStringLiteral(node.source) &&
          node.source.value === 'tailwind-nested'
        ) {
          hasTailwindNestedImport = true;

          // Check if this is a side-effect import (no specifiers)
          if (node.specifiers.length === 0) {
            twnAliases.add('twn'); // Assume twn is available globally
          } else {
            node.specifiers.forEach((spec) => {
              const importedName = getImportedName(spec);
              if (importedName === 'twn') {
                twnAliases.add(getLocalName(spec));
              } else if (spec.type === 'ImportDefaultSpecifier') {
                twnAliases.add(getLocalName(spec));
              }
            });
          }
        }
      });

      // If no tailwind-nested imports found, skip processing this file
      if (!hasTailwindNestedImport || twnAliases.size === 0) {
        return extractedClasses;
      }

      // Second pass: find function calls using any of the aliases
      walkAST(result.program, (node: Node) => {
        if (
          isCallExpression(node) &&
          isIdentifier(node.callee) &&
          twnAliases.has(node.callee.name)
        ) {
          const args: Argument[] = node.arguments;

          // Extract base classes from first argument
          if (args.length >= 1) {
            const firstArg = args[0];
            if (firstArg && isStringLiteral(firstArg)) {
              const baseClasses = firstArg.value
                .split(/\s+/)
                .filter((cls) => cls.length > 0);
              baseClasses.forEach((cls) => extractedClasses.add(cls));
            }
          }

          // Extract prefixed classes from second argument (selector object)
          if (args.length > 1) {
            const secondArg = args[1];
            if (secondArg && isObjectExpression(secondArg)) {
              const selectorClasses =
                extractClassesFromObjectExpression(secondArg);
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
  let twnFiles = new Set<string>();

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
    // If this is the CSS file and we have classes, inject @source inline and @source not
    if (id === cssFilePath && classesSet.size > 0) {
      const classesArray = Array.from(classesSet);
      const inlineSource = `@source inline("${classesArray.join(' ')}");`;

      // Generate @source not directives for files containing twn() calls
      // This prevents Tailwind from scanning these files directly
      const cssDir = dirname(id);
      const notDirectives = Array.from(twnFiles)
        .map((filePath) => {
          const relativePath = relative(cssDir, filePath);
          // Use ./ prefix for relative paths
          const normalizedPath = relativePath.startsWith('.')
            ? relativePath
            : `./${relativePath}`;
          return `@source not "${normalizedPath}";`;
        })
        .join('\n');

      // Check if already injected to avoid duplicates
      if (!code.includes('@source inline(')) {
        return `${notDirectives}\n${inlineSource}\n${code}`;
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
    if (extractedClasses.size > 0) {
      twnFiles.add(id);
    }
    classesSet = classesSet.union(extractedClasses);
  }

  return {
    enforce: 'pre',
    name: 'twn-plugin',

    transform(code: string, id: string) {
      trackRootCssFile(code, id);
      // Extract classes BEFORE transforming (extraction expects original format)
      extractTwnCallsForPlugin(code, id);
      forceReloadOnDev();

      // Transform source code to obfuscate strings in twn() selector objects
      // This prevents Tailwind's content scanner from detecting them as class names
      const transformedCode = transformTwnSource(code, id);

      // Inject classes into CSS file
      return injectClasses(transformedCode, id);
    },
  };
}
