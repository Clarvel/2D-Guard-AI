/*
Main game functionality


By: Matthew Russell
May 17, 2015

drawFrame() draws all game entities
resize() alters the canvas width
checkGoalState() restarts the game if the ai and player occupy the same square
update() moves the player and AI and checks the goal state and draws the current frame
restart() restarts the game with a new world

*/

function GuardGame(canvas){
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.frameRate = FPS;
	this.dim = [25, 25, 20]; // width, height, resolution scale

	this.drawFrame = function(){ // draws frame
		//console.log("Drawing frame...");
		this.ctx.fillStyle = "grey";
		this.ctx.fillRect(0, 0, this.dim[0]*this.dim[2], this.dim[1]*this.dim[2]); // clear enough canvas for game
		this.ai.draw(this.ctx, this.dim[2]);
		this.player.draw(this.ctx, this.dim[2]);
		this.world.draw(this.ctx, this.dim[2]);
	}

	this.resize = function(x, y){ // resizes canvas
		//console.log("resizing canvas to [" + x + " " + y + "]");
		this.canvas.width = x;
		this.canvas.height = y;
	}

	this.checkGoalState = function(){ // returns true if player is in same square as AI
		if(this.ai.pos[0] == this.player.pos[0] && this.ai.pos[1] == this.player.pos[1]){
			this.restart();
			return true;
		}
		return false;
	}

	this.update = function(){ // grabs player's inputs, checks against the grid, moves, checks goal state, and draws
		this.player.move(this.world);

		this.ai.move(this.world, this.player.pos);

		this.checkGoalState();
		this.drawFrame();
	}

	this.restart = function(){
		this.world = new World(this.dim[0], this.dim[1], 100);

		this.player = new Player(3, 3);
		this.player.listenTo(keyboard);

		this.ai = new AI(15, 15);
		this.ai.listenTo(this.world);
		this.resize(this.dim[0]*this.dim[2], this.dim[1]*this.dim[2]); // resize display

		this.world.set(this.player.pos, 0);
		this.world.set(this.ai.pos, 0);

		// set rendering thread
		if(this.renderer != undefined){ // clear rendering if this is being rendered
			clearInterval(this.renderer);
			this.renderer = undefined;
		}
		var a=this;
		this.renderer = setInterval(function(){a.update();}, 1000/this.frameRate); // draw new frame every 1/24s
	}
}


