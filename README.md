svg.select.js
=============

An extension of svn.js which allows to select an element

# Usage

Select

    var draw = SVG('drawing');
	var rect = draw.rect(100,100);
    rect.select();

Unselect

    rect.select(false);