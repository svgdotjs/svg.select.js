import { G, Point } from '@svgdotjs/svg.js'

export function getMoseDownFunc (eventName, el) {
  return function (ev) {
    ev.preventDefault()
    ev.stopPropagation()

    var x = ev.pageX || ev.touches[0].pageX
    var y = ev.pageY || ev.touches[0].pageY
    el.fire(eventName, { x: x, y: y, event: ev })
  }
}

export class SelectHandler {
  constructor (el) {
    this.el = el
    el.remember('_selectHandler', this)
    this.selection = new G()
    this.order = this.getPointNames()
    this.orginalPoints = []
    this.points = []
    this.mutationHandler = this.mutationHandler.bind(this)
    this.observer = new window.MutationObserver(this.mutationHandler)
  }

  init () {
    this.mountSelection()
    this.updatePoints()
    this.createSelection()
    this.createResizeHandles()
    this.updateResizeHandles()
    this.createRotationHandle()
    this.updateRotationHandle()
    this.createShearHandle()
    this.updateShearHandle()
    this.observer.observe(this.el.node, { attributes: true })
  }

  getPointNames () {
    return ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l', 'rot', 'shear']
  }

  active (val) {
    // Disable selection
    if (!val) {
      this.selection.clear().remove()
      this.observer.disconnect()
      return
    }

    // Enable selection
    this.init()
  }

  mountSelection () {
    this.el.root().put(this.selection)
  }

  createSelection () {
    // First transform all points, then draw polygon out of it
    this.selection.polygon(this.points.slice(0, this.order.indexOf('rot')).map(el => [el.x, el.y])).addClass('selection_border')
  }

  updateSelection () {
    this.selection.get(0).plot(this.points.slice(0, this.order.indexOf('rot')).map(el => [el.x, el.y]))
  }

  createResizeHandles () {
    this.points.slice(0, this.order.indexOf('rot')).forEach((p, index) => {
      this.selection.circle(10)
        .addClass('selection_handle_' + this.order[index])
        .on('mousedown.selection touchstart.selection', getMoseDownFunc(this.order[index], this.el))
    })
  }

  updateResizeHandles () {
    this.points.slice(0, this.order.indexOf('rot')).forEach((p, index) => {
      this.selection.get(index + 1).center(p.x, p.y)
    })
  }

  createRotationHandle () {
    const handle = this.selection.group()
      .addClass('selection_handle_rot')
      .on('mousedown.selection touchstart.selection', getMoseDownFunc('rot', this.el))

    handle.line()
    handle.circle(5)
  }

  updateRotationHandle () {
    const index = this.order.indexOf('rot')
    const topPoint = this.points[this.order.indexOf('t')]
    const rotPoint = this.points[index]

    const group = this.selection.get(index + 1)

    group.get(0).plot(topPoint.x, topPoint.y, rotPoint.x, rotPoint.y)
    group.get(1).center(rotPoint.x, rotPoint.y)
  }

  createShearHandle () {
    this.selection.rect(20, 5)
      .addClass('selection_handle_shear')
      .on('mousedown.selection touchstart.selection', getMoseDownFunc('shear', this.el))
  }

  updateShearHandle () {
    const index = this.order.indexOf('shear')
    const shearPoint = this.points[index]
    const shearPoint2 = this.points[index + 1]

    this.selection.get(index + 1)
      .move(shearPoint.x, shearPoint.y)
      .untransform()
      .rotate(this.el.transform('rotate'), shearPoint2.x, shearPoint2.y)
  }

  updatePoints () {
    // Transform elements bounding box into correct space
    const parent = this.selection.parent()

    // This is the matrix from the elements space to the space of the ui
    // const fromShapeToUiMatrix = this.el.screenCTM().multiplyO(parent.screenCTM().inverseO())
    const fromShapeToUiMatrix = parent.screenCTM().inverseO().multiplyO(this.el.screenCTM())

    this.orginalPoints = this.getPoints()
    this.points = this.orginalPoints.map((p) => p.transform(fromShapeToUiMatrix))
  }

  getPoints () {
    const { x, x2, y, y2, cx, cy } = this.el.bbox()

    // A collection of all the points we need to draw our ui
    return [
      new Point(x, y),
      new Point(cx, y),
      new Point(x2, y),
      new Point(x2, cy),
      new Point(x2, y2),
      new Point(cx, y2),
      new Point(x, y2),
      new Point(x, cy),
      new Point(cx, y - 20),
      new Point(x2 - 20, y - 5),
      new Point(x2, y - 5)
    ]
  }

  mutationHandler () {
    this.updatePoints()

    this.updateSelection()
    this.updateResizeHandles()
    this.updateRotationHandle()
    this.updateShearHandle()
  }
}

export default SelectHandler
