/*
Grid based Field of Vision class and rays

By: Matthew Russell
May 17, 2015

union(x, y): returns the union of 2 lists
bray(grid, x0, y0, x1, y1): returns a list of points intersected by the ray between[x0, y0] and [x1, y1]
braytest(grid, x0, y0, x1, y1): returns true or false based on if clear line of sight between both points
getFOVSight(px, py, angle): returns what is visible at [px, py] and angle on the priginally input grid

*/

// from http://stackoverflow.com/questions/3629817/getting-a-union-of-two-arrays-in-javascript
function union(x, y) {
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}

function bRay(grid, x0, y0, x1, y1) { // returns list of points in unobstructed ray from start to endpoint
	//adapted from: http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript

	var pts = [];
	var dx = Math.abs(x1 - x0);
	var sx = x0 < x1 ? 1 : -1;
	var dy = Math.abs(y1 - y0)
	var sy = y0 < y1 ? 1 : -1; 
	var err = (dx>dy ? dx : -dy)/2;
	while (true) {
		if (x0 === x1 && y0 === y1) break; // endpoint
		if (x0 < 0 || x0 >= grid.length || y0 < 0 || y0 >= grid[x0].length) break; // if out of bounds
		if (grid[x0][y0] == 1){ // if a wall
			pts.push([x0,y0, -1]);
			break;
		}
		pts.push([x0,y0, 0]);
		var e2 = err;
		if (e2 > -dx) { 
			err -= dy; 
			x0 += sx; 
		}
		if (e2 < dy) { 
			err += dx; 
			y0 += sy; 
		}
	}
	return pts;
}

function bRayTest(grid, x0, y0, x1, y1){ // returns T/F based on if clear line of sight, use for detecting if player spotted
	//adapted from: http://rosettacode.org/wiki/Bitmap/Bresenham's_line_algorithm#JavaScript
	var dx = Math.abs(x1 - x0);
	var sx = x0 < x1 ? 1 : -1;
	var dy = Math.abs(y1 - y0)
	var sy = y0 < y1 ? 1 : -1; 
	var err = (dx>dy ? dx : -dy)/2;

	while (true) {
		if (x0 === x1 && y0 === y1) return true; // found endpoint with no wall interrupt
		if (grid[x0][x0] == 1) return false; // if a wall
		var e2 = err;
		if (e2 > -dx) { 
			err -= dy; 
			x0 += sx; 
		}
		if (e2 < dy) { 
			err += dx; 
			y0 += sy; 
		}
	}
}

function FOV(grid, viewDistance, peripheral, resolution){ // field of view class
	this.grid = grid;
	this.viewDist = viewDistance;
	this.perip = peripheral;
	this.res = resolution;

	this.getFOVSight = function(px, py, angle){ // returns list of points in field of view
		var pts = [];
		for(var a = angle - this.perip; a < angle + this.perip; a += this.res){
			pts = union(pts, bRay(grid, px, py, Math.floor(px+Math.cos(a)*this.viewDist), Math.floor(py+Math.sin(a)*this.viewDist)));
		}
		return pts;
	}
}