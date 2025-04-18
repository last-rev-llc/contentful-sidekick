// Custom type declarations for the project
// Note: node-vibrant types are now provided by @vibrant/types

declare module "node-vibrant" {
  export interface Swatch {
    rgb: [number, number, number];
    hsl: [number, number, number];
    hex: string;
    population: number;
  }

  export interface Palette {
    Vibrant: Swatch | null;
    DarkVibrant: Swatch | null;
    LightVibrant: Swatch | null;
    Muted: Swatch | null;
    DarkMuted: Swatch | null;
    LightMuted: Swatch | null;
  }

  export interface BuilderInstance {
    getPalette(): Promise<Palette>;
    getSwatches(): Promise<Swatch[]>;
  }

  export default class Vibrant {
    static from(src: string | HTMLImageElement): BuilderInstance;
    constructor(src: string | HTMLImageElement, opts?: any);
    getPalette(): Promise<Palette>;
  }
}

declare module "node-vibrant/browser" {
  export interface Swatch {
    rgb: [number, number, number];
    hsl: [number, number, number];
    hex: string;
    population: number;
    titleTextColor: string;
    bodyTextColor: string;
  }

  export interface Palette {
    Vibrant: Swatch | null;
    DarkVibrant: Swatch | null;
    LightVibrant: Swatch | null;
    Muted: Swatch | null;
    DarkMuted: Swatch | null;
    LightMuted: Swatch | null;
  }

  export interface BuilderInstance {
    getPalette(): Promise<Palette>;
    getSwatches(): Promise<Swatch[]>;
  }

  export class Vibrant {
    static from(src: string | HTMLImageElement): BuilderInstance;
    constructor(src: string | HTMLImageElement, opts?: any);
    getPalette(): Promise<Palette>;
  }
}

declare module "node-vibrant/worker" {
  export interface Swatch {
    rgb: [number, number, number];
    hsl: [number, number, number];
    hex: string;
    population: number;
    titleTextColor: string;
    bodyTextColor: string;
  }

  export interface Palette {
    Vibrant: Swatch | null;
    DarkVibrant: Swatch | null;
    LightVibrant: Swatch | null;
    Muted: Swatch | null;
    DarkMuted: Swatch | null;
    LightMuted: Swatch | null;
  }

  export interface BuilderInstance {
    getPalette(): Promise<Palette>;
    getSwatches(): Promise<Swatch[]>;
  }

  export class Vibrant {
    static from(src: string | HTMLImageElement): BuilderInstance;
    static use(pipeline: WorkerPipeline): void;
    constructor(src: string | HTMLImageElement, opts?: any);
    getPalette(): Promise<Palette>;
  }

  export class WorkerPipeline {
    constructor(worker: Worker);
  }
}

declare module "node-vibrant/worker.worker" {
  const worker: new () => Worker;
  export default worker;
}
