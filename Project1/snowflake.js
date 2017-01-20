"use strict";

var canvas;
var gl;
var start = vec2(-1,-1);
var points = [];
var vertices = [
    vec2( -1, -1 ),
    vec2(  0,  1 ),
    vec2(  1, -1 )
];

var NumTimesToSubdivide = 3;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    divideTriangle( 0.0, 1, NumTimesToSubdivide, vertices[0]);
    divideTriangle( -120.0, 1, NumTimesToSubdivide, vertices[1]);
    divideTriangle( 120.0, 1, NumTimesToSubdivide, vertices[2]);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function divideTriangle( dir, len, count, prev )
{
    var dirRad = 0.0174533 * dir;  
    var newX = prev[0] + len * Math.cos(dirRad);
    var newY = prev[1] + len * Math.sin(dirRad);
    if (count==0) {
        points.push(prev);
        start=vec2(newX, newY);
        points.push(start);
        return start;//start[1] = newY;
    }
    else {
    	count--;
    	//draw the four parts of the side _/\_ 
    	var s = divideTriangle(dir, len/2, count, prev);
	dir += 60.0;
	s = divideTriangle(dir, len/2, count, s);
	dir -= 120.0;
	s = divideTriangle(dir, len/2, count, s);
	dir += 60.0;
	s = divideTriangle(dir, len/2, count, s);	
        return s;
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}
