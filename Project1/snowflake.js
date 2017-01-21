"use strict";

var canvas;
var gl;

var x = .7;
var y = .6;
var dir = 60;
var points = [];
var vertices = [
    vec2( -x, -y ),
    vec2(  0,  y ),
    vec2(  x, -y )
];

var NumTimesToSubdivide = 6;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    divideTriangle( vertices[0] , vertices[1], NumTimesToSubdivide-1);
    divideTriangle( vertices[1] , vertices[2], NumTimesToSubdivide-1);
    divideTriangle( vertices[2] , vertices[0], NumTimesToSubdivide-1);


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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render()
{

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_LOOP, 0, points.length );

}

function rotate_point(pointX, pointY, originX, originY, angle) {
    angle = angle * Math.PI / 180.0;
    return vec2(
        Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
                );
}

function getPoint( a, b )
{
    return rotate_point(b[0],b[1],a[0],a[1],60);
}

function divideTriangle( a , b , count ){
    var ab1 = mix(a, b, 1.0 / 3.0);
    var ab3 = mix(a, b, 2.0 / 3.0);
    var ab2 = getPoint( ab1 , ab3 );

    points.push(a);
    if(count===0){points = vertices;}
    else if(count===1)
    {
        points.push(ab1,ab2,ab3);
    }
    else
    {
        --count;
        
        divideTriangle(a,ab1,count)
        divideTriangle(ab1,ab2,count)
        divideTriangle(ab2,ab3,count)
        divideTriangle(ab3,b,count)
        
        points.push(b);
    }
}