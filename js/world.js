/*
World class for AI javascript game

By: Matthew Russell
May 17, 2015

generates a 2D grid world of dimensions [w, h], with numObstacles obstaceles randomly placed
draw(ctx, resolution): draws the world to the ctx context, and some resolution
set(pos, val): sets the grid at the pos tuple to val
checkCollisions(mov, dir): determines if moving the mov object in dir tuple direction is valid or not
*/

function World(w, h, numObstacles){ // the actual world to check AI against
	//walls are 1, space is 0.
	this.w = w;
	this.h = h;
	this.grid = []; // make world grid
	for(var a = 0; a < w; a++){
		var tmp = new Array(h);
		for(var b = 0; b < h; b++){
			tmp[b] = 0;
		}
		this.grid.push(tmp);
	}
	for(var a = 0; a < numObstacles; a++){
		this.grid[Math.floor(Math.random()*w)][Math.floor(Math.random()*h)] = 1;
	}
	//console.log(this.grid);

	this.draw = function(ctx, resolution){ // draw all walls
		ctx.fillStyle = "black";
		//console.log(this.grid);
		for(var a = 0; a < w; a++){
			for(var b = 0; b < h; b++){
				if(this.grid[a][b] == 1){
					ctx.fillRect(a*resolution, b*resolution, resolution, resolution);
				}
			}
		}
	}

	this.set = function(pos, val){
		this.grid[pos[0]][pos[1]] = val;
	}
	
	this.checkCollisions = function(mov, dir){
		var newpos = new Array(2);
		newpos[0] = mov.pos[0]+dir[0];
		newpos[1] = mov.pos[1]+dir[1];

		if(newpos[0]<0 || newpos[1]<0 || newpos[0] >= this.w || newpos[1] >= this.h){
			return false;
		}
		if(this.grid[newpos[0]][newpos[1]] == 1){
			return false;
		}
		return true;
	}
}
