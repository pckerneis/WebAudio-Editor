export enum ThemeProperty {
  selectionOutlineColor = '--selection-outline-color',
  defaultNodeColor = '--default-node-color',
  primaryTextColor = '--primary-text-color',
  secondaryBackgroundColor = '--secondary-background-color',
  defaultConnectionColor = '--default-connection-color',
}

export function getSelectionOutlineColor(): string {
  return getValueOrDefault(ThemeProperty.selectionOutlineColor);
}

export function getDefaultNodeColor(): string {
  return getValueOrDefault(ThemeProperty.defaultNodeColor);
}

export function getPrimaryTextColor(): string {
  return getValueOrDefault(ThemeProperty.primaryTextColor);
}

export function getSecondaryBackgroundColor(): string {
  return getValueOrDefault(ThemeProperty.secondaryBackgroundColor);
}

export function getDefaultConnectionColor(): string {
  return getValueOrDefault(ThemeProperty.defaultConnectionColor);
}

function getThemeHolder(): HTMLElement | null {
  return document.getElementById('theme-holder');
}

function getValueOrDefault(property: ThemeProperty): string {
  const themeHolder = getThemeHolder();

  if (themeHolder == null) {
    return defaultValues[property];
  }

  return window.getComputedStyle(themeHolder).getPropertyValue(property);
}

type DefaultValues = {
  [key in ThemeProperty]: string;
};

const defaultValues: DefaultValues = {
  [ThemeProperty.selectionOutlineColor]: '#12acff',
  [ThemeProperty.defaultNodeColor]: '#f8f8f8',
  [ThemeProperty.primaryTextColor]: '#282828',
  [ThemeProperty.secondaryBackgroundColor]: '#e7e7e7',
  [ThemeProperty.defaultConnectionColor]: '#777777',
}
