import {Element} from '@svgdotjs/svg.js'
import {SelectHandler} from './src/svg.select.js';

interface selectionPointArray {
    [index: number]: 'lt' | 'rt' | 'rb' | 'lb' | 't' | 'r' | 'b' | 'l' | 'rot' | 'shear';
}

interface selectionOptions {
    points: selectionPointArray;
    pointsExclude: selectionPointArray;
    classRect: string;
    classPoints: string;
    pointType: 'circle' | 'rect';
    pointSize: number;
    rotationPoint: boolean;
    deepSelect: boolean;
}

declare module '@svgdotjs/svg.js' {
    interface Element {
        selectize(): this;

        selectize(enable: boolean): this;
        selectize(options: selectionOptions): this;
        selectize(handler: SelectHandler): this;
        selectize(attr?: SelectHandler | selectionOptions | boolean): this;
    }
}