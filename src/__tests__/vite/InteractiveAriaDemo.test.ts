import { describe, expect, test } from 'vitest';
import { parseSelectorsObject } from '../../vite-plugin';

describe('InteractiveAriaDemo scenarios', () => {
  describe('nested selectors with aria attributes', () => {
    test('should parse aria-expanded with nested selectors for self and svg', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50 border-blue-300',
          '[&_svg]': 'rotate-180'
        },
        'aria-[expanded=false]': 'bg-gray-50 border-gray-300'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:border-blue-300',
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=false]:bg-gray-50',
        'aria-[expanded=false]:border-gray-300'
      ]));
    });

    test('should handle complex aria selector with descendant combinator', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50',
          '[&_svg]': 'rotate-180 transform'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=true]:[&_svg]:transform'
      ]));
    });

    test('should handle multiple aria states with different selectors', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50 border-blue-300',
          svg: 'rotate-180'
        },
        'aria-[expanded=false]': {
          '&': 'bg-gray-50 border-gray-300',
          svg: 'rotate-0'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:border-blue-300',
        'aria-[expanded=true]:svg:rotate-180',
        'aria-[expanded=false]:bg-gray-50',
        'aria-[expanded=false]:border-gray-300',
        'aria-[expanded=false]:svg:rotate-0'
      ]));
    });
  });

  describe('aria selectors with hover and focus states', () => {
    test('should parse complete button selector object from InteractiveAriaDemo', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50 border-blue-300',
          '[&_svg]': 'rotate-180'
        },
        'aria-[expanded=false]': 'bg-gray-50 border-gray-300',
        hover: 'shadow-sm',
        focus: 'outline-none ring-2 ring-blue-500'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:border-blue-300',
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=false]:bg-gray-50',
        'aria-[expanded=false]:border-gray-300',
        'hover:shadow-sm',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      ]));
    });

    test('should handle mixed simple and complex aria selectors', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50',
          svg: 'rotate-180'
        },
        'aria-[disabled=true]': 'opacity-50',
        hover: 'shadow-sm'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:svg:rotate-180',
        'aria-[disabled=true]:opacity-50',
        'hover:shadow-sm'
      ]));
    });
  });

  describe('edge cases for aria demo patterns', () => {
    test('should handle ampersand with descendant combinator syntax', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '[&_svg]': 'rotate-180',
          '[&_span]': 'font-bold'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=true]:[&_span]:font-bold'
      ]));
    });

    test('should handle nested aria with multiple child selectors', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50',
          svg: 'rotate-180',
          span: 'text-blue-800',
          '[&_div]': 'opacity-100'
        }
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:svg:rotate-180',
        'aria-[expanded=true]:span:text-blue-800',
        'aria-[expanded=true]:[&_div]:opacity-100'
      ]));
    });

    test('should handle complex aria selector combinations', () => {
      const selectorContent = `
        'aria-[expanded=true]': {
          '&': 'bg-blue-50 border-blue-300 shadow-sm',
          '[&_svg]': 'rotate-180 transition-transform',
          '[&_span]': 'text-blue-900'
        },
        'hover:aria-[expanded=false]': 'bg-gray-100'
      `;
      const result = parseSelectorsObject(selectorContent);
      expect(result).toEqual(new Set([
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:border-blue-300',
        'aria-[expanded=true]:shadow-sm',
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=true]:[&_svg]:transition-transform',
        'aria-[expanded=true]:[&_span]:text-blue-900',
        'hover:aria-[expanded=false]:bg-gray-100'
      ]));
    });
  });
});
