// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

  

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_lightColor;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform bool u_lightOn;
  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);

    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;   //use color

    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0); //use uv debug color

    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV); //use texture0

    } else {
      gl_FragColor = vec4(1,.2,.2,1); // error, put redish
    }

    vec3 lightVector = u_lightPos-vec3(v_VertPos);
    float r=length(lightVector);

    //if (r<1.0) {
    //  gl_FragColor = vec4(1,0,0,1);
    //} else if (r<2.0) {
    //    gl_FragColor = vec4(0,1,0,1);
    //}

    //gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);

    //N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    //Reflection
    vec3 R = reflect(-L, N);

    //eye
    vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

    //Specular
    float specular = pow(max(dot(E,R), 0.0), 10.0);

    vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL *0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.3;

    if (u_lightOn) {
      //if (u_whichTexture == 0) {
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      //} else {
        //gl_FragColor = vec4(specular+ambient, 1.0);
      //}
    }
  }`

//Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_lightPos;
let u_lightColor;
let u_cameraPos;
let u_lightOn;

//get the canvas and gl context
function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

//compile the shader programs, attach the javascript variables to the GLSL variables
function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  //Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  // Set the initial value of this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variables related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSegments=10;
let g_globalAngle = -120;
let g_wagtailAngle = 0;
let g_wagtailAnimation = false;
let g_normalOn = false;
let g_lightOn = true;
let g_lightPos=[0,1,-2];
var g_lightColor=[1,1,1];

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
    // Button Events (Shape Type)
    document.getElementById('normalOn').onclick   = function() { g_normalOn=true;};
    document.getElementById('normalOff').onclick   = function() { g_normalOn=false;};

    document.getElementById('lightOn').onclick   = function() { g_lightOn=true;};
    document.getElementById('lightOff').onclick   = function() { g_lightOn=false;};

    document.getElementById('wagtailOffButton').onclick   = function() { g_wagtailAnimation=false;};
    document.getElementById('wagtailOnButton').onclick   = function() { g_wagtailAnimation=true;};
 
    document.getElementById('wagtailSlide').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_wagtailAngle = this.value; renderAllShapes();}});
    document.getElementById('lightSlideX').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_lightPos[0] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideY').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_lightPos[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideZ').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_lightPos[2] = this.value/100; renderAllShapes();}});

    document.getElementById('lightSlideR').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_lightColor[0] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideG').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_lightColor[1] = this.value/100; renderAllShapes();}});
    document.getElementById('lightSlideB').addEventListener('mousemove',   function(ev) { if (ev.buttons == 1) {g_lightColor[2] = this.value/100; renderAllShapes();}});

    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };
 
 
    document.getElementById('angleSlide').addEventListener('mousemove',   function() { g_globalAngle = this.value; renderAllShapes();});

}

function initTextures() {
  //var texture = gl.createTexture(); //Create a texture object
  //if (!texture) {
  //  console.log('Failed to create the texture object');
  //  return false;
  //}

  var image = new Image(); //Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0(image);};
  //Tell the browser to load an image
  image.src = 'sky.jpg';

  //Add more texture loading later if we want


  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //Flip the image's y axis
  //Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  //Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //Set the texture image
  // (targer, level, internalformat, format, type, pixels)
  // Documentation at https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  //Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  //console.log('finished loadTexture');
}

function main() {

  //Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  //Setup actions for the HTML UI variables
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown = click;
  //canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  document.onkeydown = keydown;

  initTextures();
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  //renderAllShapes();
  requestAnimationFrame(tick);

}

var g_shapesList = [];

function click(ev) {
  //Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  point.segments = g_selectedSegments;
  g_shapesList.push(point);
  renderAllShapes();
}

function drawMyPicture(){
  let [x,y] = [0.1,0.1];
  let point;
  //g_selectedColor = [0.0,1.0,0.0,1.0];
  point = new Picture();
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = 10;
  g_shapesList.push(point);

  renderAllShapes();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function doAwesomeness(){
  let [x,y] = [0.1,0.1];
  let point;
  //g_selectedColor = [0.0,1.0,0.0,1.0];
  point = new Picture();
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = 10;
  g_shapesList.push(point);
  renderAllShapes();

  sleep(1000).then(() => {
  point = new Picture1();
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = 10;
  g_shapesList.push(point);
  renderAllShapes();
  });
}

//Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
    return([x, y]);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

//Called by browser repeatedly whenever its time
function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

//Update the angles of everything if currently animated
function updateAnimationAngles(){
  if (g_wagtailAnimation){
    g_wagtailAngle = (45*Math.sin(g_seconds));
  }

  g_lightPos[0] = Math.cos(g_seconds);
}

//handling the keyboard
function keydown(ev){
  if (ev.keyCode==39) { //Right arrow
    g_eye[0] += 0.2;
  } else
  if (ev.keyCode == 37) { //Left arrow
    g_eye[0] -= 0.2;
  }

  renderAllShapes();
  console.log(ev.keyCode);
}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];
var g_camera = new Camera();

//based on some data structure that is holding all the information about what to draw, 
//actually draw all the shapes.
function renderAllShapes(){

    // Check the time at the start of this function
    var startTime = performance.now();

    //pass the projection matrix
    var projMat=new Matrix4();
    projMat.setPerspective(90, canvas.width/canvas.height, .1,100 );
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    //pass the view matrix
    var viewMat=new Matrix4();
    viewMat.setLookAt(
      g_eye[0],g_eye[1],g_eye[2], 
      g_at[0], g_at[1],g_at[2], 
      g_up[0],g_up[1],g_up[2]); //(eye, at, up)

      //g_eye[0],g_eye[1],g_eye[2], 
      //g_at[0], g_at[1],g_at[2], 
      //g_up[0],g_up[1],g_up[2]); //(eye, at, up)
      //g_camera.eye.x,g_camera.eye.y, g_camera.eye.z,
      //g_camera.at.x,g_camera.at.y, g_camera.at.z,
      //g_camera.up.x,g_camera.up.y, g_camera.up.z); 
      //viewMat.setLookAt(0,0,-1, 0,0,0, 0,1,0); //(eye, at, up)

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     gl.clear(gl.COLOR_BUFFER_BIT);

    //var len = g_points.length;
   // var len = g_shapesList.length;
   // for(var i = 0; i < len; i++) {
   //   g_shapesList[i].render();
   // }

   //Pass the light position to GLSL
   gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

   //Pass the light color to GLSL
   gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
   
   //Pass the camera position to GLSL
   gl.uniform3f(u_cameraPos, g_camera.eye.x, g_camera.eye.y, g_camera.eye.z);

   //Pass the light status
   gl.uniform1i(u_lightOn, g_lightOn);
   
   // Draw the light
   var light=new Cube();
   light.color= [1,1,0,1.0];
   light.textureNum=-2;
   light.matrix.translate(g_lightPos[0],g_lightPos[1], g_lightPos[2]);
   light.matrix.scale(-.15,-.15,-.15);
   light.matrix.translate(-.5,-.5,-.5);
   light.render();

   //Draw Sphere
   var sp = new Sphere();
   //sp.textureNum=-1;
   if (g_normalOn) sp.textureNum=-3;
   //sp.matrix.translate(-1,-1.5,-1.5);
   sp.matrix.translate(-2,0.15,-0.5);
   sp.render();

   //Draw the floor
   var floor = new Cube();
   floor.color = [0.4, 0.0, 0.4, 1.0];
   floor.textureNum=-2;
   floor.matrix.translate(0, -.75, 0.0);
   floor.matrix.scale(10,0,15);
   floor.matrix.translate(-.5, 0, -0.5);
   floor.render();

   //Draw the sky
   var sky = new Cube();
   sky.color = [0.8,0.8,0.8,1.0];
   sky.textureNum=-2;
   //sky.matrix.scale(35,35,50);
   if (g_normalOn) sky.textureNum=-3;
   //sky.matrix.scale(5,5,5);
   sky.matrix.scale(-35,-35,-35);
   sky.matrix.translate(-.5, -.5, -0.5);
   sky.render();

   //Draw the Tail Base Cube
   var body = new Cube();
   body.color = [0.6,0.,0,1.0];
   body.textureNum = -2;
   if (g_normalOn) body.textureNum=-3;
   body.matrix.translate(-.25,-.5,.5);
   body.matrix.rotate(-5,1,0,0);
   body.matrix.scale(0.5,.3,.5);
   body.render();

   //Draw a Tail part 2
   var leftArm = new Cube();
   leftArm.color = [0.37,0.,0,1.0];
   //leftArm.textureNum = -2;
   if (g_normalOn) leftArm.textureNum=-3;
   //Rotates up and down, not sideways
   leftArm.matrix.setTranslate(0,-.5,0.0);
   leftArm.matrix.rotate(-g_wagtailAngle,0,0,1);
   var wagtailCoordinatesMat = new Matrix4(leftArm.matrix);
   leftArm.matrix.scale(0.25,.7,.3);
   leftArm.matrix.translate(-.5,0.48,1.95);
   leftArm.render();

   //Purple tail end
   var box = new Cube();
   box.color = [0.37,0.,0,1.0];
   box.textureNum = -2;
   if (g_normalOn) box.textureNum=-3;
   box.matrix = wagtailCoordinatesMat;
   box.matrix.translate(0,0.65,0);
   box.matrix.rotate(g_wagtailAngle,0,0,1);
   box.matrix.scale(0.3,.3,.3);
   box.matrix.translate(-.5,1.1,2.2);
   box.render();

   //Draw our Animal
   //Head Cube
   var body = new Cube();
   body.color = [0.37,0.,0,1.0];
   body.textureNum = -2;
   if (g_normalOn) body.textureNum=-3;
   body.matrix.translate(-.55,.35,0.0);
   body.matrix.scale(0.7,.4,.5);
   body.render();

   var eyes1 = new Cube();
   eyes1.color = [1,1,1,1.0];
   eyes1.textureNum = -2;
   if (g_normalOn) eyes1.textureNum=-3;
   eyes1.matrix.translate(-.45,.59,-0.05);
   eyes1.matrix.scale(0.1,.1,.1);
   eyes1.render();

   var eyes2 = new Cube();
   eyes2.color = [0,0,0,1.0];
   eyes2.textureNum = -2;
   if (g_normalOn) eyes2.textureNum=-3;
   eyes2.matrix.translate(-.43,.6,-0.07);
   eyes2.matrix.scale(0.05,.05,.05);
   eyes2.render();

   var eyes3 = new Cube();
   eyes3.color = [1,1,1,1.0];
   eyes3.textureNum = -2;
   if (g_normalOn) eyes3.textureNum=-3;
   eyes3.matrix.translate(-.05,.59,-0.05);
   eyes3.matrix.scale(0.1,.1,.1);
   eyes3.render();

   var eyes4 = new Cube();
   eyes4.color = [0,0,0,1.0];
   eyes4.textureNum = -2;
   if (g_normalOn) eyes4.textureNum=-3;
   eyes4.matrix.translate(-.03,.6,-0.07);
   eyes4.matrix.scale(0.05,.05,.05);
   eyes4.render();

   var snout = new Cube();
   snout.color = [0.48,0.,0,1.0];
   snout.textureNum = -2;
   if (g_normalOn) snout.textureNum=-3;
   snout.matrix.translate(-.3,0.36,-0.1);
   snout.matrix.scale(0.2,.18,.2);
   snout.render();

   var nose = new Cube();
   nose.color = [0,0,0,1.0];
   nose.textureNum = -2;
   if (g_normalOn) nose.textureNum=-3;
   nose.matrix.translate(-0.25,.48,-0.13);
   nose.matrix.scale(0.09,.07,.05);
   nose.render();

   var mouth1 = new Cube();
   mouth1.color = [0,0,0,1.0];
   mouth1.textureNum = -2;
   if (g_normalOn) mouth1.textureNum=-3;
   mouth1.matrix.translate(-0.21,.4,-0.11);
   mouth1.matrix.scale(0.01,.1,.03);
   mouth1.render();

   var mouth2 = new Cube();
   mouth2.color = [0,0,0,1.0];
   mouth2.textureNum = -2;
   if (g_normalOn) mouth2.textureNum=-3;
   mouth2.matrix.translate(-0.21,.4,-0.106);
   mouth2.matrix.scale(0.07,.01,.03);
   mouth2.render();

   var mouth3 = new Cube();
   mouth3.color = [0,0,0,1.0];
   mouth3.textureNum = -2;
   if (g_normalOn) mouth3.textureNum=-3;
   mouth3.matrix.translate(-0.27,.4,-0.106);
   mouth3.matrix.scale(0.07,.01,.03);
   mouth3.render();

   var ears = new Cube();
   ears.color = [0.6,0.,0,1.0];
   ears.textureNum = -2;
   if (g_normalOn) ears.textureNum=-3;
   ears.matrix.translate(.16,0.41,-0.07);
   ears.matrix.scale(0.1,0.35,.2);
   ears.render();

   var ears2 = new Cube();
   ears2.color = [0.6,0.,0,1.0];
   ears2.textureNum = -2;
   if (g_normalOn) ears2.textureNum=-3;
   ears2.matrix.translate(-.66,0.41,-0.07);
   ears2.matrix.scale(0.1,0.35,.2);
   ears2.render();

   var neck = new Cube();
   neck.color = [0.27,0.,0,1.0];
   neck.textureNum = -2;
   if (g_normalOn) neck.textureNum=-3;
   neck.matrix.translate(-0.3,0.2,0.2);
   neck.matrix.scale(0.2,0.24,.2);
   neck.render();

   var body1 = new Cube();
   body1.color = [0.37,0.,0,1.0];
   body1.textureNum = -2;
   if (g_normalOn) body1.textureNum=-3;
   body1.matrix.translate(-0.5,-0.45,0.14);
   body1.matrix.scale(0.6,.68,.4);
   body1.render();

   var paw1 = new Cube();
   paw1.color = [0.2,0.,0,1.0];
   paw1.textureNum = -2;
   if (g_normalOn) paw1.textureNum=-3;
   paw1.matrix.translate(-0.5,-0.47,-0.07);
   paw1.matrix.scale(0.2,0.24,.2);
   paw1.render();

   var paw2 = new Cube();
   paw2.color = [0.2,0.,0,1.0];
   paw2.textureNum = -2;
   if (g_normalOn) paw2.textureNum=-3;
   paw2.matrix.translate(-0.7,-0.47,0.35);
   paw2.matrix.scale(0.2,0.24,.2);
   paw2.render();

   var paw3 = new Cube();
   paw3.color = [0.2,0.,0,1.0];
   paw3.textureNum = -2;
   if (g_normalOn) paw3.textureNum=-3;
   paw3.matrix.translate(-0.1,-0.47,-0.07);
   paw3.matrix.scale(0.2,0.24,.2);
   paw3.render();

   var paw4 = new Cube();
   paw4.color = [0.2,0.,0,1.0];
   paw4.textureNum = -2;
   if (g_normalOn) paw4.textureNum=-3;
   paw4.matrix.translate(0.1,-0.47,0.35);
   paw4.matrix.scale(0.2,0.24,.2);
   paw4.render();

   var leg1 = new Cube();
   leg1.color = [0.27,0.,0,1.0];
   leg1.textureNum = -2;
   if (g_normalOn) leg1.textureNum=-3;
   leg1.matrix.translate(-0.5,-0.01,.04);
   leg1.matrix.scale(0.2,0.235,.1);
   leg1.render();

   var leg2 = new Cube();
   leg2.color = [0.27,0.,0,1.0];
   leg2.textureNum = -2;
   if (g_normalOn) leg2.textureNum=-3;
   leg2.matrix.translate(-0.5,-0.24,.04);
   leg2.matrix.scale(0.2,0.235,.1);
   leg2.render();

   var leg3 = new Cube();
   leg3.color = [0.25,0.,0,1.0];
   leg3.textureNum = -2;
   if (g_normalOn) leg3.textureNum=-3;
   leg3.matrix.translate(-0.61,-0.24,0.35);
   leg3.matrix.scale(0.11,0.47,.2);
   leg3.render();

   var leg4 = new Cube();
   leg4.color = [0.27,0.,0,1.0];
   leg4.textureNum = -2;
   if (g_normalOn) leg4.textureNum=-3;
   leg4.matrix.translate(-0.1,-0.01,0.04);
   leg4.matrix.scale(0.2,0.235,.1);
   leg4.render();

   var leg5 = new Cube();
   leg5.color = [0.27,0.,0,1.0];
   leg5.textureNum = -2;
   if (g_normalOn) leg5.textureNum=-3;
   leg5.matrix.translate(-0.1,-0.24,0.04);
   leg5.matrix.scale(0.2,0.235,.1);
   leg5.render();

   var leg6 = new Cube();
   leg6.color = [0.25,0.,0,1.0];
   leg6.textureNum = -2;
   if (g_normalOn) leg6.textureNum=-3;
   leg6.matrix.translate(0.1,-0.24,0.35);
   leg6.matrix.scale(0.11,0.47,.2);
   leg6.render();


    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
}

//Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}