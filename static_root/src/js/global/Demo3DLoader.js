///////////////////////////////////////////////////////////////////////////////
//**********************IMPORTING PACKAGES/LIBRARIES************************//                               
//////////////////////////////////////////////////////////////////////////////
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { FocusShader } from 'three/addons/shaders/FocusShader.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Text } from 'troika-three-text';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import {SimplexNoise} from "three/addons/math/SimplexNoise.js";
let particleTexture =  "../static/src/assets/dataset/textures/particle.dcae8b12.webp";
import addPageManager from './utils/PageManager.js';
import GTLFCustomLoader from "./LoadGLTFModel.js";
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';

const vertexRing = `
  uniform vec2 uvScale;
  varying vec2 vUv;
  void main() {
    vUv = uvScale * uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
  }`;

const fragmentRing = `
  uniform float time;
  uniform float fogDensity;
  uniform vec3 fogColor;
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  varying vec2 vUv;
  void main( void ) {
    vec2 position = - 1.0 + 2.0 * vUv;
    vec4 noise = texture2D( texture1, vUv );
    vec2 T1 = vUv + vec2( 1.5, - 1.5 ) * time * 0.02;
    vec2 T2 = vUv + vec2( - 0.5, 2.0 ) * time * 0.01;
    T1.x += noise.x * 2.0;
    T1.y += noise.y * 2.0;
    T2.x -= noise.y * 0.2;
    T2.y += noise.z * 0.2;
    float p = texture2D( texture1, T1 * 2.0 ).a;
    vec4 color = texture2D( texture2, T2 * 2.0 );
    vec4 temp = color * ( vec4( p, p, p, p ) * 2.0 ) + ( color * color - 0.1 );
    if( temp.r > 1.0 ) { temp.bg += clamp( temp.r - 2.0, 0.0, 100.0 ); }
    if( temp.g > 1.0 ) { temp.rb += temp.g - 1.0; }
    if( temp.b > 1.0 ) { temp.rg += temp.b - 1.0; }
    gl_FragColor = temp;
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    const float LOG2 = 1.442695;
    float fogFactor = exp2( - fogDensity * fogDensity * depth * depth * LOG2 );
    fogFactor = 1.0 - clamp( fogFactor, 0.0, 1.0 );
    gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

}`;


 class DemoLoader extends GTLFCustomLoader{
  constructor(options, settings) {
    super(settings);
    this.container = options.container;
    this.mdSettings = settings;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.ratio = this.width / this.height;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.container,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.preserveDrawingBuffer = true;
    this.camera = new THREE.PerspectiveCamera(65, this.width / this.height, 1, 10000);
    this.camera.position.set(0, 3, 10);
    this.camera.lookAt(new THREE.Vector3());
    this.clock = new THREE.Clock();
    this.targetRotation = 0;
    this.time = 0;
    /*const renderModel = new RenderPass( scene, camera );
    const effectBloom = new BloomPass( 1.25 );
    const outputPass = new OutputPass();
    this.composer = new EffectComposer( renderer );
    this.composer.addPass( renderModel );
    this.composer.addPass( effectBloom );
    this.composer.addPass( outputPass );*/
    //const controls = new OrbitControls( this.camera, this.renderer.domElement );
    this.isPlaying = true;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.target = new THREE.Vector3();
    this.mouse = new THREE.Vector2();
    this.mouseX = 0;
    this.mouseY = 0;
    //if(this.light) this.scene.add( this.light );
    //this.addPlane();
    //this.addPlane();
    this.onResize();
    this.addLight();
    this.addObjects();
    this.animate();
    this.addEventListeners();

  }

  addLight(){
    this.aLight = new THREE.DirectionalLight(0xffffff, 1000.0);
    this.aLight.position.set(-5, 5, -4);
    this.scene.add(this.aLight);
  }

  addObjects() {
    // Example usage in some function:
    this.addSingleObjectFullPath(this.mdSettings)
      .then((model) => {
        this.model = model.scene;
        this.group.add(this.model);
        this.group.scale.set(this.mdSettings.scale, this.mdSettings.scale, this.mdSettings.scale);
        this.group.position.set(this.mdSettings.posX, this.mdSettings.posY, this.mdSettings.posZ);
        this.group.rotation.set(this.mdSettings.rotX, this.mdSettings.rotY, this.mdSettings.rotZ);
        const axesHelper = new THREE.AxesHelper( 5 );
        //console.log('Model loaded demo:', model);
      })
      .catch((error) => {
        // Handle errors during loading
        console.error('Error loading model:', error);
      });
  }


  renderObject(){
      if(this.model){

        this.time = this.clock.getDelta()/10000;
        this.model.position.x = Math.cos( this.time ) * 30;
        this.model.position.y = Math.sin( this.time ) * 30;
        this.model.position.z = Math.sin( this.time ) * 30;

        this.model.rotation.x += 0.02;
        this.model.rotation.y += 0.03;

        //this.model.lookAt(0,0,0);

        /*torus.position.x = Math.cos( time + 10 ) * 30;
        torus.position.y = Math.sin( time + 10 ) * 30;
        torus.position.z = Math.sin( time + 10 ) * 30;

        torus.rotation.x += 0.02;
        torus.rotation.y += 0.03;*/

        //this.targetRotation = Math.PI; // Rotate 360 degrees (2 * Math.PI)
        //this.model.rotation.y = this.targetRotation * 0.1*this.time;
        //this.time += 0.05;
      }
    }

     renderObject1(){
      if(this.model){
        this.targetRotation = Math.PI; // Rotate 360 degrees (2 * Math.PI)
        this.model.rotation.y = this.targetRotation * 0.1*this.time;
        this.time += 0.05;
      }
    }




  /*addOuterRing() {
      const vertices = [];
      const colors = [];
      const color = new THREE.Color();
      const divisions = 50;
      for ( let i = 0, l = divisions; i <= l; i ++ ) {
        const t = i / l;
        const v = ( i / divisions ) * ( Math.PI * 2 );
        const x = Math.sin( v );
        const z = Math.cos( v );
        vertices.push( x, 0, z );
        color.setHSL( t, 1.0, 0.5, THREE.SRGBColorSpace );
        colors.push( color.r, color.g, color.b );
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
      geo.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
      for ( let i = 1; i <= 10; i ++ ) {
        matLineBasic = new THREE.LineBasicMaterial( { vertexColors: true } );
        matLineDashed = new THREE.LineDashedMaterial( { vertexColors: true, scale: 2, dashSize: 1, gapSize: 1 } );
        const line = new THREE.Line( geo, matLineDashed );
        line.computeLineDistances();
        this.group.add(line);
      }
    }

    renderOuterRing() {
      let count = 0;
      const time = performance.now() / 1000;
      this.group.traverse( function ( child ) {
          child.rotation.x = count + ( time / 3 );
          child.rotation.z = count + ( time / 4 );
          count ++;
      });
    }

    addInnerRing() {
      const textureLoader = new THREE.TextureLoader();
      const cloudTexture = textureLoader.load( '../static/src/assets/global/textures/lava/cloud.png' );
      const lavaTexture = textureLoader.load( '../static/src/assets/global/textures/lava/lavatile.jpg');
      lavaTexture.colorSpace = THREE.SRGBColorSpace;
      cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
      lavaTexture.wrapS = lavaTexture.wrapT = THREE.RepeatWrapping;
      this.uniforms = {
        'fogDensity': { value: 0.45 },
        'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
        'time': { value: 1.0 },
        'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
        'texture1': { value: cloudTexture },
        'texture2': { value: lavaTexture }

      };
      const size = 0.65;
      const material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexRing,
        fragmentShader: fragmentRing
      });
      this.ring = new THREE.Mesh( new THREE.TorusGeometry( size, 0.3, 30, 30 ), material );
      this.ring.rotation.x = 0.3;
      this.scene.add(this.ring);
    }

    renderInnerRing() {
      const delta = 5 * clock.getDelta();
      this.uniforms[ 'time' ].value += 0.2 * delta;
      this.ring.rotation.y += 0.0125 * delta;
      this.ring.rotation.x += 0.05 * delta;
      this.renderer.clear();
      this.composer.render( 0.01 );
    }*/

    stop() {
      this.isPlaying = false;
    }

    play() {
      if(!this.isPlaying){
        this.render()
        this.isPlaying = true;
      }
    }

  //ADD EVENT LISTENER
  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
  }
 
  //MOUSE MOVE EVENT
  onMouseMove = function(e) {
    this.mouseX = ( e.clientX - window.innerWidth/2 );
    this.mouseY = ( e.clientY - window.innerHeight/2 );
  }
  // RENDER
  render() {
    /*this.renderOuterRing();
    this.renderInnerRing();*/
    this.renderObject1();
    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
  }

  //RESIZE
  onResize() {
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  //ANIMATE 
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

(function () {
      function init() {
      var canvasElements = document.querySelectorAll(".demo-model-canvas");
      var canvasArr = Array.prototype.slice.call(canvasElements);
      var mdSettings =
        [    
          {
            path: '../static/src/assets/dataset/models/helmet/star_wars_stormtrooper_helmet.glb',
            scale: 0.7,
            posX: 0,
            posY: -20,
            posZ: -20,
            rotX: 0,
            rotY: 0,
            rotZ: 0
          },
          {
            path: '../static/src/assets/dataset/models/abstract/abstract_figure_3d.glb',
            scale: 120,
            posX: 0,
            posY: -2,
            posZ: -2,
            rotX: 0,
            rotY: 0,
            rotZ: 0
          },
          {
            path: '../static/src/assets/dataset/models/abstract/abstract.glb',
            scale: 3,
            posX: 0,
            posY: -3,
            posZ: -8,
            rotX: 0,
            rotY: 0,
            rotZ: 0
          },
          {
            path: '../static/src/assets/dataset/models/abstract/gyroid-ball.glb',
            scale: 2.5,
            posX: -1,
            posY: -4,
            posZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0
          }
      ];
      

        canvasArr.forEach((el, index) => {
          var o = {
            container: el
          }
          new DemoLoader(o, mdSettings[index]);
        })
      }
    if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
        init();
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
 

    
 



