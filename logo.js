// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require("three");

// Include any additional ThreeJS examples below
require("three/examples/js/controls/OrbitControls");

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
  renderer.setClearColor("#000", 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100);
  camera.position.set(0, 0, -4);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

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
  scene.add(mesh);

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
