import { Element, extend } from '@svgdotjs/svg.js'
import { SelectHandler } from './select-handler'

extend(Element, {
  /**
   * Select element with mouse
   *
   * @param {SelectHandler | Object | boolean} attr
   */
  selectize: function (attr = true) {
    var selectHandler = this.remember('_selectHandler')

    if (!selectHandler) {
      if (attr.prototype instanceof SelectHandler) {
        /* eslint new-cap: ["error", { "newIsCap": false }] */
        selectHandler = new attr(this)
        attr = true
      } else {
        selectHandler = new SelectHandler(this)
      }

      this.remember('_selectHandler', selectHandler)
    }

    selectHandler.active(attr)

    return this
  }
})

export default SelectHandler
