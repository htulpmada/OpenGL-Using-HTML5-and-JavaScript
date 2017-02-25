"use strict";

var gl;
var thetaLoc;


var pointsArray = [];
var topArr = [];
var bottomArr = [];
var sideArr = [];
var handles = [];
var rotatey;
var numOfTris = 25;
var maxNumTriangles = 200;
var maxNumVertices = 3 * maxNumTriangles;

var r = 1.5;

var spin = false;
var speed = .05;

var fColor;

var near = -10;
var far = 10;
var radius = 2.0;
var theta  = 20.0 * Math.PI/180.0;
var angle  = 5.0 * Math.PI/180.0;
var phi    = 50.0 * Math.PI/180.0;
var dr = 5.0 * Math.PI/180.0;
var c = Math.cos(angle);
var s = Math.sin(angle);
var eye = vec3( radius*Math.cos(theta)*Math.sin(phi),
                    radius*Math.sin(theta)*Math.sin(phi),
                    radius*Math.cos(phi));
var thickness = .25;
var numofHandles = 4;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4( 1.0, 0.0, 0.0, 1.0 );  
const yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
const green = vec4( 0.0, 1.0, 0.0, 1.0 );
const blue = vec4( 0.0, 0.0, 1.0, 1.0 );
const magenta = vec4( 1.0, 0.0, 1.0, 1.0 );
const cyan = vec4( 0.0, 1.0, 1.0, 1.0 );

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modeViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, rotateMatrixLoc;
var vBufferId;

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


    vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sideArr), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    fColor = gl.getUniformLocation(program, "fColor");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    rotateMatrixLoc = gl.getUniformLocation( program, "rotateMatrix" );

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
    angle = spin ? angle + speed : angle;
    
    var modelViewMatrix = lookAt( eye, at, up );
    var projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    c = Math.cos(angle);
    s = Math.sin(angle);
    rotatey = mat4( c, 0.0, -s, 0.0,
		    0.0, 1.0,  0.0, 0.0,
		    s, 0.0,  c, 0.0,
		    0.0, 0.0,  0.0, 1.0 );
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix4fv( rotateMatrixLoc, false, flatten(rotatey) );

    // draw each quad as two filled red triangles
    // and then as two black line loops
    
    // draw top
        gl.uniform4fv(fColor, flatten(red));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(topArr));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, topArr.length);

        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, 1, topArr.length-1);
        
        // draw bottom
        gl.uniform4fv(fColor, flatten(red));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(bottomArr));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, bottomArr.length);

        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, 1, bottomArr.length-1);
  
        // draw sides need to shuffle top and bottom together
        gl.uniform4fv(fColor, flatten(red));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(sideArr));
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, sideArr.length);

        // draw handles
        gl.uniform4fv(fColor, flatten(black));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(handles));
        gl.drawArrays( gl.LINE_STRIP, 0, handles.length);

        //gl.uniform4fv(fColor, flatten(black));
        //gl.drawArrays( gl.LINE_LOOP, 1, handles.length-1);
  
 
    requestAnimFrame(render);
}


function rotate(point, origin, angle) {
    var pointX = point[0];
    var pointZ = point[2];
    var originX = origin[0];
    var originZ = origin[2];
    // Rotate point around origin and Y axis
    angle = angle * Math.PI / 180.0;
    return vec4(
        Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointZ-originZ) + originX,
        point[1],
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointZ-originZ) + originZ,
        1.0);
}

function rotateUp(point, origin, angle) {
    var pointX = point[0];
    var pointY = point[1];
    var originX = origin[0];
    var originY = origin[1];
    // Rotate point around origin and Y axis
    angle = angle * Math.PI / 180.0;
    return vec4(
        Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
        Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY,
        point[1],
        1.0);
}

function makePlayground(){
    // account for last vertex of fan
    numOfTris++;

    // top 
    //first point of triangle fan
    var origin = new vec4(at[0],at[1],at[2],1.0);
    topArr.push(origin);
    
    //first point of circle
    var t = vec4(at[0],at[1],at[2],1.0);
    t[2] += r;
    
    for(var i = 1; i <= numOfTris; i++){
        topArr.push(t);
        t = rotate(t,origin, 360/(numOfTris-1));
    }

    // bottom
      
    //first point of triangle fan
    var origin = new vec4(at[0],at[1] - thickness,at[2],1.0);
    bottomArr.push(origin);
    
    //first point of circle
    var t = vec4(at[0],at[1] - thickness,at[2],1.0);
    t[2] += r;
    
    for(var i = 1; i <= numOfTris; i++){
        bottomArr.push(t);
        t = rotate(t,origin, 360/(numOfTris-1));
    }
    
    // draw sides
    var j = topArr.length;
    for(var i = 1; i < j; i++){
        sideArr.push(topArr[i]);
        sideArr.push(bottomArr[i]);
    }

    // draw handles
    var interval =.07;
    //for(var z = 0; z < numofHandles; z++){
        origin = vec4(at[0],at[1],at[2],1.0);
        var t = vec4(at[0] + (r/2.0),at[1],at[2],1.0);
      //  t = rotate(t, origin, (360/numofHandles*z));
//        handles.push(t);
        for(j = 1; j < 2;j+=interval){
           handles.push(rotateUp(origin,t, 360/((r/3.0)/interval)));
        }
    //}

}
