//Known bugs: 
//pots cause infinite loops - fixed using splice
//points on end of lines make balls stop


//some physical constants 
const FRICTION = 0.0;//friction coefficient to slow down balls each frame
const RESTITUTION = 1.0;//coefficient of restitution for ball collisions
const RESTITUTION_S = 1.0;//coeff restitution of balls on cushon
const FPS = 60.0;//frames per second
const SIZE_X = 1000;//size of the table
const SIZE_Y = 500;
const ball_size = 20;//size of the balls
const hole_size = 24;//size of holes
const ballColours = new Array("white","yellow","darkblue","red","purple","orange","darkgreen","maroon","black","yellow","darkblue","red","purple","orange","darkgreen","maroon");
const startCoordsX = new Array(500,300,300,335,265,265,265,230,230,230,230,195,195,195,195,195);
const startCoordsY = new Array(310,290,330,310,270,350,310,250,370,290,330,230,270,310,350,390);

//some program information
const SVGNS = "http://www.w3.org/2000/svg";//the namespace for SVG drawings
const dbalerts = 0;//if 1, debug alert messages can show

var container;//div the table is drawn in

//stuff for calculating power of shot
var pressTime = 0;
var startPress = 0;

//the balls themselves, these are just svg elements with additional properties
var balls = new Array();

//some physical stuff that interact with the balls
var collisionlines = new Array();
var collisionpoints = new Array();//at the end of each collision line
var pocketholes = new Array();

//number of perimeter sensors (one for each side(4)? one for all sides(1)? etc)  
var perimeter = 1;

//stuff for calculating collision mechanics (earliest collisions happen first between frames)
var ts = new Array();

var Ball = function(e){//consider OOD approach
}

var Line = function(e){
}

var Point = function(e){
}

var Hole = function(e){
}

//additional stuff can be created here


function myalert(str){
	if(dbalerts == 1){
		alert(str);
	}
}

function assert(prop,message){
	if(prop === false){
		alert(message);
	}
}

//::MEMBER FUNCTIONS
//set a new position of a ball
function setBallPosition(ball,x,y){
/*	ball.setAttribute("cx",x);
	ball.setAttribute("cy",y);
	ball.centre.setAttribute("cx",x);
	ball.centre.setAttribute("cy",y);
	ball.text.setAttribute("x",x);
	ball.text.setAttribute("y",y);
	if(ball.number > 8){
		//set stripe masks
		ball.stripewhite.setAttribute("cx",x);
		ball.stripewhite.setAttribute("cy",y);
		ball.stripemask.setAttribute("x",x-ball_size);
		ball.stripemask.setAttribute("y",y-ball_size);
		ball.stripemask.rect1.setAttribute("x",x-ball_size);
		ball.stripemask.rect1.setAttribute("y",y-ball_size);
		ball.stripemask.rect2.setAttribute("x",x-ball_size)
		ball.stripemask.rect2.setAttribute("y",y+(2/3)*ball_size);
	}*/
	ball.setAttribute("x",x-ball_size);
	ball.setAttribute("y",y-ball_size);
}

function getBallPositionX(ball){
	return parseFloat(ball.getAttribute("x"),10) + ball_size;
}

function getBallPositionY(ball){
	return parseFloat(ball.getAttribute("y"),10) + ball_size;
}

function ballToString(ball){
	var cx = getBallPositionX(ball);
	var cy = getBallPositionY(ball);
	var str = ball.getAttribute("id")+": old=("+cx+","+cy+"), new=("+ball.ncx+","+ball.ncy+"), speed=("+ball.speedx+","+ball.speedy+
			"), pos=("+ball.px+","+ball.py+"), fs=("+ball.pspeedx+","+ball.pspeedy+")";
	return str;
}

function ballDraw(ball){
	//set attribute
}

function setBallInUse(ball,b){
	ball.inuse = b;
}

function pot(ball){
	setBallInUse(ball,false);
	ball.setAttribute("style","display:none");
	ball.speedx = 0;
	ball.speedy = 0;
	ball.pspeedx = 0;
	ball.pspeedy = 0;
	ball.setAttribute("cx",1000);
	ball.px = 0;
	ball.py = 0;
	var index = balls.indexOf(ball);
	balls.splice(index,1);
	
}

//initialise table + balls
//firstly, place a pool table looking thing inside the div container.
//second, draw a bunch of balls and store their references into an array
//thirdly, give the balls some additional data such as their speeds and  directions
function init(){
	//TODO: use DOM tools instead of inputting text as it's "bad practise" 
	var container = document.getElementById("pooltable");
	var table = document.createElementNS(SVGNS,"svg")
	table.setAttribute("width",SIZE_X);
	table.setAttribute("height",SIZE_Y);
	table.setAttribute("id","table");
	container.appendChild(table);
	var carpet = document.createElementNS(SVGNS,"rect");
	carpet.setAttribute("x",0);
	carpet.setAttribute("y",0);
	carpet.setAttribute("width",SIZE_X);
	carpet.setAttribute("height",SIZE_Y);
	carpet.setAttribute("fill","green");
	table.appendChild(carpet);
	table.addEventListener("mousedown",function(evt){mouseDown(evt);});
	table.addEventListener("mouseup",function(evt){mouseUp(evt);});
	var hole1 = document.createElementNS(SVGNS,"circle");
	hole1.setAttribute("cx",hole_size);
	hole1.setAttribute("cy",hole_size);
	hole1.setAttribute("r",hole_size);
	hole1.setAttribute("fill","black");
	table.appendChild(hole1);
	var hole2 = document.createElementNS(SVGNS,"circle");
	hole2.setAttribute("cx",SIZE_X - hole_size);
	hole2.setAttribute("cy",hole_size);
	hole2.setAttribute("r",hole_size);
	hole2.setAttribute("fill","black");
	table.appendChild(hole2);
	var hole3 = document.createElementNS(SVGNS,"circle");
	hole3.setAttribute("cx",hole_size);
	hole3.setAttribute("cy",SIZE_Y - hole_size);
	hole3.setAttribute("r",hole_size);
	hole3.setAttribute("fill","black");
	table.appendChild(hole3);
	var hole4 = document.createElementNS(SVGNS,"circle");
	hole4.setAttribute("cx",SIZE_X - hole_size);
	hole4.setAttribute("cy",SIZE_Y - hole_size);
	hole4.setAttribute("r",hole_size);
	hole4.setAttribute("fill","black");
	table.appendChild(hole4);
	var hole5 = document.createElementNS(SVGNS,"circle");
	hole5.setAttribute("cx",SIZE_X/2);
	hole5.setAttribute("cy",SIZE_Y-hole_size);
	hole5.setAttribute("r",hole_size);
	hole5.setAttribute("fill","black");
	table.appendChild(hole5);
	var hole6 = document.createElementNS(SVGNS,"circle");
	hole6.setAttribute("cx",SIZE_X/2);
	hole6.setAttribute("cy",hole_size);
	hole6.setAttribute("r",hole_size);
	hole6.setAttribute("fill","black");
	table.appendChild(hole6);
	pocketholes.push(hole1);
	pocketholes.push(hole2);
	pocketholes.push(hole3);
	pocketholes.push(hole4);
	pocketholes.push(hole5);
	pocketholes.push(hole6);
	//alert(pocketholes.length);
	var maskstuff = document.createElementNS(SVGNS,"defs");
	var mask = document.createElementNS(SVGNS,"mask");
	mask.setAttribute("x",0);
	mask.setAttribute("y",0);
	mask.setAttribute("width",ball_size*2);
	mask.setAttribute("height",ball_size*2);
	mask.setAttribute("id","billiardballmask");
	var mrect1 = document.createElementNS(SVGNS,"rect");
	var mrect2 = document.createElementNS(SVGNS,"rect");
	mrect1.setAttribute("x",0);
	mrect1.setAttribute("y",0);
	mrect1.setAttribute("width",ball_size*2);
	mrect1.setAttribute("height",ball_size/2);
	mrect1.setAttribute("fill","white");
	mrect2.setAttribute("x",0);
	mrect2.setAttribute("y",ball_size*3.0/2.0);
	mrect2.setAttribute("width",ball_size*2);
	mrect2.setAttribute("height",ball_size/2);
	mrect2.setAttribute("fill","white");
	mask.appendChild(mrect1);
	mask.appendChild(mrect2);
	maskstuff.appendChild(mask);
	table.appendChild(maskstuff);
	for(var i = 0; i < 16; i++){//balls
		balls[i] = document.createElementNS(SVGNS,"svg");
		balls[i].setAttribute("x",startCoordsX[i]);
		balls[i].setAttribute("y",startCoordsY[i]);
		balls[i].setAttribute("width",ball_size*2);
		balls[i].setAttribute("height",ball_size*2);
		balls[i].setAttribute("class","billiardball");
		var back = document.createElementNS(SVGNS,"circle");
		back.setAttribute("cx",ball_size);
		back.setAttribute("cy",ball_size);
		back.setAttribute("r",ball_size);
		back.setAttribute("fill",ballColours[i]);
		back.setAttribute("class","billiardballback");
		var dot = document.createElementNS(SVGNS,"circle");
		dot.setAttribute("cx",ball_size);
		dot.setAttribute("cy",ball_size);
		dot.setAttribute("r",ball_size/2);
		dot.setAttribute("fill","white");
		dot.setAttribute("class","billiardballdot");
		var text = document.createElementNS(SVGNS,"text");
		text.setAttribute("x",ball_size);
		text.setAttribute("y",ball_size);
		var tstr = -(ball_size/4)+","+(ball_size/4);
		if(i>9){
			tstr = -(ball_size/2.1)+","+(ball_size/4);
		}
		text.setAttribute("transform","translate("+tstr+")");
		text.setAttribute("fill","black");
		text.setAttribute("class","billiardballnumber");
		text.innerHTML = i;
		balls[i].appendChild(back);
		balls[i].appendChild(dot);
		balls[i].appendChild(text);
		if(i>8){
			var stripes = document.createElementNS(SVGNS,"circle");
			stripes.setAttribute("cx",ball_size);
			stripes.setAttribute("cy",ball_size);
			stripes.setAttribute("r",ball_size);
			stripes.setAttribute("fill","white");
			stripes.setAttribute("class","billiardballstripes");
			stripes.setAttribute("mask","url(#billiardballmask)");
			balls[i].appendChild(stripes);
		}
		table.appendChild(balls[i]);
	}

	//mechanics
	for(var i = 0; i < balls.length; i++){
		balls[i].speedx = 0;
		balls[i].speedy = 0;
		balls[i].ncx = 0.0;
		balls[i].ncx = 0.0;
		balls[i].inuse = true;
		setBallPosition(balls[i],startCoordsX[i],startCoordsY[i]);
	}
	
	//draw a dummy line
	var line = document.createElementNS(SVGNS,"line");
	line.setAttribute("x1",600);
	line.setAttribute("y1",100);
	line.setAttribute("x2",650);
	line.setAttribute("y2",500);
	line.setAttribute("stroke","red");
	line.collideable = true;
	line.restitution = 1.0;//max bounce
	line.p1x = 600;
	line.p1y = 100;
	line.p2x = 650;
	line.p2y = 500;
	table.appendChild(line);
	collisionlines[0] = line;
	//dummy point
	var point = document.createElementNS(SVGNS,"circle");
	point.setAttribute("cx",600);
	point.setAttribute("cy",100);
	point.setAttribute("r",1);
	point.setAttribute("fill","white");
	point.collideable = true;
	point.restitution = 1.0;
	point.x = 600;
	point.y = 100;
	table.appendChild(point);
	collisionpoints.push(point);
/*	var point2 = new Object();
	point2.collideable = true;
	point2.restitution = 1.0;
	point2.x = 600;
	point2.y = 100;
	collisionpoints.push(point2);*/
	//balls[0].speedx = -2;
	//collisionpoints[1] = new Point(600,150);
	
	//balls[0].speedy = -10;
	for(var i = 0; i < pocketholes.length; i++){
		pocketholes[i].x = pocketholes[i].getAttribute("cx");
		pocketholes[i].y = pocketholes[i].getAttribute("cy");
	}
}

/*
var Point = function(x,y){
	this.x = x;
	this.y = y;
}*/

function friction(){
	var f = 1.0-FRICTION;
	for(var i = 0; i < balls.length; i++){
		balls[i].speedx = f*balls[i].speedx;
		balls[i].speedy = f*balls[i].speedy;
		if(Math.pow(balls[i].speedx,2) + Math.pow(balls[i].speedy,2) < FRICTION){
			balls[i].speedx = 0;
			balls[i].speedy = 0;
		} 
	}
}

function testbounds(t){
	for(var i = 0; i < balls.length; i++){
		var cx = getBallPositionX(ball);
		var cy = getBallPositionY(ball);		
		if(cx < ball_size){
			alert("fail: tbreak="+t+", "+ballToString(balls[i]));
		}
		if(cx > SIZE_X - ball_size){
			alert("fail: tbreak="+t+", "+ballToString(balls[i]));
		}
		if(cy < ball_size){
			alert("fail: tbreak="+t+", "+ballToString(balls[i]));
		}
		if(cy > SIZE_Y - ball_size){
			alert("fail: tbreak="+t+", "+ballToString(balls[i]));
		}
	}
}

//make balls move (and collide) according to their speeds and directions
function animate(){
	
	var smallestt = 0;//used in calculating next collision in frame
	var smallesti = 0;//if two collisions happen at similar times these 
	var smallestj = 0;//variables can be used to calculate the outcome of all
	var tbreak = 0;//time of last collision 
	var collide = 1;
	var pcollide = 0;
	var lasti = -1;
	var lastj = -1;
	var i = 0;
	var j = 0;
	var tick = 0;
	for(i = 0; i < balls.length; i++){//initial start positions and speeds
		if(balls[i].inuse == false){
			continue;
		}
		balls[i].px = getBallPositionX(balls[i]);
		balls[i].py = getBallPositionY(balls[i]);
		balls[i].pspeedx = balls[i].speedx;
		balls[i].pspeedy = balls[i].speedy;
		balls[i].ncx = balls[i].px + balls[i].pspeedx;//current partframe position + part speed
		balls[i].ncy = balls[i].py + balls[i].pspeedy;	
	}
	
	while(collide == 1 && tbreak < 1.0){
		if(tick > 0){
			pcollide = collide;
		}
		tick++;
		collide = 0;
		smallestt = 0;
		smallesti = 0;
		smallestj = 0;
		//reset collision matrix
		for(i = 0; i < balls.length + perimeter + collisionlines.length + collisionpoints.length + pocketholes.length; i++){
			for(j = 0; j < balls.length; j++){

	//			collisions[i*balls.length + j] = 0;
				ts[i*balls.length + j] = 2;
			}
		}
		
		
		//collision detection - detect if two balls collide and ammend their new speeds and places if they do. 
		//first: work out where the balls end up in the next frame.
		//Get their speeds and their distances from eachother. if they are not able to collide in this frame they can be ignored
		//Next, test if they actually collide. If they don't, ignore them for this frame. 
		//Find the time of the collision and angle of contact on the balls to work out the energy transfer.
		//Update the new positions and the new speeds and repeat until all collisions have been accounted for
		
		//objective: Work out the new place for next frame:
/*		for(i = 0; i < balls.length; i++){
			balls[i].ncx = balls[i].px + balls[i].pspeedx;//current partframe position + part speed
			balls[i].ncy = balls[i].py + balls[i].pspeedy;
		}*/
		
		//test their speed and position for possible collisions
		//if two balls speeds are larger than their distance from eachother, they may collide in this frame
/*		for(i = 0; i < balls.length; i++){
			var cx1 = balls[i].px;//lucky this is stored as a float!
			var cy1 = balls[i].py;
			var speed1 = Math.sqrt(Math.pow(balls[i].pspeedx,2) + Math.pow(balls[i].pspeedy,2));

			for(j = 0; j < i; j++){
				var cx2 = parseFloat(balls[j].getAttribute("cx"),10);//lucky this is stored as a float!
				var cy2 = parseFloat(balls[j].getAttribute("cy"),10);
			
				var dist = Math.sqrt(Math.pow(cx1 - cx2,2) + Math.pow(cy1 - cy2,2));
				var speed2 = Math.sqrt(Math.pow(balls[j].pspeedx,2) + Math.pow(balls[j].pspeedy,2));
				if(dist <= speed1 + speed2 + ball_size*2){
					//Potential collision
					collisions[i*balls.length + j] = 1;
					collisions[j*balls.length + i] = 1;
				}
			}
		}*/
		
		//Get the point of contact and the value of t that they collided at distance d to work out new positions and speeds
		//METHOD: put lines into form r = a + tb. then dist(a1 + tb1 , a2+tb2), where a1 = (x11,y11), b1 = (x12,y12), 
		//a2 = (x21,y21), b2 = (x22,y22). thus, sqrt(((x11 + tx12) - (x21 - tx22))^2 + ((y11 + ty12) - (y21 - ty22))^2) = d
		// ** + square both sides of =
		//=> ((x11 - x21) +t(x12 - x22))^2 + ((y11 - y21) +t(y12 - y22))^2 = d^2
		// ** more re arrangement gives a nice quad of at^2 + bt + c = d^2. 
		for(i = 0; i < balls.length; i++){
			for(j = 0; j < balls.length; j++){
			//	if(collisions[i*balls.length + j] == 1){
					if((balls[i].inuse || balls[j].inuse) == false){
						continue;
					}
					var bcxi = balls[i].px;
					var bcxj = balls[j].px;
					var bcyi = balls[i].py;
					var bcyj = balls[j].py;
					//give values (some magic i worked out here :) )
					var n1 = bcxi - bcxj;//ax1 = cx(i), bx1 = cx(j), ax2 = ncx(i) - cx(i), bx2 =
					var n3 = bcyi - bcyj;
					var n2 = (balls[i].ncx - bcxi) -  (balls[j].ncx - bcxj);
					var n4 = (balls[i].ncy - bcyi) -  (balls[j].ncy - bcyj);
					var a = (n2*n2) + (n4*n4);
					var b = 2*(n1*n2 + n3*n4);
					var c = (n1*n1) + (n3*n3) - (4*ball_size*ball_size);
					var det = Math.pow(b,2) - 4*a*c;
					//myalert(a+"t^2 + "+b+"t + "+c+", det="+det);
					//quad eq to find t with a,b and c
					if(det <= 0){
						//balls don't collide - no intersection point
		//				collisions[i*balls.length + j] = 0;
			//			collisions[j*balls.length + i] = 0;
					}else{
						//find their collision point (smallest positive) since t = time :D
						var t = 0; 
						var t1 = (-b - Math.sqrt(Math.pow(b,2) - 4*a*c))/(2*a);
						t = t1;
	//					var t2 = (-b + Math.sqrt(Math.pow(b,2) - 4*a*c))/(2*a);
/*						var tt1 = 3;
						var tt2 = 3;
						if(t1 > 0){
							tt1 = t1;
						}
						if(t2 > 0){
							tt2 = t2;
						}
						t = tt1 < tt2 ? tt1 : tt2;*/
						//myalert("t1 = "+t1+", t2 = "+t2+", t = "+t);
						if(t <= 1 && t >= 0){
							//collision point
							ts[i*balls.length + j] = t;
							ts[j*balls.length + i] = t;
							collide = 1;//collision has happened here
						}else{
							//no collision in this particular frame
			//				collisions[i*balls.length + j] = 0;
				//			collisions[j*balls.length + i] = 0;
						}
					}
			//	}
			}
		}
		
		//detect wall bounces
		for(i = 0; i < balls.length; i++){
			//myalert(ball);
			if(balls[i].inuse == false){
				continue;
			}
			var cx = balls[i].px;
			var cy = balls[i].py;
			balls[i].ncx = cx+balls[i].pspeedx;//the remaining frame speed
			balls[i].ncy = cy+balls[i].pspeedy;
			if(balls[i].ncx < 0.0 + ball_size){
				//bounce off left cushon
				//find t for comparing collisions
				ts[balls.length * balls.length + i] = (Math.abs(cx - ball_size)/Math.abs(balls[i].pspeedx));
				collide = 1;
			}else 
			if(balls[i].ncx > SIZE_X - ball_size){
				//bounce off right cushon
				ts[balls.length * balls.length + i] = (Math.abs(SIZE_X - ball_size - cx)/Math.abs(balls[i].pspeedx));
				collide = 1;
			}else 
			if(balls[i].ncy < 0.0 + ball_size){
				//bounce off top cushon	
				ts[balls.length * balls.length + i] = (Math.abs(cy - ball_size)/Math.abs(balls[i].pspeedy));
				collide = 1;
			}else 
			if(balls[i].ncy > SIZE_Y - ball_size){
				//bounce off bottom cushon
				ts[balls.length * balls.length + i] = (Math.abs(SIZE_Y - ball_size - cy)/Math.abs(balls[i].pspeedy));
				collide = 1;
			}
		}
		
		//detect line collisions
		for(i = 0; i < collisionlines.length; i++){
			for(j = 0; j < balls.length; j++){
				if(balls[j].inuse == false){
					continue;
				}
				var ball = balls[j];
				var line = collisionlines[i];
				//alert(ballToString(ball));				
				var x2 = line.p2x;
				var x1 = line.p1x;
				var x0 = ball.px;
				var y2 = line.p2y;
				var y1 = line.p1y;
				var y0 = ball.py;
				var dx = ball.ncx - ball.px;
				var dy = ball.ncy - ball.py;
				/**
				 * x0 = px + t.dx
				 * y0 = py + t.dy
				 * ::::WORKING::::
				 * dist = Math.abs((y2-y1)*(px + t.dx) - (x2-x1)*(py + t.dy) + x2*y1 - y2*x1)/D;
				 * dist = Math.abs((y2-y1)*(px) + (y2-y1)*(t.dx) - (x2-x1)*(py) - (x2-x1)(t.dy) + x2*y1 - y2*x1)/D;
				 * dist = Math.abs((y2-y1)*(px) - (x2-x1)*(py)  + t((y2-y1)*dx - (x2-x1)dy) + x2*y1 - y2*x1)/D;
				 * dist*d = Math.abs((y2-y1)*(px) - (x2-x1)*(py)  + t((y2-y1)*dx - (x2-x1)dy) + x2*y1 - y2*x1); //square to get rid of abs
				 * Math.pow(dist*d,2) = Math.pow((y2-y1)*(px) - (x2-x1)*(py) + x2*y1 - y2*x1  + t((y2-y1)*dx - (x2-x1)dy),2);
				 * Math.pow((y2-y1)*(px) - (x2-x1)*(py) + x2*y1 - y2*x1 + t((y2-y1)*dx - (x2-x1)dy),2) - Math.pow(dist*d,2) = 0;
				 * var A = (y2-y1)*(px) - (x2-x1)*(py) + x2*y1 - y2*x1;
				 * var B = (y2-y1)*dx - (x2-x1)dy;
				 * var C = Math.pow(dist*d,2);
				 * Math.pow(A + t.B,2) - C = 0;
				 * Math.pow(t.B,2) + t.2.A.B + Math.pow(A,2) - C = 0;
				 * a = B^2
				 * b = 2.A.B
				 * c = A^2 - C
 				 */
				var D = Math.sqrt(Math.pow(y2-y1,2) + Math.pow(x2-x1,2));
				var A = (y2-y1)*(x0) - (x2-x1)*(y0) + x2*y1 - y2*x1;
				var B = (y2-y1)*dx - (x2-x1)*dy;
				var C = Math.pow(ball_size*D,2);
				var a = Math.pow(B,2);
				var b = 2*A*B;
				var c = Math.pow(A,2) - C;
				var det = Math.pow(b,2) - 4*a*c;
				if(det < 0){
					//no collision 
				}else{
					var time = (-b - Math.sqrt(Math.pow(b,2) - 4*a*c))/(2*a);
					//alert("time of intersect = "+time);
					if(time >= 0 && time < 1){
						//test if ball hits the line
						//projection or intersection?
						//projection: 
						var px = x0 + time*dx;
						var py = y0 + time*dy;
						//point: (px,py)
						//line: (x1,y1) + t(x2-x1,y2-y1)
						//dot prod must be 0: 
						//(x2-x1,y2-y1) . (x1-px + t(x2-x1),y1-py + t(y2-y1)) = 0
						//(x2-x1)(x1-px + t(x2-x1)) + (y2-y1)(y1-py + t(y2-y1)) = 0
						//(x2-x1)(x1-px) + t(x2-x1)(x2-x1) + (y2-y1)(y1-py) + t(y2-y1)(y2-y1) = 0
						//t((x2-x1)^2 + (y2-y1)^2) = -((x2-x1)(x1-px) + (y2-y1)(y1-py))
						//t = -((x2-x1)(x1-px) + (y2-y1)(y1-py))/((x2-x1)^2 + (y2-y1)^2)
						var t = -((x2-x1)*(x1-px) + (y2-y1)*(y1-py))/(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
						var projx = x1 + t*(x2-x1);
						var projy = y1 + t*(y2-y1);
						var d = Math.sqrt(Math.pow(projx - px,2) + Math.pow(projy - py,2));
						//alert("Ball pos = ("+px+","+py+"), point on line = ("+projx+","+projy+"), dist="+d);
						if(Math.min(x1,x2) <= projx && projx <= Math.max(x1,x2) // if it actually hits the line
							&& Math.min(y1,y2) <= projy && projy <= Math.max(y1,y2)){
							ts[(balls.length + perimeter + i)*balls.length + j] = time;
							collide = 1;
						}
				//		alert("noted  line intersection");
					}
				}
			}
		}
		
		//detect collision points
		for(i = 0; i < collisionpoints.length; i++){
			for(j = 0; j < balls.length; j++){
				if(balls[j].inuse == false){
					continue;
				}
				var bcxi = collisionpoints[i].x;
				var bcxj = balls[j].px;
				var bcyi = collisionpoints[i].y;
				var bcyj = balls[j].py;
				//give values (some magic i worked out here :) )
				var n1 = bcxi - bcxj;//ax1 = cx(i), bx1 = cx(j), ax2 = ncx(i) - cx(i), bx2 =
				var n3 = bcyi - bcyj;
				var n2 = (0) -  (balls[j].ncx - bcxj);
				var n4 = (0) -  (balls[j].ncy - bcyj);
				var a = (n2*n2) + (n4*n4);
				var b = 2*(n1*n2 + n3*n4);
				var c = (n1*n1) + (n3*n3) - (ball_size*ball_size);
				var det = Math.pow(b,2) - 4*a*c;
				//myalert(a+"t^2 + "+b+"t + "+c+", det="+det);
				//quad eq to find t with a,b and c
				if(det <= 0){
					//balls don't collide - no intersection point
	//				collisions[i*balls.length + j] = 0;
		//			collisions[j*balls.length + i] = 0;
				}else{
					//find their collision point (smallest positive) since t = time :D
					var t = 0; 
					var t1 = (-b - Math.sqrt(Math.pow(b,2) - 4*a*c))/(2*a);
					t = t1;
//					var t2 = (-b + Math.sqrt(Math.pow(b,2) - 4*a*c))/(2*a);
/*						var tt1 = 3;
					var tt2 = 3;
					if(t1 > 0){
						tt1 = t1;
					}
					if(t2 > 0){
						tt2 = t2;
					}
					t = tt1 < tt2 ? tt1 : tt2;*/
					//myalert("t1 = "+t1+", t2 = "+t2+", t = "+t);
					if(t <= 1 && t >= 0){
						//collision point
						ts[(balls.length + perimeter + collisionlines.length + i)*balls.length + j] = t;
						//ts[j*balls.length + i] = t;
						collide = 1;//collision has happened here
					}else{
						//no collision in this particular frame
		//				collisions[i*balls.length + j] = 0;
			//			collisions[j*balls.length + i] = 0;
					}
				}
			}
		}
		
		//detect pocket sinks
		for(i = 0; i < pocketholes.length; i++){
			for(j = 0; j < balls.length; j++){
				if(balls[j].inuse == false){
					continue;
				}
				var bcxi = pocketholes[i].x;
				var bcxj = balls[j].px;
				var bcyi = pocketholes[i].y;
				var bcyj = balls[j].py;
				//give values (some magic i worked out here :) )
				var n1 = bcxi - bcxj;//ax1 = cx(i), bx1 = cx(j), ax2 = ncx(i) - cx(i), bx2 =
				var n3 = bcyi - bcyj;
				var n2 = (0) -  (balls[j].ncx - bcxj);
				var n4 = (0) -  (balls[j].ncy - bcyj);
				var a = (n2*n2) + (n4*n4);
				var b = 2*(n1*n2 + n3*n4);
				var c = (n1*n1) + (n3*n3) - (hole_size*hole_size);
				var det = Math.pow(b,2) - 4*a*c;
				//myalert(a+"t^2 + "+b+"t + "+c+", det="+det);
				//quad eq to find t with a,b and c
				if(det <= 0){
					//balls don't collide - no intersection point
	//				collisions[i*balls.length + j] = 0;
		//			collisions[j*balls.length + i] = 0;
				}else{
					//find their collision point (smallest positive) since t = time :D
					var t = 0; 
					var t1 = (-b - Math.sqrt(Math.pow(b,2) - 4*a*c))/(2*a);
					t = t1;
					if(t <= 1 && t >= 0){
						//collision point
						ts[(balls.length + perimeter + collisionlines.length + collisionpoints.length + i)*balls.length + j] = t;
						//ts[j*balls.length + i] = t;
						//alert("ball "+j+" has pocketed in pocket "+i);
						collide = 1;//collision has happened here
					}else{
						//no collision in this particular frame
		//				collisions[i*balls.length + j] = 0;
			//			collisions[j*balls.length + i] = 0;
					}
				}
			}
		}
		
		//end of detection 
		
		
		//find smallest t
		//set a centre point for all balls once smallest collision has been found and use this each calculation
		smallestt = 2;//all ts between 0 and 1
		for(i = 0; i < balls.length + perimeter + collisionlines.length + collisionpoints.length + pocketholes.length; i++){
			for(j = 0; j < balls.length; j++){
				if(ts[i*balls.length + j] < smallestt && ts[i*balls.length + j] >= 0 && i != lasti && j != lastj ){
					smallesti = i;
					smallestj = j;
					smallestt = ts[i*balls.length + j];
				}
			}
		}
		//lasti = smallesti;//causes ghosting :(
		//lastj = smallestj;//balls actually escape though walls with this
		if(i > balls.length + perimeter + collisionlines.length + collisionpoints.length){
			lasti = i;
		}else{
			lasti = -1;
		}
		if(smallestt > 1 || smallestt < 0 || collide == 0){
		//	myalert("smallest t bigger than 1! = "+smallestt);
			break;//exit loop correcting speeds and positions
		}
		
		tbreak += (1-tbreak)*smallestt;//last point in time a collision began (from 0 to 1 between frames)
		if(tbreak < 0 || tbreak > 1){
			alert("tbreak wrong, = "+tbreak);
		}
		for(i = 0; i < balls.length; i++){
			if(balls[i].inuse == false){
				continue;
			}
			balls[i].px = balls[i].px + balls[i].pspeedx*smallestt;
			balls[i].py = balls[i].py + balls[i].pspeedy*smallestt;
			balls[i].pspeedx = balls[i].pspeedx*(1-smallestt);
			balls[i].pspeedy = balls[i].pspeedy*(1-smallestt);
			balls[i].ncx = balls[i].px + balls[i].pspeedx;
			balls[i].ncy = balls[i].py + balls[i].pspeedy;
		}
		
		if(smallesti >= balls.length && smallesti < balls.length + perimeter){//bounced off side
			if(balls[smallestj].inuse == false){
				continue;
			}
			//perform wall bounces
			//when the ball hits into a cushon, this corrects where it will be on the next frame
			//For example:  
			//      table width is 100
			//	ball radius is 5
			//	position x = 94 
			//	speed x = 8
			// THEN: boundary = 100-5, new position x = 102
			// BUT 102 is 7 bigger than 95 so it has moved backwards by -7
			// new position = 95 - 7
			//in the next frame it must be at 88 heading in the opposite direction (since it bounced between frames) 
			if(balls[smallestj].ncx < 0 + ball_size){
				//bounce off left cushon=
				//find t for comparing collisions
				balls[smallestj].pspeedx = balls[smallestj].pspeedx*RESTITUTION_S*(-1);
				balls[smallestj].px = 0 + ball_size;
				balls[smallestj].ncx = ball_size + balls[smallestj].pspeedx;
				if(balls[smallestj].ncx < ball_size){
					alert("new x position of "+balls[smallestj].getAttribute("id")+
					" too small, "+balls[smallestj].ncx);
				}
			}else
			if(balls[smallestj].ncx > SIZE_X - ball_size){
				//bounce off right cushon
				balls[smallestj].pspeedx = balls[smallestj].pspeedx*RESTITUTION_S*(-1);
				balls[smallestj].px = SIZE_X - ball_size;
				balls[smallestj].ncx = balls[smallestj].px + balls[smallestj].pspeedx;
				if(balls[smallestj].ncx > SIZE_X - ball_size){
					alert("new x position of "+balls[smallestj].getAttribute("id")+" too big");
				}
			}else 
			if(balls[smallestj].ncy < 0 + ball_size){
				//bounce off top cushon	
				balls[smallestj].pspeedy = balls[smallestj].pspeedy*RESTITUTION_S*(-1);
				balls[smallestj].py = 0 + ball_size;
				balls[smallestj].ncy = balls[smallestj].py + balls[smallestj].pspeedy;
				if(balls[smallestj].ncy < ball_size){
					alert("new y position of "+balls[smallestj].getAttribute("id")+" too small");
				}
			}else 
			if(balls[smallestj].ncy > SIZE_Y - ball_size){
				//bounce off bottom cushon
				balls[smallestj].pspeedy = balls[smallestj].pspeedy*RESTITUTION_S*(-1);
				balls[smallestj].py = SIZE_Y - ball_size;
				balls[smallestj].ncy = balls[smallestj].py + balls[smallestj].pspeedy;
				if(balls[smallestj].ncy > SIZE_Y - ball_size){
					alert("new y position of "+balls[smallestj].getAttribute("id")+" too large");
				}
			}
		}else if(smallesti >= balls.length + perimeter 
				&& smallesti < balls.length + perimeter + collisionlines.length){//bounced off a line
		//		alert("ball hit line");
			var line = collisionlines[smallesti - balls.length - perimeter];
			var ball = balls[smallestj];
			var linex = line.p2x - line.p1x;
			var liney = line.p2y - line.p1y;
			var nx = -liney;
			var ny = linex;
			var nd = Math.sqrt(Math.pow(nx,2)+Math.pow(ny,2));
			var vx = ball.pspeedx;
			var vy = ball.pspeedy; 
			nx = nx/nd;//unit vector
			ny = ny/nd;
			var dp = vx*nx + vy*ny;
			var ux = dp*nx;
			var uy = dp*ny;
			var wx = vx - ux;
			var wy = vy - uy;
			ball.pspeedx = wx - RESTITUTION_S*ux;
			ball.pspeedy = wy - RESTITUTION_S*uy;
			ball.ncx = ball.px + ball.pspeedx;
			ball.ncy = ball.py + ball.pspeedy; 
		}else if(smallesti >= balls.length + perimeter + collisionlines.length &&
				smallesti < balls.length + perimeter + collisionlines.length + collisionpoints.length ){
					//bounced off point
			//		alert("ball hit point");
			var ball = balls[smallestj];
			var point = collisionpoints[smallesti - (balls.length + perimeter + collisionlines.length)];
			var nx = point.x - ball.px;
			var ny = point.y - ball.py;
			var nd = Math.sqrt(Math.pow(nx,2)+Math.pow(ny,2));
			var vx = ball.pspeedx;
			var vy = ball.pspeedy;
			nx = nx/nd;//unit vector
			ny = ny/nd;
			
			var dp = vx*nx + vy*ny;
			var ux = dp*nx;
			var uy = dp*ny;
			var wx = vx - ux;
			var wy = vy - uy;
			ball.pspeedx = wx - RESTITUTION_S*ux;
			ball.pspeedy = wy - RESTITUTION_S*uy;
			ball.ncx = ball.px + ball.pspeedx;
			ball.ncy = ball.py + ball.pspeedy;
//
			
		}else if(smallesti >= balls.length + perimeter + collisionlines.length + collisionpoints.length){
			//"pocketed"
			pot(balls[smallestj]);
		}else{
			//perform collision of smallest point and find end points + speeds of balls
		//	if(collisions[smallesti*balls.length + smallestj] == 1){
				var t = smallestt;
				var ball1 = balls[smallesti];
				var ball2 = balls[smallestj];
				if(ball1.inuse == false || ball2.inuse == false){
					continue;
				}
/*				var cx11 = ball1.px;
				var cy11 = ball1.py;
				var cx21 = ball2.px;
				var cy21 = ball2.py;
				var cx12 = ball1.pspeedx;
				var cy12 = ball1.pspeedy;
				var cx22 = ball2.pspeedx;
				var cy22 = ball2.pspeedy;*/
				var px1 = ball1.px;//positions of balls at collision
				var py1 = ball1.py;
				var px2 = ball2.px;
				var py2 = ball2.py;
	//			var dista = Math.sqrt(Math.pow(ball1.px - ball2.px,2) + Math.pow(ball1.py - ball2.py,2));
	//			var distb = Math.sqrt(Math.pow(px1 - px2,2) + Math.pow(py1 - py2,2));
	//			myalert("A = "+dista + ", B = "+distb);
				var dist = Math.sqrt(Math.pow(px1 - px2,2) + Math.pow(py1 - py2,2));
				var contAngle = Math.atan2((py2 - py1) , (px2 - px1));
				myalert("Positions: (x1,y1),(x2,y2) = ("+px1+","+py1+"),("+px2+","+py2+") angle = "+contAngle+", dist = "+dist+" t = "+t);
				var theta1 = Math.atan2(ball1.pspeedy,ball1.pspeedx); //Math.atan(ball1.speedy/ball1.speedx);//if speedx = 0 this breaks!
				var theta2 = Math.atan2(ball2.pspeedy,ball2.pspeedx); //Math.atan(ball2.speedy/ball2.speedx);
				myalert("theta of "+ball1.getAttribute("id")+" = "+theta1+",theta of "+ball2.getAttribute("id")+" = "+theta2);
				var u1 = Math.sqrt(Math.pow(ball1.pspeedx,2) + Math.pow(ball1.pspeedy,2));
				myalert("ball2 = "+ballToString(ball2));
				var u2 = Math.sqrt(Math.pow(ball2.pspeedx,2) + Math.pow(ball2.pspeedy,2));
				myalert("speeds = 1:("+u1+"), 2:("+u2+")");
				var v1x = u2*Math.cos(theta2 - contAngle)*Math.cos(contAngle)*RESTITUTION + 
					u1*Math.sin(theta1 - contAngle)*Math.cos(contAngle + (Math.PI/2));
				var v1y = u2*Math.cos(theta2 - contAngle)*Math.sin(contAngle)*RESTITUTION + 
					u1*Math.sin(theta1 - contAngle)*Math.sin(contAngle + (Math.PI/2));
				var v2x = u1*Math.cos(theta1 - contAngle)*Math.cos(contAngle)*RESTITUTION + 
					u2*Math.sin(theta2 - contAngle)*Math.cos(contAngle + (Math.PI/2));
				var v2y = u1*Math.cos(theta1 - contAngle)*Math.sin(contAngle)*RESTITUTION + 
					u2*Math.sin(theta2 - contAngle)*Math.sin(contAngle + (Math.PI/2));
				myalert("pos = 1:("+px1+","+py1+") and 2:("+px2+","+py2+")");
				ball1.pspeedx = v1x;
				ball1.pspeedy = v1y;
				ball2.pspeedx = v2x;
				ball2.pspeedy = v2y;
				myalert("new speeds = 1:("+ball1.pspeedx+","+ball1.pspeedy+") and 2:("+ball2.pspeedx+","+ball2.pspeedy+")");
				ball1.ncx = px1 + ball1.pspeedx;
				ball1.ncy = py1 + ball1.pspeedy;
				ball2.ncx = px2 + ball2.pspeedx;
				ball2.ncy = py2 + ball2.pspeedy;
				myalert("next pos = 1:("+ball1.ncx+","+ball1.ncy+") and 2:("+ball2.ncx+","+ball2.ncy+")");
				var ball1str = ballToString(ball1);
				var ball2str = ballToString(ball2);
				//myalert("ball1: "+ball1str+"\nball2: "+ball2str+"\n contact angle = "+contAngle);
				var dist2 = Math.sqrt(Math.pow(ball1.ncx-ball2.ncx,2) + Math.pow(ball1.ncy-ball2.ncy,2));
				if(dist2 < ball_size*2){
				//	myalert("Error! balls have not escaped one another!");
				}
		//	}
		}	
		if(tick > 50){
			alert("exceeded loop limit!");
			break;
		}	
	}

	assert(tbreak < 1,"tbreak = "+tbreak);
	for(i = 0; i < balls.length; i++){
		if(balls[i].inuse == false){
			continue;
		}
		balls[i].speedx = balls[i].pspeedx/(1.0-tbreak);
		balls[i].speedy = balls[i].pspeedy/(1.0-tbreak);
		setBallPosition(balls[i],balls[i].ncx,balls[i].ncy);
		
	}
	friction();
	
//	testbounds(tbreak);
}

//take a shot (give the white ball an initial speed)
function shoot(px,py){
	balls[0].speedx = px;
	balls[0].speedy = py;
}

function mouseDown(e){
	pressTime = 0;
	startPress = (new Date()).getTime();
}

function mouseUp(e){//get coords!
	if(startPress != 0){
		var x = e.clientX;
		var y = e.clientY;
		var a = 0;
		var p = 0;
		pressTime = (new Date()).getTime() - startPress;
		p = pressTime / 200.0;
		if(p > 20){
//			p = 20;
		} 
		p *= 60/FPS;
		startPress = 0;
		//alert("presstime = "+pressTime+"ms");
		//alert("Click, x="+x+", y="+y);
		x -= getBallPositionX(balls[0]);
		y -= getBallPositionY(balls[0]);
		a = Math.atan2(y,x);
		shoot(p*Math.cos(a),p*Math.sin(a));
	}
}


init();
setInterval(function(){animate();},1000.0/FPS);
