import { describe, it, expect } from 'vitest';
import { extractTwnCalls, transformTwnSource } from '../vite-plugin.ts';

describe('extractTwnCalls', () => {
  describe('file type filtering', () => {
    it('should return empty set for non-JS/TS files', () => {
      const code = `twn("bg-red-500")`;
      const result = extractTwnCalls(code, 'test.css');
      expect(result.size).toBe(0);
    });

    it('should process JS/TS files', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-red-500", { hover: "bg-red-600" });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('hover:bg-red-600')).toBe(true);
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
        const className = twn("bg-red-500", { hover: "bg-red-600" });
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('hover:bg-red-600')).toBe(true);
    });

    it('should NOT process when tailwind-nested is only mentioned in comments', () => {
      const code = `
        // Using tailwind-nested for styling
        const className = twn("bg-red-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.size).toBe(0); // Should be empty since there's no actual import
    });
  });

  describe('basic class extraction', () => {
    it('should extract single base class from first parameter', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("bg-red-500");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.has('bg-red-500')).toBe(true);
      expect(result.size).toBe(1);
    });

    it('should extract multiple base classes from first parameter', () => {
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

    it('should extract base classes from multiple twn calls', () => {
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

    it('should handle empty base classes', () => {
      const code = `
        import 'tailwind-nested';
        const className = twn("");
      `;
      const result = extractTwnCalls(code, 'test.ts');
      expect(result.size).toBe(0);
    });

    it('should handle base classes with whitespace', () => {
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

      // Selector classes
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

describe('transformTwnSource', () => {
  describe('file type filtering', () => {
    it('should return unchanged code for non-JS/TS files', () => {
      const code = `twn("base", { hover: "bg-red-500" })`;
      const result = transformTwnSource(code, 'test.css');
      expect(result).toBe(code);
    });

    it('should process JS/TS files', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", { hover: "bg-red-500" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).not.toBe(code);
      expect(result).toContain('\\x68over'); // 'h' -> \x68
      expect(result).toContain('\\x62g-red-500'); // 'b' -> \x62
    });
  });

  describe('tailwind-nested detection', () => {
    it('should return unchanged code when tailwind-nested is not imported', () => {
      const code = `const className = twn("base", { hover: "bg-red-500" });`;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).toBe(code);
    });
  });

  describe('basic transformation', () => {
    it('should transform keys and values with escaped first character', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", { hover: "bg-red-500" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      // hover should become ["\\x68over"]
      expect(result).toContain('["\\x68over"]');
      // "bg-red-500" should become "\\x62g-red-500"
      expect(result).toContain('"\\x62g-red-500"');
    });

    it('should transform the first argument (base classes)', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("bg-blue-500 text-white", { hover: "bg-red-500" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      // Base classes should be transformed
      expect(result).toContain('"\\x62g-blue-500 \\x74ext-white"');
      // Selector object should also be transformed
      expect(result).toContain('["\\x68over"]');
      expect(result).toContain('"\\x62g-red-500"');
    });

    it('should handle multiple selectors', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", { hover: "bg-red-500", focus: "ring-2" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).toContain('["\\x68over"]'); // hover
      expect(result).toContain('["\\x66ocus"]'); // focus
      expect(result).toContain('"\\x62g-red-500"'); // bg-red-500
      expect(result).toContain('"\\x72ing-2"'); // ring-2
    });
  });

  describe('nested objects', () => {
    it('should transform deeply nested object keys and values', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", {
          dark: {
            md: {
              hover: "scale-105"
            }
          }
        });
      `;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).toContain('["\\x64ark"]'); // dark
      expect(result).toContain('["\\x6dd"]'); // md
      expect(result).toContain('["\\x68over"]'); // hover
      expect(result).toContain('"\\x73cale-105"'); // scale-105
    });
  });

  describe('string literal keys', () => {
    it('should transform string literal keys', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", { "aria-[expanded=true]": "bg-blue-500" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      // String key should be escaped
      expect(result).toContain('"\\x61ria-[expanded=true]"'); // aria -> \x61ria
      expect(result).toContain('"\\x62g-blue-500"');
    });
  });

  describe('multiple twn calls', () => {
    it('should transform all twn calls in the file', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const btn = twn("btn", { hover: "bg-red-500" });
        const card = twn("card", { focus: "ring-2" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).toContain('["\\x68over"]'); // hover
      expect(result).toContain('["\\x66ocus"]'); // focus
      expect(result).toContain('"\\x62g-red-500"');
      expect(result).toContain('"\\x72ing-2"');
    });
  });

  describe('edge cases', () => {
    it('should transform twn calls with only base classes (no second argument)', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("bg-blue-500");
      `;
      const result = transformTwnSource(code, 'test.ts');
      // Base classes should be transformed
      expect(result).toContain('"\\x62g-blue-500"');
    });

    it('should handle empty selector object', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", {});
      `;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).toContain('{}');
    });

    it('should handle aliased imports', () => {
      const code = `
        import { twn as myTwn } from 'tailwind-nested';
        const className = myTwn("base", { hover: "bg-red-500" });
      `;
      const result = transformTwnSource(code, 'test.ts');
      expect(result).toContain('["\\x68over"]');
      expect(result).toContain('"\\x62g-red-500"');
    });

    it('should return unchanged code on parse errors', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", { hover: "bg-red-500"
      `;
      const result = transformTwnSource(code, 'test.ts');
      // Should return original code on parse error
      expect(result).toBe(code);
    });
  });

  describe('transformed code should evaluate correctly', () => {
    it('should produce valid JavaScript that evaluates to same values', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        const className = twn("base", { hover: "bg-red-500", focus: "ring-2" });
      `;
      const result = transformTwnSource(code, 'test.ts');

      // The transformed code should contain escaped strings
      expect(result).toContain('["\\x68over"]');
      expect(result).toContain('["\\x66ocus"]');
      expect(result).toContain('"\\x62g-red-500"');
      expect(result).toContain('"\\x72ing-2"');

      // Verify the escaped values evaluate correctly to original strings
      expect(eval('"\\x68over"')).toBe('hover');
      expect(eval('"\\x62g-red-500"')).toBe('bg-red-500');
      expect(eval('"\\x72ing-2"')).toBe('ring-2');
      expect(eval('"\\x66ocus"')).toBe('focus');
    });
  });
});
