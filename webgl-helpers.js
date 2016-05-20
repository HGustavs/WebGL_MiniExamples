//----------------------------------------------------------
// helper Globals
//----------------------------------------------------------		

var shaderProgram;
var gl;

// Benchmarking code
var fps=0;
var fpsmax=0;
var timecount=0;
var fpssum=0;
var fpscount=1;
var benchtime=0;

var username="";

// Dynamic texture loading variables    
var Images = new Array();
var Textures = new Array();

// Buffer variables
var cubeVerticesBuffer;
var cubeVerticesColorBuffer;
var cubeVerticesIndexBuffer;
var cubeVerticesTexcoordBuffer;
var cubeVerticesNormalBuffer;
var cubeVerticesBiNormalBuffer;
var cubeVerticesTangentBuffer;

//----------------------------------------------------------
// loadImages loads all of the images in the Image array and calls loadedImage when each has finished loading
//----------------------------------------------------------		

function loadImages()
{
		for(var i=0;i<textureImages.length;i+=2){
			  var tex = gl.createTexture();																									// Generate texture ID
			  var img = new Image();
			  img.onload = function() {loadedImage(this)}
			  img.src = textureImages[i];

				Images.push(img);
				Textures.push(tex);
		}
}

//----------------------------------------------------------
// activateTextures is called when each scene is drawn to enable the texturing units and connect the textures
//----------------------------------------------------------		

function activateTextures()
{
		for(var i=0;i<textureImages.length;i+=2){
				if(i==0){
						gl.activeTexture(gl.TEXTURE0)
				}else if(i==2){
						gl.activeTexture(gl.TEXTURE1);
				}else if(i==4){
						gl.activeTexture(gl.TEXTURE2);
				}else if(i==6){
						gl.activeTexture(gl.TEXTURE3);
						// Above 6 is 
				}
				
				// If index is 0 to 4 it is ordinary 2d texture 
				// if index is 6 or higher it is a cube map
				if(i>=0 && i<=4){
						gl.bindTexture(gl.TEXTURE_2D, Textures[i/2]);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
						gl.uniform1i(gl.getUniformLocation(shaderProgram, textureImages[i+1]), i/2); 	// Texture ID
				}else if(i==6){
						gl.bindTexture(gl.TEXTURE_CUBE_MAP, Textures[i/2]);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
						gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
						gl.uniform1i(gl.getUniformLocation(shaderProgram, textureImages[i+1]), i/2); 	// Texture Cube
				}
				
		}
}

//----------------------------------------------------------
// loadedImage is called automatically when each image is loaded
//----------------------------------------------------------		

function loadedImage(img)
{
		imgno=-1;
		for(var i=0;i<Images.length;i++){
				if(img.src==Images[i].src) imgno=i;
		}
		if(imgno>-1){
			  if(imgno<3){
					  gl.bindTexture(gl.TEXTURE_2D, Textures[imgno]);
					  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);					// 0 is mipmap level
					  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);				  
			  }else if(imgno>=3&&imgno<=8){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Textures[3]);					  
            
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
						if(imgno==3) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);
						if(imgno==4) gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);
						if(imgno==5) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);
						if(imgno==6) gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);
						if(imgno==7) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);
						if(imgno==8) gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Images[imgno]);
						
			  }
				
				// Generate mipmaps for 2d textures
				if(imgno<3){
					  gl.generateMipmap(gl.TEXTURE_2D);
					  gl.bindTexture(gl.TEXTURE_2D, null);						
				}
		}
}

//----------------------------------------------------------
// getShader collects shader and compiles it. Errors are printed in alert
//----------------------------------------------------------		

function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

//----------------------------------------------------------
// Matrix stack variables
//----------------------------------------------------------		

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
var nMatrix = mat4.create();

//----------------------------------------------------------
// Push Matrix
//----------------------------------------------------------		

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

//----------------------------------------------------------
// Pop Matrix
//----------------------------------------------------------		

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------
// Startup webGL and alert if not available
//----------------------------------------------------------		

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }if (!gl){
        alert("Could not initialise WebGL, sorry :-(");
    }
}

//----------------------------------------------------------
// Startup webGL canvas
//----------------------------------------------------------		

function webGLStart(canvas) {
    var canvas = document.getElementById(canvas);
    initGL(canvas);
    initShaders()
    initBuffers();

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    tick();
}    

//----------------------------------------------------------
// Measure fps and update div if available
//----------------------------------------------------------		

function updatefps(elapsed,fpsdiv)
{
		if(!isNaN(elapsed)){
				timecount+=(elapsed/1000.0);
				fpssum+=(elapsed/10.0);											
		} 
		if(elapsed<1) elapsed=1;
		
		fpscount++;
		fps=Math.round((100.0/(fpssum/fpscount))*10.0)/10.0;
						
		if(fps>fpsmax&&timecount>5.0) fpsmax=fps;

		fpsd=document.getElementById(fpsdiv);
		if(fpsd!=null) fpsd.innerHTML=fps;

}

//----------------------------------------------------------
// Sends benchmark every X seconds
//----------------------------------------------------------		

function sendbenchmark(delay,app)
{
 		// Every 8 seconds send benchmark data to server!
 		if(Math.abs(timecount-benchtime)>delay){
 			benchtime=timecount;
			Benchmark(username,app,fps,fpsmax,Math.round(timecount*10.0)/10.0);
		}                                                                                                                                                   		
}

//----------------------------------------------------------
// Generate benchmark userID
//----------------------------------------------------------		

function genID(app)                                                                                                                       
{                                                                                                                                            
	username = localStorage.getItem("Benchuser"); //Try to fetch username data                                                             
	if (username==null||username==""){
			var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			text="";
			for( var i=0; i < 16; i++ ) text += possible.charAt(Math.floor(Math.random() * possible.length));
			username=text;
			localStorage.setItem("Benchuser",username);
	}else{
  }
 
  Benchmark(username,app,fps,fpsmax,Math.round(timecount*10.0)/10.0);                                                                                                                                    
}                                                                                                                                            

//----------------------------------------------------------
// Send Benchmark using httpajax.js
//----------------------------------------------------------		

function Benchmark(username,app,fps,maxfps,runtime)
{
		var paramstr='User='+escape(username);
		paramstr+="&App="+escape(app);
		paramstr+="&Fps="+escape(fps);		
		paramstr+="&MaxFps="+escape(maxfps);		
		paramstr+="&RunTime="+escape(runtime);
		AjaxService("Benchy.php",paramstr);				
}			

//----------------------------------------------------------
// Collect and compile shaders
//----------------------------------------------------------		

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.vertexBiNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexBiNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexBiNormalAttribute);

    shaderProgram.vertexTangentAttribute = gl.getAttribLocation(shaderProgram, "aVertexTangent");
    gl.enableVertexAttribArray(shaderProgram.vertexTangentAttribute);

    shaderProgram.vertexTexcoordAttribute = gl.getAttribLocation(shaderProgram, "aVertexTexcoord");
    gl.enableVertexAttribArray(shaderProgram.vertexTexcoordAttribute);


    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

    shaderProgram.iResolutionUniform = gl.getUniformLocation(shaderProgram, "iResolution");
    IGT = gl.getUniformLocation(shaderProgram, "iGlobalTime");

		loadImages();

}

//----------------------------------------------------------
// prepare data buffers
//----------------------------------------------------------		

function initBuffers() 
{

	  cubeVerticesBuffer = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  	cubeVerticesNormalBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesNormalBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormal), gl.STATIC_DRAW);

  	cubeVerticesBiNormalBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBiNormalBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeBinormal), gl.STATIC_DRAW);

  	cubeVerticesTangentBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTangentBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTangent), gl.STATIC_DRAW);

  	cubeVerticesTexcoordBuffer = gl.createBuffer();
  	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTexcoordBuffer);
  	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexcoords), gl.STATIC_DRAW);

	  cubeVerticesIndexBuffer = gl.createBuffer();
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
	  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);

} 

//----------------------------------------------------------
// Mouse Setup
//----------------------------------------------------------		

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var moonRotationMatrix = mat4.create();
mat4.identity(moonRotationMatrix);

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}


function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, deltaX / 30.0, [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, deltaY / 30.0, [1, 0, 0]);

    mat4.multiply(newRotationMatrix, moonRotationMatrix, moonRotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}

var lastTime = 0;

function animate()
{
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
    }
    lastTime = timeNow;
		
		updatefps(elapsed,"fps");
}
