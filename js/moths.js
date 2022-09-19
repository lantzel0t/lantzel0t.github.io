//Var setup
var scene, renderer, camera, controls, stats;
var mothCenter = new THREE.Vector3(0, 0, 0);
var distance_score = 0;
var mouseMesh;
//const switchClick = new Audio("light-switch-1.wav");
//const mothFlap = new Audio("mothflaps.wav");
//mothFlap.volume = 0.5;
//const simplex = new SimplexNoise();
const mothLit = new THREE.Color(0xa39c89);
const mothDark = new THREE.Color(0x262624);
const canvas = document.querySelector('canvas.webgl');


//Bloom var setup
const ENTIRE_SCENE = 0, BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
//darkMaterial used on unbloomed meshes when rendering bloom pass
const darkMaterial = new THREE.MeshBasicMaterial({color:"black"});
const materials = {};

const pickPosition = {x:0, y:0};
var pickLocation = new THREE.Vector3(9999, 9999, 0);
clearPickPosition();
class PickHelper {
    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
      this.pickLocation = new THREE.Vector3();
    }
    pick(normalizedPosition, scene, camera) {
   
      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      // get the list of objects the ray intersected
      const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);
      if (intersectedObjects.length && intersectedObjects[0].object.name == "bulb") {
        // pick the first object. It's the closest one
        this.pickedObject = intersectedObjects[0].object;
        
        switchBulb(this.pickedObject.parent);
        //switchClick.cloneNode(true).play();

        //return this.raycaster.ray.at(20);
      }
      pickLocation = this.raycaster.ray.at(25, this.pickLocation);
      pickLocation.z = 0;
      //console.log(pickLocation);
      return this.pickLocation;
    }
    pickPosition(normalizedPosition, scene, camera) {
            // cast a ray through the frustum
            this.raycaster.setFromCamera(normalizedPosition, camera);
            // get the list of objects the ray intersected
            const intersectedObjects = this.raycaster.intersectObjects(scene.children, true);
            pickLocation = this.raycaster.ray.at(25, this.pickLocation);
            pickLocation.z = 0;
            return this.pickLocation;
    }
  }
const pickHelper = new PickHelper();

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

init();
initCamera();

const renderScene = new THREE.RenderPass( scene, camera );

const bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = 0;
bloomPass.strength = 1;
bloomPass.radius = 1;

const bloomComposer = new THREE.EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );

const finalPass = new THREE.ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
    defines: {}
  } ), "baseTexture"
);
finalPass.needsSwap = true;

const finalComposer = new THREE.EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( finalPass );

//initStats();
initEventListeners();

//Create scene and renderer
function init() {
    scene = new THREE.Scene(); 
    const fog = new THREE.Fog('#000000', 20, 50);
    scene.fog = fog;
    renderer = new THREE.WebGLRenderer({
      canvas: canvas
  }); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.toneMapping = THREE.ReinhardToneMapping;
    var light = new THREE.AmbientLight(0x404040);
    light.intensity = 1;
    scene.add(light);
}

//Create camera and orbit controls
function initCamera() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 20;
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.maxPolarAngle = Math.PI * 0.5;
    controls.minPolarAngle = Math.PI * 0.5;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.enableZoom = false;
}

//Optional function to load stats monitor
function initStats() {
    stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
}

function initEventListeners() {
    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('mousemove', setPickPosition);
    window.addEventListener('mousemove', (event) => {
      pickHelper.pickPosition(pickPosition, scene, camera);
  })
    //window.addEventListener('mouseout', clearPickPosition);
    //window.addEventListener('mouseleave', clearPickPosition);  
    window.addEventListener('mousedown', (event) => {
        pickHelper.pick(pickPosition, scene, camera);
    })
    
    window.addEventListener('touchstart', (event) => {
        // prevent the window from scrolling
        event.preventDefault();
        setPickPosition(event.touches[0]);
        pickHelper.pick(pickPosition, scene, camera);
      }, {passive: false});
       
      window.addEventListener('touchmove', (event) => {
        setPickPosition(event.touches[0]);
      });
       
      window.addEventListener('touchend', clearPickPosition);
}
// Update webgl renderer size
function onWindowResize() {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    bloomComposer.setSize(sizes.width, sizes.height);
    finalComposer.setSize(sizes.width, sizes.height);
}

function getCanvasRelativePosition(event) {
    const rect = document.querySelector('canvas.webgl').getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * document.querySelector('canvas.webgl').width  / rect.width,
      y: (event.clientY - rect.top ) * document.querySelector('canvas.webgl').height / rect.height,
    };
  }
   
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / document.querySelector('canvas.webgl').width ) *  2 - 1;
  pickPosition.y = (pos.y / document.querySelector('canvas.webgl').height) * -2 + 1;  // note we flip Y
}
   
function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

/*
const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);
*/

/* ================= BULB SPAWNING ================= */

var lights = [];

const wireGeo = new THREE.BoxGeometry( 0.1, 100, 0.1 );
const wireMat = new THREE.MeshBasicMaterial( {color: 0x0F0C0C} );

const gltfLoader = new THREE.GLTFLoader();
gltfLoader.load(
    'models/lightbulb.glb',
    (gltf) =>
    {
      //Kick-start the infinite pooling
      for(var i=-2; i<5; i++) {
        var bulb = newBulb(gltf);
        bulb.position.x = i*10;
        bulb.position.y = ((Math.random()-0.5)*15)-5;
        lights.push(bulb);
      }
      switchBulb(lights[2]);

    }
)

function newBulb(model, isLit=false, brightness=10) {
  var bulb = model.scene.clone();
  bulb.children[0].material = model.scene.children[0].material.clone();
  bulb.children[0].material.color.setHex(0x47412c);
  bulb.children[0].material.emissive.setHex(0x000000);
  var wire = new THREE.Mesh( wireGeo, wireMat );
  wire.name = "wire";
  wire.position.set(0, 50, 0);
  bulb.add(wire);
  bulb.position.x = -1000;
  scene.add(bulb);

  bulb.userData = {
    lit:isLit,
    brightness:brightness,
  };
  return bulb;
}

var geometry = new THREE.SphereGeometry(0.5, 32, 16);
var mouseMat = new THREE.MeshStandardMaterial();
mouseMat.emissive = new THREE.Color( 0xffffff );
mouseMesh = new THREE.Mesh(geometry, mouseMat);
scene.add(mouseMesh)
mouseMesh.layers.toggle( BLOOM_SCENE );

function switchBulb(obj) {
  // save its color
  if (obj.userData.lit) {
    obj.children[0].material.color.setHex(0x47412c);
    obj.children[0].material.emissive.setHex(0x000000);
  } else {
    obj.children[0].material.color.setHex(0xffffff);
    obj.children[0].material.emissive.setHex(0xffffff);
  }
  obj.children[0].layers.toggle( BLOOM_SCENE );
  obj.userData.lit = !obj.userData.lit;
}

/* ================= MOTH SPAWNING ================= */

const moths = [];
for (let i = 0; i < 100; i++) {
    var moth = {
        object: null,
        velocity: null,
    }
    const geometry = new THREE.SphereGeometry( 0.1, 16, 8 );
    const material = new THREE.MeshBasicMaterial( { color: 0xa39c89 } );
    const sphere = new THREE.Mesh( geometry, material );
    sphere.scale.y = 0.1;
    sphere.rotation.x = Math.PI * Math.random();
    sphere.position.set((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10);
    moth.object = sphere;
    moth.velocity = new THREE.Vector3((Math.random()-0.5)/10, (Math.random()-0.5)/10, (Math.random()-0.5)/10)
    scene.add( sphere );
    moths.push(moth);
}

function mothbrain(i) {
  //TODO: fade out
    var moth = moths[i];

    //flutter
    moth.object.rotation.x += 0.4;

    //Find all LIT lights within range and
    //Calculate vector to attraction point
    var closest = moth.object.position;
    var dist = 999;
    for (let i = 0; i < lights.length; i++) {
      if (lights[i].userData.lit) {
        var curDist = moth.object.position.distanceTo(lights[i].position);
        if ((curDist < dist) && (Math.abs(curDist) <= lights[i].userData.brightness)) {
            dist = curDist;
            closest = lights[i].position;
        }
      }
    }
    var curDist = moth.object.position.distanceTo(pickLocation);
    if ((curDist < dist) && (Math.abs(curDist) <= 100000000)) { //beeg number here; moths will default to swarming mouse if no nearby lights
        dist = curDist;
        closest = pickLocation;
    }

    
    var target = new THREE.Vector3().subVectors(closest, moth.object.position);
    //var attract = new THREE.Vector3().sub(moth.object.position);
    if (moth.object.position.distanceTo(closest) != 0) {
      moth.object.material.color = mothLit;
      //console.log('closest');
      target.multiplyScalar(0.002 / moth.object.position.distanceTo(closest)); //Fix this
    } else {
      moth.object.material.color = mothDark;
      //console.log('no closest');
    }
    moth.velocity.add(target);
    moth.velocity.clampLength(-0.15,0.15);
    moth.object.position.add(moth.velocity);
    //moth.object.position.x = pickPosition.x;
    //moth.object.position.y = pickPosition.y;
    //console.log(pickPosition);

    //JITTER
    //TODO: simplex noise jitter
    //console.log(simplex.noise3D(x, y, z));
    moth.object.position.add(new THREE.Vector3((Math.random()-0.5)/10,(Math.random()-0.5)/10,(Math.random()-0.5)/10))

    //moth.velocity.divideScalar(1.0001);
    //moth.object.position.add(attract);

    //TODO: On contact with bug zapper, remove moth
}



/* ================= CLOCK STUFF ================= */
 const clock = new THREE.Clock();
 const tick = () =>
 {
     const elapsedTime = clock.getElapsedTime();
 
     // Update objects
    render();
    //controls.update();
    //stats.update();
    
  mouseMesh.position.x = pickLocation.x;
  mouseMesh.position.y = pickLocation.y;
  mouseMesh.position.z = pickLocation.z;
  //console.log(mouseMesh.position);
    
    var currentMothCount = 0;
    for (let i = 0; i < moths.length; i++) {
        mothbrain(i);

        //Calculate average of the moth swarm
        if (moths[i].object.material.color == mothLit) {
          mothCenter.add(moths[i].object.position);
          //console.log(moths[i].object.position);
          currentMothCount++;
        }
    }
    
    //console.log(currentMothCount);
    if (currentMothCount) {
      mothCenter.divideScalar(currentMothCount);
      //console.log(mothCenter);
      //camera.position.x = lerp(camera.position.x, mothCenter.x, 0.01);
      if (mothCenter.x > distance_score) {
        distance_score = mothCenter.x;
        //DISTANCE HAS INCREASED! Check if you need to move a bulb.
        if (lights[0].position.x < camera.position.x-50) {
          lights[0].position.x = lights[lights.length-1].position.x + 10 + Math.random();
          if (lights[0].userData.lit) switchBulb(lights[0]);
          console.log('moved bulb');
          lights.push(lights.shift());
        } 
        //document.getElementById('score').textContent = Math.trunc(distance_score);
      }
      //console.log(currentMothCount/100);

      //Possibly play audio
      //mothFlap.volume = clamp(currentMothCount/1000, 0, 1);
      //if (Math.random() < 0.02) mothFlap.cloneNode(true).play();
    }
    mothCenter.setScalar(0);

     // ...
     window.requestAnimationFrame(tick)
 }
 tick();



/* ================= BLOOM STUFF ================= */
function render() {
  // render scene with bloom
  renderBloom( true );
  // render the entire scene, then render bloom scene on top
  finalComposer.render();
}

//Render the bloom scene for composing
function renderBloom( mask ) {
  if ( mask === true ) {
    scene.traverse( darkenNonBloomed );
    bloomComposer.render();
    scene.traverse( restoreMaterial );
  } else {
    camera.layers.set( BLOOM_SCENE );
    bloomComposer.render();
    camera.layers.set( ENTIRE_SCENE );
  }
}

//Replace materials for objects that don't have bloom
function darkenNonBloomed( obj ) {
  if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;
  }
}

//Return original material to a darkened material
function restoreMaterial( obj ) {
  if ( materials[ obj.uuid ] ) {
    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];
  }
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}

function clamp (num, min, max) {
  return Math.min(Math.max(num, min), max);
}
