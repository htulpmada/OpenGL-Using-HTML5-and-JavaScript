"use strict";

var canvas;
var gl;
var start = vec2(-1,-1);
var points = [];

var NumTimesToSubdivide = 2;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    divideTriangle( 0.0, 1, NumTimesToSubdivide);
    divideTriangle( -120.0, 1, NumTimesToSubdivide);
    divideTriangle( 120.0, 1, NumTimesToSubdivide);

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

function divideTriangle( dir, len, count )
{
    var dirRad = 0.0174533 * dir;  
    var newX = start[0] + len * Math.cos(dirRad);
    var newY = start[1] + len * Math.sin(dirRad);
    if (count==0) {
        vec2(start[0], start[1]);
        vec2(newX, newY);
        start[0] = newX;
        start[1] = newY;
    }
    else {
    	count--;
    	//draw the four parts of the side _/\_ 
    	divideTriangle(dir, len/3, count);
	dir += 60.0;
	divideTriangle(dir, len/3, count);
	dir -= 120.0;
	divideTriangle(dir, len/3, count);
	dir += 60.0;
	divideTriangle(dir, len/3, count);
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}
