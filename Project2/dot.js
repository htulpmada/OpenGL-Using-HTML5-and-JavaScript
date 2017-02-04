"use strict";

var canvas;
var gl;
var code;
var selected = -1;
var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = -1;
var t;
var canMakeDot = false;
var rightClick = false;
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


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    document.addEventListener("keydown", function (event) {
		// grab keyCode
		pickKey(event);
    });

    document.addEventListener("keyup", function (event) {
        // clear selected color
		console.log(code);
		canMakeDot = false;
    });

	canvas.addEventListener("mouseover", function (event) {
	    canvas.focus();
	});

	canvas.addEventListener("mouseup", function (event) {
//	    dotArr[index]=t;
		rightClick = false;
		index=-1;
	});

	canvas.addEventListener("mousemove", function (event) {
			t = vec2(2 * event.clientX / canvas.width - 1,
				2 * (canvas.height - event.clientY) / canvas.height - 1);
			//index = findPoint(t);
			if(index >= 0 && !canMakeDot && !rightClick){
				gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
				gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, 16*(index), flatten(dotCols[index]));
			    dotArr[index]=t;
			}	    
	});

    canvas.addEventListener("mousedown", function(event){
		t = vec2(2 * event.clientX / canvas.width - 1,
				2 * (canvas.height - event.clientY) / canvas.height - 1);
		index = findPoint(t);
		if(canMakeDot){//make new point
			makeDot(vBuffer,cBuffer);
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

		t = vec2(2 * event.clientX / canvas.width - 1,
				2 * (canvas.height - event.clientY) / canvas.height - 1);
		index = findPoint(t);

		if(rightClick && index >=0){
			index = findPoint(t);
			dotArr.splice(index,1);
			dotCols.splice(index,1);
			index=-1;	
		}
		//rightClick = false;
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );

		//delete points on right click
		
		//var i = findPoint(t);

		//copy buffer minus buffer[i]

		//rebind buffer

	});

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
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
    gl.enableVertexAttribArray( vColor );

    render();

}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, dotArr.length );

    window.requestAnimFrame(render);

}

function makeDot(vBuffer,cBuffer){

	t = vec2(2 * event.clientX / canvas.width - 1,
		2 * (canvas.height - event.clientY) / canvas.height - 1);
	dotArr.push(t);
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );
//	gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));

	t = vec4(colors[selected]);
	dotCols.push(t);
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );
//	gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));
	index++;
}

function clearDot(vBuffer,cBuffer){
//    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
//    gl.useProgram( program );

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


	index--;
}

function findPoint( p1 ){
	var maxDist = .075;
	for(var i=0; i < dotArr.length; i++){
		var p2 = dotArr[i];
		if((Math.abs(p1[0] - p2[0]) < maxDist) 
			&& (Math.abs(p1[1] - p2[1]) < maxDist))
			{
//			alert("found it: " + i);
			//dotArr.splice(i,1);
			//dotCols.splice(i,1);
			//gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );
			//gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );
//			clearDot();
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