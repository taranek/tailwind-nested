import { describe, expect, test } from 'vitest';
import { extractTwnCalls } from '../../vite-plugin';

describe('extractTwnCalls - Complete File Scenarios', () => {
  describe('InteractiveAriaDemo scenarios', () => {
    test('should extract classes from aria-expanded with nested selectors', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        export function ExpandableButton() {
          const buttonClass = twn("p-4 border rounded", {
            'aria-[expanded=true]': {
              '&': 'bg-blue-50 border-blue-300',
              '[&_svg]': 'rotate-180'
            },
            'aria-[expanded=false]': 'bg-gray-50 border-gray-300'
          });
          
          return <button className={buttonClass}>Toggle</button>;
        }
      `;

      const result = extractTwnCalls(code, 'ExpandableButton.tsx');
      expect(result).toEqual(new Set([
        'p-4',
        'border',
        'rounded',
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:border-blue-300',
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=false]:bg-gray-50',
        'aria-[expanded=false]:border-gray-300'
      ]));
    });

    test('should handle complex aria selector with descendant combinator', () => {
      const code = `
        import 'tailwind-nested';
        
        const AccordionItem = () => {
          const className = twn("accordion-item", {
            'aria-[expanded=true]': {
              '&': 'bg-blue-50',
              '[&_svg]': 'rotate-180 transform'
            }
          });
        };
      `;

      const result = extractTwnCalls(code, 'AccordionItem.ts');
      expect(result).toEqual(new Set([
        'accordion-item',
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:[&_svg]:rotate-180',
        'aria-[expanded=true]:[&_svg]:transform'
      ]));
    });

    test('should extract multiple aria states with different selectors', () => {
      const code = `
        import React from 'react';
        import { twn } from 'tailwind-nested';
        
        interface ButtonProps {
          expanded: boolean;
        }
        
        export const InteractiveButton: React.FC<ButtonProps> = ({ expanded }) => {
          const buttonStyles = twn("flex items-center justify-between", {
            'aria-[expanded=true]': {
              '&': 'bg-blue-50 border-blue-300',
              svg: 'rotate-180'
            },
            'aria-[expanded=false]': {
              '&': 'bg-gray-50 border-gray-300',
              svg: 'rotate-0'
            }
          });
          
          return (
            <button className={buttonStyles} aria-expanded={expanded}>
              Content
            </button>
          );
        };
      `;

      const result = extractTwnCalls(code, 'InteractiveButton.tsx');
      expect(result).toEqual(new Set([
        'flex',
        'items-center',
        'justify-between',
        'aria-[expanded=true]:bg-blue-50',
        'aria-[expanded=true]:border-blue-300',
        'aria-[expanded=true]:svg:rotate-180',
        'aria-[expanded=false]:bg-gray-50',
        'aria-[expanded=false]:border-gray-300',
        'aria-[expanded=false]:svg:rotate-0'
      ]));
    });

    test('should parse complete button with aria, hover and focus states', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        function CompleteAriaButton() {
          const styles = twn("px-4 py-2 font-medium transition-all", {
            'aria-[expanded=true]': {
              '&': 'bg-blue-50 border-blue-300',
              '[&_svg]': 'rotate-180'
            },
            'aria-[expanded=false]': 'bg-gray-50 border-gray-300',
            hover: 'shadow-sm',
            focus: 'outline-none ring-2 ring-blue-500'
          });
        }
      `;

      const result = extractTwnCalls(code, 'CompleteAriaButton.js');
      expect(result).toEqual(new Set([
        'px-4',
        'py-2',
        'font-medium',
        'transition-all',
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
  });

  describe('Complex nested selector scenarios', () => {
    test('should handle deeply nested responsive and state combinations', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        const ResponsiveCard = () => {
          const cardClass = twn("base-card", {
            dark: {
              md: {
                hover: {
                  '&': 'bg-fuchsia-600 text-white',
                  span: 'text-gray-100'
                },
                focus: 'ring-2 ring-purple-500'
              }
            }
          });
          
          const anotherClass = twn("text-sm", {
            lg: {
              hover: 'shadow-lg transform scale-105'
            }
          });
        };
      `;

      const result = extractTwnCalls(code, 'ResponsiveCard.tsx');
      expect(result).toEqual(new Set([
        'base-card',
        'dark:md:hover:bg-fuchsia-600',
        'dark:md:hover:text-white',
        'dark:md:hover:span:text-gray-100',
        'dark:md:focus:ring-2',
        'dark:md:focus:ring-purple-500',
        'text-sm',
        'lg:hover:shadow-lg',
        'lg:hover:transform',
        'lg:hover:scale-105'
      ]));
    });

    test('should handle data attribute selectors with square brackets', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        export default function DataAttributeComponent() {
          const className = twn("component-base", {
            'data-[size=large]': 'p-8 text-xl',
            'data-[state=open]': 'opacity-100',
            hover: {
              'data-[variant=primary]': 'bg-blue-700'
            }
          });
          
          return <div className={className} />;
        }
      `;

      const result = extractTwnCalls(code, 'DataAttributeComponent.tsx');
      expect(result).toEqual(new Set([
        'component-base',
        'data-[size=large]:p-8',
        'data-[size=large]:text-xl',
        'data-[state=open]:opacity-100',
        'hover:data-[variant=primary]:bg-blue-700'
      ]));
    });

    test('should handle ampersand selectors with complex bracket syntax', () => {
      const code = `
        // Using tailwind-nested for advanced selectors
        import { twn } from 'tailwind-nested';
        
        const DragDropComponent = () => {
          const styles = twn("draggable-item cursor-pointer", {
            '[&.is-dragging]': 'opacity-50 cursor-grabbing',
            '[&:not(.disabled)]': 'hover:bg-gray-100',
            hover: {
              '[&.active]': 'bg-blue-500',
              'data-[state=selected]': 'ring-2'
            }
          });
        };
      `;

      const result = extractTwnCalls(code, 'DragDropComponent.js');
      expect(result).toEqual(new Set([
        'draggable-item',
        'cursor-pointer',
        '[&.is-dragging]:opacity-50',
        '[&.is-dragging]:cursor-grabbing',
        '[&:not(.disabled)]:hover:bg-gray-100',
        'hover:[&.active]:bg-blue-500',
        'hover:data-[state=selected]:ring-2'
      ]));
    });
  });

  describe('Real-world component scenarios', () => {
    test('should extract classes from button component with all states', () => {
      const code = `
        import React from 'react';
        import { twn } from 'tailwind-nested';
        
        interface ButtonProps {
          variant?: 'primary' | 'secondary';
          disabled?: boolean;
        }
        
        export const Button: React.FC<ButtonProps> = ({ variant = 'primary', disabled }) => {
          const baseStyles = twn("px-4 py-2 font-medium rounded transition-colors", {
            hover: 'bg-blue-600 text-white',
            focus: 'ring-2 ring-blue-500',
            disabled: 'opacity-50 cursor-not-allowed'
          });
          
          const variantStyles = variant === 'primary' 
            ? twn("bg-blue-500 text-white", {
                hover: 'bg-blue-700'
              })
            : twn("bg-gray-200 text-gray-800", {
                hover: 'bg-gray-300'
              });
              
          return <button className={\`\${baseStyles} \${variantStyles}\`} disabled={disabled} />;
        };
      `;

      const result = extractTwnCalls(code, 'Button.tsx');
      expect(result).toEqual(new Set([
        'px-4',
        'py-2',
        'font-medium',
        'rounded',
        'transition-colors',
        'hover:bg-blue-600',
        'hover:text-white',
        'focus:ring-2',
        'focus:ring-blue-500',
        'disabled:opacity-50',
        'disabled:cursor-not-allowed',
        'bg-blue-500',
        'text-white',
        'hover:bg-blue-700',
        'bg-gray-200',
        'text-gray-800',
        'hover:bg-gray-300'
      ]));
    });

    test('should handle responsive design with complex breakpoints', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        const ResponsiveGrid = () => {
          const gridStyles = twn("grid gap-4", {
            sm: "grid-cols-1",
            md: "grid-cols-2 gap-6",
            lg: {
              "&": "grid-cols-3 gap-8",
              hover: "shadow-lg transform scale-105"
            },
            xl: "grid-cols-4",
            'dark:md': 'bg-gray-800 text-white'
          });
          
          const itemStyles = twn("p-4 border rounded", {
            md: "p-6",
            hover: {
              md: "shadow-md",
              lg: "shadow-lg"
            }
          });
        };
      `;

      const result = extractTwnCalls(code, 'ResponsiveGrid.tsx');
      expect(result).toEqual(new Set([
        'grid',
        'gap-4',
        'sm:grid-cols-1',
        'md:grid-cols-2',
        'md:gap-6',
        'lg:grid-cols-3',
        'lg:gap-8',
        'lg:hover:shadow-lg',
        'lg:hover:transform',
        'lg:hover:scale-105',
        'xl:grid-cols-4',
        'dark:md:bg-gray-800',
        'dark:md:text-white',
        'p-4',
        'border',
        'rounded',
        'md:p-6',
        'hover:md:shadow-md',
        'hover:lg:shadow-lg'
      ]));
    });

    test('should handle form component with validation states', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        const FormInput = ({ hasError, isValid }) => {
          const inputStyles = twn("w-full px-3 py-2 border rounded", {
            focus: {
              '&': 'outline-none ring-2',
              '[&:valid]': 'ring-green-500 border-green-500',
              '[&:invalid]': 'ring-red-500 border-red-500'
            },
            'data-[error=true]': {
              '&': 'border-red-500 bg-red-50',
              '[&::placeholder]': 'text-red-400'
            },
            'data-[valid=true]': 'border-green-500 bg-green-50'
          });
        };
      `;

      const result = extractTwnCalls(code, 'FormInput.jsx');
      expect(result).toEqual(new Set([
        'w-full',
        'px-3',
        'py-2',
        'border',
        'rounded',
        'focus:outline-none',
        'focus:ring-2',
        'focus:[&:valid]:ring-green-500',
        'focus:[&:valid]:border-green-500',
        'focus:[&:invalid]:ring-red-500',
        'focus:[&:invalid]:border-red-500',
        'data-[error=true]:border-red-500',
        'data-[error=true]:bg-red-50',
        'data-[error=true]:[&::placeholder]:text-red-400',
        'data-[valid=true]:border-green-500',
        'data-[valid=true]:bg-green-50'
      ]));
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle files without tailwind-nested import', () => {
      const code = `
        const className = twn("bg-red-500 text-white");
        export default function Component() {
          return <div className={className} />;
        }
      `;

      const result = extractTwnCalls(code, 'Component.tsx');
      expect(result).toEqual(new Set()); // Should be empty since no tailwind-nested import
    });

    test('should handle mixed import styles', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        import * as TW from 'tailwind-nested';
        // Comment mentioning tailwind-nested
        
        const styles1 = twn("class1");
        const styles2 = TW.twn("class2"); // This won't be detected as we only look for 'twn'
      `;

      const result = extractTwnCalls(code, 'MixedImports.tsx');
      expect(result).toEqual(new Set(['class1']));
    });

    test('should handle empty and whitespace classes', () => {
      const code = `
        import { twn } from 'tailwind-nested';
        
        const styles = twn("  valid-class   ", {
          hover: "   another-class  extra-class   ",
          focus: ""
        });
      `;

      const result = extractTwnCalls(code, 'WhitespaceTest.tsx');
      expect(result).toEqual(new Set([
        'valid-class',
        'hover:another-class',
        'hover:extra-class'
      ]));
    });
  });
});
