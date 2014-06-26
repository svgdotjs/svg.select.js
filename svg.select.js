// svg.draw.js 0.1.0 - Copyright (c) 2014 Ulrich-Matthias Schäfer - Licensed under the MIT license

;(function () {

    SVG.extend(SVG.Element, {
        // Select element with mouse
        select: function (value, options) {

            var defaults, observer
                , element = this
                , bbox = this.bbox()
                , parent = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc);

            // The defaults for our option-object
            defaults = {
                points: true,                            // If true, points at the edges are drawn. Needed for resize!
                classRect: 'svg_select_boundingRect',    // Css-class added to the rect
                classPoints: 'svg_select_points',        // Css-class added to the points
                radius: 7,                               // radius of the points
                rotationPoint: true,                     // If true, rotation point is drawn. Needed for rotation!
                deepSelect: false                        // If true, moving of single points is possible (only line, polyline, polyon)
            };

            // Check the parameters and reassign if needed
            if (typeof value === 'object') {
                options = value;
                value = true;
            }

            // When no parameter is given, our value is true
            value = value === undefined ? true : value;

            // Merging the defaults and the options-object together
            for (var i in options) {
                if (!defaults.hasOwnProperty(i)) throw('Property ' + i + ' doesn\'t exists');
                defaults[i] = options[i];
            }


            // START DEEPSELECT

            // When deepSelect is enabled and the element is a line/polyline/polyline, draw only points for moving
            if (defaults.deepSelect && ['line', 'polyline', 'polygon'].indexOf(element.type) !== -1) {
                var drawCircles, updateCircles, array, observeDeepSelectedPoints;
                element.deepSelect = element.deepSelect || {};

                if (!value) {
                    // Remove all points, clear the set, stop watching the element
                    element.deepSelect.set.each(function () {
                        this.remove();
                    });
                    element.deepSelect.set.clear();
                    element.isSelected = false;

                    // create an MutationObserver if possible, fallback to mutation-events if not
                    if (MutationObserver) {
                        this.deepSelect.attributeObserver.disconnect();
                    } else {
                        element.off(observeDeepSelectedPoints);
                    }

                    return this;
                }

                // we don't need to select twice
                if (element.isSelected)return this;

                // Create our set of elements
                element.deepSelect.set = parent.set();

                // The function to draw the circles
                drawCircles = function (array) {

                    // go through the array of points
                    for (var i = 0, len = array.length; i < len; ++i) {

                        // add every point to the set
                        element.deepSelect.set.add(

                            // a circle with our css-classes and a mousedown-event which fires our event for moving points
                            parent.circle(defaults.radius).center(array[i][0], array[i][1]).addClass(defaults.classPoints).addClass(defaults.classPoints + '_point')
                                .mousedown(
                                    (function (k) {
                                        return function (ev) {
                                            ev.preventDefault && ev.preventDefault();
                                            element.node.dispatchEvent(new CustomEvent('point', {detail: {x: ev.pageX, y: ev.pageY, i: k}}));
                                        }
                                    })(i)
                                )
                        );
                    }

                };

                // every time a circle is moved, we have to update the positions of our circle
                updateCircles = function (array) {
                    element.deepSelect.set.each(function (i) {
                        if (this.cx() == array[i][0] && this.cy() == array[i][1])return;
                        this.center(array[i][0], array[i][1]);
                    });
                };

                // create the point-array which contains the 2 points of a line or simply the points-array of polyline/polygon
                array = element.type == 'line' ? [
                    [element.attr('x1'), element.attr('y1')],
                    [element.attr('x2'), element.attr('y2')]
                ] : element.array.value;

                // draw the circles and mark the element as selected
                drawCircles(array);
                element.isSelected = true;


                // Observer which is triggered, when point is moved
                observeDeepSelectedPoints = function() {
                    var arr = element.type == 'line' ? [
                        [element.attr('x1'), element.attr('y1')],
                        [element.attr('x2'), element.attr('y2')]
                    ] : element.array.value;
                    updateCircles(arr);
                };

                // create an MutationObserver if possible, fallback to mutation-events if not
                if (MutationObserver) {

                    // observe the attributes of the shape. When changing, adjust the boundingRect
                    this.deepSelect.attributeObserver = new MutationObserver(observeDeepSelectedPoints);
                    this.deepSelect.attributeObserver.observe(this.node, {attributes: true});

                } else {
                    element.on('DOMAttrModified', observeDeepSelectedPoints);
                }

                return this;
            }

            // END DEEPSELECT


            // Deselect the element
            if (!value) {

                // stop watching the element, remove the selection
                if (this.boundingGroup) {
                    if (MutationObserver) {
                        this.boundingGroup.attributeObserver.disconnect();
                    } else {
                        element.off(observer);
                    }
                    this.boundingGroup.group.remove();
                    delete this.boundingGroup;
                }

                // mark element as not selected
                this.isSelected = false;
                return this;
            }

            // don't select twice
            if (this.isSelected)return this;

            // our object to store the elements we use
            this.boundingGroup = {
                group: this.parent.nested().transform(element.transform()).move(bbox.x, bbox.y),
                rect: null,
                circles: []
            };

            // helperFunction to create a mouse-down function which triggers the event specified in `eventName`
            function getMoseDownFunc(eventName) {
                return function (ev) {
                    (ev.preventDefault && ev.preventDefault()) || (ev.returnValue = false);
                    element.node.dispatchEvent(new CustomEvent(eventName, {detail: {x: ev.pageX, y: ev.pageY}}));
                };
            }

            // create the selection-rectangle and add the css-class
            this.boundingGroup.rect = this.boundingGroup.group.rect(bbox.width, bbox.height).addClass(defaults.classRect);

            // Draw Points at the edges, if enabled
            if (defaults.points) {
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0, 0).attr('class', defaults.classPoints + '_lt').mousedown(getMoseDownFunc('lt')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width, 0).attr('class', defaults.classPoints + '_rt').mousedown(getMoseDownFunc('rt')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width, bbox.height).attr('class', defaults.classPoints + '_rb').mousedown(getMoseDownFunc('rb')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0, bbox.height).attr('class', defaults.classPoints + '_lb').mousedown(getMoseDownFunc('lb')));

                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width / 2, 0).attr('class', defaults.classPoints + '_t').mousedown(getMoseDownFunc('t')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width, bbox.height / 2).attr('class', defaults.classPoints + '_r').mousedown(getMoseDownFunc('r')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width / 2, bbox.height).attr('class', defaults.classPoints + '_b').mousedown(getMoseDownFunc('b')));
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(0, bbox.height / 2).attr('class', defaults.classPoints + '_l').mousedown(getMoseDownFunc('l')));

                this.boundingGroup.circles.forEach(function (c) {
                    c.addClass(defaults.classPoints);
                });
            }

            // draw rotationPint, if enabled
            if (defaults.rotationPoint) {
                this.boundingGroup.circles.push(this.boundingGroup.group.circle(defaults.radius).center(bbox.width / 2, 20).attr('class', defaults.classPoints + '_rot')
                    .mousedown(function (ev) {
                        ev.preventDefault && ev.preventDefault();
                        element.node.dispatchEvent(new CustomEvent('rot', {detail: {x: ev.pageX, y: ev.pageY}}));
                    }));
            }

            // mark element as selected
            this.isSelected = true;

            // Observer which is triggered on resize and drag
            observer = function() {

                // Move all elements to the new position
                bbox = element.bbox();
                if (element.boundingGroup) {
                    element.boundingGroup.group.transform(element.transform()).move(bbox.x, bbox.y);
                    element.boundingGroup.rect.attr({
                        width: bbox.width,
                        height: bbox.height
                    });

                    if (defaults.points) {
                        element.boundingGroup.circles[1].center(bbox.width, 0);
                        element.boundingGroup.circles[2].center(bbox.width, bbox.height);
                        element.boundingGroup.circles[3].center(0, bbox.height);

                        element.boundingGroup.circles[4].center(bbox.width / 2, 0);
                        element.boundingGroup.circles[5].center(bbox.width, bbox.height / 2);
                        element.boundingGroup.circles[6].center(bbox.width / 2, bbox.height);
                        element.boundingGroup.circles[7].center(0, bbox.height / 2);
                    }

                    if (defaults.rotationPoint) {
                        element.boundingGroup.circles[8].center(bbox.width / 2, 20);
                    }
                }
            };

            // create an MutationObserver if possible, fallback to mutation-events if not
            if (MutationObserver) {
                // observe the attributes of the shape. When changing, adjust the boundingRect
                this.boundingGroup.attributeObserver = new MutationObserver(observer);
                this.boundingGroup.attributeObserver.observe(this.node, {attributes: true});

            } else {
                element.on('DOMAttrModified', observer);
            }

            return this;
        }

    });

}).call(this);