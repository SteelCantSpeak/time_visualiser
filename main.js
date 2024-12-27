// Scene, camera, and renderer setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a sphere geometry with radius 1, 32 width segments, and 32 height segments
const geometry = new THREE.SphereGeometry(1, 32, 32);
// Use MeshStandardMaterial for solid shading
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, emissive: 0x000000, metalness: 0.5, roughness: 0.5 });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Add a directional light to simulate sunlight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize();  // Set position of the light
scene.add(directionalLight);

// Add an ambient light for softer illumination
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);  // Soft ambient light
scene.add(ambientLight);

// Set up shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;
sphere.castShadow = true;
sphere.receiveShadow = true;

// Camera position
camera.position.z = 2;
sphere.rotation.z += 0.1;

// Animation loop to render and update the sphere
function animate() {
  requestAnimationFrame(animate);

  // Rotate the sphere itself for some additional animation
  sphere.rotation.y += 0.001;

  // Update the material's emissive color based on the direction of light
  const lightIntensity = directionalLight.intensity;
  const dotProduct = directionalLight.position.clone().normalize().dot(sphere.position.clone().normalize());

  renderer.render(scene, camera);
}

animate(); // Start the animation loop