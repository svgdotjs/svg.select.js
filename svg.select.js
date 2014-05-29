// svg.draw.js 0.0.5 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license
// extended by Urich-Matthias Schäfer (https://github.com/Fuzzyma)

// TODO: Maybe use nested SVG instead of group to avoid translation when moving

;(function() {

    SVG.extend(SVG.Element, {
        // Draw element with mouse
        select: function(value, options) {

            var update, defaults
              , element = this
              , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc)
              , bbox = this.bbox();

            defaults = {
                points:true,
                classRect:'svg_select_boundingRect',
                classCircles:'svg_select_circles'
            }

            if(typeof value === 'object'){
                options = value;
                value = true;
            }

            value = value === null ? true : value;

            for(var i in options){
                defaults[i] = options[i];
            }

            // deselect
            if(!value){
                if(this.boundingGroup){
                    this.boundingGroup.attributeObserver.disconnect();
                    this.boundingGroup.group.remove();
                    delete this.boundingGroup;
                }
                this.isSelected = false;
                return this;
            }

            if(this.isSelected)return this;

            // select
            this.boundingGroup = {
                group:this.parent.group().move(bbox.x, bbox.y),
                rect:null,
                circles:[]
            };

            this.boundingGroup.rect = this.boundingGroup.group.rect(bbox.width, bbox.height).attr({
                'stroke-width':1,
                'fill':'gray',
                'stroke-dasharray':'10 10',
                'stroke':'black',
                'stroke-opacity':0.8,
                'fill-opacity':0.1,
                'pointer-events':'none'
            });

            if(defaults.points){
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(5).center(0,0));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(5).center(bbox.width,0));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(5).center(bbox.width,bbox.height));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(5).center(0,bbox.height));
            }

            this.isSelected = true;

            // Observe the attributes of the shape. When changing, adjust the boundingRect
            this.boundingGroup.attributeObserver = new MutationObserver(function(){
                bbox = element.bbox();
                if(element.boundingGroup){
                    element.boundingGroup.group.move(bbox.x, bbox.y);
                    element.boundingGroup.rect.attr({
                        width:bbox.width,
                        height:bbox.height
                    });

                    if(defaults.points){
                        element.boundingGroup.circles[1].center(bbox.width,0);
                        element.boundingGroup.circles[2].center(bbox.width,bbox.height);
                        element.boundingGroup.circles[3].center(0,bbox.height);
                    }
                }
            });

            this.boundingGroup.attributeObserver.observe(this.node, {attributes:true});

            return this;
        }

    });

}).call(this);