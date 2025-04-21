import { ScaffoldComponent, ScaffoldType } from "./types";
import { scaffoldTransformer } from "./transformer.js";
import { scaffoldReader } from "./reader.js";
import { scaffoldWriter } from "./writer.js";

export const scaffoldMap: Record<ScaffoldType, ScaffoldComponent> = {
    transformer: scaffoldTransformer,
    reader: scaffoldReader,
    writer: scaffoldWriter,
}   

export function scaffold(type: string, name: string, outDir: string): void {
    const scaffoldType = type as ScaffoldType;
    switch (type) {
        case 'reader':
            scaffoldReader(scaffoldType, name, outDir);
            break;
        case 'writer':
            scaffoldWriter(scaffoldType, name, outDir);
            break;
        case 'transformer':
            scaffoldTransformer(scaffoldType, name, outDir);
            break;
        default:
            throw new Error(`Unknown component type: ${type}`);
    }
}