export type ScaffoldType = 'transformer' | 'reader' | 'writer';
export type ScaffoldComponent = (type: ScaffoldType, name: string, outPath: string) => void;