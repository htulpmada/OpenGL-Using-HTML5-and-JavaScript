"use strict";

var canvas;
var gl;
var dir = 60;
var start = vec2(-1,-1);
var points = [];
var vertices = [
    vec2( -1, -1 ),
    vec2(  0,  1 ),
    vec2(  1, -1 ),
    vec2( -1, -1 )
];

var NumTimesToSubdivide = 1;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.


    divideTriangle( vertices, NumTimesToSubdivide);

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

function midP(a, b) { return vec2((a[0]+b[0])/2,(a[1]+b[1])/2);} 

function Slope(a, b) { return vec2(b[0]-a[0],b[1]-a[1]);}
function rotate_point(pointX, pointY, originX, originY, angle) {
	angle = angle * Math.PI / 180.0;
	return vec2(Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
		 Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY);
}
function distance( a , b ){ return Math.sqrt(Math.pow((a[0]+b[0]),2)+(Math.pow((a[1]+b[1]),2)));}
function getPoint( a, b )
{
    return rotate_point(b[0],b[1],a[0],a[1],60);
    
   // var d = distance(a,b);
   // var angle = .0174533 * dir; 
   // var cx = a[0] + d * Math.cos(angle); 
   // var cy = a[1] + d * Math.sin(angle); 
//    var mid = midP(a, b); 
//    var slope = Slope(a, b); 
//    slope[0]=-slope[0]; 
    //return vec2(cx,cy); 
}

function divideTriangle( v, count )
{
    while(count > 0){
        for (var i = 0; i <= v.length - 2; i++){
            //bisect the sides
            var a = v[i];
//            if (i === v.length - 1) {
//                var b = v[0];
//            }
 //           else {
                var b = v[i + 1];
//            }
            var ab1 = mix(a, b, 1.0 / 3.0);
            var ab3 = mix(a, b, 2.0 / 3.0);
            points.push(a, ab1);
            var ab2 = getPoint( ab1 , ab3 );
            points.push(ab2, ab3, b);
        }
//        points.push(v[v.length - 1]);
        v = points;
        --count;
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}
