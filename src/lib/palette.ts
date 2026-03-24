export const hslToHex = (h: number, s: number, l: number): string => {
  const lightness = l / 100;
  const a = (s * Math.min(lightness, 1 - lightness)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color =
      lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };

  return `#${f(0)}${f(8)}${f(4)}`;
};

export const hexToHsl = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex
  );
  if (!result) {
    return [0, 0, 0];
  }

  const r = Number.parseInt(result[1], 16) / 255;
  const g = Number.parseInt(result[2], 16) / 255;
  const b = Number.parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: {
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      }
      case g: {
        h = (b - r) / d + 2;
        break;
      }
      case b: {
        h = (r - g) / d + 4;
        break;
      }
      default:
    }

    h /= 6;
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100),
  ];
};

export const normalizeColor = (color: string): string => {
  if (color.startsWith("#")) {
    return color.toUpperCase();
  }

  if (color.startsWith("hsl")) {
    const [h, s, l] = color.match(/\d+(\.\d+)?/g)?.map(Number) || [
      0, 0, 0,
    ];
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  return color;
};

export const trimColorString = (
  color: string,
  maxLength = 20
): string => {
  if (color.length <= maxLength) {
    return color;
  }

  return `${color.slice(0, maxLength - 3)}...`;
};
