class Cube{
    constructor(){
         this.type='cube';
         //this.position = [0.0, 0.0, 0.0];
         this.color = [1.0, 1.0, 1.0, 1.0];
         //this.size = 5.0;
         this.matrix = new Matrix4();
         this.textureNum = -2;
     }
 
   // Render this shape
   render() {
      var rgba = this.color;

      //Pass the texture number
      gl.uniform1i(u_whichTexture, this.textureNum);
      //We have 4f below as we are passing 4 floating point values
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      drawTriangle3DUVNormal([0,0,0,  1,1,0,  1,0,0], 
                             [0,0, 1,1, 1,0],
                             [0,0,-1, 0,0,-1, 0,0,-1]);

      drawTriangle3DUVNormal([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1], [0,0,-1, 0,0,-1, 0,0,-1]);

      //Fake the lighting by coloring different sides slightly different color
      //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

      drawTriangle3DUVNormal([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1], [0,1,0, 0,1,0, 0,1,0]);
      drawTriangle3DUVNormal([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0], [0,1,0, 0,1,0, 0,1,0]);

      //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
      drawTriangle3DUVNormal([1,1,0,  1,1,1,  1,0,0], [0,0, 0,1, 1,1], [1,0,0, 1,0,0, 1,0,0]);
      drawTriangle3DUVNormal([1,0,0,  1,1,1,  1,0,1], [0,0, 1,1, 1,0], [1,0,0, 1,0,0, 1,0,0]);

      //gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
      drawTriangle3DUVNormal([0,1,0,  0,1,1,  0,0,0], [0,0, 0,1, 1,1], [-1,0,0, -1,0,0, -1,0,0]);
      drawTriangle3DUVNormal([0,0,0,  0,1,1,  0,0,1], [0,0, 1,1, 1,0], [-1,0,0, -1,0,0, -1,0,0]);

      //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
      drawTriangle3DUVNormal([0,0,0,  0,0,1,  1,0,1], [0,0, 0,1, 1,1], [0,-1,0, 0,-1,0, 0,-1,0]);
      drawTriangle3DUVNormal([0,0,0,  1,0,1,  1,0,0], [0,0, 1,1, 1,0], [0,-1,0, 0,-1,0, 0,-1,0]);

      //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
      drawTriangle3DUVNormal([0,0,1,  1,1,1,  1,0,1], [0,0, 0,1, 1,1], [0,0,1, 0,0,1, 0,0,1]);
      drawTriangle3DUVNormal([0,0,1,  0,1,1,  1,1,1], [0,0, 1,1, 1,0], [0,0,1, 0,0,1, 0,0,1]);
   }

   renderOld() {
    var rgba = this.color;

    //Pass the texture number
    gl.uniform1i(u_whichTexture, this.textureNum);
    //We have 4f below as we are passing 4 floating point values
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [1,0,0,1,1,1]);
    drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0,0,1,1,1]);

    //Fake the lighting by coloring different sides slightly different color
    gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

    drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [1,0,0,1,1,1]);
    drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0,0,1,1,1]);

    drawTriangle3DUV([1,1,0,  1,0,0,  1,1,1], [1,0,0,1,1,1]);
    drawTriangle3DUV([1,0,0,  1,1,1,  1,0,1], [0,0,0,1,1,1]);

    drawTriangle3DUV([0,1,0,  0,0,0,  0,0,1], [1,0,0,1,1,1]);
    drawTriangle3DUV([0,1,0,  0,0,1,  0,1,1], [0,0,0,1,1,1]);

    drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [1,0,0,1,1,1]);
    drawTriangle3DUV([0,0,0,  1,0,1,  1,0,0], [0,0,0,1,1,1]);

    drawTriangle3DUV([0,0,1,  0,1,1,  1,1,1], [1,0,0,1,1,1]);
    drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0,0,1,1,1]);
 }
 }