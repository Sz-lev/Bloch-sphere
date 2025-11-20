import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


const container = document.getElementById("container");
let alfa = document.getElementById("half").value / 180 * Math.PI;
let beta = document.getElementById("whole").value / 180 * Math.PI;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.5, 25);

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

const circleMat = new THREE.LineBasicMaterial({ color: 0xffffff });
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
let dir = new THREE.Vector3(Math.cos(beta) * Math.sin(alfa), Math.cos(alfa), Math.sin(beta) * Math.sin(alfa));
const origin = new THREE.Vector3(0, 0, 0);
let hex = 0xff0000;
const arrowHelper = new THREE.ArrowHelper(dir, origin, 1, hex);

scene.add(arrowHelper);

let qubitList = new Map();
let index = 1;

function addArrow() {
    let newDir = new THREE.Vector3(dir.x, dir.y, dir.z);
    hex = Math.floor(Math.random() * (256 * 256 * 256));
    const qubitName = "QuBit_" + index;
    const newArrowHelper = new THREE.ArrowHelper(newDir, origin, 1, hex);
    qubitList.set(qubitName, [newDir, newArrowHelper]);

    scene.add(newArrowHelper);

    const divElement = document.createElement("div");
    const spanElement = document.createElement("span");
    spanElement.textContent = qubitName;
    divElement.appendChild(spanElement);
    const delButton = document.createElement("button");
    delButton.textContent = "Delete";
    delButton.addEventListener("click", () => {
        document.getElementById("qubits").removeChild(divElement);
        qubitList.delete(qubitName);
        scene.remove(newArrowHelper);
    });
    divElement.appendChild(delButton);

    document.getElementById("qubits").appendChild(divElement);

    index = index + 1;
}

//labels
const labelRenderer = new CSS2DRenderer();
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

    const label = new CSS2DObject(div);
    label.position.copy(position);
    return label;
}

scene.add(makeLabel("|–i⟩", new THREE.Vector3(0, 0, 1.1)));
scene.add(makeLabel("|+i⟩", new THREE.Vector3(0, 0, -1.1)));
scene.add(makeLabel("|+⟩", new THREE.Vector3(1.1, 0, 0)));
scene.add(makeLabel("|–⟩", new THREE.Vector3(-1.1, 0, 0)));
scene.add(makeLabel("|0⟩", new THREE.Vector3(0, 1.1, 0)));
scene.add(makeLabel("|1⟩", new THREE.Vector3(0, -1.1, 0)));

const controls = new OrbitControls(camera, container);

animate();
controls.update();

function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// window.addEventListener("resize", () => {
//     camera.aspect = container.clientWidth / container.clientHeight;
//     renderer.setSize(container.clientWidth, container.clientHeight);
//     labelRenderer.setSize(container.clientWidth, container.clientHeight);
// });

//TODO functions to rotate
function invokeXGate() {
    for (let element of qubitList.values()) {
        XGate(element[0], element[1])
    }

    XGate(dir, arrowHelper);
    setSlides();
}

function XGate(direction, arrow) {
    direction.y = -direction.y;
    direction.z = -direction.z;
    arrow.setDirection(direction);
}

function invokeYGate() {
    for (let element of qubitList.values()) {
        YGate(element[0], element[1])
    }

    YGate(dir, arrowHelper);
    setSlides();
}

function YGate(direction, arrow) {
    direction.x = -direction.x;
    direction.z = -direction.z;
    arrow.setDirection(direction);
}

function invokeZGate() {
    for (let element of qubitList.values()) {
        ZGate(element[0], element[1])
    }

    ZGate(dir, arrowHelper);
    setSlides();
}

function ZGate(direction, arrow) {
    direction.x = -direction.x;
    direction.y = -direction.y;
    arrow.setDirection(direction);
}

function invokeHGate() {
    for (let element of qubitList.values()) {
        HadamardGate(element[0], element[1])
    }

    HadamardGate(dir, arrowHelper);
    setSlides();
}

function HadamardGate(direction, arrow) {
    let tmp = direction.y;
    direction.y = direction.x;
    direction.x = tmp;
    direction.z = -direction.z;

    arrow.setDirection(direction);
}

function invokeSGate() {
    for (let element of qubitList.values()) {
        SGate(element[0], element[1])
    }

    SGate(dir, arrowHelper);
    setSlides();
}

function SGate(direction, arrow) {
    let tmp = -direction.x;
    direction.x = direction.z;
    direction.z = tmp;
    arrow.setDirection(direction);
}

function setAngles() {
    alfa = document.getElementById("half").value / 180 * Math.PI;
    beta = document.getElementById("whole").value / 180 * Math.PI;

    dir.x = Math.cos(beta) * Math.sin(alfa);
    dir.y = Math.cos(alfa);
    dir.z = Math.sin(beta) * Math.sin(alfa);
    arrowHelper.setDirection(dir);
}

function setSlides() {
    let res = ((Math.atan2(dir.z, dir.x)) / Math.PI * 180);
    if (res < 0) {
        beta = Math.PI * 2 + (Math.atan2(dir.z, dir.x));
        document.getElementById("whole").value = (beta) / Math.PI * 180;
    } else {
        beta = Math.atan2(dir.z, dir.x);
        document.getElementById("whole").value = (beta) / Math.PI * 180;
    }
    alfa = Math.acos(dir.y)
    document.getElementById("half").value = alfa / Math.PI * 180;

}

function BuildGate() {
    document.getElementById("applyGates").style.display = "none";
    document.getElementById("buildGate").style.display = "block";
}

function Exit() {
    document.getElementById("applyGates").style.display = "block";
    document.getElementById("buildGate").style.display = "none";
}

let gatesfun = [];


function addGate(name) {
    addGateSpan(name);
    //document.getElementById("Gates").textContent = document.getElementById("Gates").textContent + name;
    switch (name) {

        case "X":
            gatesfun.push(invokeXGate);
            break;
        case "Y":
            gatesfun.push(invokeYGate);
            break;
        case "Z":
            gatesfun.push(invokeZGate);
            break;
        case "S":
            gatesfun.push(invokeSGate);
            break;
        case "H":
            gatesfun.push(invokeHGate);
            break;
    }
}

function addGateSpan(name) {
    const gDiv = document.getElementById("GatesDiv");
    const span = document.createElement("span");
    span.textContent = name;
    span.style.padding = "10px";
    span.style.border = "1px solid black";
    span.style.marginLeft = "2px";
    span.className = "GateSpan";
    gDiv.appendChild(span);
}

function invokeGates() {
    for (let i = 0; i < gatesfun.length; i++) {
        gatesfun[i]();
    }
}

function deleteGates() {
    gatesfun.splice(0, gatesfun.length);
    const gateDiv = document.getElementById("GatesDiv");
    const nodes = gateDiv.childNodes;

    for(const i in nodes) {
        console.log(i);
        //gateDiv.removeChild();

    }
}

document.getElementById("XGate").addEventListener("click", invokeXGate);
document.getElementById("YGate").addEventListener("click", invokeYGate);
document.getElementById("ZGate").addEventListener("click", invokeZGate);
document.getElementById("SGate").addEventListener("click", invokeSGate);
document.getElementById("Hadamard").addEventListener("click", invokeHGate);

document.getElementById("AddQubit").addEventListener("click", addArrow);

document.getElementById("bgButton").addEventListener("click", BuildGate);
document.getElementById("addXGate").addEventListener("click", () => addGate("X"));
document.getElementById("addYGate").addEventListener("click", () => addGate("Y"));
document.getElementById("addZGate").addEventListener("click", () => addGate("Z"));
document.getElementById("addSGate").addEventListener("click", () => addGate("S"));
document.getElementById("addHadamard").addEventListener("click", () => addGate("H"));

document.getElementById("UseGates").addEventListener("click", invokeGates);
document.getElementById("ExitButton").addEventListener("click", Exit);
document.getElementById("DeleteGates").addEventListener("click", deleteGates);

document.getElementById("half").addEventListener("input", setAngles);
document.getElementById("whole").addEventListener("input", setAngles);