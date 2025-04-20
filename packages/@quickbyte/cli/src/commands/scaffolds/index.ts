import { ScaffoldComponent, ScaffoldType } from "./types";
import { scaffoldTransformer } from "./transformer";
import { scaffoldReader } from "./reader";
import { scaffoldWriter } from "./writer";

export const scaffoldMap: Record<ScaffoldType, ScaffoldComponent> = {
    transformer: scaffoldTransformer,
    reader: scaffoldReader,
    writer: scaffoldWriter,
}   

export const scaffold = (type: ScaffoldType, name: string, outPath: string): void => {
    const scaffoldComponent = scaffoldMap[type];
    if (!scaffoldComponent) throw new Error(`Unsupported type: ${type}`);
    scaffoldComponent(type, name, outPath);
}