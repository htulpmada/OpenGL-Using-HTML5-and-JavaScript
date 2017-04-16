////////////////////
//  Adam Pluth
//  CS 435
//  Project #7
//  4/15/2017
//  
//  final project
//  board game
//  

"use strict";

var canvas;
var gl;

var numVertices  = 6 * 4;
var numOfTris = 16;
var numOfCir = 0;
var numOfSpaces = 28
var texSize = 64;
var dotRadius = 0.045;
var dotUpBound =  0.9;
var dotLowBound = -0.9;
var diceNum = 1;


var pointsArray = [];
var colorArray = [];

var vertices = [
        //      x     y  
        //
        vec2( -1.0, -1.0),
        vec2( -1.0,  1.0),
        vec2(  1.0,  1.0),
        vec2(  1.0, -1.0),

    ];

var colors = [
    
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( .75, .75, .75, 1.0 ),  // gray
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 0.0, 0.0, 1.0 )   // black
    
];

var program;
var vPosition;

function rotateAround(point, origin, angle) {
    var pointX = point[0];
    var pointY = point[1];
    var originX = origin[0];
    var originY = origin[1];
    // Rotate point around origin given
    angle = angle * Math.PI / 180.0;
    return vec2(
        Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
                );
}


function makeCylinder(orig,rad,c){
    if(c===4){
        numOfCir++;
    }
    var bot = orig;
    
    // bottom first 
    //first point of triangle fan
    pointsArray.push(bot);
    colorArray.push(colors[c]);
    //first point of circle
    var t = vec2(bot[0],bot[1]);
    t[0] += rad;
    for(var i = 1; i < numOfTris; i++){
        pointsArray.push(t);
        colorArray.push(colors[c]);
        t = rotateAround(t,bot, 360/(numOfTris-2));
    }
}

function quad(a, b, c, d) {

     pointsArray.push(vertices[a]);
     colorArray.push(colors[a]);

     pointsArray.push(vertices[b]);
     colorArray.push(colors[b]);

     pointsArray.push(vertices[c]);
     colorArray.push(colors[c]);

     pointsArray.push(vertices[a]);
     colorArray.push(colors[a]);

     pointsArray.push(vertices[c]);
     colorArray.push(colors[c]);

     pointsArray.push(vertices[d]);
     colorArray.push(colors[d]);
}

function makeTriAngle(a, b, c, d) {

     pointsArray.push(a);
     colorArray.push(colors[d]);

     pointsArray.push(b);
     colorArray.push(colors[d]);

     pointsArray.push(c);
     colorArray.push(colors[d]);

}

function quad(a, b, c, d) {

     pointsArray.push(vertices[a]);
     colorArray.push(colors[a]);

     pointsArray.push(vertices[b]);
     colorArray.push(colors[b]);

     pointsArray.push(vertices[c]);
     colorArray.push(colors[c]);

     pointsArray.push(vertices[a]);
     colorArray.push(colors[a]);

     pointsArray.push(vertices[c]);
     colorArray.push(colors[c]);

     pointsArray.push(vertices[d]);
     colorArray.push(colors[d]);
}

function makeCube()
{
    quad( 1, 0, 3, 2 );
}
function makeCylinders(){
    // right side
    var currPoint = vec2(0.0,0.0);
    currPoint[0] += dotUpBound;
    currPoint[1] += dotRadius / 2;
    var origin = vec2(0,0);
 
    //spaces around the circle
    for(var k = 0; k < numOfSpaces; k++){
        makeCylinder(currPoint,dotRadius,4);
        currPoint = rotateAround(currPoint,origin,(360 / numOfSpaces));
    }
    
    // diagonals
    makeCylinder(vec2(-0.5,-0.5),dotRadius,4);
    makeCylinder(vec2(-0.5, 0.5),dotRadius,4);
    makeCylinder(vec2( 0.5,-0.5),dotRadius,4);
    makeCylinder(vec2( 0.5, 0.5),dotRadius,4);
    
    makeCylinder(vec2(-0.4, -0.4),dotRadius,4);
    makeCylinder(vec2(-0.4,  0.4),dotRadius,4);
    makeCylinder(vec2( 0.4, -0.4),dotRadius,4);
    makeCylinder(vec2( 0.4,  0.4),dotRadius,4);

    makeCylinder(vec2(-0.3,-0.3),dotRadius,4);
    makeCylinder(vec2(-0.3, 0.3),dotRadius,4);
    makeCylinder(vec2( 0.3,-0.3),dotRadius,4);
    makeCylinder(vec2( 0.3, 0.3),dotRadius,4);

    makeCylinder(vec2(-0.2,-0.2),dotRadius,4);
    makeCylinder(vec2(-0.2, 0.2),dotRadius,4);
    makeCylinder(vec2( 0.2,-0.2),dotRadius,4);
    makeCylinder(vec2( 0.2, 0.2),dotRadius,4);
    
    // center bubble
    makeCylinder(vec2( 0.0, 0.0),dotRadius * 4,4);
    
    // bottom left start point     x           y
    makeCylinder(vec2(dotLowBound                   ,dotLowBound + (dotRadius * 6)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 2) ,dotLowBound + (dotRadius * 4)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 4) ,dotLowBound + (dotRadius * 2)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 6) ,dotLowBound)                   ,dotRadius,4);
    
    // top left    start point   x           y
    makeCylinder(vec2(dotLowBound                   ,dotUpBound - (dotRadius * 6)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 2) ,dotUpBound - (dotRadius * 4)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 4) ,dotUpBound - (dotRadius * 2)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 6) ,dotUpBound)                   ,dotRadius,4);

    // top right   start point    x           y
    makeCylinder(vec2(dotUpBound                   ,dotUpBound - (dotRadius * 6)) ,dotRadius,4);
    makeCylinder(vec2(dotUpBound - (dotRadius * 2) ,dotUpBound - (dotRadius * 4)) ,dotRadius,4);
    makeCylinder(vec2(dotUpBound - (dotRadius * 4) ,dotUpBound - (dotRadius * 2)) ,dotRadius,4);
    makeCylinder(vec2(dotUpBound - (dotRadius * 6) ,dotUpBound)                   ,dotRadius,4);

    // bottom right  start point     x           y
    makeCylinder(vec2(dotUpBound                   ,dotLowBound + (dotRadius * 6)) ,dotRadius,4);
    makeCylinder(vec2(dotUpBound - (dotRadius * 2) ,dotLowBound + (dotRadius * 4)) ,dotRadius,4);
    makeCylinder(vec2(dotUpBound - (dotRadius * 4) ,dotLowBound + (dotRadius * 2)) ,dotRadius,4);
    makeCylinder(vec2(dotUpBound - (dotRadius * 6) ,dotLowBound)                   ,dotRadius,4);

    // bottom left      x           y
    makeCylinder(vec2(dotLowBound                   ,dotLowBound + (dotRadius * 6)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 2) ,dotLowBound + (dotRadius * 4)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 4) ,dotLowBound + (dotRadius * 2)) ,dotRadius,4);
    makeCylinder(vec2(dotLowBound + (dotRadius * 6) ,dotLowBound)                   ,dotRadius,4);

}

function cuttOffCorners(){
    var d = 5;
    // bottom left
    makeTriAngle(
            vec2(-1.0,-1.0),
            vec2(-1.0 + (dotRadius * 8),-1.0),
            vec2(-1.0  ,-1.0 + (dotRadius * 8)),
            d
    );
    //top left
    makeTriAngle(
            vec2(-1.0,1.0),
            vec2(-1.0 + (dotRadius * 8),1.0),
            vec2(-1.0  ,1.0 - (dotRadius * 8)),
            d
    );
    //top right
    makeTriAngle(
            vec2(1.0,1.0),
            vec2(1.0 - (dotRadius * 8),1.0),
            vec2( 1.0  ,1.0 - (dotRadius * 8)),
            d
    );
    //bottom right
    makeTriAngle(
            vec2(1.0,-1.0),
            vec2(1.0 - (dotRadius * 8),-1.0),
            vec2( 1.0  ,-1.0 + (dotRadius * 8)),
            d
    );
    
}

function makeDice(){
     pointsArray.push(vec2(-dotRadius * 2.5,-dotRadius * 2.5));
     colorArray.push(colors[5]);

     pointsArray.push(vec2(-dotRadius * 2.5,dotRadius * 2.5));
     colorArray.push(colors[5]);

     pointsArray.push(vec2(dotRadius * 2.5,dotRadius * 2.5));
     colorArray.push(colors[5]);

     pointsArray.push(vec2(dotRadius * 2.5,dotRadius * 2.5));
     colorArray.push(colors[5]);

     pointsArray.push(vec2(dotRadius * 2.5,-dotRadius * 2.5));
     colorArray.push(colors[5]);

     pointsArray.push(vec2(-dotRadius * 2.5,-dotRadius * 2.5));
     colorArray.push(colors[5]);
}

function diceNums(){

    makeCylinder(vec2(-0.06,-0.06),dotRadius / 3,6);
    makeCylinder(vec2(-0.06, 0.00),dotRadius / 3,6);
    makeCylinder(vec2(-0.06, 0.06),dotRadius / 3,6);
    makeCylinder(vec2( 0.06,-0.06),dotRadius / 3,6);
    makeCylinder(vec2( 0.06, 0.00),dotRadius / 3,6);
    makeCylinder(vec2( 0.06, 0.06),dotRadius / 3,6);

}

function rollDice(n){
    switch(n){
        case 1:
            
            break;
        case 2:
            
            break;
        case 3:
/*
        gl.bindBuffer( gl.ARRAY_BUFFER, vPosition );
        var t1 = 
        gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t1));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[(index)%7]);
        gl.bufferSubData(gl.ARRAY_BUFFER, 16*index, flatten(t));
        index++;
*/

            break;
        case 4:
            
            break;
        case 5:
            
            break;
        case 6:
            
            break;
    }
}

function getPoint(event){   
    // offset canvas
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    return vec2(2 * x / canvas.width - 1, 2 * (canvas.height - y) / canvas.height - 1);

    //VVVVVVVVVV doesnt take offset into account VVVVVVVVVVV DON'T USE!!!
    //return vec2(2 * event.clientX / canvas.width - 1,
	//	2 * (canvas.height - event.clientY) / canvas.height - 1);
}


window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 0.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // points for background square
    makeCube();
    // points for gray circles
    makeCylinders();
    // points for making white corners
    cuttOffCorners();
    // points for dice square
    makeDice();
    
    // populate buffer
    // with six blank points
    diceNums();
    // then roll the dice
    // to draw all numbers
    // redraw by 
    // manipulating 
    // color buffer
    // on render
    //
    rollDice(3);
    
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    canvas.addEventListener("mousedown", function(event){
        var t = getPoint(event);
        
        // test for   top  row
        if(t[1] > 0.4 && t[1] < 0.8){
        }
        // test for bottom row
        else if(t[1] < -.4 && t[1] > -.8){
        }
        // outside of range
        else{return;}
    render();
    });    
    
    render();
    
};

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT );

    // keep track of what we are rendering
    var index = 0;
    
    // draw background
    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    index += 6;
    
    //draw movement spaces
    for(var i = 0; i < numOfCir ; i++){
        gl.drawArrays( gl.TRIANGLE_FAN, i * numOfTris + 6, numOfTris );
    }
    index += (numOfTris * numOfCir);
    
    // cut off corners
    gl.drawArrays( gl.TRIANGLES, index , 12 );
    index += 12;

    //draw dice
    gl.drawArrays( gl.TRIANGLES, index , 6 );
    index += 6;
    
//    switch(diceNum){}
    for(var i = 0; i < 6; i++){
      gl.drawArrays( gl.TRIANGLE_FAN, index, numOfTris );
      index += numOfTris;
  }
    
}
