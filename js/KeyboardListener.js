/*
total keyboard event listener, 
records all keys pressed in real time as an array of keycodes

By: Matthew Russell
May 17, 2015
*/

keyboard = []; // map of keys by keycode, true if pressed
document.onkeydown = keyPressEvt;
document.onkeyup = keyPressEvt;
function keyPressEvt(e) {
    keyboard[e.keyCode] = e.type == 'keydown';
    //console.log(keyboard);
    //return false; // return false to prevent normal key functions
}
