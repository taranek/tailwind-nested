import { describe, expect, test } from 'vitest';
import { twn } from '../index';

describe('twn function', () => {
  describe('basic usage', () => {
    test('should handle undefined/empty baseStyles', () => {
      expect(twn(undefined, {})).toBe('');
      expect(twn('', {})).toBe('');
    });

    test('should return base styles when no selectors', () => {
      expect(twn('bg-red-100 text-white', {})).toBe('bg-red-100 text-white');
      expect(twn('bg-red-100', undefined)).toBe('bg-red-100');
    });
  });

  describe('selector processing', () => {
    test('should prefix single selector', () => {
      expect(twn('bg-red-100', { hover: 'bg-red-200' })).toBe('bg-red-100 hover:bg-red-200');
    });

    test('should handle multiple classes in selector', () => {
      expect(twn('bg-red-100', {
        hover: 'bg-red-200 text-white border-2'
      })).toBe('bg-red-100 hover:bg-red-200 hover:text-white hover:border-2');
    });

    test('should sort selectors alphabetically', () => {
      const result = twn('bg-red-100', {
        zoom: 'scale-110',
        active: 'bg-red-400',
        hover: 'bg-red-200'
      });
      expect(result).toBe('bg-red-100 active:bg-red-400 hover:bg-red-200 zoom:scale-110');
    });

    test('should handle complex selector names', () => {
      expect(twn('bg-red-100', {
        'hover:focus': 'bg-red-200',
        'md:dark': 'text-white'
      })).toBe('bg-red-100 hover:focus:bg-red-200 md:dark:text-white');
    });
  });

  describe('nested selectors', () => {
    test('should handle nested object selectors', () => {
      const result = twn('bg-red-100', {
        hover: {
          '&': 'bg-red-200',
          'span': 'text-white'
        }
      });
      expect(result).toBe('bg-red-100 hover:bg-red-200 hover:span:text-white');
    });

    test('should handle deeply nested selectors', () => {
      const result = twn('bg-red-100', {
        hover: {
          'div': {
            'span': 'text-white'
          }
        }
      });
      expect(result).toBe('bg-red-100 hover:div:span:text-white');
    });

    test('should handle mixed flat and nested selectors', () => {
      const result = twn('bg-red-100', {
        hover: 'bg-red-200',
        focus: {
          '&': 'bg-red-300',
          'span': 'text-white'
        }
      });
      expect(result).toBe('bg-red-100 focus:bg-red-300 focus:span:text-white hover:bg-red-200');
    });
  });

  describe('conditional support (clsx-like)', () => {
    test('should filter out undefined and empty selectors', () => {
      expect(twn('bg-red-100', {
        hover: undefined,
        focus: '',
        active: 'bg-red-300'
      })).toBe('bg-red-100 active:bg-red-300');
    });

    test('should handle empty nested objects', () => {
      expect(twn('bg-red-100', {
        hover: {},
        focus: 'bg-red-200'
      })).toBe('bg-red-100 focus:bg-red-200');
    });
  });

  describe('real-world scenarios', () => {
    test('should handle button component with multiple states', () => {
      const result = twn('px-4 py-2 rounded', {
        hover: 'bg-blue-600',
        focus: 'ring-2 ring-blue-500',
        disabled: 'opacity-50 cursor-not-allowed',
        'dark:hover': 'bg-blue-800'
      });
      expect(result).toBe('px-4 py-2 rounded dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 hover:bg-blue-600');
    });

    test('should handle complex responsive and state combinations', () => {
      const result = twn('bg-white p-4', {
        'md': 'p-6',
        'lg:hover': 'shadow-lg transform scale-105',
        'dark:md': 'bg-gray-800 text-white'
      });
      expect(result).toBe('bg-white p-4 dark:md:bg-gray-800 dark:md:text-white lg:hover:shadow-lg lg:hover:transform lg:hover:scale-105 md:p-6');
    });
  });
});
