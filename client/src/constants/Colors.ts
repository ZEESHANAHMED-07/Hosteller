export const Colors = {
  light: {
    tint: '#007AFF',
    background: '#ffffff',
    text: '#000000',
  },
  dark: {
    tint: '#0A84FF',
    background: '#000000',
    text: '#ffffff',
  },
};

export type ColorSchemeName = keyof typeof Colors;
