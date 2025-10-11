declare module 'signature_pad' {
  export default class SignaturePad {
    constructor(canvas: HTMLCanvasElement, options?: any);
    clear(): void;
    toDataURL(type?: string): string;
    fromDataURL(dataURL: string): void;
    isEmpty(): boolean;
  }
}
