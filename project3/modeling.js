"use strict";

var gl;
var thetaLoc;


var pointsArray = [];
var topArr = [];
var bottomArr = [];
var handles = [];

var numOfTris = 10;
var maxNumTriangles = 200;
var maxNumVertices = 3 * maxNumTriangles;

var r = .5;

var spin = false;
var speed = 1;

var fColor;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 5.0;
var dr = 5.0 * Math.PI/180.0;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4( 1.0, 0.0, 0.0, 1.0 );  
const yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
const green = vec4( 0.0, 1.0, 0.0, 1.0 );
const blue = vec4( 0.0, 0.0, 1.0, 1.0 );
const magenta = vec4( 1.0, 0.0, 1.0, 1.0 );
const cyan = vec4( 0.0, 1.0, 1.0, 1.0 );

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var eye = vec3( 0,2,6);

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );

    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    // enable depth testing and polygon offset
    // so lines will be in front of filled triangles

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 2.0);

// vertex array of nRows*nColumns quadrilaterals
// (two triangles/quad) from data

    makePlayground();
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(topArr), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fColor = gl.getUniformLocation(program, "fColor");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

// buttons for moving viewer and changing size

    document.getElementById("start_stop").onclick = 
            function(){
                if(spin){spin = false;}
                else{spin = true;}
    };

    render();

}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // spin playground y axis
    theta = spin ? speed : 0;
    //phi = spin ? phi + speed : phi;
    var t = rotate(eye,at,theta);
    eye = vec3(t[0],t[1],t[2]);
    
    var modelViewMatrix = lookAt( eye, at, up );
    var projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    // draw each quad as two filled red triangles
    // and then as two black line loops

        // draw top
//        gl.uniform3fv(thetaLoc, spinTheta);

        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, numOfTris+1);
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, 1, numOfTris);

/*
        // draw bottom
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, (numOfTris+1)*2, numOfTris+1);
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, (numOfTris+1)*2, numOfTris+1);
  
        // draw handles
        
        gl.uniform4fv(fColor, flatten(red));
        gl.drawArrays( gl.TRIANGLE_FAN, (numOfTris+1)*2, handles.length);
        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, (numOfTris+1)*2, handles.length);
  */      
 
    requestAnimFrame(render);
}


function rotate(point, origin, angle) {
    var pointX = point[0];
    var pointY = point[1];
    var originX = origin[0];
    var originY = origin[1];
    // Rotate point around origin given
    angle = angle * Math.PI / 180.0;
    return vec4(
        Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY,
        point[2],
        1.0);
}

function makePlayground(){
    // account for last vertex of fan
    numOfTris++;
    //first point of triangle fan
    var origin = new vec4(at[0],at[1],at[2],1.0);
    topArr.push(origin);
    
    //first point of circle
    var t = vec4(at[0],at[1],at[2],1.0);
    t[0] += r;
    
    for(var i = 1; i <= numOfTris; i++){
        topArr.push(t);
        t = rotate(t,origin, 360/(numOfTris-1));
    }

}