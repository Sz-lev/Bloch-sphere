import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';


/**
 * The container is the HTML element that contains the bloch sphere.
 * The alfa and beta values are used in the parametric equation of the sphere
 */
const container = document.getElementById("container");
let alfa = document.getElementById("half").value / 180 * Math.PI;
let beta = document.getElementById("whole").value / 180 * Math.PI;


//Initializing the scene, camera and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.5, 25);
camera.position.set(1, 1, 3);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(container.clientWidth, container.clientHeight);

//Adds the canvas of the renderer to the container HTML element
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
//Calculate the points of the circle
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


//Axes
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


//Initializing the first and main rrow
let dir = new THREE.Vector3(Math.cos(beta) * Math.sin(alfa), Math.cos(alfa), -Math.sin(beta) * Math.sin(alfa));
const origin = new THREE.Vector3(0, 0, 0);
let hex = 0xff0000;
const arrowHelper = new THREE.ArrowHelper(dir, origin, 1, hex);

scene.add(arrowHelper);


//initializing the qubit list
let qubitList = new Map();
let index = 1;

//Adds a qubit and arrow with the current direction
function addArrow() {
    let newDir = new THREE.Vector3(dir.x, dir.y, dir.z);
    hex = Math.floor(Math.random() * (256 * 256 * 256));
    const qubitName = "QuBit_" + index;
    const newArrowHelper = new THREE.ArrowHelper(newDir, origin, 1, hex);
    qubitList.set(qubitName, [newDir, newArrowHelper]);

    scene.add(newArrowHelper);

    createNewQubitHTML(qubitName, newArrowHelper);
}

//Adds the new qubit as an HTML element to the page
function createNewQubitHTML(name, arrow) {
    const divElement = document.createElement("div");
    divElement.style.display = "inline-block";
    divElement.style.margin = "15px";
    const spanElement = document.createElement("span");
    spanElement.textContent = name;
    divElement.appendChild(spanElement);
    const delButton = document.createElement("button");
    delButton.textContent = "Delete";
    delButton.addEventListener("click", () => {
        document.getElementById("qubits").removeChild(divElement);
        qubitList.delete(name);
        scene.remove(arrow);
    });
    divElement.appendChild(delButton);

    document.getElementById("qubits").appendChild(divElement);

    index = index + 1;
}

//Initializing the labelrenderer used for the labels of the axes
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
container.appendChild(labelRenderer.domElement);


//Function to create the labels with the given name and position
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


//Creating the control to be able to rotate the sphere with the mouse
const controls = new OrbitControls(camera, container);

//The function for the animation, updates the OrbitControl, the renderer and the labelrenderer
function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

animate();
controls.update();


//functions to apply the effects of a quantum gate
function invokeHGate() {
    for (let element of qubitList.values()) {
        HadamardGate(element[0], element[1])
    }

    HadamardGate(dir, arrowHelper);
    setSlides();
}

function HadamardGate(direction, arrow) {
    PGate(direction, arrow, Math.PI/2);
    RxGate(direction, arrow, -Math.PI/2);
    PGate(direction, arrow, Math.PI/2);

    arrow.setDirection(direction);
}

function invokeRxGate(angle){

    if (angle === undefined) {
        angle = document.getElementById("RxAngle").value / 180 * Math.PI;
    }

    for (let element of qubitList.values()) {
        RxGate(element[0], element[1], angle)
    }

    RxGate(dir, arrowHelper, angle);
    setSlides();
}

function RxGate(direction, arrow, angle) {
    let z = direction.z;
    let y = direction.y;
    direction.y = (Math.cos(angle)*y) + (Math.sin(angle)*z);
    direction.z = -(Math.sin(angle)*y) + (Math.cos(angle)*z);

    arrow.setDirection(direction);
}

function invokeRyGate(angle){
    
    if (angle === undefined) {
        angle = document.getElementById("RyAngle").value / 180 * Math.PI;
    }

    for (let element of qubitList.values()) {
        RyGate(element[0], element[1], angle)
    }

    RyGate(dir, arrowHelper, angle);
    setSlides();
    return angle
}

function RyGate(direction, arrow, angle) {
    let x = direction.x;
    let y = direction.y;

    direction.x =  (Math.cos(angle)*x) + (Math.sin(angle)*y);
    direction.y =  -(Math.sin(angle)*x) + (Math.cos(angle)*y);

    arrow.setDirection(direction);
}

function invokePGate(angle) {

    if (angle === undefined) {
        angle = document.getElementById("PAngle").value / 180 * Math.PI;
    }

    for (let element of qubitList.values()) {
        PGate(element[0], element[1], angle)
    }

    PGate(dir, arrowHelper, angle);
    setSlides();
}

function PGate(direction, arrow, angle) {
    let tmp = direction.x;
    direction.x = (Math.cos(angle)*tmp) + (Math.sin(angle)*direction.z);
    direction.z = -(Math.sin(angle)*tmp) + (Math.cos(angle)*direction.z);

    arrow.setDirection(direction);
}

function updateParametricVars() {
    alfa = document.getElementById("half").value / 180 * Math.PI;
    beta = document.getElementById("whole").value / 180 * Math.PI;

}


//Updates the variables used in the parametric equation of the sphere, and direction variable, and then sets the arrow in that direction
function setAngles() {
    updateParametricVars();

    dir.x = Math.cos(beta) * Math.sin(alfa);
    dir.y = Math.cos(alfa);
    dir.z = -Math.sin(beta) * Math.sin(alfa);
    arrowHelper.setDirection(dir);
}


//Sets the values of the rangeslides calculated from the actual vector of the direction
function setSlides() {
    let res = ((Math.atan2(-dir.z, dir.x)) / Math.PI * 180);
    if (res < 0) {
        beta = Math.PI * 2 + (Math.atan2(-dir.z, dir.x));
        document.getElementById("whole").value = (beta) / Math.PI * 180;
    } else {
        beta = Math.atan2(-dir.z, dir.x);
        document.getElementById("whole").value = (beta) / Math.PI * 180;
    }
    alfa = Math.acos(dir.y)
    document.getElementById("half").value = alfa / Math.PI * 180;

}

//Sets the build gate section visible and hides the apply gates section
function BuildGate() {
    document.getElementById("applyGates").style.display = "none";
    document.getElementById("buildGate").style.display = "block";
}

//Sets the apply gates section visible and hides the build gates section
function Exit() {
    document.getElementById("applyGates").style.display = "block";
    document.getElementById("buildGate").style.display = "none";
}


//List that stores the linked gates in order
let gatesFunList = [];


//Adds the effect of the new gate to the gatesFunList
function addGate(name) {
    let angle;
    switch (name) {
        case "X":
            gatesFunList.push(() => invokeRxGate(Math.PI));
            break;
        case "Y":
            gatesFunList.push(() => invokeRyGate(Math.PI));
            break;
        case "Z":
            gatesFunList.push(() => invokePGate(Math.PI));
            break;
        case "S":
            gatesFunList.push(() => invokePGate(Math.PI/2));
            break;
        case "T":
            gatesFunList.push(() => invokePGate(Math.PI/4));
            break;
        case "H":
            gatesFunList.push(invokeHGate);
            break;
        case "P":
            angle = document.getElementById("addPAngle").value;
            gatesFunList.push(() => invokePGate(degreeToRad(angle)));
            break;
        case "Rx":
            angle = document.getElementById("addRxAngle").value;

            gatesFunList.push(() => invokeRxGate(degreeToRad(angle)));
            break;
        case "Ry":
            angle = document.getElementById("addRyAngle").value;
            gatesFunList.push(() => invokeRyGate(degreeToRad(angle)));
            break;
    }
    addGateSpan(name, angle);
}

//Creates the HTML element that represents a gate in the linked gates
function addGateSpan(name, angle) {
    const gDiv = document.getElementById("GatesDiv");
    const span = document.createElement("span");
    if(angle === undefined){
        span.textContent = name;
    }
    else{
        span.textContent = name + '(' + angle + "fok" + ')';
    }
    span.style.padding = "10px";
    span.style.border = "1px solid black";
    span.style.marginLeft = "2px";
    span.className = "GateSpan";
    gDiv.appendChild(span);
}

//Invokes the effects of the linked gates
function invokeGates() {
    for (let i = 0; i < gatesFunList.length; i++) {
        gatesFunList[i]();
    }
}

//Deletes the linked gates from the list and from the HTML
function deleteGates() {
    gatesFunList.splice(0, gatesFunList.length);
    const gateDiv = document.getElementById("GatesDiv");
    while (gateDiv.childElementCount > 1) {
        const child = gateDiv.lastChild;
        gateDiv.removeChild(child);
    }
}

function degreeToRad(degree){
    let rad = degree / 180 * Math.PI;
    return rad;
}

function radToDegree(rad){
    let degree = rad * 180 / Math.PI;
    return degree;
}

//Setting the effects of the buttons clicked with the corresponding function
document.getElementById("XGate").addEventListener("click", () => invokeRxGate(Math.PI));
document.getElementById("YGate").addEventListener("click", () => invokeRyGate(Math.PI));
document.getElementById("ZGate").addEventListener("click", () => invokePGate(Math.PI));
document.getElementById("SGate").addEventListener("click", () => invokePGate(Math.PI/2));
document.getElementById("TGate").addEventListener("click", () => invokePGate(Math.PI/4));
document.getElementById("Hadamard").addEventListener("click", invokeHGate);
document.getElementById("PGate").addEventListener("click", () => invokePGate());
document.getElementById("RxGate").addEventListener("click", () => invokeRxGate());
document.getElementById("RyGate").addEventListener("click", () => invokeRyGate());

document.getElementById("AddQubit").addEventListener("click", addArrow);

document.getElementById("bgButton").addEventListener("click", BuildGate);
document.getElementById("addXGate").addEventListener("click", () => addGate("X"));
document.getElementById("addYGate").addEventListener("click", () => addGate("Y"));
document.getElementById("addZGate").addEventListener("click", () => addGate("Z"));
document.getElementById("addSGate").addEventListener("click", () => addGate("S"));
document.getElementById("addTGate").addEventListener("click", () => addGate("T"));
document.getElementById("addHadamard").addEventListener("click", () => addGate("H"));
document.getElementById("addPGate").addEventListener("click", () => addGate("P"));
document.getElementById("addRxGate").addEventListener("click", () => addGate("Rx"));
document.getElementById("addRyGate").addEventListener("click", () => addGate("Ry"));

document.getElementById("UseGates").addEventListener("click", invokeGates);
document.getElementById("ExitButton").addEventListener("click", Exit);
document.getElementById("DeleteGates").addEventListener("click", deleteGates);

document.getElementById("half").addEventListener("input", setAngles);
document.getElementById("whole").addEventListener("input", setAngles);