type Selectors =
  | {
      [key: string]: string | Selectors | undefined | null;
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

// Main library exports only - Vite plugin is in separate entry
