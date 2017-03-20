//////////////////
//  CS435       //
//  Adam Pluth  //
//  Project#3   //
//              //
//////////////////



"use strict";

var gl;
var thetaLoc;


var pointsArray = [];
var topArr = [];
var bottomArr = [];
var sideArr = [];
var handles = [];

var numOfTris = 10;
var maxNumTriangles = 200;
var maxNumVertices = 3 * maxNumTriangles;

var r = 1.5;

var spin = false;
var speed = 1;

var fColor;

var near = -10;
var far = 10;
var radius = 2.0;
var theta  = 20.0 * Math.PI/180.0;
var angle  = 10.0 * Math.PI/180.0;
var phi    = 50.0 * Math.PI/180.0;
//var dr = 5.0 * Math.PI/180.0;
//var thickness = .25;
//var numofHandles = 4;

const black = vec4(0.0, 0.0, 0.0, 1.0);
const red = vec4( 1.0, 0.0, 0.0, 1.0 );  
const yellow = vec4( 1.0, 1.0, 0.0, 1.0 );
const green = vec4( 0.0, 1.0, 0.0, 1.0 );
const blue = vec4( 0.0, 0.0, 1.0, 1.0 );
const magenta = vec4( 1.0, 0.0, 1.0, 1.0 );
const cyan = vec4( 0.0, 1.0, 1.0, 1.0 );

var eye = vec3( 0,.5,6); 
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



    makePlayground();
    
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vBufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sideArr[0]), gl.STATIC_DRAW);

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
    var or = rotateAround(eye,vec3(at[0],at[1]+eye[1],at[2]),angle);
    var o = vec3(or[0],or[1],or[2]);
    var modelViewMatrix = lookAt( o, at, up );
    var projectionMatrix = ortho( left, right, bottom, ytop, near, far );

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
  
    // draw each cylinder as two filled red triangles
    // and then as two black line loops
    
    // draw tops
    
    for(var i = 0; i < topArr.length ;i++){
        gl.uniform4fv(fColor, flatten(red));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(topArr[i]));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, topArr[i].length);

        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, 1, topArr[i].length-1);
    }
        // draw bottoms
    
    for(i = 0; i < topArr.length ;i++){
        gl.uniform4fv(fColor, flatten(red));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(bottomArr[i]));
        gl.drawArrays( gl.TRIANGLE_FAN, 0, bottomArr[i].length);

        gl.uniform4fv(fColor, flatten(black));
        gl.drawArrays( gl.LINE_LOOP, 1, bottomArr[i].length-1);
    }
    // draw sides need to shuffle top and bottom together
    for(var i = 0; i < topArr.length ;i++){
        if(i<2){
            gl.uniform4fv(fColor, flatten(red));
        }
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(sideArr[i]));
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, sideArr[i].length);
        gl.uniform4fv(fColor, flatten(black));
        gl.bindBuffer( gl.ARRAY_BUFFER, vBufferId );
    }
        // draw handles
        
    
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(handles));
    gl.drawArrays( gl.LINE_STRIP, 0, handles.length);

    //gl.uniform4fv(fColor, flatten(black));
    //gl.drawArrays( gl.LINE_LOOP, 1, handles.length-1);
  
 
    requestAnimFrame(render);
}


function rotateAround(point, origin, angle) {
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
    var height = .1;
    var bottom = vec4(at[0],at[1],at[2],1.0);
    var rad=r;
    var axis = 'z';
    var a = 0;

    //  platform
    makeCylinder(bottom,height,rad,axis,a);

    // center cylinder
    var bCenter = vec4(bottom[0],bottom[1],bottom[2],1.0);
    bCenter[1]+=height+.01;
    rad = rad/10;
    height+=.25;
    makeCylinder(bCenter,height,rad,axis,a);
    
    //handles
    var bH1 = vec4(bCenter[0],bCenter[1],bCenter[2],1.0);
    bH1[0]+=.5;
    bH1[1]+=.5;
    rad = rad/10;
    height+=.25;
    a=45;
    makeCylinder(bH1,height,rad,axis,a);
    
    
}

function makeCylinder(orig,len,rad,axis,angle){

    var tArr = [];
    var bArr = [];
    var sArr = [];    

    var bot = vec4(at[0],at[1],at[2],1.0);
    var top = vec4(at[0],at[1] + len,at[2],1.0);
    var a;

    switch(axis){
        case 'x':
            a = vec3(1.0,at[1],at[2]);
            break;
        case 'y':
            a = vec3(at[0],1.0,at[2]);
            break;
        case 'z':
            a = vec3(at[0],at[1],1.0);
            break;
    }
    //var angleR = angle * Math.PI/180;
    var rot = rotate(angle ,a);

  //  var toOrig = mat4( 1.0, 0.0,  0.0,  -orig[0],
  //              0.0,  1.0,  0.0,  -orig[1],
  //              0.0,  0.0,  1.0,  -orig[2],
  //              0.0,  0.0,  0.0,  1.0);
    var fromOrig = mat4( 1.0, 0.0,  0.0,  orig[0],
                0.0,  1.0,  0.0,  orig[1],
                0.0,  0.0,  1.0,  orig[2],
                0.0,  0.0,  0.0,  1.0);


    // bottom first 
    //first point of triangle fan
    bArr.push(bot);
    //first point of circle
    var t = vec4(bot[0],bot[1],bot[2],1.0);
    t[0] += rad;
    for(var i = 1; i <= numOfTris; i++){
        bArr.push(t);
        t = rotateAround(t,bot, 360/(numOfTris-1));
    }

    // top
    //orig = new vec4(orig[0],orig[1] + len,orig[2],1.0);
    tArr.push(top);
    t = vec4(top[0],top[1] + len,top[2],1.0);
    t[2] += rad;
    
    for(var i = 1; i <= numOfTris; i++){
        tArr.push(t);
        t = rotateAround(t,top, 360/(numOfTris-1));
    }
    
        // draw sides
    var j = tArr.length;
    for(var i = 1; i < j; i++){
        sArr.push(tArr[i]);
        sArr.push(bArr[i]);
    }

    
    // 
    // rotate cylinder here
    // rotate, translate to position

    for(i=0;i<tArr.length;i++){
        tArr[i] = mult(rot,tArr[i]);
        bArr[i] = mult(rot,bArr[i]);
//        tArr[i][0] = dot(tArr[i],rot[0]);
//        tArr[i][1] = dot(tArr[i],rot[1]);
//        tArr[i][2] = dot(tArr[i],rot[2]);
//        bArr[i][0] = dot(bArr[i],rot[0]);
//        bArr[i][1] = dot(bArr[i],rot[1]);
//        bArr[i][2] = dot(bArr[i],rot[2]);
//   
    
//        tArr[i][0] = dot(tArr[i],fromOrig[0]);
//        tArr[i][1] = dot(tArr[i],fromOrig[1]);
//        tArr[i][2] = dot(tArr[i],fromOrig[2]);
//        bArr[i][0] = dot(bArr[i],fromOrig[0]);
//        bArr[i][1] = dot(bArr[i],fromOrig[1]);
//        bArr[i][2] = dot(bArr[i],fromOrig[2]);
    }   

    
        topArr.push(tArr);
        bottomArr.push(bArr);
        sideArr.push(sArr);


}



