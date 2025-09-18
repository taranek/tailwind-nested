import { describe, expect, test } from 'vitest';
import { parseSelectorsObject } from '../../vite-plugin';

describe('parseSelectorsObject', () => {
  describe('basic selector parsing', () => {
    test('should parse simple string selectors', () => {
      const selectorContent = 'hover: "text-green-100 scale-105"';
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:text-green-100',
        'hover:scale-105'
      ]));
    });

    test('should parse multiple selectors', () => {
      const selectorContent = `
        hover: 'text-green-100 scale-105 border-2 border-red-200',
        focus: 'ring-2 ring-green-400'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:text-green-100',
        'hover:scale-105',
        'hover:border-2',
        'hover:border-red-200',
        'focus:ring-2',
        'focus:ring-green-400'
      ]));
    });
  });

  describe('nested object parsing', () => {
    test('should parse nested objects', () => {
      const selectorContent = `
        hover: {
          span: 'text-white',
          div: 'bg-red-100'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:span:text-white',
        'hover:div:bg-red-100'
      ]));
    });

    test('should handle deeply nested objects', () => {
      const selectorContent = `
        dark: {
          md: {
            hover: 'bg-blue-500 text-white'
          }
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'dark:md:hover:bg-blue-500',
        'dark:md:hover:text-white'
      ]));
    });

    test('should handle special "&" selector', () => {
      const selectorContent = `
        hover: {
          '&': 'bg-red-200',
          span: 'text-white'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:bg-red-200',
        'hover:span:text-white'
      ]));
    });
  });

  describe('mixed content parsing', () => {
    test('should handle mixed string and object selectors', () => {
      const selectorContent = `
        hover: 'bg-red-200',
        focus: {
          '&': 'bg-red-300',
          span: 'text-white'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:bg-red-200',
        'focus:bg-red-300',
        'focus:span:text-white'
      ]));
    });

    test('should handle complex nested structure', () => {
      const selectorContent = `
        dark: {
          md: {
            hover: {
              '&': 'bg-fuchsia-600 text-white',
              span: 'text-gray-100'
            },
            focus: 'ring-2 ring-purple-500'
          }
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'dark:md:hover:bg-fuchsia-600',
        'dark:md:hover:text-white',
        'dark:md:hover:span:text-gray-100',
        'dark:md:focus:ring-2',
        'dark:md:focus:ring-purple-500'
      ]));
    });
  });

  describe('edge cases', () => {
    test('should handle empty selector content', () => {
      const result = parseSelectorsObject('');
      expect(result).toEqual(new Set());
    });

    test('should handle malformed content gracefully', () => {
      const selectorContent = 'invalid: {broken';
      const result = parseSelectorsObject(selectorContent);
      expect(result).toBeInstanceOf(Set);
    });

    test('should filter out empty classes', () => {
      const selectorContent = 'hover: "  text-white   "';
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set(['hover:text-white']));
    });
  });

  describe('data selectors', () => {
    test('should handle data attribute selectors with square brackets', () => {
      const selectorContent = `
        'data-[size=large]': 'p-8 text-xl',
        'data-[state=open]': 'opacity-100'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'data-[size=large]:p-8',
        'data-[size=large]:text-xl',
        'data-[state=open]:opacity-100'
      ]));
    });

    test('should handle complex data selectors with nested prefixes', () => {
      const selectorContent = `
        hover: {
          'data-[variant=primary]': 'bg-blue-700'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:data-[variant=primary]:bg-blue-700'
      ]));
    });

    test('should handle ampersand selectors with square brackets', () => {
      const selectorContent = `
        '[&.is-dragging]': 'opacity-50 cursor-grabbing',
        '[&:not(.disabled)]': 'hover:bg-gray-100'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        '[&.is-dragging]:opacity-50',
        '[&.is-dragging]:cursor-grabbing',
        '[&:not(.disabled)]:hover:bg-gray-100'
      ]));
    });

    test('should handle mixed bracket selectors', () => {
      const selectorContent = `
        hover: {
          '[&.active]': 'bg-blue-500',
          'data-[state=selected]': 'ring-2'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:[&.active]:bg-blue-500',
        'hover:data-[state=selected]:ring-2'
      ]));
    });
  });

  describe('real-world examples', () => {
    test('should parse button component selectors', () => {
      const selectorContent = `
        hover: 'bg-blue-600 text-white',
        focus: 'ring-2 ring-blue-500',
        disabled: 'opacity-50 cursor-not-allowed'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'hover:bg-blue-600',
        'hover:text-white',
        'focus:ring-2',
        'focus:ring-blue-500',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed'
      ]));
    });

    test('should parse responsive and state combinations', () => {
      const selectorContent = `
        'md': 'p-6',
        'lg:hover': 'shadow-lg transform scale-105',
        'dark:md': 'bg-gray-800 text-white'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'md:p-6',
        'lg:hover:shadow-lg',
        'lg:hover:transform',
        'lg:hover:scale-105',
        'dark:md:bg-gray-800',
        'dark:md:text-white'
      ]));
    });
  });
});
