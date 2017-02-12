//////////////////
//  CS 435      //
//  Project #2  //
//  Adam Pluth  //
//  2/7/2017    //
//////////////////

"use strict";

var canvas;
var code;
var gl;
var t;

// max click distance away from point <Accuracy>
var maxDist = .025;

var radius = .025;
var index = -1;
var selected = -1;
var numOfTris = 10;
var maxNumTriangles = 200;
var maxNumVertices = 3 * maxNumTriangles;
var canMakeDot = false;
var rightClick = false;
var canDrag = false;
var dotCols = [];
var dotArr = [];
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
                canDrag = false;
		index=-1;
	});

	canvas.addEventListener("mousemove", function (event) {
	    if(canDrag){
                drag(event,vBuffer,cBuffer);
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
                    if(index >= 0 && !rightClick){
                        canDrag = true;
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

    render();

}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    for(var i = 0; i <= dotArr.length; i+=numOfTris+1){
        gl.drawArrays( gl.TRIANGLE_FAN, i, numOfTris+1);
    }

    window.requestAnimFrame(render);

}

function drag(event,vBuffer,cBuffer){
    t = getPoint(event);
    // find t
    index = findPoint(t);
    if(index >= 0 && !canMakeDot && !rightClick){
        var origin = new vec2(t[0],t[1]);
        t[0] += radius;
        dotArr[index]=origin;
        var i = 1;
        for( ; i < numOfTris; i++){
            dotArr[index+i]=t;
            t = rotate(t,origin, 360/(numOfTris-1));
        }
        dotArr[index+i]=t;
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );
    }
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
    //first point of triangle fan
    var origin = new vec2(t[0],t[1]);
    dotArr.push(origin);
    
    //first point of circle
    t[0] += radius;
    
    for(var i = 1; i <= numOfTris; i++){
        dotArr.push(t);
        t = rotate(t,origin, 360/(numOfTris-1));
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );

    t = vec4(colors[selected]);
    for(var i = 0; i <= numOfTris; i++){
        dotCols.push(t);
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );

    // index should be origin of dot
    index=dotArr.length - numOfTris + 1;
}

function clearDot(vBuffer,cBuffer){
    // clear and reset buffers
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
    // -1 if not found
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
    // offset canvas
    var x = event.pageX - canvas.offsetLeft;
    var y = event.pageY - canvas.offsetTop;
    return vec2(2 * x / canvas.width - 1, 2 * (canvas.height - y) / canvas.height - 1);

    //VVVVVVVVVV doesnt take offset into account VVVVVVVVVVV DON'T USE!!!
    //return vec2(2 * event.clientX / canvas.width - 1,
	//	2 * (canvas.height - event.clientY) / canvas.height - 1);
}