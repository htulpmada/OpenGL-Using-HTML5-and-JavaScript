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
var picChoice = 0;
var frameChoice = 4;


var imagesFiles = [ 'r',
                    'rr',
                    'rrr',
                    'rrrr',
                    'rrrrr',
                    'rrrrrr',
                    'rrrrrrr',
                    'rrrrrrrr'
                ];

var pointsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertices = [
        //      x     y  
        // top row 1
        vec2( -1.0, 0.4),
        vec2( -1.0, 0.8),
        vec2( -0.5, 0.8),
        vec2( -0.5, 0.4),
        // top row 2
        vec2( -0.5, 0.4),
        vec2( -0.5, 0.8),
        vec2(  0.0, 0.8),
        vec2(  0.0, 0.4),
        // top row 3
        vec2(  0.0, 0.4),
        vec2(  0.0, 0.8),
        vec2(  0.5, 0.8),
        vec2(  0.5, 0.4),
        // top row 4
        vec2(  0.5, 0.4),
        vec2(  0.5, 0.8),
        vec2(  1.0, 0.8),
        vec2(  1.0, 0.4),

        // bottom row 1
        vec2( -1.0, -0.8),
        vec2( -1.0, -0.4),
        vec2( -0.5, -0.4),
        vec2( -0.5, -0.8),
        // bottom row 2
        vec2( -0.5, -0.8),
        vec2( -0.5, -0.4),
        vec2(  0.0, -0.4),
        vec2(  0.0, -0.8),
        // bottom row 3
        vec2(  0.0, -0.8),
        vec2(  0.0, -0.4),
        vec2(  0.5, -0.4),
        vec2(  0.5, -0.8),
        // bottom row 4
        vec2(  0.5, -0.8),
        vec2(  0.5, -0.4),
        vec2(  1.0, -0.4),
        vec2(  1.0, -0.8),


        // active blend
        //
        vec2( -0.25, -0.2),
        vec2( -0.25,  0.2),
        vec2(  0.25,  0.2),
        vec2(  0.25, -0.2),
        //picture frame
        vec2( -0.25, -0.2),
        vec2( -0.25,  0.2),
        vec2(  0.25,  0.2),
        vec2(  0.25, -0.2),

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
    
    for(var i = 0; i < images.length; i++){
//    gl.activeTexture(gl.TEXTURE0);
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
//        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // Upload the image into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);

        // add the texture to the array of textures.
        textures.push(texture);
        }
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
    quad( 1, 0, 3, 2 );
    quad( 5, 4, 7, 6 );
    quad( 9, 8, 11, 10 );
    quad( 13, 12, 15, 14 );

    // bottom row
    quad( 17, 16, 19, 18 );
    quad( 21, 20, 23, 22 );
    quad( 25, 24, 27, 26 );
    quad( 29, 28, 31, 30 );

    // active blend
    quad( 33, 32, 35, 34 );
    quad( 37, 36, 39, 38 );

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


    canvas.addEventListener("mousedown", function(event){
        var t = getPoint(event);
        
        // test for   top  row
        if(t[1] > 0.4 && t[1] < 0.8){
            //alert("top row");
            // test for which president form left to right
            if(t[0] > -1.0 && t[0] < -0.5){picChoice = 0;}//alert("Wash");}//washington
            else if(t[0] > -0.5 && t[0] < 0.0){picChoice = 1;}//alert("Adams");}//adams
            else if(t[0] > 0.0 && t[0] < 0.5){picChoice = 2;}//alert("JEFF");}//jefferson
            else if(t[0] > 0.5 && t[0] < 1.0){picChoice = 3;}//alert("MAD");}//madison
            else{return;}//nobody probably wont ever hit this
        }
        // test for bottom row
        else if(t[1] < -.4 && t[1] > -.8){
            //alert("bottom row");
            // test for which picture frame form left to right
            if(t[0] > -1.0 && t[0] < -0.5){frameChoice = 4;}//alert("gold circle");}//gold circle
            else if(t[0] > -0.5 && t[0] < 0.0){frameChoice = 5;}//alert("gold square");}//gold square
            else if(t[0] > 0.0 && t[0] < 0.5){frameChoice = 6;}//alert("clouds");}//clouds
            else if(t[0] > 0.5 && t[0] < 1.0){frameChoice = 7;}//alert("waves");}//waves
            else{return;}//nobody probably wont ever hit this
        }
        // outside of range
        else{return;}
    render(picChoice,frameChoice);
    });    
    
    loadImages(imagesFiles,render);
    
    render(picChoice,frameChoice);
};

var render = function(pchoice,fchoice){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // active blend
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
//    gl.enable(gl.POLYGON_OFFSET_FILL);
//    gl.polygonOffset(1.0, 2.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
//    gl.depthMask(false);

    for (var i = 0; i < 8; i++){
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        gl.drawArrays( gl.TRIANGLES, i*6, 6 );
    }

    // active blend
    gl.bindTexture(gl.TEXTURE_2D, textures[pchoice]);
    gl.drawArrays( gl.TRIANGLES, 8*6, 6 );
    gl.bindTexture(gl.TEXTURE_2D, textures[fchoice]);
    gl.drawArrays( gl.TRIANGLES, 9*6, 6 );
    gl.activeTexture(gl.TEXTURE0);

}
