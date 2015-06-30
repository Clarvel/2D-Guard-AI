/*
General Helper scripts

By: Matthew Russell
May 17, 2015

*/

function rad(deg){
	//console.log("Rad: " + deg * Math.PI / 180 + " deg: " + deg);
	return deg * Math.PI / 180;
}

function deg(rad){
	return rad * 180 / Math.PI;
	//
}

function polarize(cartesian){
	//find angle
	var angle = 0;
	if(Math.abs(cartesian[0]) == 0){ 
		angle = rad(-90*Math.sign(cartesian[1]));
	}else{
		angle = Math.atan(cartesian[1]/cartesian[0]);
	}
	if(cartesian[0] > 0){
		angle += rad(180);
	}
	if(angle < 0){
		angle += rad(360);
	}

	//find intensity, min = 0
	var intensity = Math.sqrt(cartesian[0]*cartesian[0] + cartesian[1]*cartesian[1]);

	return [angle, intensity];
}

function popArrayVal(list, index){ // returns new array not containing the indexed val
	out = [];
	for(var a = 0; a < list.length; a++){
		if(a != index){
			out.push(list[a]);
		}
	}
	return out;
}

function rand(min, max){
	return Math.floor((Math.random() * max) + min);
	//
}

function addTuple(a, b){
	out = [0, 0];
	for(var c = 0;  c < 2; c++){
		out[c] = a[c]+b[c];
	}
	//console.log(out);
	return out;
}