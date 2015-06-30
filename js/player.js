/*
player interaction class for AI javascript game

By: Matthew Russell
May 17, 2015

getInput() returns an input tuple for [x, y] movement based on keyyboard
move(world) moves the player in the world
listenTo(keysmap) sets the array pf pressed keys the player listens to for getInput
draw(ctx, resolution) draws this entity

*/

function Player(x, y){
	this.color = "green";
	this.pos = [x, y];
	this.dim = [20, 20];

	this.getInput = function(){ // called once/frame
		var dir = [0, 0]; // determine direction vectors
		if(this.keysMap[39]){ // right
			dir[0] = 1;
		}else if(this.keysMap[40]){ // up
			dir[1] = 1;
		}else if(this.keysMap[37]){ // left
			dir[0] = -1;
		}else if(this.keysMap[38]){ // down
			dir[1] = -1;
		}
		//console.log(dir);
		return dir;
	}

	this.move = function(world){
		var input = this.getInput();
		if(world.checkCollisions(this, input)){
			this.pos[0] += input[0];
			this.pos[1] += input[1];
		}
	}

	this.listenTo = function(keysMap){
		this.keysMap = keysMap;
	}
	this.draw = function(ctx, resolution){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos[0] * resolution, this.pos[1] * resolution, resolution, resolution);
	}
}
