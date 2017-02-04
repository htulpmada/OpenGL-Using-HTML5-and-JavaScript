"use strict";

var canvas;
var gl;
var code;
var selected = -1;
var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var canMakeDot = false;
var dotArr = [];
var dotCols = [];
var colors = [
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red 82
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow 89
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green 71
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue 66
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta 77
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan 67
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	document.addEventListener("keydown", getColor(event));
    //
    //  Initialize our data for the Snowflake
    //

    // First, initialize the corners of our fractal with three points.


//    divideTriangle( vertices[0] , vertices[1], NumTimesToSubdivide-1);
//    divideTriangle( vertices[1] , vertices[2], NumTimesToSubdivide-1);
//    divideTriangle( vertices[2] , vertices[0], NumTimesToSubdivide-1);


    //     Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render()
{

    gl.clear( gl.COLOR_BUFFER_BIT );

    // Need to use LINE_LOOP for drawing between points

    gl.drawArrays( gl.LINE_LOOP, 0, dotArr.length );
	
	window.requestAnimFrame(render);

}

function getColor( event )
{
	
//	alert(" getting color");
}

