// `subset-font` ne publie pas de types : seules les options dont
// `subset-fonts.ts` se sert sont décrites ici.
declare module "subset-font" {
  interface SubsetFontOptions {
    keepFeatures?: string[];
    preserveNameIds?: number[];
    targetFormat?: "sfnt" | "woff" | "woff2";
    variationAxes?: Record<
      string,
      number | { default?: number; max: number; min: number }
    >;
  }

  const subsetFont: (
    font: Buffer,
    text: string,
    options?: SubsetFontOptions
  ) => Promise<Buffer>;

  export = subsetFont;
}
