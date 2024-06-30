import { SelectHandler } from './src/SelectHandler.js'

interface selectionPointArray {
  [index: number]: 'lt' | 'rt' | 'rb' | 'lb' | 't' | 'r' | 'b' | 'l' | 'rot' | 'shear'
}

interface selectionOptions {
  points: selectionPointArray
  pointsExclude: selectionPointArray
  classRect: string
  classPoints: string
  pointType: 'circle' | 'rect'
  pointSize: number
  rotationPoint: boolean
  deepSelect: boolean
}

declare module '@svgdotjs/svg.js' {
  interface Element {
    select(): this

    select(enable: boolean): this
    select(options: selectionOptions): this
    select(handler: SelectHandler): this
    select(attr?: SelectHandler | selectionOptions | boolean): this
  }
}
