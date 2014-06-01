// svg.draw.js 0.1.0 - Copyright (c) 2014 Urich-Matthias Schäfer - Licensed under the MIT license

// TODO: Maybe use nested SVG instead of group to avoid translation when moving

;(function() {

    SVG.extend(SVG.Element, {
        // Select element with mouse
        select: function(value, options) {

            var defaults
              , element = this
              , bbox = this.bbox();

            defaults = {
                points:true,
                classRect:'svg_select_boundingRect',
                classPoints:'svg_select_points',
                radius:7
                //TODO: deepSelect - doubleClick selects every point from polygons/lines and not only the box
            };

            if(typeof value === 'object'){
                options = value;
                value = true;
            }

            value = value === undefined ? true : value;

            for(var i in options){
                if(!defaults[i])throw('Property '+i+'doesn\'t exists');
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
                'class':defaults.classRect
            });

            if(defaults.points){
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0,0).attr('class', defaults.classPoints+'_lt')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('lt', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width,0).attr('class', defaults.classPoints+'_rt')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('rt', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width,bbox.height).attr('class', defaults.classPoints+'_rb')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('rb', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0,bbox.height).attr('class', defaults.classPoints+'_lb')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('lb', {detail:{x:ev.pageX, y:ev.pageY}})); }));


                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width/2,0).attr('class', defaults.classPoints+'_t')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('t', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width,bbox.height/2).attr('class', defaults.classPoints+'_r')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('r', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width/2,bbox.height).attr('class', defaults.classPoints+'_b')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('b', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0,bbox.height/2).attr('class', defaults.classPoints+'_l')
                    .mousedown(function(ev){ ev.preventDefault && ev.preventDefault(); element.node.dispatchEvent(new CustomEvent('l', {detail:{x:ev.pageX, y:ev.pageY}})); }));

                this.boundingGroup.circles.forEach(function(c){ c.node.className += ' ' + defaults.classPoints; });
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

                        element.boundingGroup.circles[4].center(bbox.width/2,0);
                        element.boundingGroup.circles[5].center(bbox.width,bbox.height/2);
                        element.boundingGroup.circles[6].center(bbox.width/2,bbox.height);
                        element.boundingGroup.circles[7].center(0,bbox.height/2);
                    }
                }
            });

            this.boundingGroup.attributeObserver.observe(this.node, {attributes:true});

            return this;
        }

    });

}).call(this);