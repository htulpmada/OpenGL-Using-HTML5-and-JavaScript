"use strict";

var canvas;
var gl;

var points = [];

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

    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

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

function distance(a, b) { return vec2(b[0]-a[0],b[1]-a[1]);}

function getPoint(a, b)
{
    var dx = (b[0] - a[0]);
    var dy = (b[1] - a[1]);

    var ang = 60;

    if (dx == 0) {
        if (dy >= 0)
            ang = 90;
        else
            ang = 270;
    }
    else {
      ang = Math.atan2(dy, dx);
    }
    var cX = (b[0] - a[0]);// * lineAperture;
    var cY = (b[1] - a[1]);// * lineAperture;
    var cSize = Math.sqrt(Math.pow(cX, 2) + Math.pow(cY, 2));

    var np1X = a[0] + cX;
    var np1Y = a[1] + cY;

    var midPoint = vec2(a[0] + ((b[0] - a[0]) / 2), (a[1] + ((b[1] - a[1]) / 2)));

    var xCom = cSize * Math.sin(ang);
    var yCom = cSize * Math.cos(ang);

    var dicularPoint = vec2(midPoint[0] + xCom, midPoint[1] - yCom);

    var np3X = b[0] - cX;
    var np3Y = b[1] - cY;

    //points.push(vec2(), ab1, ab2, ab3);
    return vec2(dicularPoint);
}

function divideTriangle( v, count )
{
    while(count > 0){
        //var n = [];
        for (var i = 0; i <= v.length - 1; i++){
            //bisect the sides
            var a = v[i];
            if (i == v.length - 1) {
                var b = v[0];
            }
            else {
                var b = v[i + 1];
            }
            var ab1 = mix(a, b, 1.0 / 3.0);
            var ab3 = mix(a, b, 2.0 / 3.0);
            points.push(a, ab1);
            var ab2 = getPoint( a , b );
            points.push(ab2, ab3, b);
        }
        points.push(v[v.length - 1]);
        v = points;
        --count;
    }
//    snowflake(n);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
}
