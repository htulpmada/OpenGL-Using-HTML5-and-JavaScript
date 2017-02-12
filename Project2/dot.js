//////////////////
//  CS 435      //
//  Project #2  //
//  Adam Pluth  //
//  2/7/2017    //
//////////////////

"use strict";

var radius = .025;
var canvas;
var gl;
var code;
var selected = -1;
var numOfTris = 5;
var maxNumTriangles = 200;
var maxNumVertices = 3 * maxNumTriangles;
var pSize = 5;
var vSize = 5;
var index = -1;
var t;
// max click distance away from point
var maxDist = .05;
var canMakeDot = false;
var rightClick = false;
var dotArr = [];
var dotCols = [];
var colors = [
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red 82
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow 89r
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green 71
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue 66
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta 77
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan 67
];


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    document.addEventListener("keydown", function (event) {
		// grab keyCode
		pickKey(event);
    });

    document.addEventListener("keyup", function (event) {
		console.log(code);
		canMakeDot = false;
    });

	canvas.addEventListener("mouseover", function (event) {
	    canvas.focus();
	});

	canvas.addEventListener("mouseup", function (event) {
		rightClick = false;
		index=-1;
	});

	canvas.addEventListener("mousemove", function (event) {
	    t = getPoint(event);
	    if(index >= 0 && !canMakeDot && !rightClick){
			gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 8*index*(numOfTris+1), flatten(t));
			//gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
			gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 16*index*(numOfTris+1), flatten(dotCols[index]));
			//gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index), flatten(dotCols[index]));
                        var origin = new vec2(t[0],t[1]);
                        t[0] += radius;
                        dotArr[index]=origin;
                        for(var i = 1; i <= numOfTris; i++){
                            dotArr[index+i]=t;
                            t = rotate(t,origin, 360/numOfTris);
			}
                        dotArr[index+numOfTris+1]=t;
            }
        });

    canvas.addEventListener("mousedown", function(event){
        t = getPoint(event);
        index = findPoint(t);
		if(canMakeDot){//make new point
			makeDot(vBuffer,cBuffer,event);
			index = findPoint(t);
		}
		else{//move point
		//	index = findPoint(t);
			if(index >= 0 && !rightClick){
				gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
				gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index), flatten(dotCols[index]));
			}
		}
	});

	canvas.addEventListener("contextmenu", function (event) {
        //prevent default behavior
		event.preventDefault();
		rightClick = true;
		t = getPoint(event);

		index = findPoint(t);
		if(rightClick && index >=0){
		    // removing point from array
		    index = findPoint(t);
			dotArr.splice(index,numOfTris+1);// cut off all points of triangle fan
			dotCols.splice(index,numOfTris+1);
			index = -1;	
		}

		// redraw 
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );

	});

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vColor);

    pSize = gl.getUniformLocation(program, "vSize");

    render();

}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(pSize, vSize);
    //gl.drawArrays( gl.POINTS, 0, dotArr.length );
    
    for(var i = 0; i <= dotArr.length; i+=numOfTris+1){
        gl.drawArrays( gl.TRIANGLE_FAN, i, numOfTris+1);
    }

    window.requestAnimFrame(render);

}

function rotate(point, origin, angle) {
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


function makeDot(vBuffer,cBuffer,event){
    t = getPoint(event);
    var origin = new vec2(t[0],t[1]);
    dotArr.push(origin);
    t[0] += radius;
    for(var i = 1; i <= numOfTris; i++){
        dotArr.push(t);
        t = rotate(t,origin, 360/(numOfTris-1));
    }
//    dotArr.push(t);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );

    t = vec4(colors[selected]);
    // once for the origin
    for(var i = 0; i <= numOfTris; i++){
        dotCols.push(t);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );
    // index should be origin of dot
    index=dotArr.length - numOfTris + 1;
}

function clearDot(vBuffer,cBuffer){

    vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );

    cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


	index-=numOfTris+1;
}

function findPoint( p1 ){
    for(var i=0; i < dotArr.length; i+=numOfTris+1){
		var p2 = dotArr[i];
		if((Math.abs(p1[0] - p2[0]) < maxDist) 
			&& (Math.abs(p1[1] - p2[1]) < maxDist))
		{
            // return index of point if found
			return i;
		}
	}
	return -1;
}

function pickKey(event){
	code = event.keyCode;
		switch(code){
			case 82://red
				selected = 0;
				canMakeDot = true;
				break;
			case 89://yellow
				selected = 1;
				canMakeDot = true;
				break;
			case 71://green
				selected = 2;
				canMakeDot = true;
				break;
			case 66://blue
				selected = 3;
				canMakeDot = true;
				break;
			case 77://magenta
				selected = 4;
				canMakeDot = true;
				break;
			case 67://cyan
				selected = 5;
				canMakeDot = true;
				break;
		}
}

function getPoint(event){   
    //need to change to offset canvas
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    return vec2(2 * x / canvas.width - 1, 2 * (canvas.height - y) / canvas.height - 1);

    //VVVVVVVVVV doesnt take offset into account VVVVVVVVVVV DON'T USE!!!
    //return vec2(2 * event.clientX / canvas.width - 1,
	//	2 * (canvas.height - event.clientY) / canvas.height - 1);
}