/* eslint-disable perfectionist/sort-objects */
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

    test('should preserve selector order', () => {
      const result = twn('bg-red-100', {
        zoom: 'scale-110',
        active: 'bg-red-400',
        hover: 'bg-red-200'
      });
      expect(result).toBe('bg-red-100 zoom:scale-110 active:bg-red-400 hover:bg-red-200');
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

    test('should handle complex deeply nested selectors like Tailwind states', () => {
      const result = twn('grid grid-cols-2', {
        dark: {
          md: {
            hover: {
              '&': 'bg-fuchsia-600 text-white',
              'span': 'text-gray-100',
              'before': 'content-["→"] text-blue-300'
            },
            focus: 'ring-2 ring-purple-500'
          },
          sm: 'grid-cols-1'
        },
        group: {
          hover: {
            '&': 'scale-105',
            'div': {
              'img': 'opacity-75'
            }
          }
        }
      });
      expect(result).toBe('grid grid-cols-2 dark:md:hover:bg-fuchsia-600 dark:md:hover:text-white dark:md:hover:span:text-gray-100 dark:md:hover:before:content-["→"] dark:md:hover:before:text-blue-300 dark:md:focus:ring-2 dark:md:focus:ring-purple-500 dark:sm:grid-cols-1 group:hover:scale-105 group:hover:div:img:opacity-75');
    });

    test('should handle mixed flat and nested selectors', () => {
      const result = twn('bg-red-100', {
        hover: 'bg-red-200',
        focus: {
          '&': 'bg-red-300',
          'span': 'text-white'
        }
      });
      expect(result).toBe('bg-red-100 hover:bg-red-200 focus:bg-red-300 focus:span:text-white');
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
      expect(result).toBe('px-4 py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-blue-800');
    });

    test('should handle complex responsive and state combinations', () => {
      const result = twn('bg-white p-4', {
        'md': 'p-6',
        'lg:hover': 'shadow-lg transform scale-105',
        'dark:md': 'bg-gray-800 text-white'
      });
      expect(result).toBe('bg-white p-4 md:p-6 lg:hover:shadow-lg lg:hover:transform lg:hover:scale-105 dark:md:bg-gray-800 dark:md:text-white');
    });
  });
});
