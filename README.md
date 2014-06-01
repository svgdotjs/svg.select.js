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


You can style the selection with the classes

- `svg_select_boundingRect`
- `svg_select_points`
- `svg_select_points_lt` - *left top*
- `svg_select_points_rt` - *right top*
- `svg_select_points_rb` - *right bottom*
- `svg_select_points_lb` - *left bottom*
- `svg_select_points_t`  - *top*
- `svg_select_points_r`  - *right*
- `svg_select_points_b`  - *bottom*
- `svg_select_points_l`  - *left*


# Options

- points: Points should be drawn (default `true`)
- classRect: Classname of the rect from the bounding Box (default `svg_select_boundingRect`)
- classPoints: Classname/Prefix of the Points (default `svg_select_points`)
- radius: Radius of the points (default `7`)