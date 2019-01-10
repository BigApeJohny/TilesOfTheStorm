var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
var mouse;
var raycaster;
var renderer = new THREE.WebGLRenderer();
var spaceBetweenItems = 1;
var yourTurn = false;
var objects = [];
var _board;
var raycastObjects = [];
var chosenObjects = [];
var objectsRepository = [
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0xff6666 } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0x9999ff } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0x0000b3 } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0x80ff80 } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0x009900 } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0xffb3ff } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0xffd633 } )},
    {geometry: new THREE.BoxGeometry( 1 , 1, 0.2), material: new THREE.MeshPhongMaterial( { color: 0x0099cc } )}
];
const objectNames = [
    'chogal',
    'horse',
    'lunara',
    'mob',
    'murloc',
    'raynor',
    'sylvanas',
    'tracer'
];
const objectPath = "/assets/models/";
var loader = new THREE.OBJLoader();
var models = [];
objectNames.forEach((name) => {
    loader.load(
        objectPath + name + '/' +name + ".obj",
        function ( object ) {
            object.scale.set(0.05,0.05,0.05);
            object.position.z = 5;
            object.position.y = 0;
            object.children[0].material = new THREE.MeshStandardMaterial({
                map: new THREE.TextureLoader().load(objectPath + name + "/textures/bc.png"),
                aoMap: new THREE.TextureLoader().load(objectPath + name + "/textures/ao.png"),
                metalnessMap: new THREE.TextureLoader().load(objectPath + name + "/textures/m.png"),
                normalMap: new THREE.TextureLoader().load(objectPath + name + "/textures/nm.png"),
                roughnessMap: new THREE.TextureLoader().load(objectPath + name + "/textures/r.png")
            });
            models.push(object);
        }
    );
});
var objectCover = { geometry: new THREE.BoxGeometry( 1.2, 1.2, 0.2 ),material: new THREE.MeshPhongMaterial( { color: 0x1a63d8 })};
var objectsToShow = [];
var objectsToHide = [];
var objectsToRemove = [];
var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
var light = new THREE.PointLight(0xffffff, 0.8, 30);
light.position.set(0, 2, 8);
light.castShadow = true;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 25;
scene.add(light);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color('#5b9aff');
function createBoard (boardSize, board) {  
    _board = board;
    let index = 0;    
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {    
            var model = models[board[index]].clone();
            var cover = new THREE.Mesh(objectCover.geometry, objectCover.material);
            var group = new THREE.Group();            
            model.position.z = -0.2;
            model.children[0].userData['index'] = index;
            group.name = index++;
            group.add(model);
            group.add(cover);
            var objectBounds = new THREE.Box3().setFromObject( model );
            let shift = (objectBounds.getSize().x * boardSize / 2) + spaceBetweenItems * ((boardSize / 2) - 1);
            model.position.x = (objectBounds.getSize().x + spaceBetweenItems) * j - shift;
            model.position.y = -(objectBounds.getSize().y + spaceBetweenItems) * i + shift;
            scene.add(model);
            objects.push(model.children[0]);
            raycastObjects.push(model.children[0]);            
        }        
    }
}
function clearBoard () {
    for (let object of objects) {
        scene.remove(object);
    }
}
function rotateObjects (index, value) {
    if (value ==="show") 
        objectsToShow.push(index);           
    else
        objectsToHide.push(index);    
}
function removeObjectsFromScene (firstIndex, secondIndex) {
    for (let object of objects) {
        if(object.userData['index'] === firstIndex || object.userData['index'] === secondIndex)
            objectsToRemove.push(object);            
    }
}
function onDocumentTouchStart (event) {
    event.preventDefault();
    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown( event );
}
function onDocumentMouseDown (event) {    
    event.preventDefault();
    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    let a;
    var intersects = raycaster.intersectObjects( raycastObjects  ); 
    if (intersects.length > 0 && yourMove) {
        a = intersects[ 0 ].object;
        console.log(a.name + ' -> ' + a.userData['index']);
        socket.emit('clicked object', a.userData['index'], "show");
        for (let object of objects) {          
            if (object.userData['index'] ===  a.userData['index']) {
                if(object.userData['index'] !== chosenObjects[0])
                    chosenObjects.push(object.userData['index']);                                
                if (chosenObjects.length === 2) {                    
                    socket.emit('move', chosenObjects[0], chosenObjects[1]);
                    chosenObjects = [];
                }            
            }
        }
    }
}
camera.position.z = 7;
raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('touchstart', onDocumentTouchStart, false);
function animate () {
    requestAnimationFrame (animate);
    renderer.render(scene, camera);
    if (objectsToShow.length !== 0)
    for (let object of objects) {
        if (object.rotation.y < (180 * Math.PI)/180) {
            if (objectsToShow.includes(object.userData['index'])) {
                object.rotation.y += 0.1;
            }
        }
        if (object.rotation.y >= (180 * Math.PI)/180) {
            if (objectsToShow.includes(object.userData['index'])) {
                objectsToShow.shift();
                object.rotation.y = (180 * Math.PI)/180;
            }
        }
    }
    if (objectsToHide.length !== 0)
    for (let object of objects) {
        if (object.rotation.y > 0 ) {
            if (objectsToHide.includes(object.userData['index'])) {
                object.rotation.y -= 0.1;
            }
        }
        if (object.rotation.y <= 0 ) {
            if (objectsToHide.includes(object.userData['index'])) {
                objectsToHide.shift();
                object.rotation.y = 0;
            }
        }
    }
    if (objectsToRemove.length !== 0)
    for (let object of objectsToRemove) {
        object.position.z -= 0.3;
        object.rotation.x -= 0.2;
        if (object.position.z < -18) {
            objectsToRemove.shift();
            scene.remove(object);
        }
    }
}
animate();