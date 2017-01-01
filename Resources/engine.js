
//Global variables of the "engine"
var milisecondsBetweenTicks = 10;
var ticksToDecreaseYSpeed = 3;
var player;
var portals;
var platforms;
var world;

//Variables for the control of the player
var startingCharacterX;
var startingCharacterY;
var isLeftPressed;
var isRightPressed;
var playerSpeed = 2;
var playerGravitySpeed = 0;

var playerGravityJump = -10;
var playerGravitySpeedMax = 6;
var gravityTickCounter;

var isTouchingGround = false;

var redirectioningToLink = false;

//Camera variables
var offsetMoveCamera = 150;

//Animation Variables
var animationIndex = 0;
var ticksBetweenAnimationChange = 10;
var ticksPassedFromLastAnimation = 0;
var lastAnimation = "WalkRight"; //WalkRight,WalkLeft,JumpRight,JumpLeft,Idle
var actualAnimation = "WalkRight";

var numMoveRightFrames = 9;
var indexMoveRight = 1;
var numMoveLeftFrames = 9;
var indexMoveLeft = 0;
var numJumpRightFrames = 1;
var indexJumpRight = 3;
var numJumpLeftFrames = 1;
var indexJumpLeft = 2;
var idleFrames = 1;
var indexIdle = 4;

var tileHeight = 64;
var tileWidth = 64; 

var imageHeight=55;
var imageWidth=35;

/** ENGINE **/
function Start(){
	//register elements
	//register player
	var loadedCorrectly = true;
	
	player = document.getElementsByClassName("player");	
	
	if(player.length!=1){ loadedCorrectly = false; }
	else{player = player[0];}
	
	//register portals
	portals = document.getElementsByClassName("portal");	
	console.log("Portals: "+portals.length);
	
	//register portals
	platforms = document.getElementsByClassName("platform");	
	console.log("Platforms: "+platforms.length);
	
	
	world = document.getElementsByClassName("world");	
	if(world.length!=1){ loadedCorrectly = false; }
	else{world = world[0];}
	//initialize whatever needs to be initialized
	
	if(loadedCorrectly==true){
		Initialize();
	}else{
		console.log("Something has gone wrong while loading, check the Start() function of engine.js");
	}
}

function Initialize(){
	startingCharacterY = convertPxString(player.style.top);
	startingCharacterX = convertPxString(player.style.left);
	
	window.setInterval(Tick, milisecondsBetweenTicks);
	//Register the keyboard event
	document.addEventListener('keydown', function(event) {
		if(event.keyCode == 37 || event.keyCode == 65) {
			preventDefault(event);
			LeftPressed();
		}else if(event.keyCode == 39 || event.keyCode == 68) {
			preventDefault(event);
			RightPressed();
		}else if(event.keyCode == 32) {
			preventDefault(event);
			SpacePressed();
		}
	});
	
	document.addEventListener('keyup', function(event) {
		if(event.keyCode == 37 || event.keyCode == 65) {
			LeftReleased();
		}else if(event.keyCode == 39 || event.keyCode == 68) {
			RightReleased();
		}
	});
	
	disable_scroll();
	
	
	gravityTickCounter = 0;
}

function overlaps(x1,y1,w1,h1,x2,y2,w2,h2){
	var AX1 = x1;
	var AX2 = x1+w1;
	var AY1 = y1;
	var AY2 = y1+h1;
	
	var BX1 = x2;
	var BX2 = x2+w2;
	var BY1 = y2;
	var BY2 = y2+h2;
	
	if (AX1 < BX2 && AX2 > BX1 && AY1 < BY2 && AY2 > BY1){
		return true;
	}
	return false;
}

function contains(x1,y1,w1,h1,x2,y2,w2,h2){
	//Returns if the 2nd rectangle contains the first
	var AX1 = x1;
	var AX2 = x1+w1;
	var AY1 = y1;
	var AY2 = y1+h1;
	
	var BX1 = x2;
	var BX2 = x2+w2;
	var BY1 = y2;
	var BY2 = y2+h2;
	
	if(AX1 >=BX1 && AX2<=BX2 && AY1>=BY1 && AY2<=BY2){
		return true;
	}
	return false;
}

function moveOnX(newX){
	var newXPlayer = newX;
	var YPlayer = convertPxString(player.style.top);
	var widthPlayer = convertPxString(player.style.width);
	var heightPlayer = convertPxString(player.style.height);
	
	if(newXPlayer+widthPlayer>=convertPxString(world.style.width)){
		newXPlayer = world.style.width - widthPlayer;
	}else if(newXPlayer<0){
		newXPlayer = 0;
	}else{
		var i;
		for(i = 0;i<platforms.length;i++){
			var XRectangle = convertPxString(platforms[i].style.left);
			var YRectangle = convertPxString(platforms[i].style.top);
			var widthRectangle = convertPxString(platforms[i].style.width);
			var heightRectangle = convertPxString(platforms[i].style.height);
			if (overlaps(newXPlayer,YPlayer,widthPlayer,heightPlayer,XRectangle,YRectangle,widthRectangle,heightRectangle)){
				newXPlayer = convertPxString(player.style.left);
			}
		}
	}
	
	player.style.left = newXPlayer+"px";
	
}

function moveOnY(newY){
	var XPlayer = convertPxString(player.style.left);
	var newYPlayer = newY;
	var widthPlayer = convertPxString(player.style.width);
	var heightPlayer = convertPxString(player.style.height);
	var collisionFound = false;
	if(newYPlayer+heightPlayer>=convertPxString(world.style.height)){
		newYPlayer = world.style.height - heightPlayer;
		playerGravitySpeed = 0;
		isTouchingGround = true;
	}else if(newYPlayer<0){
		newYPlayer = 0;
	}else{
		var i;
		for(i = 0;i<platforms.length;i++){
			var XRectangle = convertPxString(platforms[i].style.left);
			var YRectangle = convertPxString(platforms[i].style.top);
			var widthRectangle = convertPxString(platforms[i].style.width);
			var heightRectangle = convertPxString(platforms[i].style.height);
			if (overlaps(XPlayer,newYPlayer,widthPlayer,heightPlayer,XRectangle,YRectangle,widthRectangle,heightRectangle)){
				collisionFound = true;
				if(((newYPlayer+heightPlayer)>YRectangle) && (newYPlayer < YRectangle)){
					newYPlayer = YRectangle - heightPlayer;
					playerGravitySpeed = 0;
					isTouchingGround = true;
				}else if(((YRectangle+heightRectangle)>newYPlayer) && (YRectangle < newYPlayer)){
					newYPlayer = YRectangle + heightRectangle;
					playerGravitySpeed = 0;
				}
			}
		}
		if(collisionFound==false && playerGravitySpeed!=0){
			isTouchingGround = false;
		}
	}

	
	player.style.top = newYPlayer+"px";
}

function actGravity(){
	gravityTickCounter++;
	if(gravityTickCounter>=ticksToDecreaseYSpeed){
		gravityTickCounter = 0;
		playerGravitySpeed++;
		if(playerGravitySpeed>playerGravitySpeedMax){
			playerGravitySpeed = playerGravitySpeedMax;
		}
	}
}

function goLeft(){
	moveOnX(convertPxString(player.style.left)-playerSpeed);
}

function goRight(){
	moveOnX(convertPxString(player.style.left)+playerSpeed);
}

function goOnY(){
	moveOnY(convertPxString(player.style.top)+playerGravitySpeed);
}

function jump(){
	if(isTouchingGround == true){
		playerGravitySpeed = playerGravityJump;
		if(actualAnimation=="WalkRight"){
			actualAnimation=="JumpRight";
		}else if(actualAnimation=="WalkLeft"){
			actualAnimation=="JumpLeft";
		}else{
			actualAnimation = "JumpRight";
		}
	}
}

function CheckPortals(){
	var i;
	
	var XPlayer = convertPxString(player.style.left);
	var YPlayer = convertPxString(player.style.top);
	var widthPlayer = convertPxString(player.style.width);
	var heightPlayer = convertPxString(player.style.height);
	
	for(i = 0;i<portals.length;i++){
		var XRectangle = convertPxString(portals[i].style.left);
		var YRectangle = convertPxString(portals[i].style.top);
		var widthRectangle = convertPxString(portals[i].style.width);
		var heightRectangle = convertPxString(portals[i].style.height);
		
		if(contains(XPlayer,YPlayer,widthPlayer,heightPlayer,XRectangle,YRectangle,widthRectangle,heightRectangle)){
			window.location = portals[i].getAttribute("href");
			if(hasClass(portals[i],"reload")==true){
				player.style.top = startingCharacterY+"px";
				player.style.left = startingCharacterX+"px";
			}else{
				redirectioningToLink = true;
			}
			
		}
	}
	
}

function hasClass(element,c){
	return element.getAttribute("class").split(" ").indexOf(c) > -1;
}

function Tick(){
	//Function called every tick	
	
	//Check input (keys pressed)
	if(redirectioningToLink==false){
		if(isLeftPressed && !isRightPressed){
			goLeft();
			if(isTouchingGround==true){
				actualAnimation = "WalkLeft";
			}else{
				actualAnimation = "JumpLeft";
			}
		}else if(!isLeftPressed && isRightPressed){
			goRight();
			if(isTouchingGround==true){
				actualAnimation = "WalkRight";
			}else{
				actualAnimation = "JumpRight";
			}
		}else{
			if(isTouchingGround==true){
				actualAnimation = "Idle";
			}
		}
		goOnY();
		actGravity();
		CheckPortals();
	}else{
		actualAnimation = "Idle";
	}
	animation();
	
	checkCamera();
}

function checkCamera(){
	
	var scrolledY = window.scrollY;
	var windowHeight = window.innerHeight;
	var playerHeightTop = convertPxString(player.style.top);
	var playerHeightBottom = convertPxString(player.style.top) + convertPxString(player.style.height);
	
	var scrolledX = window.scrollX;
	var windowWidth = window.innerWidth;
	var playerWidthLeft = convertPxString(player.style.left);
	var playerWidthRight = convertPxString(player.style.left) + convertPxString(player.style.width);
	
	var scrollToX = scrolledX;
	var scrollToY = scrolledY;
	if((playerHeightBottom+offsetMoveCamera)> (scrolledY+windowHeight)){
		scrollToY=(playerHeightBottom+offsetMoveCamera) - windowHeight;
	}
	if((playerHeightTop-offsetMoveCamera)< (scrolledY)){
		scrollToY=(playerHeightTop-offsetMoveCamera);
	}
	if((playerWidthRight+offsetMoveCamera)> (scrolledX+windowWidth)){
		scrollToX = (playerWidthRight+offsetMoveCamera) - windowWidth;
	}
	if((playerWidthLeft-offsetMoveCamera)< (scrolledX)){
		scrollToX=(playerWidthLeft-offsetMoveCamera);
	}
	
	window.scrollTo(scrollToX,scrollToY);
}

/** END ENGINE **/

/** INPUT CONTROL **/
function LeftPressed(){
	isLeftPressed = true;
}

function LeftReleased(){
	isLeftPressed = false;
}

function RightPressed(){
	isRightPressed = true;
}

function RightReleased(){
	isRightPressed = false;
}

function SpacePressed(){
	jump();
}
/** END INPUT CONTROL **/

/** ANIMATION **/
function animation(){
	ticksPassedFromLastAnimation++;
	if(actualAnimation!=lastAnimation){
		ticksPassedFromLastAnimation = ticksBetweenAnimationChange;
		animationIndex = 0;
		lastAnimation = actualAnimation;
	}
	if(ticksPassedFromLastAnimation>=ticksBetweenAnimationChange){
		ticksPassedFromLastAnimation = 0;
		animationIndex++;
		changeFrame();
	}
}

function changeFrame(){
	var offsety = 0;
	var offsetx = 0;
	if(lastAnimation == "WalkRight"){
		if(animationIndex>=numMoveRightFrames){animationIndex = 0;}
		offsety = tileHeight * indexMoveRight;
		
	}else if(lastAnimation == "WalkLeft"){
		if(animationIndex>=numMoveLeftFrames){animationIndex = 0;}
		offsety = tileHeight * indexMoveLeft;
		
	}else if(lastAnimation == "JumpRight"){
		if(animationIndex>=numJumpRightFrames){animationIndex = 0;}
		offsety = tileHeight * indexJumpRight;
		
	}else if(lastAnimation == "JumpLeft"){
		if(animationIndex>=numJumpLeftFrames){animationIndex = 0;}
		offsety = tileHeight * indexJumpLeft;
		
	}else if(lastAnimation == "Idle"){
		if(animationIndex>=idleFrames){animationIndex = 0;}
		offsety = tileHeight * indexIdle;
	}
	offsetx = tileWidth*animationIndex;
	
	//We do the next operations because the div has a size and each sprite of the spritesheet has another one (they are different, so we rest the difference)
	offsety = offsety + (tileHeight-imageHeight);
	offsetx = offsetx + ((tileWidth-imageWidth)/2);
	
	player.style.backgroundPosition = -offsetx+"px "+"-"+offsety+"px";
}
/** END ANIMATION **/

/** UTILS **/
function convertPxString(pxString){
	var splited = pxString.split("px");
	return parseInt(splited[0]);
}

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}


function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}

function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;  
}

/** END UTILS **/
