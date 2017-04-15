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
var texSize = 64;
var dotRadius = 0.045;
var dotUpBound =  0.9;
var dotLowBound = -0.9;
var textures;


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
    vec4( .75, .75, .75, 1.0 )  // white
    
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


function makeCylinder(orig,rad){
    numOfCir++;
    var bot = orig;
    
    // bottom first 
    //first point of triangle fan
    pointsArray.push(bot);
    colorArray.push(colors[4]);
    //first point of circle
    var t = vec2(bot[0],bot[1]);
    t[0] += rad;
    for(var i = 1; i < numOfTris; i++){
        pointsArray.push(t);
        colorArray.push(colors[4]);
        t = rotateAround(t,bot, 360/(numOfTris-2));
    }
//        pointsArray.push(t);
//        colorArray.push(colors[4]);
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
    // top row
    quad( 1, 0, 3, 2 );

}
function makeCylinders(){
    // right side
    makeCylinder(vec2(dotUpBound,0.0),dotRadius);
    makeCylinder(vec2(dotUpBound,0.2),dotRadius);
    makeCylinder(vec2(dotUpBound,0.4),dotRadius);
    makeCylinder(vec2(dotUpBound,0.6),dotRadius);
    makeCylinder(vec2(dotUpBound,0.8),dotRadius);
    makeCylinder(vec2(dotUpBound,-0.2),dotRadius);
    makeCylinder(vec2(dotUpBound,-0.4),dotRadius);
    makeCylinder(vec2(dotUpBound,-0.6),dotRadius);
    makeCylinder(vec2(dotUpBound,-0.8),dotRadius);
    // left side
    makeCylinder(vec2(dotLowBound,0.0),dotRadius);
    makeCylinder(vec2(dotLowBound,0.2),dotRadius);
    makeCylinder(vec2(dotLowBound,0.4),dotRadius);
    makeCylinder(vec2(dotLowBound,0.6),dotRadius);
    makeCylinder(vec2(dotLowBound,0.8),dotRadius);
    makeCylinder(vec2(dotLowBound,-0.2),dotRadius);
    makeCylinder(vec2(dotLowBound,-0.4),dotRadius);
    makeCylinder(vec2(dotLowBound,-0.6),dotRadius);
    makeCylinder(vec2(dotLowBound,-0.8),dotRadius);

    // top side
    makeCylinder(vec2(0.0,dotUpBound),dotRadius);
    makeCylinder(vec2(0.2,dotUpBound),dotRadius);
    makeCylinder(vec2(0.4,dotUpBound),dotRadius);
    makeCylinder(vec2(0.6,dotUpBound),dotRadius);
    makeCylinder(vec2(0.8,dotUpBound),dotRadius);
    makeCylinder(vec2(-0.2,dotUpBound),dotRadius);
    makeCylinder(vec2(-0.4,dotUpBound),dotRadius);
    makeCylinder(vec2(-0.6,dotUpBound),dotRadius);
    makeCylinder(vec2(-0.8,dotUpBound),dotRadius);
    // bottomt side
    makeCylinder(vec2(0.0,dotLowBound),dotRadius);
    makeCylinder(vec2(0.2,dotLowBound),dotRadius);
    makeCylinder(vec2(0.4,dotLowBound),dotRadius);
    makeCylinder(vec2(0.6,dotLowBound),dotRadius);
    makeCylinder(vec2(0.8,dotLowBound),dotRadius);
    makeCylinder(vec2(-0.2,dotLowBound),dotRadius);
    makeCylinder(vec2(-0.4,dotLowBound),dotRadius);
    makeCylinder(vec2(-0.6,dotLowBound),dotRadius);
    makeCylinder(vec2(-0.8,dotLowBound),dotRadius);

    // diagonals
    makeCylinder(vec2(-0.7,-0.7),dotRadius);
    makeCylinder(vec2(-0.7, 0.7),dotRadius);
    makeCylinder(vec2( 0.7,-0.7),dotRadius);
    makeCylinder(vec2( 0.7, 0.7),dotRadius);
    
    makeCylinder(vec2(-0.55, -0.55),dotRadius);
    makeCylinder(vec2(-0.55,  0.55),dotRadius);
    makeCylinder(vec2( 0.55, -0.55),dotRadius);
    makeCylinder(vec2( 0.55,  0.55),dotRadius);

    makeCylinder(vec2(-0.35,-0.35),dotRadius);
    makeCylinder(vec2(-0.35, 0.35),dotRadius);
    makeCylinder(vec2( 0.35,-0.35),dotRadius);
    makeCylinder(vec2( 0.35, 0.35),dotRadius);

    makeCylinder(vec2(-0.2,-0.2),dotRadius);
    makeCylinder(vec2(-0.2, 0.2),dotRadius);
    makeCylinder(vec2( 0.2,-0.2),dotRadius);
    makeCylinder(vec2( 0.2, 0.2),dotRadius);

    makeCylinder(vec2( 0.0, 0.0),dotRadius * 4);
    


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

    makeCube();
    makeCylinders();
  
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

    gl.drawArrays( gl.TRIANGLES, 0, 6 );
    for(var i = 0; i < numOfCir ; i++){
        gl.drawArrays( gl.TRIANGLE_FAN, i * numOfTris + 6, numOfTris );
    }
}
