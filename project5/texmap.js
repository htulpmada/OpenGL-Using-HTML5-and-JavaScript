////////////////////
//  Adam Pluth
//  CS 435
//  Project #5
//  3/28/2017
//  Texture Mapping
//  
//  model interior and exterior of a 
//  room in a house with a table and 
//  picture frames with rotating 
//  images or at least thats the plan!!
//

"use strict";

var canvas;
var gl;

var numVertices  = 6 * 4;
var texSize = 64;

var modelView, projection;

var eyes = [    vec3(-0.2,0.5,1.0),//front
                vec3(-1.0,0.5,-0.2),//left
                vec3(0.2,0.5,-1.0),//back
                vec3(1.0,0.5,0.2)//right
];
var curEye = 0;
var eye = eyes[curEye];

var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var radius = 1.5;
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[45, 45, 0];
var the  = 20.0;
var phi    = 20.0;

var left = -1.0;
var right = 1.0;
var ytop =1.0;
var bottom = -1.0;
var near = -10;
var far = 10;

var imagesFiles = ['rrr.png','r.png'];

var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.25,  0.5, 1.0 ),
        vec4( 0.5,  0.25,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.25, -0.5, 1.0 ),
        vec4( 0.5,  0.25, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

var ctm;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];
var flag = true;

function loadImage(url, callback) {
    var image = new Image();
    image.onload = callback;
    image.src = url;
    return image;
}

function loadImages(urls, callback) {
    var images = [];
    var imagesToLoad = urls.length;

    // Called each time an image finished loading.
    var onImageLoad = function() {
      --imagesToLoad;
      // If all the images are loaded call the callback.
      if (imagesToLoad == 0) {
        configureTexture(images)
        callback();
      }
    };

    for (var ii = 0; ii < imagesToLoad; ++ii) {
      var image = loadImage(urls[ii], onImageLoad);
      image.crossOrigin = 'anonymous';
      images.push(image);
    }
}

function configureTexture( images ) {
    var textures = [];
    for(var ii = 0; ii < images.length; ++ii){
        //gl.activeTexture(gl.TEXTURE0);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

        // add the texture to the array of textures.
        textures.push(texture);
    }

    var u_image0Location = gl.getUniformLocation(program, "u_image0");
    var u_image1Location = gl.getUniformLocation(program, "u_image1");

    gl.uniform1i(u_image0Location, 0);  // texture unit 0
    gl.uniform1i(u_image1Location, 1);  // texture unit 1

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    
//    render();
}


function quad(a, b, c, d) {

    pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
}

function quadt(a, b, c, d, e) {

    pointsArray.push(vertices[e*a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[e*b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[e*c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[e*a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[e*c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[e*d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
}


function colorCube()
{
//    quad( 1, 0, 3, 2 );//front
    quad( 2, 3, 7, 6 );//right
    quad( 3, 0, 4, 7 );//bottom
//    quad( 6, 5, 1, 2 );//top
    quad( 6, 7, 4, 5 );//back
    quad( 5, 4, 0, 1 );//left
}

function table()
{
    // first leg
    quadt( 1, 0, 3, 2 ,1);//front
    quadt( 2, 3, 7, 6 ,1);//right
    quadt( 3, 0, 4, 7 ,1);//bottom
    quadt( 6, 5, 1, 2 ,1);//top
    quadt( 6, 7, 4, 5 ,1);//back
    quadt( 5, 4, 0, 1 ,1);//left
    // second leg
    quadt( 1, 0, 3, 2 ,2);//front
    quadt( 2, 3, 7, 6 ,2);//right
    quadt( 3, 0, 4, 7 ,2);//bottom
    quadt( 6, 5, 1, 2 ,2);//top
    quadt( 6, 7, 4, 5 ,2);//back
    quadt( 5, 4, 0, 1 ,2);//left
    // third leg
    quadt( 1, 0, 3, 2 ,3);//front
    quadt( 2, 3, 7, 6 ,3);//right
    quadt( 3, 0, 4, 7 ,3);//bottom
    quadt( 6, 5, 1, 2 ,3);//top
    quadt( 6, 7, 4, 5 ,3);//back
    quadt( 5, 4, 0, 1 ,3);//left
    // fourth leg
    quadt( 1, 0, 3, 2 ,4);//front
    quadt( 2, 3, 7, 6 ,4);//right
    quadt( 3, 0, 4, 7 ,4);//bottom
    quadt( 6, 5, 1, 2 ,4);//top
    quadt( 6, 7, 4, 5 ,4);//back
    quadt( 5, 4, 0, 1 ,4);//left
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

    colorCube();
//    table()

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    
    //var image = new Image();
    //image.onload = function() {
    //    configureTexture( image );
    //}
    //image.src = "rr.png"

    //viewerPos = vec3(0.0, 0.0, -20.0 );

    //projection = ortho(-1, 1, -1, 1, -100, 100);

    document.getElementById("ButtonNV").onclick = function(){curEye++;theta[axis]=0;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonN").onclick = function(){};
    document.getElementById("ButtonP").onclick = function(){};
    
    loadImages(imagesFiles,render);
    
//    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(!flag) theta[axis] += 2.0;
    
    eye = eyes[curEye % 4];

    modelView = lookAt(eye, at , up);
    projection = ortho(left, right, bottom, ytop, near, far);

    //modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));

    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    requestAnimFrame(render);
}
