// import * as THREE from "three";
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


const container = document.getElementById("container");
let alfa = document.getElementById("half").value/180*Math.PI;
let beta = document.getElementById("whole").value/180*Math.PI;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.5, 50);

camera.position.set(1, 1, 3);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();



renderer.setSize(container.clientWidth, container.clientHeight);

container.appendChild(renderer.domElement);


//Sphere
const sphereGeo = new THREE.SphereGeometry(1, 50, 50);
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    opacity: 0.3,
    transparent: true,
});
const sphere = new THREE.Mesh(sphereGeo, sphereMat);

scene.add(sphere);


//Circle
let circlePoints = []

const transmission = Math.PI / 50 * 2;
for (let i = 0; i <= 50; i++) {
    circlePoints.push(new THREE.Vector3(Math.sin(i * transmission), Math.cos(i * transmission), 0));
}

const circleMat = new THREE.LineBasicMaterial({ color: 0xffffff});
const circleGeo = new THREE.BufferGeometry().setFromPoints(circlePoints);
const circle1 = new THREE.Line(circleGeo, circleMat);
const circle2 = new THREE.Line(circleGeo, circleMat);
const circle3 = new THREE.Line(circleGeo, circleMat);
circle2.rotateX(Math.PI / 2);
circle3.rotateY(Math.PI / 2);

scene.add(circle1);
scene.add(circle2);
scene.add(circle3);

//Axis
let axisPointsX = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)];
let axisPointsY = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)];
let axisPointsZ = [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];


const lineMatX = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const lineGeoX = new THREE.BufferGeometry().setFromPoints(axisPointsX);

const lineMatY = new THREE.LineBasicMaterial({ color: 0x0000ff });
const lineGeoY = new THREE.BufferGeometry().setFromPoints(axisPointsY);

const lineMatZ = new THREE.LineBasicMaterial({ color: 0xffff00 });
const lineGeoZ = new THREE.BufferGeometry().setFromPoints(axisPointsZ);

const lineX = new THREE.Line(lineGeoX, lineMatX);
const lineY = new THREE.Line(lineGeoY, lineMatY);
const lineZ = new THREE.Line(lineGeoZ, lineMatZ);

scene.add(lineX);
scene.add(lineY);
scene.add(lineZ);

//arrow
let dir = new THREE.Vector3(Math.cos(beta)*Math.sin(alfa), Math.cos(alfa), Math.sin(beta)*Math.sin(alfa));
const origin = new THREE.Vector3(0,0,0);
const hex = 0xff0000;
const arrowHelper = new THREE.ArrowHelper( dir, origin, 1, hex );
scene.add( arrowHelper );

//labels
const labelRenderer = new THREE.CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
container.appendChild(labelRenderer.domElement);


function makeLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'label';
    div.textContent = text;
    div.style.color = 'white';
    div.style.fontSize = '20px';

    const label = new THREE.CSS2DObject(div);
    label.position.copy(position);
    return label;
}

scene.add(makeLabel("|–i⟩", new THREE.Vector3(0, 0, 1.1)));
scene.add(makeLabel("|+i⟩", new THREE.Vector3(0, 0, -1.1)));
scene.add(makeLabel("|+⟩", new THREE.Vector3(1.1, 0, 0)));
scene.add(makeLabel("|–⟩", new THREE.Vector3(-1.1, 0, 0)));
scene.add(makeLabel("|0⟩", new THREE.Vector3(0, 1.1, 0)));
scene.add(makeLabel("|1⟩", new THREE.Vector3(0, -1.1, 0)));

const controls = new THREE.OrbitControls(camera, container);

animate();
controls.update();

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    renderer.setSize(container.clientWidth, container.clientHeight);
    labelRenderer.setSize(container.clientWidth, container.clientHeight);
});

//TODO functions to rotate
function applyXGate() {
    dir.y = -dir.y;
    dir.z = -dir.z;
    arrowHelper.setDirection(dir);
    setSlides();
}

function applyYGate() {
    dir.x = -dir.x;
    dir.z = -dir.z;
    arrowHelper.setDirection(dir);
    setSlides();
}

function applyZGate() {
    dir.x = -dir.x;
    dir.y = -dir.y;
    arrowHelper.setDirection(dir);
    setSlides();
}

function applyHadamardGate() {
    let tmp = dir.y;
    dir.y = dir.x;
    dir.x = tmp;
    dir.z = -dir.z;
    arrowHelper.setDirection(dir);
    setSlides();
}

function applySGate() {
    // setAngles();
    // dir.x = Math.cos(beta - Math.PI/2)*Math.sin(alfa);
    // dir.z = Math.sin(beta - Math.PI/2)*Math.sin(alfa);
    let tmp = -dir.x;
    dir.x = dir.z;
    dir.z = tmp;
    arrowHelper.setDirection(dir);
    setSlides();
}

function setAngles() {
    alfa = document.getElementById("half").value/180*Math.PI;
    beta = document.getElementById("whole").value/180*Math.PI;
    dir = new THREE.Vector3(Math.cos(beta)*Math.sin(alfa), Math.cos(alfa), Math.sin(beta)*Math.sin(alfa));
    arrowHelper.setDirection(dir);
}

function setSlides() {
    let res = ((Math.atan2(dir.z,dir.x))/Math.PI*180);
    if(res < 0) {
        document.getElementById("whole").value = (Math.PI*2 + (Math.atan2(dir.z,dir.x)))/Math.PI*180;
    } else {
        document.getElementById("whole").value = (Math.atan2(dir.z,dir.x))/Math.PI*180;
    }
    document.getElementById("half").value = Math.acos(dir.y)/Math.PI*180;
    
}

document.getElementById("XGate").addEventListener("click", applyXGate);
document.getElementById("YGate").addEventListener("click", applyYGate);
document.getElementById("ZGate").addEventListener("click", applyZGate);
document.getElementById("SGate").addEventListener("click", applySGate);
document.getElementById("Hadamard").addEventListener("click", applyHadamardGate);
document.getElementById("half").addEventListener("input", setAngles);
document.getElementById("whole").addEventListener("input", setAngles);