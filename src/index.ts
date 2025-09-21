type InteractiveStates =
  | 'hover'
  | 'focus'
  | 'focus-within'
  | 'focus-visible'
  | 'active'
  | 'visited'
  | 'target';

type PositionStates =
  | 'first'
  | 'last'
  | 'only'
  | 'odd'
  | 'even'
  | 'first-of-type'
  | 'last-of-type'
  | 'only-of-type';

type FormStates =
  | 'disabled'
  | 'enabled'
  | 'checked'
  | 'indeterminate'
  | 'default'
  | 'optional'
  | 'required'
  | 'valid'
  | 'invalid'
  | 'user-valid'
  | 'user-invalid'
  | 'in-range'
  | 'out-of-range'
  | 'placeholder-shown'
  | 'read-only'
  | 'autofill';

type ResponsiveBreakpoints = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

type ThemeVariants = 'dark' | 'portrait' | 'landscape';

type GroupStates =
  | 'group-hover'
  | 'group-focus'
  | 'group-active'
  | 'group-visited'
  | 'group-target'
  | 'group-first'
  | 'group-last'
  | 'group-odd'
  | 'group-even'
  | 'group-disabled'
  | 'group-checked'
  | 'group-required'
  | 'group-valid'
  | 'group-invalid';

type PeerStates =
  | 'peer-hover'
  | 'peer-focus'
  | 'peer-focus-within'
  | 'peer-focus-visible'
  | 'peer-active'
  | 'peer-visited'
  | 'peer-target'
  | 'peer-first'
  | 'peer-last'
  | 'peer-odd'
  | 'peer-even'
  | 'peer-disabled'
  | 'peer-enabled'
  | 'peer-checked'
  | 'peer-required'
  | 'peer-valid'
  | 'peer-invalid'
  | 'peer-placeholder-shown';

type SpecialSelectors =
  | '&'
  | `[${string}]`
  | `aria-[${string}]`
  | `data-[${string}]`;

type PseudoElements =
  | 'before'
  | 'after'
  | 'placeholder'
  | 'marker'
  | 'selection'
  | 'file'
  | 'first-letter'
  | 'first-line'
  | 'backdrop';

type FeatureQueries =
  | 'starting'
  | `supports-${string}`
  | `not-supports-${string}`
  | 'print'
  | 'noscript';

type TailwindModifiers =
  | InteractiveStates
  | PositionStates
  | FormStates
  | ResponsiveBreakpoints
  | ThemeVariants
  | GroupStates
  | PeerStates
  | PseudoElements
  | SpecialSelectors
  | FeatureQueries
  | `${ResponsiveBreakpoints}:${InteractiveStates}`
  | `${ResponsiveBreakpoints}:${PositionStates}`
  | `${ResponsiveBreakpoints}:${FormStates}`
  | `${ThemeVariants}:${ResponsiveBreakpoints}`
  | `${ThemeVariants}:${InteractiveStates}`
  | `${ThemeVariants}:${ResponsiveBreakpoints}:${InteractiveStates}`
  | `${ThemeVariants}:${ResponsiveBreakpoints}:${FormStates}`
  | string;

type Selectors =
  | {
      [key in TailwindModifiers]?: string | Selectors | undefined | null;
    }
  | undefined;

export const twn = (
  baseStyles: string | undefined | null,
  selectors: Selectors,
): string => {
  const classes: string[] = [];
  if (baseStyles && baseStyles.trim()) {
    classes.push(baseStyles.trim());
  }
  if (selectors) {
    const selectorClasses = processSelectors(selectors);
    classes.push(...selectorClasses);
  }
  return classes.join(' ');
};

enum SpecialCharacters {
  Root = '&',
}

function processSelectors(selectors: Selectors, prefix = ''): string[] {
  if (!selectors || typeof selectors !== 'object') {
    return [];
  }
  const classes: string[] = [];
  const keys = Object.keys(selectors);

  for (const key of keys) {
    const value = selectors[key];
    const isFalsy =
      !value ||
      value === '' ||
      (typeof value === 'object' && Object.keys(value).length === 0);
    if (isFalsy) {
      continue;
    }
    const currentPrefix = prefix ? `${prefix}:${key}` : key;
    if (typeof value === 'string') {
      // Handle string values - split by spaces and prefix each class
      const classNames = value.trim().split(/\s+/);
      for (const className of classNames) {
        if (className) {
          classes.push(
            key === SpecialCharacters.Root
              ? `${prefix}:${className}`
              : `${currentPrefix}:${className}`,
          );
        }
      }
    }
    if (typeof value === 'object') {
      const nestedClasses = processSelectors(value, currentPrefix);
      classes.push(...nestedClasses);
    }
  }

  return classes;
}
