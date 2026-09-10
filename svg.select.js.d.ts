import { Element } from '@svgdotjs/svg.js'

export interface SelectionOptions {
  createHandle?: (el: Element) => Element
  updateHandle?: (el: Element, point: number[]) => void
  createRot?: (el: Element) => Element
  updateRot?: (
    el: Element,
    rotPoint: number[],
    handlePoints: number[][]
  ) => void
  handles?: Array<'lt' | 't' | 'rt' | 'r' | 'rb' | 'b' | 'lb' | 'l' | 'rot'>
}

export declare class SelectHandler {
  constructor(el: Element)
  init(options?: SelectionOptions): void
  active(val: boolean, options?: SelectionOptions): void
  createSelection(): void
  updateSelection(): void
  createHandleFn(group: Element): Element
  updateHandleFn(
    shape: Element,
    point: number[],
    index: number,
    arr: number[][]
  ): void
  createRotFn(group: Element): Element
  updateRotFn(group: Element, rotPoint: number[]): void
  updatePoints(): void
}

export declare class PointSelectHandler {
  constructor(el: Element)
  init(options?: SelectionOptions): void
  active(val: boolean, options?: SelectionOptions): void
  createSelection(): void
  updateSelection(): void
  createHandleFn(group: Element): Element
  updateHandleFn(shape: Element, point: number[]): void
  updatePoints(): void
}

declare module '@svgdotjs/svg.js' {
  interface Element {
    select(): this
    select(enable: boolean): this
    select(options: SelectionOptions): this
    select(handler: SelectHandler): this
    select(attr?: SelectHandler | SelectionOptions | boolean): this
  }

  interface Polygon {
    pointSelect(): this
    pointSelect(enable: boolean): this
    pointSelect(options: SelectionOptions): this
    pointSelect(handler: PointSelectHandler): this
    pointSelect(attr?: PointSelectHandler | SelectionOptions | boolean): this
  }
  interface Polyline {
    pointSelect(): this
    pointSelect(enable: boolean): this
    pointSelect(options: SelectionOptions): this
    pointSelect(handler: PointSelectHandler): this
    pointSelect(attr?: PointSelectHandler | SelectionOptions | boolean): this
  }
  interface Line {
    pointSelect(): this
    pointSelect(enable: boolean): this
    pointSelect(options: SelectionOptions): this
    pointSelect(handler: PointSelectHandler): this
    pointSelect(attr?: PointSelectHandler | SelectionOptions | boolean): this
  }
}
