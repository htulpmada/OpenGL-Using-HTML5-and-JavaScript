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

    canvas.addEventListener("mousedown", function(event){
		if(canMakeDot){//make new point
			makeDot(vBuffer,cBuffer);
		}
		else{//move point
			var t = vec2(2 * event.clientX / canvas.width - 1,
				2 * (canvas.height - event.clientY) / canvas.height - 1);
			var i = findPoint(t);
	// deletes needs to drag now
//			clearDot(vBuffer,cBuffer);
//			makeDot(vBuffer,cBuffer);
		}
	});

	canvas.addEventListener("contextmenu", function (event) {
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

	var t = vec2(2 * event.clientX / canvas.width - 1,
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
		var x1 = p1[0];
		var x2 = p2[0];
		var y1 = p1[1];
		var y2 = p2[1];
		var xx = x1 - x2;
		var yy = y1 - y2;
		if((Math.abs(x1 - x2) < maxDist) 
			&& (Math.abs(y1 - y2) < maxDist))
			{
//			alert("found it: " + dotArr[i]);
			dotArr.splice(i,1);
			dotCols.splice(i,1);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(dotArr), gl.STATIC_DRAW );
			gl.bufferData( gl.ARRAY_BUFFER, flatten(dotCols), gl.STATIC_DRAW );
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