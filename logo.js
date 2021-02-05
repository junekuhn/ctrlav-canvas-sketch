
/*
todo

Three Group 
mesh
coloring
fonts
buffer geometry
custom shading

https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_text_stroke.html

*/



// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/loaders/SVGLoader.js");


const canvasSketch = require("canvas-sketch");

const settings = {
   // canvas size
   dimensions: [1080,1080],
   // units: "in",
   scaleToView: true,
   pixelsPerInch: 150,
   orientation: "portrait",
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: "webgl"
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });

  // WebGL background color
  renderer.setClearColor("#fff", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  //font
  const fontLoader = new THREE.FontLoader();
  fontLoader.load('coolvetica.json', (font) => {
      const color = new THREE.Color( 0x000000 );

      const matDark = new THREE.MeshBasicMaterial( {
         color: color,
         side: THREE.DoubleSide
      } );

      const matLite = new THREE.MeshBasicMaterial( {
         color: color,
         transparent: true,
         opacity: 0.4,
         side: THREE.DoubleSide
      } );

      const message = "ctrlAV";

      const shapes = font.generateShapes( message, 1 );

      const geometry = new THREE.ShapeGeometry( shapes );

      geometry.computeBoundingBox();

      const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

      geometry.translate( xMid, 0, 0 );

      // make shape ( N.B. edge view not visible )

      const text = new THREE.Mesh( geometry, matLite );
      text.position.z = - 150;
      scene.add( text );

      // make line shape ( N.B. edge view remains visible )

      const holeShapes = [];

      for ( let i = 0; i < shapes.length; i ++ ) {

         const shape = shapes[ i ];

         if ( shape.holes && shape.holes.length > 0 ) {

            for ( let j = 0; j < shape.holes.length; j ++ ) {

               const hole = shape.holes[ j ];
               holeShapes.push( hole );

            }

         }

      }

      shapes.push.apply( shapes, holeShapes );

      const style = THREE.SVGLoader.getStrokeStyle( 0.05, color.getStyle() );

      const strokeText = new THREE.Group();

      for ( let i = 0; i < shapes.length; i ++ ) {

         const shape = shapes[ i ];

         const points = shape.getPoints();

         const geometry = THREE.SVGLoader.pointsToStroke( points, style );

         geometry.translate( xMid, 0, 0 );

         const strokeMesh = new THREE.Mesh( geometry, matDark );
         strokeText.add( strokeMesh );

      }

      scene.add( strokeText );
  });

  // Setup a geometry
  const geometry = new THREE.BoxGeometry(2,2,2);

  const vertexShader = /* glsl */ `
  //built into three
  varying vec2 vUv;
  uniform float time;

   void main() {
    vec3 transformed = position.xyz;

    // Here we scale X and Z of the geometry by some modifier
    transformed.xz *= sin(position.y + 0.1 * time);
     vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.0);
   }


  `;

  const fragmentShader = /* glsl */`
  varying vec2 vUv;
  uniform vec3 color;
  uniform float time;

    void main() {
      gl_FragColor = vec4(vec3(vUv.x + 0.3*sin(time)) * color, 1.0);
    }
  `;

  // Setup a material
  const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color("white") }
      },
      vertexShader,
      fragmentShader
  });

  // Setup a mesh with geometry + material
  const mesh = new THREE.Mesh(geometry, material);
  //scene.add(mesh);

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      material.uniforms.time.value = time;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
