// svg.draw.js 0.0.5 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
// extended by Urich-Matthias Schäfer (https://github.com/Fuzzyma)

;(function() {

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        select: function(value) {

            var update
              , element = this
              , value = value === null ? true : value
              , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)
              , bbox = this.bbox();

            // Deselect
            if(!value){
                this.boundingRect.attributeObserver.disconnect();
                this.boundingRect && this.boundingRect.remove();
                delete this.boundingRect;
                return this;
            }

            // select
            this.boundingRect = this.parent.rect(bbox.width, bbox.height).move(bbox.x, bbox.y).attr({
                'stroke-width':1,
                'fill':'gray',
                'stroke-dasharray':'10 10',
                'stroke':'black',
                'stroke-opacity':0.8,
                'fill-opacity':0.1,
                'pointer-events':'none'
            });

            // Observe the attributes of the shape. When changing, adjust the boundingRect
            this.boundingRect.attributeObserver = new MutationObserver(function(){
                bbox = element.bbox();
                element.boundingRect && element.boundingRect.attr({
                    width:bbox.width,
                    height:bbox.height,
                    x:bbox.x,
                    y:bbox.y
                });
            });

            this.boundingRect.attributeObserver.observe(this.node, {attributes:true});

            return this;
        }

    });

}).call(this);