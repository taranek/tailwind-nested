import { describe, it, expect } from 'vitest';
import { extractTwnCalls } from './vite-plugin';

describe('extractTwnCalls', () => {
  describe('file type filtering', () => {
    it('should return empty set for non-JS/TS files', () => {
      const code = `twn("bg-red-500")`;
      const result = extractTwnCalls(code, 'test.css');
      expect(result.size).toBe(0);
    });

    it('should process .ts files', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-red-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
    });

    it('should process .tsx files', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-blue-500");
      `;
      const result = extractTwnCalls(code, 'test.tsx');
      expect(result.has('bg-blue-500')).toBe(true);
    });

    it('should process .js files', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-green-500");
      `;
      const result = extractTwnCalls(code, 'test.js');
      expect(result.has('bg-green-500')).toBe(true);
    });

    it('should process .jsx files', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-yellow-500");
      `;
      const result = extractTwnCalls(code, 'test.jsx');
      expect(result.has('bg-yellow-500')).toBe(true);
    });
  });

  describe('tailwind-nested detection', () => {
    it('should return empty set when tailwind-nested is not imported', () => {
      const code = `const className = twn("bg-red-500");`;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.size).toBe(0);
    });

    it('should process when tailwind-nested is mentioned in import', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("bg-red-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
    });

    it('should process when tailwind-nested is mentioned in comments', () => {
      const code = `
        // Using tailwind-nested for styling
        const className = twn("bg-red-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
    });
  });

  describe('basic class extraction', () => {
    it('should extract single class from twn call', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-red-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
      expect(result.size).toBe(1);
    });

    it('should extract multiple classes from single twn call', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-red-500 text-white p-4");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
      expect(result.has('text-white')).toBe(true);
      expect(result.has('p-4')).toBe(true);
      expect(result.size).toBe(3);
    });

    it('should extract classes from multiple twn calls', () => {
      const code = `
        import 'tailwind-nested';
        const className1 = twn("bg-red-500");
        const className2 = twn("text-blue-600");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
      expect(result.has('text-blue-600')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('should handle empty class strings', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.size).toBe(0);
    });

    it('should handle classes with extra whitespace', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("  bg-red-500   text-white  ");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
      expect(result.has('text-white')).toBe(true);
      expect(result.size).toBe(2);
    });
  });

  describe('selector object extraction', () => {
    it('should extract classes from simple selector object', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("base", {
          md: "bg-blue-500",
          lg: "bg-green-500"
        });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('base')).toBe(true);
      expect(result.has('md:bg-blue-500')).toBe(true);
      expect(result.has('lg:bg-green-500')).toBe(true);
      expect(result.size).toBe(3);
    });

    it('should extract classes from nested selector object', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("base", {
          md: {
            hover: "bg-blue-500",
            focus: "bg-blue-600"
          }
        });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('base')).toBe(true);
      expect(result.has('md:hover:bg-blue-500')).toBe(true);
      expect(result.has('md:focus:bg-blue-600')).toBe(true);
      expect(result.size).toBe(3);
    });

    it('should handle & selector in nested objects', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("base", {
          hover: {
            "&": "bg-red-500"
          }
        });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('base')).toBe(true);
      expect(result.has('hover:bg-red-500')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('should extract multiple classes from selector values', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("base", {
          md: "bg-blue-500 text-white p-4"
        });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('base')).toBe(true);
      expect(result.has('md:bg-blue-500')).toBe(true);
      expect(result.has('md:text-white')).toBe(true);
      expect(result.has('md:p-4')).toBe(true);
      expect(result.size).toBe(4);
    });
  });

  describe('complex scenarios', () => {
    it('should handle twn calls with only selector object (no base classes)', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("", {
          md: "bg-blue-500"
        });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('md:bg-blue-500')).toBe(true);
      expect(result.size).toBe(1);
    });

    it('should handle mixed quote types', () => {
      const code = `
        import 'tailwind-nested';
        const className1 = twn('bg-red-500');
        const className2 = twn("bg-blue-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
      expect(result.has('bg-blue-500')).toBe(true);
      expect(result.size).toBe(2);
    });

    it('should handle complex nested selector structure', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("base text-black", {
          sm: "text-sm",
          md: {
            hover: "bg-blue-500 text-white",
            focus: {
              "&": "ring-2 ring-blue-300"
            }
          },
          lg: "text-lg"
        });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      
      // Base classes
      expect(result.has('base')).toBe(true);
      expect(result.has('text-black')).toBe(true);
      
      // Simple selectors
      expect(result.has('sm:text-sm')).toBe(true);
      expect(result.has('lg:text-lg')).toBe(true);
      
      // Nested selectors
      expect(result.has('md:hover:bg-blue-500')).toBe(true);
      expect(result.has('md:hover:text-white')).toBe(true);
      expect(result.has('md:focus:ring-2')).toBe(true);
      expect(result.has('md:focus:ring-blue-300')).toBe(true);
      
      expect(result.size).toBe(8);
    });
  });

  describe('error handling', () => {
    it('should handle malformed code gracefully', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-red-500"
      `;
      const result = extractTwnCalls(code, 'test.ts');
      // Should not throw and return empty set on parse error
      expect(result.size).toBe(0);
    });

    it('should handle twn calls without arguments', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn();
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.size).toBe(0);
    });
  });
});