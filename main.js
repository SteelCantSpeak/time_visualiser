import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import * as tz from 'tz';

// 1. Setup scene, camera, and renderer
const renderer = new THREE.WebGPURenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 2);
camera.layers.enable(1);
controls.target.set(0, 0, 0);
controls.update();      

// Render loop
function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.001;
    controls.update();
    renderer.renderAsync(scene, camera);
}

//End Setup

const textureLoader = new THREE.TextureLoader();
const dayTexture = textureLoader.load( 'static/earth_day_4096.jpg' );
				dayTexture.colorSpace = THREE.SRGBColorSpace;
				dayTexture.anisotropy = 8;

function createMesh(geometry, material, x, y, z, name, layer) {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(x, y, z);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    return mesh;
  }

let globe = createMesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({ map:dayTexture }), 
    0, 0, 0,
    'Earth',
    0
);
scene.add(globe);

//End Scene

window.addEventListener( 'resize', onWindowResize );

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

const raycaster = new THREE.Raycaster();

document.addEventListener('mousedown', onMouseDown);

function onMouseDown(event) {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1),
  );

  raycaster.setFromCamera(coords, camera);

  const intersections = raycaster.intersectObjects(scene.children, true);
  if (intersections.length > 0) {    
    // Convert the intersection point from Cartesian to spherical coordinates
    const latLon = cartesianToLatLon(intersections[0].point);
    console.log('Latitude:', latLon.latitude, 'Longitude:', latLon.longitude);
    
    //get TZ from https://www.geoapify.com/get-timezone-from-lat-long-geographical-coordinates/
    var requestOptions = {
        method: 'GET',
        };
        fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latLon.latitude}&lon=${latLon.longitude}&apiKey=c73c6e8231eb430ab8f2cb52b14ec1da`, requestOptions)
        .then(response => response.json())
        .then(result => console.log(result.features[0].properties.timezone))
        .catch(error => console.log('error', error));
    }
}

// Function to convert Cartesian coordinates to Latitude/Longitude
function cartesianToLatLon(point) {
    const radius = 1;  // Radius of the sphere
    const longitude = Math.atan2(point.z, point.x);  // Longitude: atan2(z, x)
    const latitude = Math.asin(point.y / radius);    // Latitude: asin(y / radius)
    // Convert radians to degrees
    return {
        latitude: latitude * (180 / Math.PI),
        longitude: longitude * (180 / Math.PI)
    };
}

animate();