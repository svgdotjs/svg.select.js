// svg.draw.js 0.1.0 - Copyright (c) 2014 Urich-Matthias Schäfer - Licensed under the MIT license

// TODO: Maybe use nested SVG instead of group to avoid translation when moving

;(function() {

    SVG.extend(SVG.Element, {
        // Select element with mouse
        select: function(value, options) {

            var defaults
              , element = this
              , bbox = this.bbox()
              , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc);

            defaults = {
                points:true,
                classRect:'svg_select_boundingRect',
                classPoints:'svg_select_points',
                radius:7,
                rotationPoint:true,
                deepSelect:false
            };

            if(typeof value === 'object'){
                options = value;
                value = true;
            }

            value = value === undefined ? true : value;

            for(var i in options){
                if(defaults[i] === undefined)throw('Property '+i+' doesn\'t exists');
                defaults[i] = options[i];
            }

            if(defaults.deepSelect && ['line', 'polyline', 'polygon'].indexOf(element.type) !== -1){
                var drawCircles, updateCircles, array;
                element.deepSelect = element.deepSelect || {};

                if(!value){
                    element.deepSelect.set.each(function(){ this.remove(); });
                    element.deepSelect.set.clear();
                    element.isSelected = false;
                    this.deepSelect.attributeObserver.disconnect();
                    return this;
                }

                if(element.isSelected)return this;

                element.deepSelect.set = parent.set();

                drawCircles = function(array){
                    for(var i = 0; i<array.length; ++i){
                        element.deepSelect.set.add(
                            parent.circle(defaults.radius).center(array[i][0], array[i][1]).attr('class', defaults.classPoints + ' ' + defaults.classPoints+'_point')
                                .mousedown(
                                    (function(k){
                                        return function(ev){
                                            ev.preventDefault && ev.preventDefault();
                                            element.node.dispatchEvent(new CustomEvent('point', {detail:{x:ev.pageX, y:ev.pageY, i:k}}));
                                        }
                                    })(i)
                                )
                        );
                    }
                };

                updateCircles = function(array){
                    element.deepSelect.set.each(function(i){
                        if(this.cx() == array[i][0] && this.cy() == array[i][1])return;
                        this.center(array[i][0], array[i][1]);
                    });
                }
                array = element.type == 'line' ? [[element.attr('x1'), element.attr('y1')],[element.attr('x2'), element.attr('y2')]] : element.array.value;

                drawCircles(array);
                element.isSelected = true;

                this.deepSelect.attributeObserver = new MutationObserver(function(){
                    var arr = element.type == 'line' ? [[element.attr('x1'), element.attr('y1')],[element.attr('x2'), element.attr('y2')]] : element.array.value;
                    updateCircles(arr);
                });

                this.deepSelect.attributeObserver.observe(element.node, {attributes:true});
                return this;
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
                group:this.parent.group().transform(element.transform()).move(bbox.x, bbox.y),
                rect:null,
                circles:[]
            };

            this.boundingGroup.rect = this.boundingGroup.group.rect(bbox.width, bbox.height).attr({
                'class':defaults.classRect
            });

            function getMoseDownFunc(eventName){
                return function(ev){
                    (ev.preventDefault && ev.preventDefault()) || (ev.returnValue = false);
                    element.node.dispatchEvent(new CustomEvent(eventName, {detail:{x:ev.pageX, y:ev.pageY}}));
                };
            }

            if(defaults.points){
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0,0).attr('class', defaults.classPoints+'_lt').mousedown(getMoseDownFunc('lt')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width,0).attr('class', defaults.classPoints+'_rt').mousedown(getMoseDownFunc('rt')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width,bbox.height).attr('class', defaults.classPoints+'_rb').mousedown(getMoseDownFunc('rb')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0,bbox.height).attr('class', defaults.classPoints+'_lb').mousedown(getMoseDownFunc('lb')));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width/2,0).attr('class', defaults.classPoints+'_t').mousedown(getMoseDownFunc('t')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width,bbox.height/2).attr('class', defaults.classPoints+'_r').mousedown(getMoseDownFunc('r')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width/2,bbox.height).attr('class', defaults.classPoints+'_b').mousedown(getMoseDownFunc('b')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0,bbox.height/2).attr('class', defaults.classPoints+'_l').mousedown(getMoseDownFunc('l')));

                this.boundingGroup.circles.forEach(function(c){ c.node.className += ' ' + defaults.classPoints; });
            }

            if(defaults.rotationPoint){
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width/2,20).attr('class', defaults.classPoints+'_rot')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('rot', {detail:{x:ev.pageX, y:ev.pageY}})); }));
            }

            this.isSelected = true;

            // Observe the attributes of the shape. When changing, adjust the boundingRect
            this.boundingGroup.attributeObserver = new MutationObserver(function(){
                bbox = element.bbox();
                if(element.boundingGroup){
                    element.boundingGroup.group.transform(element.transform()).move(bbox.x, bbox.y);
                    element.boundingGroup.rect.attr({
                        width:bbox.width,
                        height:bbox.height
                    });

                    if(defaults.points){
                        element.boundingGroup.circles[1].center(bbox.width,0);
                        element.boundingGroup.circles[2].center(bbox.width,bbox.height);
                        element.boundingGroup.circles[3].center(0,bbox.height);

                        element.boundingGroup.circles[4].center(bbox.width/2,0);
                        element.boundingGroup.circles[5].center(bbox.width,bbox.height/2);
                        element.boundingGroup.circles[6].center(bbox.width/2,bbox.height);
                        element.boundingGroup.circles[7].center(0,bbox.height/2);
                    }

                    if(defaults.rotationPoint){
                        element.boundingGroup.circles[8].center(bbox.width/2,20);
                    }
                }
            });

            this.boundingGroup.attributeObserver.observe(this.node, {attributes:true});

            return this;
        }

    });

}).call(this);