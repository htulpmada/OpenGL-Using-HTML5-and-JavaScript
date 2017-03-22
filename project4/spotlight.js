"use strict";

var canvas;
var gl;

var numFaces  = 6;

var pointsArray = [];
var normalsArray = [];

var vertices = [
    //          x     y      z
        vec4( -2.0, -0.25,  1.0, 1.0 ),//front,bottom,left
        vec4( -2.0,  0.25,  1.0, 1.0 ),//front,top,left
        vec4( 2.0,  0.25,  1.0, 1.0 ),//front,top,right
        vec4( 2.0, -0.25,  1.0, 1.0 ),//front,bottom,right
        vec4( -2.0, -0.25, -1.0, 1.0 ),//back,bottom,left
        vec4( -2.0,  0.25, -1.0, 1.0 ),//back,top,left
        vec4( 2.0,  0.25, -1.0, 1.0 ),//back,top,right
        vec4( 2.0, -0.25, -1.0, 1.0 )//back,bottom,right
    ];

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;
var near = -10;
var far = 10;

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;
var vShader = true;

var subDiv = 0;
var subDivH = 0;
var subDivV = 0;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[45, 45, 0];
var radius = 1.5;
var the  = 20.0;
var phi    = 20.0;
var dr = 5.0 * Math.PI/180.0;

var thetaLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var flag = true;

function pushQuad(a,b,c,d){
        var t1 = subtract(b, a);
        var t2 = subtract(c, b);
        var normal = cross(t1, t2);
        var normal = vec3(normal);


        pointsArray.push(a);
        normalsArray.push(normal);
        pointsArray.push(b);
        normalsArray.push(normal);
        pointsArray.push(c);
        normalsArray.push(normal);
        pointsArray.push(a);
        normalsArray.push(normal);
        pointsArray.push(c);
        normalsArray.push(normal);
        pointsArray.push(d);
        normalsArray.push(normal);

}

function quad(a, b, c, d, n) {

    if( n > 0){
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var ad = mix(a, d, 0.5);
        var bc = mix(b, c, 0.5);
        var bd = mix(b, d, 0.5);
        var cd = mix(c, d, 0.5);
    
        quad( a, ab, ac, ad, n - 1);
        quad(ab,  b, bc, ac, n - 1);
        quad(ac, bc,  c, cd, n - 1);
        quad(ad, ac, cd,  d, n - 1);
                
    }
    else{
        pushQuad(a,b,c,d);
       }
}


function colorCube(n)
{
    quad( vertices[1], vertices[0], vertices[3], vertices[2], n );//front
    quad( vertices[2], vertices[3], vertices[7], vertices[6], n );//right
    quad( vertices[3], vertices[0], vertices[4], vertices[7], n );//bottom
    quad( vertices[6], vertices[5], vertices[1], vertices[2], n );//top
    quad( vertices[4], vertices[5], vertices[6], vertices[7], n );//back
    quad( vertices[5], vertices[4], vertices[0], vertices[1], n );//left
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube(subDiv);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(left, right, bottom, ytop, near, far);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("Button1").onclick = function(){
        vShader = true;
        subDiv = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("Button2").onclick = function(){
        vShader = true;
        subDiv = subDivH + subDivV;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("Button3").onclick = function(){
        vShader=false;
        subDiv = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    };
    document.getElementById("sliderH").onchange = function(event) {
        subDivH = parseInt(event.target.value);
    };
    document.getElementById("sliderV").onchange = function(event) {
        subDivV = parseInt(event.target.value);
    };
    document.addEventListener("keydown", function (event) {
		// grab keyCode
                switch(event.keyCode){
                    case(38)://up
                        alert("up");
                        break;
                    case(40)://down
                        alert("down");
                        break;
                    case(39)://right
                        alert("right");
                        break;
                    case(37)://left
                        alert("left");
                        break;
                        
                }
    });



    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

    gl.uniform1f(gl.getUniformLocation(program,
       "vShader"),vShader);
    gl.uniform1f(gl.getUniformLocation(program,
       "VShader"),vShader);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(flag){the += 20;}

    eye = vec3(radius*Math.sin(the)*Math.cos(phi),
                radius*Math.sin(the)*Math.sin(phi),
                radius*Math.cos(the));

    modelView = lookAt(eye, at , up);
//    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

        normalMatrix = [
        vec3(modelView[0][0], modelView[0][1], modelView[0][2]),
        vec3(modelView[1][0], modelView[1][1], modelView[1][2]),
        vec3(modelView[2][0], modelView[2][1], modelView[2][2])
    ];
    
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );
    gl.uniform1f(gl.getUniformLocation(program,
       "vShader"),vShader);
    gl.uniform1f(gl.getUniformLocation(program,
       "VShader"),vShader);

    gl.drawArrays( gl.TRIANGLES, 0, 6*Math.pow(4, subDiv)*numFaces);


    requestAnimFrame(render);
}
