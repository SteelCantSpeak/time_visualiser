import * as THREE from 'three';

const AusCap = [
    [-35.2809, 149.1300, 0xff0000], // Canberra (Australian Capital Territory)
[-37.8136, 144.9631, 0x00ff00], // Melbourne (Victoria)
[-33.8688, 151.2093, 0x0000ff], // Sydney (New South Wales)
[-34.9285, 138.6007, 0xffff00], // Adelaide (South Australia)
[-27.4698, 153.0251, 0xff00ff], // Brisbane (Queensland)
[-31.9505, 115.8605, 0x00ffff], // Perth (Western Australia)
[-42.8821, 147.3272, 0xff8000], // Hobart (Tasmania)
[-12.4634, 130.8456, 0x8000ff], // Darwin (Northern Territory)
];

const usCap = [
    [34.0522, -118.2437, 0xff0000], // Sacramento, California
[58.3019, -134.4197, 0x00ff00], // Juneau, Alaska
[33.4484, -112.0740, 0x0000ff], // Phoenix, Arizona
[34.7465, -92.2896, 0xffff00], // Little Rock, Arkansas
[39.1903, -96.5861, 0xff00ff], // Topeka, Kansas
[39.0997, -94.5786, 0x00ffff], // Kansas City, Missouri (Note: Capital is Jefferson City)
[38.5767, -92.1735, 0xff8000], // Jefferson City, Missouri
[42.6526, -73.7562, 0x8000ff], // Albany, New York
[36.1627, -86.7816, 0xff0080], // Nashville, Tennessee
[32.7765, -79.9311, 0x0080ff], // Columbia, South Carolina
[39.7684, -86.1581, 0x80ff00], // Indianapolis, Indiana
[39.1031, -84.5120, 0xff8000], // Columbus, Ohio
[44.9429, -123.0351, 0x800080], // Salem, Oregon
[44.2601, -72.5754, 0x008080], // Montpelier, Vermont
[30.2747, -97.7403, 0xff0080], // Austin, Texas
[41.7637, -72.6851, 0x0080ff], // Hartford, Connecticut
[35.7796, -78.6382, 0xff8000], // Raleigh, North Carolina
[39.7392, -104.9903, 0x8000ff], // Denver, Colorado
[27.9944, -81.7603, 0x00ff80], // Tallahassee, Florida
[43.0747, -89.3844, 0xff00ff], // Madison, Wisconsin
[35.4676, -97.5164, 0x00ffff], // Oklahoma City, Oklahoma
[38.9072, -77.0369, 0xff0000], // Washington, D.C.
[40.2732, -76.8867, 0x00ff00], // Harrisburg, Pennsylvania
[40.8136, -96.7026, 0x0000ff], // Lincoln, Nebraska
[44.3148, -85.6024, 0xffff00], // Lansing, Michigan
[44.9434, -93.0936, 0xff00ff], // St. Paul, Minnesota
[43.6187, -116.2146, 0x00ffff], // Boise, Idaho
[39.1638, -119.7674, 0xff8000], // Carson City, Nevada
[44.3106, -69.7795, 0x800080], // Augusta, Maine
[37.5407, -77.4360, 0x008080], // Richmond, Virginia
[43.2081, -71.5376, 0xff0080], // Concord, New Hampshire
[33.7490, -84.3880, 0x0080ff], // Atlanta, Georgia
[46.5958, -112.0270, 0xff8000], // Helena, Montana
[36.8508, -76.2859, 0x8000ff], // Richmond, Virginia
[40.7608, -111.8910, 0x00ff80], // Salt Lake City, Utah
[41.8339, -71.4170, 0xff00ff], // Providence, Rhode Island
[32.2988, -90.1848, 0x00ffff], // Jackson, Mississippi
[46.8797, -110.3626, 0xff0000], // Helena, Montana
[33.5207, -86.8025, 0x00ff00], // Montgomery, Alabama
[42.3601, -71.0589, 0x0000ff], // Boston, Massachusetts
[36.1733, -95.9390, 0xffff00], // Tulsa, Oklahoma (Note: Capital is Oklahoma City)
[40.7608, -111.8910, 0xff00ff], // Salt Lake City, Utah
[35.9940, -78.8986, 0x00ffff], // Raleigh, North Carolina
[39.7684, -86.1581, 0xff8000], // Indianapolis, Indiana
[44.9537, -93.0900, 0x800080], // St. Paul, Minnesota

];


function getLatLon(globe, point) {
    const localPoint = globe.worldToLocal(point.clone());
    const spherical = new THREE.Spherical().setFromVector3(localPoint);
    const lat = 90 - THREE.MathUtils.radToDeg(spherical.phi);
    let lon = THREE.MathUtils.radToDeg(spherical.theta) - 90;

    if (lon < -180) lon += 360;
    if (lon > 180) lon -= 360;

    return [lat, lon];
}

async function fetchTimeZone(lat, lon) {
    try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=c73c6e8231eb430ab8f2cb52b14ec1da`);
        const result = await response.json();
        return result.features?.[0]?.properties?.timezone ?? null;
    } catch {
        return null;
    }
}

function latLonToCartesian(latitude, longitude, radius) {
    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude + 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
}

function createMarker(globe, latitude, longitude, color) {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.01, 16, 16), new THREE.MeshBasicMaterial({ color }));
    marker.position.copy(latLonToCartesian(latitude, longitude, 1.01));
    marker.name = 'marker';
    globe.add(marker);
}

function removeMarkers(globe){
    globe.children.forEach((child) => {
  if (child.name === 'marker') {
    globe.remove(child);
    child.geometry.dispose();
    child.material.dispose();
  }
});
}

export {AusCap, usCap, getLatLon, fetchTimeZone, latLonToCartesian, createMarker, removeMarkers}