////////////////////
//  Adam Pluth
//  CS 435
//  Project #6
//  4/5/2017
//  Texture Mapping
//  
//  blending images using
//  presidents and 
//  picture frames
//  
//

"use strict";

var canvas;
var gl;

var numVertices  = 6 * 4;
var texSize = 64;

var textures;



var imagesFiles = ['rrr'];

var pointsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
        // walls
        //      x     y  
        vec2( -0.05, -0.05),
        vec2( -0.05,  0.05),
        vec2( 0.05,  0.05),
        vec2( 0.05, -0.05),
        vec2( -0.05, -0.05),
        vec2( -0.05,  0.05),
        vec2( 0.05,  0.05),
        vec2( 0.05, -0.05),
                
    ];


var program;
var vPosition;


function loadImage(url) {
    var image = new Image();
    image = document.getElementById( url );
    return image;
}

function loadImages(urls) {
    var images = [];
    var imagesToLoad = urls.length;

    for (var ii = 0; ii < imagesToLoad; ++ii) {
      var image = loadImage(urls[ii]);
      images.push(image);
    }
    
    configureTexture(images)
    
}

function configureTexture( images ) {
    textures = [];

//    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);

    // add the texture to the array of textures.
    textures.push(texture);

}


function quad(a, b, c, d) {

     pointsArray.push(vertices[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[b]);
     texCoordsArray.push(texCoord[1]);

     pointsArray.push(vertices[c]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[a]);
     texCoordsArray.push(texCoord[0]);

     pointsArray.push(vertices[c]);
     texCoordsArray.push(texCoord[2]);

     pointsArray.push(vertices[d]);
     texCoordsArray.push(texCoord[3]);
}


function makeCube()
{
    // top row
    quad( 1, 0, 3, 2 );//front
    //quad( 1, 0, 3, 2 );//front
    //quad( 1, 0, 3, 2 );//front
    //quad( 1, 0, 3, 2 );//front

    // bottom row
    //quad( 1, 0, 3, 2 );//front
    //quad( 1, 0, 3, 2 );//front
    //quad( 1, 0, 3, 2 );//front
    //quad( 1, 0, 3, 2 );//front

    // active blend
    //quad( 1, 0, 3, 2 );//front

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

    makeCube();
  
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);


    canvas.onclick = function(){};
    
  //  loadImages(imagesFiles,render);
    
    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//    var u_image0Location = gl.getUniformLocation(program, "u_image0");
//    var u_image1Location = gl.getUniformLocation(program, "u_image1");
    
    // pic image to display here
    
//    gl.uniform1i(u_image0Location, 0);  // texture unit 0
//    gl.uniform1i(u_image1Location, 1);  // texture unit 1

    
    // loop for top row
//    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );

    // loop for bottom row
    //gl.bindTexture(gl.TEXTURE_2D, textures[2]);
    //gl.drawArrays( gl.TRIANGLES, pointsArray.length,6 );
    
    // draw active belnd
    //gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    //gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length );
    
    // we should render on click
    requestAnimFrame(render);
}
