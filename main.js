import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as helper from './helpers.js';

const SPHERE_RADIUS = 1;

const renderer = new THREE.WebGPURenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x010103 );

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 2);
controls.target.set(0, 0, 0);
controls.update();

const textureLoader = new THREE.TextureLoader();
const dayTexture = textureLoader.load('static/atlas1.jpg');
dayTexture.colorSpace = THREE.SRGBColorSpace;
dayTexture.anisotropy = 8;

function createMesh(geometry, material, position, name, layer) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.layers.set(layer);
    return mesh;
}

// Create the Globe
const globe = createMesh(
    new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64),
    new THREE.MeshStandardMaterial({ map: dayTexture }),
    new THREE.Vector3(0, 0, 0),
    'Earth',
    0
);

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
scene.add(globe);

let spin = true;

function animate() {
    requestAnimationFrame(animate);
    if (spin) globe.rotation.y += 0.0005;
    controls.update();
    renderer.renderAsync(scene, camera);
}
animate();



//helper.AusCap.forEach(([lat, lon, color]) => helper.createMarker(globe, lat, lon, color));
//helper.usCap.forEach(([lat, lon, color]) => helper.createMarker(globe, lat, lon, color));


window.addEventListener('resize', onWindowResize);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousedown', async (event) => {
    hidePopup();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(globe);

    if (!intersects.length) return;

    const point = intersects[0].point;
    const [lat, lon] = helper.getLatLon(globe, point);
    const text = `Latitude: ${lat.toFixed(6)}<br>Longitude: ${lon.toFixed(6)}`;

    showPopup(event.clientX, event.clientY, text);
    let marker = helper.createMarker(globe, lat, lon, 0xff00ff);
    const tzData = await helper.fetchTimeZone(lat, lon);
    if (tzData) {
        const formattedTime = new Date().toLocaleString('en-US', {
            timeZone: tzData.name,
        day: 'numeric',
        month: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
        });
        showPopup(event.clientX, event.clientY, `${text}<br>Name: ${tzData.name}<br>Time: ${formattedTime}`);
    }
});




const popup = document.getElementById('popup');

function showPopup(x, y, content) {
    popup.innerHTML = content;
    popup.style.display = 'block';

    const popupRect = popup.getBoundingClientRect();
    const margin = 10; // margin from window edges

    // Default positions
    let left = x;
    let top = y;

    // Check right overflow
    if (x + popupRect.width + margin > window.innerWidth) {
        left = window.innerWidth - popupRect.width - margin;
    }
    // Check bottom overflow
    if (y + popupRect.height + margin > window.innerHeight) {
        top = window.innerHeight - popupRect.height - margin;
    }

    // Prevent negative positioning
    if (left < margin) left = margin;
    if (top < margin) top = margin;

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    spin = false;
}


function hidePopup() {
    helper.removeMarkers(globe);
    popup.style.display = 'none';
    spin = true;
}


const clock = document.getElementById('clock');

function updateClock() {
    clock.textContent = new Date().toLocaleString('en-US', {
        day: 'numeric',
        month: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
        });
}
updateClock();
setInterval(updateClock, 1000);
