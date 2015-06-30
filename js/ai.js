
/*
Guard AI class

By Matthew Russell
may 17, 2015

handles running the AI

(state 1)starts out assuming nothing, have to look first.
if player hasn't been seen, can't seed probability, so explore, algorithm 
to determine path around known map, go adjacent to [most unknown areas].
(state 2)if no more unknown areas, assign a global probability to all known 
map chunks [sum = 1], use algorithm to determine largest concentration. - not implemented yet
(state 3)if player found, pursue.
(state 2)if player leaves FOV, set probability = 1 at last known location, propagate at speed

draw() draws the AI and the AI's known map, colored with probabilities
update() updates the AI, should be called once/frame, before the draw step


*/
function AI(x, y){
	this.color = "red";
	this.pos = [x, y, 0]; // pos[2] = vision angle
	this.lookingAt = [0, 0];
	this.state = 1; // 1: havent seen the player yet, full explore mode, 2: player is seen, 3: player was seen
	this.known = {}; // assuming a 2D world here
	this.plannedPath = []; // path input numbers to some endpoint: 1=right, 2=up, 3=left, 4=down

	var set = 0;
	if(PERMISSIVE_MAP){
		set = 1;
	}
	this.grid = new Array(25); // for pathfinding, needs swapped 1s and 0s
	for(var a = 0; a < 25; a++){
		var tmp = new Array(25);
		for(var b = 0; b < 25; b++){
			tmp[b] = set; // set empty where I can't see, will eb updated with walls once I see them
		}
		this.grid[a] = tmp;
	}
	this.grid = new Graph(this.grid);

	this.draw = function(ctx, resolution){
		// draw known states here
		for(key in this.known){
			var prob = this.known[key];
			if(prob >= 0){
				ctx.fillStyle = probToHex(this.known[key]);
				var xy = key.split(" ");
				ctx.fillRect(parseInt(xy[0]) * resolution, parseInt(xy[1]) * resolution, resolution, resolution);
			}
		}

		// draw viewcone
		ctx.fillStyle = "white";
		for(var a = 0; a < this.sight.length; a++){
			ctx.fillRect(this.sight[a][0]*resolution, this.sight[a][1]*resolution, resolution, resolution);
		}

		// draw pathfinding here
		var pt = [0, 0];
		pt[0] = this.pos[0];
		pt[1] = this.pos[1];
		for(var a = 0; a < this.plannedPath.length; a++){
			pt[0] += this.plannedPath[a][0];
			pt[1] += this.plannedPath[a][1];

			ctx.fillStyle = "yellow";
			ctx.fillRect(pt[0]*resolution, pt[1]*resolution, resolution, resolution);
		}

		// draw ai pos here
		ctx.fillStyle = this.color;
		ctx.fillRect(this.pos[0] * resolution, this.pos[1] * resolution, resolution, resolution);
	}

	this.getInput = function(ppos){ // returns AI potential move, moves AI vision cone, receives player position
		// get input
		this.sight = this.fov.getFOVSight(this.pos[0], this.pos[1], this.pos[2]); // returns a list of [x, y, space=0:wall=1] tuples of locations I see this frame
		for(var a = 0; a < this.sight.length; a++){ // save as keys, plan for sight to be zeroed on AI start pos
			var key = ptToKey(this.sight[a]);
			this.known[key] = this.sight[a][2]; // set to wall or space
			if(this.sight[a][2] == 0){
				this.grid.updatePoint(this.sight[a][0], this.sight[a][1], 1); // update grid with movable spaces
			}else{
				this.grid.updatePoint(this.sight[a][0], this.sight[a][1], 0); // update grid with walls
			}
		}
		//console.log(sight);
		//console.log(ppos);

		// determine what to do
		if(findTuple(this.sight, ppos) != -1){ //player is in sight cone
			console.log("I SEE HIM!");
			this.setMax(ppos); // set probability of player in that spot to 1
			this.state = 2;
			this.lookPoint(ppos);
			this.pathTo(ppos);
		}else if(this.state == 2){ // player isn't in sight cone but was
			console.log("HE'S GETTING AWAY");
			this.state = 3;
			this.setMax(this.endPos); // set probability of player in that spot to 1
			//console.log(ptToKey(ppos));
			//console.log(this.known[ptToKey(ppos)]);
			//console.log(this.known);
			this.propagate(); // updates known states based on baeysian reasoning
		}else if(this.state == 3){ // player isn't in sight cone but was at some point
			this.propagate(); // propagte belief states
			var key = findMaxProb(this.known);
			if(this.known[key] == 0){// if no maximum found, stop searching my probability
				console.log("HE GOT AWAY");
				this.state = 1;
			}else{ // try to go here
				console.log("IS HE AT [" + key + "]?");
				//console.log(key);
				var pos = keyToPt(key);
				this.lookPoint(pos);
				this.pathTo(pos);
			}
		}else if(this.state == 1){ // player hasn't been seen yet, explore the space
			var pos = this.getClosestVoid(); // determine [x, y] of nearest spot not on the known board
			console.log("E:"+pos);
			if(!(pos[0] == this.pos[0] && pos[1] == this.pos[1])){ // if should be moving
				//console.log(pos+" "+this.pos);
				this.lookPoint(pos); // orient viewcone on that sopt
				this.pathTo(pos);// plan path to that spot
			}
		} 
		// return the next move
		if(this.plannedPath.length == 0){ // if no path give, stay stationary and slowly pan viewcone
			this.pos[2] += rad(1);
			return [0, 0];
		}else{
			return this.plannedPath[0];
		}
	}

	this.getClosestVoid = function(){
		var adj = [[1, 0], [0, 1], [-1, 0], [0, -1]];
		var pos = [this.pos[0], this.pos[1]];

		//find undefined key positions inside grid dimensions
		var vkeys = []; // void keys
		for(key in this.known){
			if(this.known[key] != -1){ // ignore walls
				var p = keyToPt(key);
				for(var a = 0; a < adj.length; a++){ // for each possible direction
					var pt = addTuple(p, adj[a]);
					var vkey = ptToKey(pt);
					if(vkey in this.known){ // if key exists
					}else if(((pt[0] >= 0 && pt[1] >= 0) && (pt[0] < 25 && pt[1] < 25)) && !(vkey in vkeys)){ // if in unknown state, add it as well
						vkeys.push(vkey);
					}
				}
			}
		}

		//find closest void
		var min = [Infinity, pos];
		for(var a = 0; a < vkeys.length; a++){
			var vpos = keyToPt(vkeys[a]);
			var diff = Math.abs(pos[0]-vpos[0]) + Math.abs(pos[1]-vpos[1]);
			if(diff <= min[0]){
				min[0] = diff;
				min[1] = vpos;
			}
		}
		return min[1];
	}

	this.setMax = function(pos){
		for(key in this.known){
			this.known[key] = 0;
		}
		this.known[ptToKey(pos)] = 1; // set probability of player in that spot to 1
	}

	this.move = function(world, ppos){ // moves the ai by the input tuple
		var input = this.getInput(ppos);
		console.log(this.pos +" " + input+" " +world.checkCollisions(this, input));
		if(world.checkCollisions(this, input)){
			this.pos[0] += input[0];
			this.pos[1] += input[1];
			this.plannedPath.shift();
		}
	}

	this.listenTo = function(world){ // sets up the field of view for the ai
		var viewDistance = 10;
		var perephereral = rad(50);
		var resolution = rad(5);
		this.fov = new FOV(world.grid, viewDistance, perephereral, resolution);
		this.sight = [];
	}

	this.lookPoint = function(pos){ // orients viewcone angle to face the point, uses world coordinates
		var x = this.pos[0] - pos[0];
		var y = this.pos[1] - pos[1];
		this.pos[2] = polarize([x, y])[0];
	}

	this.pathTo = function(pos){ // plans path through known spaces to that point, might be recursive, assume pos is in known map
		var start = this.grid.grid[this.pos[0]][this.pos[1]];
		var end = this.grid.grid[pos[0]][pos[1]];
		var result = astar.search(this.grid, start, end);
		// result is an array containing the shortest path

		this.plannedPath = []; // this.plannedpath is array of tuples denoting direction to travel
		var pos = this.pos;
		for(var a = 0; a < result.length; a++){
			var npos = [result[a].x, result[a].y];
			this.plannedPath.push([npos[0]-pos[0], npos[1]-pos[1]]);
			pos = npos;
		}
		console.log(pos);
		console.log(this.plannedPath);
		this.endPos = [pos[0], pos[1]];
	}

	this.propagate = function(){ // TODO
		var adj = [[1, 0], [0, 1], [-1, 0], [0, -1]];
		// for each key, update it's probablity of the player being in that position based on the probability of the player being in adjacent position
		var propagated = {};
		for(key in this.known){ // for each value in the known set
			if(this.known[key] > 0){ // ignore walls and 0 probabilities

			/* 	set new probability according to Bayes rule: P(A|B) = P(B|A)*P(A)/P(B)

				determine possible movement options based on known walls
				use bayes rule to spread probabilities
			*/

				var p = keyToPt(key);

				// determine movement options:
				var nkeys = [];
				var moveProb = 1; // generate probability of moving away from the spot based on known terrain
				for(var a = 0; a < adj.length; a++){ // for each possible direction
					var pt = addTuple(p, adj[a])
					var nkey = ptToKey(pt);
					if(nkey in this.known){ // if key exists
						if(this.known[nkey] >= 0){ // and if no wall is found, add
							moveProb += 1;
							nkeys.push(nkey);
							propagated[nkey] = this.known[nkey];
						}
					}else if((pt[0] >=0 && pt[1] >= 0) && (pt[0] < 25 && pt[1] < 25)){ // if in unknown state, add it as well
						moveProb += 1;
						nkeys.push(nkey);
						propagated[nkey] = 0;
					}
				}
				moveProb = 1/moveProb; // probability of movement is 1 over all possible actions

				// update all movement options
				propagated[key] = moveProb * this.known[key]; // update probability of not moving
				for(var a = 0; a < nkeys.length; a++){ // for each valid movement key, update probability
					//console.log(moveProb + " $ " + this.known[key]);
					propagated[nkeys[a]] += moveProb * this.known[key];
				}
			}
		}
		//console.log(propagated);
		for(key in propagated){ // transfer over the updated probabilities
			if(propagated[key] < 1){ // limit check on probability
				this.known[key] = propagated[key];
			}else{
				this.known[key] = 1;
			}
		}
	}
}

function findMaxProb(states){ // returns [x, y] of highest probability of player position
	//console.log(states);
	var max = 0;
	var mKey = "";
	for(key in states){
		if(states[key] >= max){
			max = states[key];
			mKey = key;
		}
	}
	//console.log(keyToPt(mKey) + "  " + max);
	return mKey;
}

function probToHex(prob){
	var norm = Math.floor(prob*255);
	var col = (214-norm).toString(16);
	if(col.length < 2){
		col = "0"+col;
	}
	hex = "#" + col + col + "ff";
	//console.log(prob + " " + norm + " " + col + " " + hex);
	return hex;
}

function findTuple(list, tuple){
	for(var a = 0; a < list.length; a++){
		if(list[a][0] == tuple[0] && list[a][1] == tuple[1]){
			return a;
		}
	}
	return -1;
}

function ptToKey(pt){
	// takes point tuple, returns unique string key
	return pt[0].toString() + " " + pt[1].toString();
}

function keyToPt(key){
	// takes key string, returns point tuple
	var xy = key.split(" ");
	return [parseInt(xy[0]), parseInt(xy[1])];
}


