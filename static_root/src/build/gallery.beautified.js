let stats, isMoved = !1, renderer, rendererCSS3D, isEcho = !1, guiModel, listener, generatedModels = [], audioStore = [], isInteractiveWall = !1, is3DWall = !1, isInteractiveShape = !1, audioElement, displaysettings, audio1, audio2, audio3, sound1, sound2;

var activeFunction = null;

let isDisplay = !1, activateAudio = !1, startAudio = !1, audioTriggered = !1, panel1, panel2, panel3, resetTriggered = !1, isAudioFinder = !1, isAudioIsolator = !1, toggleSlider = !1, isVertical = !0, audioBackGroundLoader = [], mouseX = 0, mouseY = 0, windowWidth, windowHeight, camera, camera1, camera2, camera3, controls1, scene1, scene2, modelList = [];

const threshold = .1, pointSize = .05, defaultSettings = {
    audioURL: "Soundtrack1",
    pitch: .05,
    delayVolume: .05,
    delayOffset: .05
}, defaultWallSettings = {
    width: 10,
    depth: 10,
    height: 10,
    radius: 1,
    mode: "random",
    length: 100,
    segments: 5
};

let sliderVerticalPos = window.innerWidth / 2, sliderHorizontalPos = window.innerHeight / 2;

const sliderVerticalElement = document.getElementById("slider-vertical"), sliderHorizontalElement = document.getElementById("slider-horizontal");

var clock, player, terrainScene, clonedTerrainScene, clonedGeo, cloneddecoScene, decoScene, lastOptions, fpsCamera, skyDome, skyLight, sand, water, controls = {}, INV_MAX_FPS = .01, frameDelta = 0, paused = !0, useFPS = !1;

const views = [ {
    background: new THREE.Color().setRGB(.7, .5, .5, THREE.SRGBColorSpace),
    eye: [ 0, 1800, 0 ],
    up: [ 0, 0, 1 ],
    fov: 45,
    updateCamera: function(e, t, n) {
        e.position.x -= .05 * n, e.position.x = Math.max(Math.min(e.position.x, 2e3), -2e3), 
        e.lookAt(scene2.position);
    }
}, {
    background: new THREE.Color().setRGB(.5, .7, .7, THREE.SRGBColorSpace),
    eye: [ 1400, 800, 1400 ],
    up: [ 0, 1, 0 ],
    fov: 60,
    updateCamera: function(e, t, n) {
        e.position.y -= .05 * n, e.position.y = Math.max(Math.min(e.position.y, 1600), -1600), 
        e.lookAt(e.position.clone().setY(0));
    }
} ];

function init() {
    var e = document.getElementById("container"), t = new THREE.DirectionalLight(16777215, 3);
    t.position.set(0, 0, 1), (scene1 = new THREE.Scene()).background = new THREE.Color().setRGB(.5, .5, .7, THREE.SRGBColorSpace), 
    (camera1 = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1e4)).position.z = 6, 
    (scene2 = new THREE.Scene()).background = views[0].background, (scene3 = new THREE.Scene()).background = views[1].background, 
    scene1.add(t.clone()), scene2.add(t.clone()), scene3.add(t.clone()), clock = new THREE.Clock(!1);
    for (let e = 0; e < views.length; ++e) {
        var n = views[e], i = new THREE.PerspectiveCamera(n.fov, window.innerWidth / window.innerHeight, 1, 1e4);
        i.position.fromArray(n.eye), i.up.fromArray(n.up), n.camera = i;
    }
    camera2 = views[0].camera, camera3 = views[1].camera, controls2 = new THREE.OrbitControls(camera3, e), 
    document.addEventListener("mousemove", function(e) {
        isMoved || onDocumentMouseMove(e);
    }), clock = new THREE.Clock(), window.removeEventListener("pointermove", onHover), 
    (renderer = new THREE.WebGLRenderer({
        antialias: !0
    })).setPixelRatio(window.devicePixelRatio), renderer.setSize(window.innerWidth, window.innerHeight), 
    e.appendChild(renderer.domElement);
}

function onHover(e) {
    var t = new THREE.Raycaster(), n = new THREE.Vector2(), e = (n.x = e.clientX / window.innerWidth * 2 - 1, 
    n.y = 2 * -(e.clientY / window.innerHeight) + 1, t.setFromCamera(n, camera), 
    t.intersectObject(lineVertical)), n = t.intersectObject(lineHorizontal), t = 0 < e.length && e[0].distance < .05, e = 0 < n.length && n[0].distance < .05;
    sliderVerticalElement.style.display = t ? "block" : "none", sliderHorizontalElement.style.display = e ? "block" : "none", 
    (t || e) && (console.log("got it"), initSlider());
}

function initSlider() {
    function t() {
        !1 !== event.isPrimary && (window.addEventListener("pointermove", n), window.addEventListener("pointerup", e));
    }
    function e() {
        isMoved = !1, window.removeEventListener("pointermove", n), window.removeEventListener("pointerup", e);
    }
    function n(e) {
        e.preventDefault(), !1 !== event.isPrimary && (isVertical ? (sliderVerticalPos = Math.max(0, Math.min(window.innerWidth, e.pageX)), 
        sliderVerticalElement.style.left = sliderVerticalPos - sliderVerticalElement.offsetWidth / 2 + "px") : (sliderHorizontalPos = Math.max(0, Math.min(window.innerHeight, e.pageY)), 
        sliderHorizontalElement.style.top = sliderHorizontalPos - sliderHorizontalElement.offsetHeight / 2 + "px"));
    }
    sliderVerticalElement.addEventListener("pointerdown", function(e) {
        isVertical = !0, isMoved = !0, t();
    }), sliderHorizontalElement.addEventListener("pointerdown", function(e) {
        isVertical = !1, isMoved = !0, t();
    });
}

function updateSize() {
    windowWidth == window.innerWidth && windowHeight == window.innerHeight || (windowWidth = window.innerWidth, 
    windowHeight = window.innerHeight, renderer.setSize(windowWidth, windowHeight));
}

function onDocumentMouseMove(e) {
    mouseX = e.clientX / window.innerWidth * 2 - 1, mouseY = 2 * -(e.clientY / window.innerHeight) + 1;
}

function initRender() {
    views[0].updateCamera(camera2, scene2, mouseX, mouseY), renderer.setViewport(0, 0, sliderVerticalPos, window.innerHeight), 
    renderer.setScissor(0, 0, sliderVerticalPos, window.innerHeight), renderer.render(scene1, camera1), 
    renderer.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
    renderer.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
    renderer.render(scene3, camera3), renderer.setViewport(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
    renderer.setScissor(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
    renderer.render(scene2, useFPS ? fpsCamera : camera2), renderer.setScissorTest(!0), 
    camera1.aspect = window.innerWidth / window.innerHeight, camera1.updateProjectionMatrix(), 
    camera2.aspect = window.innerWidth / window.innerHeight, camera2.updateProjectionMatrix(), 
    camera3.aspect = window.innerWidth / window.innerHeight, camera3.updateProjectionMatrix();
}

function animate() {
    for (render(), stats.begin(), frameDelta += clock.getDelta(); INV_MAX_FPS <= frameDelta; ) update(INV_MAX_FPS), 
    frameDelta -= INV_MAX_FPS;
    stats.end(), paused || requestAnimationFrame(animate);
}

function render() {
    updateSize(), initSlider(), initRender();
}

function startAnimating() {
    paused && (paused = !1, controls.enabled = !0, clock.start(), requestAnimationFrame(animate));
}

function stopAnimating() {
    paused = !0, controls.enabled = !1, clock.stop();
}

function setup() {
    setupControls(), setupWorld(), watchFocus(), setupDatGui(), startAnimating();
}

function setupControls() {
    fpsCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1e4), 
    scene2.add(fpsCamera), (controls = new THREE.FirstPersonControls(fpsCamera, container)).enabled = !1, 
    controls.movementSpeed = 100, controls.lookSpeed = .075;
}

function setupWorld() {
    new THREE.TextureLoader().load("../static/THREE.Terrain/demo/img/sky1.jpg", function(e) {
        e.minFilter = THREE.LinearFilter, (skyDome = new THREE.Mesh(new THREE.SphereGeometry(8192, 16, 16, 0, 2 * Math.PI, 0, .5 * Math.PI), new THREE.MeshBasicMaterial({
            map: e,
            side: THREE.BackSide,
            fog: !1
        }))).position.y = -99, scene2.add(skyDome);
        e = skyDome.clone();
        scene3.add(e);
    }), (water = new THREE.Mesh(new THREE.PlaneGeometry(17408, 17408, 16, 16), new THREE.MeshLambertMaterial({
        color: 27552,
        transparent: !0,
        opacity: .6
    }))).position.y = -99, water.rotation.x = -.5 * Math.PI, scene2.add(water);
    var e = water.clone(), e = (scene3.add(e), (skyLight = new THREE.DirectionalLight(15252912, 1.5)).position.set(2950, 2625, -160), 
    scene2.add(skyLight), skyLight.clone()), e = (scene3.add(e), new THREE.DirectionalLight(12839679, .75)), e = (e.position.set(-1, -.5, -1), 
    scene2.add(e), e.clone());
    scene3.add(e);
}

function setupDatGui() {
    var r = new Image();
    r.src = "../static/THREE.Terrain/demo/img/heightmap.png";
    var e = new dat.GUI(), t = (e.domElement.id = "mainpanel", new function() {
        var o, m = this, n = new THREE.MeshBasicMaterial({
            color: 5596842,
            wireframe: !0
        }), i = new THREE.MeshPhongMaterial({
            color: 8956586,
            specular: 4473941,
            shininess: 10
        }), a = (document.getElementById("elevation-graph"), document.getElementById("slope-graph"), 
        document.getElementsByClassName("value"), new THREE.TextureLoader());
        function u(e) {
            return -80 < e && e < -50 ? THREE.Terrain.EaseInOut((e + 80) / 30) * m.spread * .002 : -50 < e && e < 20 ? .002 * m.spread : 20 < e && e < 50 ? THREE.Terrain.EaseInOut((e - 20) / 30) * m.spread * .002 : 0;
        }
        a.load("../static/THREE.Terrain/demo/img/sand1.jpg", function(i) {
            i.wrapS = i.wrapT = THREE.RepeatWrapping, (sand = new THREE.Mesh(new THREE.PlaneGeometry(17408, 17408, 64, 64), new THREE.MeshLambertMaterial({
                map: i
            }))).position.y = -101, sand.rotation.x = -.5 * Math.PI, scene2.add(sand);
            var e = sand.clone();
            scene3.add(e), a.load("../static/THREE.Terrain/demo/img/grass1.jpg", function(n) {
                a.load("../static/THREE.Terrain/demo/img/stone1.jpg", function(t) {
                    a.load("../static/THREE.Terrain/demo/img/snow1.jpg", function(e) {
                        o = THREE.Terrain.generateBlendedMaterial([ {
                            texture: i
                        }, {
                            texture: n,
                            levels: [ -80, -35, 20, 50 ]
                        }, {
                            texture: t,
                            levels: [ 20, 50, 60, 85 ]
                        }, {
                            texture: e,
                            glsl: "1.0 - smoothstep(65.0 + smoothstep(-256.0, 256.0, vPosition.x) * 10.0, 80.0, vPosition.z)"
                        }, {
                            texture: t,
                            glsl: "slope > 0.7853981633974483 ? 0.2 : 1.0 - smoothstep(0.47123889803846897, 0.7853981633974483, slope) + 0.2"
                        } ]), m.Regenerate();
                    });
                });
            });
        }), this.easing = "Linear", this.heightmap = "PerlinDiamond", this.smoothing = "None", 
        this.maxHeight = 200, this.segments = 63, this.steps = 1, this.turbulent = !1, 
        this.size = 1024, this.sky = !0, this.texture = "Blended", this.edgeDirection = "Normal", 
        this.edgeType = "Box", this.edgeDistance = 256, this.edgeCurve = "EaseInOut", 
        this["width:length ratio"] = 1, this["Flight mode"] = useFPS, this["Light color"] = "#" + skyLight.color.getHexString(), 
        this.spread = 60, this.scattering = "PerlinAltitude", this["Enable SubAudio"] = isAudioFinder, 
        this["Sound Activate"] = function() {
            m.soundActivate();
        }, this.after = function(e, t) {
            "Normal" !== m.edgeDirection && ("Box" === m.edgeType ? THREE.Terrain.Edges : THREE.Terrain.RadialEdges)(e, t, "Up" === m.edgeDirection, "Box" === m.edgeType ? m.edgeDistance : .5 * Math.min(t.xSize, t.ySize) - m.edgeDistance, THREE.Terrain[m.edgeCurve]);
        }, window.rebuild = this.Regenerate = function() {
            var e = parseInt(m.segments, 10), t = "heightmap.png" === m.heightmap, t = {
                after: m.after,
                easing: THREE.Terrain[m.easing],
                heightmap: t ? r : "influences" === m.heightmap ? customInfluences : THREE.Terrain[m.heightmap],
                material: "Wireframe" == m.texture ? n : "Blended" == m.texture ? o : i,
                maxHeight: m.maxHeight - 100,
                minHeight: -100,
                steps: m.steps,
                stretch: !0,
                turbulent: m.turbulent,
                xSize: m.size,
                ySize: Math.round(m.size * m["width:length ratio"]),
                xSegments: e,
                ySegments: Math.round(e * m["width:length ratio"])
            }, e = (scene2.remove(terrainScene), scene3.remove(clonedTerrainScene), 
            terrainScene = THREE.Terrain(t), clonedTerrainScene = terrainScene.clone(), 
            camera3.lookAt(clonedTerrainScene.position), applySmoothing(m.smoothing, t), 
            scene2.add(terrainScene), scene3.add(clonedTerrainScene), skyDome.visible = sand.visible = water.visible = "Wireframe" != m.texture, 
            document.getElementById("heightmap"));
            e && (t.heightmap = e, THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.attributes.position.array, t)), 
            m["Scatter meshes"](), lastOptions = t;
        }, this.altitudeSpread = function(e, t) {
            return t % 4 == 0 && Math.random() < u(e.z);
        }, this.Soundsettings = function() {
            var e = this;
            this.listener = new THREE.AudioListener(), this.oscillator = e.listener.context.createOscillator(), 
            useFPS && fpsCamera.add(e.listener), sound1 = new THREE.PositionalAudio(e.listener), 
            sound2 = new THREE.PositionalAudio(e.listener), e.oscillator.type = "sine", 
            e.oscillator.frequency.setValueAtTime(144, sound2.context.currentTime), 
            e.oscillator.start(0), sound2.setNodeSource(e.oscillator), sound2.setRefDistance(20), 
            sound2.setVolume(.5), analyser1 = new THREE.AudioAnalyser(sound1, 32), 
            analyser2 = new THREE.AudioAnalyser(sound2, 32);
            this.soundControls = new function() {
                this.master = e.listener.getMasterVolume(), this.msound1 = sound1.getVolume(), 
                this.msound2 = sound2.getVolume();
            }(), this.generatorControls = new function() {
                this.frequency = e.oscillator.frequency.value, this.wavetype = e.oscillator.type;
            }(), this.removeAudioFinder = function() {
                console.log("this function addAudioFinder is triggered"), sound1 && !isAudioFinder && (sound1.pause(), 
                sound1.currentTime = 0), sound2 && e.oscillator && !isAudioFinder && (sound2.context.currentTime = 0, 
                e.oscillator.stop(), sound2.pause(), sound2.disconnect(), sound2.setVolume(0));
            }, this.addAudioFinder = function(e, t) {
                function n() {
                    var e = clock.getDelta();
                    controls.update(e), t.material.emissive.b = analyser1.getAverageFrequency() / 256, 
                    t.material.emissive.b = analyser2.getAverageFrequency() / 256, 
                    renderer.setViewport(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
                    renderer.setScissor(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
                    renderer.render(scene2, fpsCamera), renderer.setScissorTest(!0);
                }
                console.log("this function addAudioFinder is triggered"), new THREE.AudioLoader().load(e, function(e) {
                    sound1.setBuffer(e), sound1.setRefDistance(20), isAudioFinder && (sound1.play(), 
                    console.log("this condition audioFinder is met"));
                }), t.add(sound1), t.add(sound2), function e() {
                    requestAnimationFrame(e);
                    n();
                }();
            };
        }, this["Scatter meshes"] = function() {
            var a, r, i, o, s = parseInt(m.segments, 10), e = {
                xSegments: s,
                ySegments: Math.round(s * m["width:length ratio"])
            }, d = ("Linear" === m.scattering ? (a = 5e-4 * m.spread, r = Math.random) : "Altitude" === m.scattering ? a = m.altitudeSpread : "PerlinAltitude" === m.scattering ? (i = THREE.Terrain.ScatterHelper(THREE.Terrain.Perlin, e, 2, .125)(), 
            o = THREE.Terrain.InEaseOut(.01 * m.spread), a = function(e, t) {
                var t = i[t], n = !1;
                return t < o ? n = !0 : t < o + .2 && (n = THREE.Terrain.EaseInOut(5 * (t - o)) * o < Math.random()), 
                Math.random() < 5 * u(e.z) && n;
            }) : (a = THREE.Terrain.InEaseOut(.01 * m.spread) * ("Worley" === m.scattering ? 1 : .5), 
            r = THREE.Terrain.ScatterHelper(THREE.Terrain[m.scattering], e, 2, .125)), 
            []), l = [ viewDisplay1, viewDisplay2 ], c = terrainScene.children[0].geometry;
            clonedGeo = c.clone(), terrainScene.remove(decoScene), clonedTerrainScene.remove(cloneddecoScene), 
            new THREE.GLTFLoader().load("../static/dataset/models/scene.gltf", function(e) {
                e.scene.traverse(function(e) {
                    e.isMesh && (e.castShadow = !0, e.frustumCulled = !1, e.scale.set(.1, .1, .1), 
                    e.geometry.computeVertexNormals());
                });
                var e = [ {
                    mesh: buildTreeType1()
                }, {
                    mesh: buildTreeType2()
                }, {
                    mesh: e.scene,
                    numObjects: 2
                } ], t = ((decoScene = THREE.Terrain.ScatterMeshes(c, {
                    mesh: e,
                    w: s,
                    h: Math.round(s * m["width:length ratio"]),
                    spread: a,
                    smoothSpread: "Linear" === m.scattering ? 0 : .2,
                    randomness: r,
                    maxSlope: .6283185307179586,
                    maxTilt: .15707963267948966
                })) && (cloneddecoScene = decoScene.clone(), terrainScene.add(decoScene), 
                cloneddecoScene.position.y = decoScene.position.y - 20, clonedTerrainScene.add(cloneddecoScene), 
                decoScene.children.forEach(function(e) {
                    "Sketchfab_Scene" === e.name && d.push(e.uuid);
                })), shuffle(d));
                const o = [];
                for (let e = 0; e < t.length && e < l.length; e++) {
                    var n = t[e], i = l[e];
                    o.push({
                        modelID: n,
                        sceneView: i
                    });
                }
                decoScene.children.forEach(function(t) {
                    const n = t.uuid, i = o.find(e => e.modelID === n);
                    i && t.uuid === i.modelID && i.sceneView && (console.log("child", t), 
                    console.log("sceneView", i.sceneView), generatedModels.push(t), 
                    document.addEventListener("mousedown", function(e) {
                        onClick(e, t, decoScene, camera2, i.sceneView);
                    }));
                });
            }, void 0, function(e) {
                console.error("Error loading the GLTF model:", e);
            });
        }, this.soundActivate = function() {
            var t = new THREE.MeshPhongMaterial({
                color: 16755200,
                flatShading: !0,
                shininess: 0
            });
            0 < generatedModels.length && generatedModels.forEach(function(e) {
                e.material = t, new m.Soundsettings().addAudioFinder("../static/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3", e);
            });
        };
    }()), n = e.addFolder("Heightmap"), n = (n.add(t, "heightmap", [ "Brownian", "Cosine", "CosineLayers", "DiamondSquare", "Fault", "heightmap.png", "Hill", "HillIsland", "influences", "Particles", "Perlin", "PerlinDiamond", "PerlinLayers", "Simplex", "SimplexLayers", "Value", "Weierstrass", "Worley" ]).onFinishChange(t.Regenerate), 
    n.add(t, "easing", [ "Linear", "EaseIn", "EaseInWeak", "EaseOut", "EaseInOut", "InEaseOut" ]).onFinishChange(t.Regenerate), 
    n.add(t, "smoothing", [ "Conservative (0.5)", "Conservative (1)", "Conservative (10)", "Gaussian (0.5, 7)", "Gaussian (1.0, 7)", "Gaussian (1.5, 7)", "Gaussian (1.0, 5)", "Gaussian (1.0, 11)", "GaussianBox", "Mean (0)", "Mean (1)", "Mean (8)", "Median", "None" ]).onChange(function(e) {
        applySmoothing(e, lastOptions), t["Scatter meshes"](), lastOptions.heightmap && THREE.Terrain.toHeightmap(terrainScene.children[0].geometry.attributes.position.array, lastOptions);
    }), n.add(t, "segments", 7, 127).step(1).onFinishChange(t.Regenerate), n.add(t, "steps", 1, 8).step(1).onFinishChange(t.Regenerate), 
    n.add(t, "turbulent").onFinishChange(t.Regenerate), n.open(), e.addFolder("Decoration")), n = (n.add(t, "texture", [ "Blended", "Grayscale", "Wireframe" ]).onFinishChange(t.Regenerate), 
    n.add(t, "scattering", [ "Altitude", "Linear", "Cosine", "CosineLayers", "DiamondSquare", "Particles", "Perlin", "PerlinAltitude", "Simplex", "Value", "Weierstrass", "Worley" ]).onFinishChange(t["Scatter meshes"]), 
    n.add(t, "spread", 0, 100).step(1).onFinishChange(t["Scatter meshes"]), n.addColor(t, "Light color").onChange(function(e) {
        skyLight.color.set(e);
    }), e.addFolder("Size")), n = (n.add(t, "size", 1024, 3072).step(256).onFinishChange(t.Regenerate), 
    n.add(t, "maxHeight", 2, 300).step(2).onFinishChange(t.Regenerate), n.add(t, "width:length ratio", .2, 2).step(.05).onFinishChange(t.Regenerate), 
    e.addFolder("Edges"));
    n.add(t, "edgeType", [ "Box", "Radial" ]).onFinishChange(t.Regenerate), n.add(t, "edgeDirection", [ "Normal", "Up", "Down" ]).onFinishChange(t.Regenerate), 
    n.add(t, "edgeCurve", [ "Linear", "EaseIn", "EaseOut", "EaseInOut" ]).onFinishChange(t.Regenerate), 
    n.add(t, "edgeDistance", 0, 512).step(32).onFinishChange(t.Regenerate), e.add(t, "Flight mode").onChange(function(e) {
        useFPS = e, fpsCamera.position.x = 449, fpsCamera.position.y = 311, fpsCamera.position.z = 376, 
        controls.lookAt(terrainScene.children[0].position), controls.update(0), 
        controls.enabled = !1, useFPS ? (document.getElementById("fpscontrols").className = "visible", 
        setTimeout(function() {
            controls.enabled = !0, s.trackModelPosition();
        }, 1e3)) : document.getElementById("fpscontrols").className = "";
    }), e.add(t, "Scatter meshes"), e.add(t, "Regenerate");
    const i = new THREE.PointerLockControls(fpsCamera, document.body);
    n = e.addFolder("Pointer Control"), n.add({
        get Enabled() {
            return i.isLocked;
        },
        set Enabled(e) {
            e ? i.lock() : i.unlock();
        }
    }, "Enabled").name("Enabled"), n.open(), n = e.addFolder("Slider Control");
    function o() {
        sliderHorizontalElement.style.display = "none", sliderVerticalElement.style.display = "none";
    }
    n.add({
        get Enabled() {
            return toggleSlider;
        },
        set Enabled(e) {
            e ? (toggleSlider = !0, sliderVerticalPos = window.innerWidth / 2, sliderHorizontalPos = window.innerHeight / 2, 
            sliderVerticalElement.style.display = "block", sliderHorizontalElement.style.display = "block") : (toggleSlider = !1, 
            sliderHorizontalElement.style.display = "none", sliderVerticalElement.style.display = "none");
        }
    }, "Enabled").name("Enabled"), n.open();
    var a = new function() {
        var e = this;
        this["Display Options"] = "Default", this.displaySet = function() {
            "Default" === e["Display Options"] ? e.setDisplayDefault() : "FullScreen1" === e["Display Options"] ? e.setDisplayScreen1() : "FullScreen2" === e["Display Options"] ? e.setDisplayScreen2() : "FullScreen3" === e["Display Options"] && e.setDisplayScreen3();
        }, this.setDisplayDefault = function() {
            o(), views[0].updateCamera(camera2, scene2, mouseX, mouseY), sliderVerticalPos = window.innerWidth / 2, 
            sliderHorizontalPos = window.innerHeight / 2, renderer.setViewport(0, 0, sliderVerticalPos, window.innerHeight), 
            renderer.setScissor(0, 0, sliderVerticalPos, window.innerHeight), renderer.render(scene1, camera1), 
            renderer.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
            renderer.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
            renderer.render(scene3, camera3), renderer.setViewport(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
            renderer.setScissor(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
            renderer.render(scene2, useFPS ? fpsCamera : camera2), renderer.setScissorTest(!0), 
            camera1.aspect = window.innerWidth / window.innerHeight, camera1.updateProjectionMatrix(), 
            camera2.aspect = window.innerWidth / window.innerHeight, camera2.updateProjectionMatrix(), 
            camera3.aspect = window.innerWidth / window.innerHeight, camera3.updateProjectionMatrix();
        }, this.setDisplayScreen1 = function() {
            o(), sliderVerticalPos = window.innerWidth, renderer.setViewport(0, 0, sliderVerticalPos, window.innerHeight), 
            renderer.setScissor(0, 0, sliderVerticalPos, window.innerHeight), renderer.render(scene1, camera1), 
            renderer.setViewport(0, 0, 0, 0), renderer.setScissor(0, 0, 0, 0), renderer.render(scene3, camera3), 
            renderer.setViewport(0, 0, 0, 0), renderer.setScissor(0, 0, 0, 0), renderer.render(scene2, useFPS ? fpsCamera : camera2), 
            renderer.setScissorTest(!0), camera1.aspect = window.innerWidth / window.innerHeight, 
            camera1.updateProjectionMatrix(), camera2.aspect = window.innerWidth / window.innerHeight, 
            camera2.updateProjectionMatrix(), camera3.aspect = window.innerWidth / window.innerHeight, 
            camera3.updateProjectionMatrix();
        }, this.setDisplayScreen2 = function() {
            o(), sliderVerticalPos = 0, sliderHorizontalPos = window.innerHeight, 
            renderer.setViewport(0, 0, 0, 0), renderer.setScissor(0, 0, 0, 0), renderer.render(scene1, camera1), 
            renderer.setViewport(0, 0, 0, 0), renderer.setScissor(0, 0, 0, 0), renderer.render(scene3, camera3), 
            renderer.setViewport(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
            renderer.setScissor(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
            renderer.render(scene2, useFPS ? fpsCamera : camera2), renderer.setScissorTest(!0), 
            camera1.aspect = window.innerWidth / window.innerHeight, camera1.updateProjectionMatrix(), 
            camera2.aspect = window.innerWidth / window.innerHeight, camera2.updateProjectionMatrix(), 
            camera3.aspect = window.innerWidth / window.innerHeight, camera3.updateProjectionMatrix();
        }, this.setDisplayScreen3 = function() {
            o(), sliderVerticalPos = window.innerWidth, sliderHorizontalPos = window.innerWidth, 
            renderer.setViewport(0, 0, 0, 0), renderer.setScissor(0, 0, 0, 0), renderer.render(scene1, camera1), 
            renderer.setViewport(0, 0, 0, 0), renderer.setScissor(0, 0, 0, 0), renderer.render(scene3, camera3), 
            renderer.setViewport(0, 0, sliderVerticalPos, sliderHorizontalPos), 
            renderer.setScissor(0, 0, sliderVerticalPos, sliderHorizontalPos), renderer.render(scene2, useFPS ? fpsCamera : camera2), 
            renderer.setScissorTest(!0), camera1.aspect = window.innerWidth / window.innerHeight, 
            camera1.updateProjectionMatrix(), camera2.aspect = window.innerWidth / window.innerHeight, 
            camera2.updateProjectionMatrix(), camera3.aspect = window.innerWidth / window.innerHeight, 
            camera3.updateProjectionMatrix();
        };
    }(), n = e.addFolder("Screen Control"), _ = (n.add(a, "Display Options", [ "Default", "FullScreen1", "FullScreen2", "FullScreen3" ]).onChange(function() {
        a.displaySet();
    }), n.open(), {
        Soundtrack1: "../static/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3",
        Soundtrack2: "../static/examples/sounds/358232_j_s_song.mp3"
    }), s = new function() {
        var te = this, i = (this.backgroundmusic = defaultSettings.audioURL, this.foundURL = null, 
        this.audioURL = null, this["Wall Type"] = "Line", this.width = 1, this.depth = 1, 
        this.height = 1, this.mode = "random", this.radius = 1, this.length = 1, 
        this.segments = 20, this["Model Options"] = "Soldier", this["Enable Audio"] = activateAudio, 
        this.pitch = defaultSettings.pitch, this.delayVolume = defaultSettings.delayVolume, 
        this.delayOffset = defaultSettings.delayOffset, this.after = function() {
            for (var [ e, t ] of Object.entries(_)) if (e === te.backgroundmusic) return console.log(te.backgroundmusic), 
            console.log("Matching pair:", e, t), te.foundURL = t, te.foundURL;
        }, this.RegenerateAudio = function() {
            te["Replay Audio"]();
        }, this["Start Audio"] = function() {
            audioTriggered = !1, resetTriggered = !1, localStorage.setItem("audioTriggered", audioTriggered), 
            localStorage.setItem("resetTriggered", resetTriggered);
            var e = {
                after: te.after
            };
            te.initAudio(e);
        }, this["Replay Audio"] = function() {
            console.log("this Replay Audio is triggered"), (audioElement || 0 < audioStore.length) && (audioElement.pause(), 
            audioElement.currentTime = 0), audioTriggered = !0;
            var e = te.after();
            localStorage.setItem("audioTriggered", audioTriggered), localStorage.setItem("soundURL", e), 
            localStorage.setItem("pitch", te.pitch), localStorage.setItem("delayVolume", te.delayVolume), 
            localStorage.setItem("delayOffset", te.delayOffset);
        }, this["Reset Audio"] = function() {
            (audioElement || 0 < audioStore.length) && (audioElement.pause(), audioElement.currentTime = 0, 
            audioStore.length = 0), audioTriggered = !0, localStorage.setItem("audioTriggered", audioTriggered);
        }, this["Toggle Display"] = function() {
            var e;
            (e = document.getElementById("audio-container")) && (e.style.display = "block" === e.style.display ? "none" : "block");
        }, this["Regenerate Wall"] = function() {
            console.log("function Regenerate Wall is executed"), te["Setup Wall"]().then(e => {
                console.log("options", e);
                e = THREE.Terrain.generateWall(clonedGeo, e);
                e.name = "Wall Object", console.log("wallGeometry", e);
                e && decoScene && (te.removeWallObjects(decoScene, scene3), e.matrix.identity(), 
                e.position.set(0, 0, 0), decoScene.add(e), console.log("wallGeometry", e), 
                console.log("decoScene", decoScene));
            }).catch(e => {
                console.error("Error loading object:", e);
            });
        }, this["Interactive Wall"] = function() {
            te.removeWallObjects(decoScene, scene3), te.initWallGenerator(renderer, scene3, camera3);
        }, this["Create3D Wall"] = function() {
            te.removeWallObjects(decoScene, scene3), te.initWallGenerator(renderer, scene3, camera3);
        }, this["InteractiveShape Wall"] = function() {
            te.removeWallObjects(decoScene, scene3), te.initWallGenerator(renderer, scene3, camera3);
        }, this["Remove Wall"] = function() {
            te.removeWallObjects(decoScene, scene3), isInteractiveWall = !1, is3DWall = !1, 
            isInteractiveShape = !1, console.log("isInteractiveWall", isInteractiveWall), 
            console.log("is3DWall", is3DWall), console.log("isInteractiveShape", isInteractiveShape);
        }, this["Setup Wall"] = function() {
            return new Promise((e, t) => {
                e({
                    wallType: te["Wall Type"],
                    width: te.width,
                    depth: te.depth,
                    height: te.height,
                    radius: te.radius,
                    mode: "random",
                    length: te.length,
                    segments: te.segments
                });
            });
        }, this.IsolatorAudio = function() {
            te["Add IsolatorAudio"]();
        }, this.trackModelPosition = function() {
            te.trackModelPosition();
        }, this.initAudio = function(n) {
            let i;
            "undefined" === n && (i = "../static/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3", 
            localStorage.setItem("soundURL", i)), "function" == typeof n.after && (i = n.after(), 
            console.log("audioURL", i)), console.log("the selected background", i);
            {
                n = i, console.log("this funtion initAudioScene is triggered");
                let e = !1, t = 0;
                const o = document.createElement("div"), a = (o.id = "audio-container", 
                o.style.width = "256px", o.style.height = "128px", o.style.left = "0", 
                o.style.top = "0", o.style.position = "absolute", o.style.display = "flex", 
                document.body.appendChild(o), o.clientWidth), r = o.clientHeight, s = document.createElement("button"), d = (s.textContent = "START", 
                s.id = "startButton", o.appendChild(s), new THREE.Scene()), l = new THREE.WebGLRenderer({
                    antialias: !0
                }), c = (l.setPixelRatio(window.devicePixelRatio), l.setSize(a, r), 
                o.appendChild(l.domElement), new THREE.Camera()), m = new THREE.AudioListener(), u = (audioElement = new THREE.Audio(m), 
                new THREE.AudioLoader()), h = (console.log("audioURLtest3", n), 
                u.load(n, function(e) {
                    console.log("Audio loaded successfully"), audioElement.setBuffer(e), 
                    audioElement.setLoop(!0), audioElement.setVolume(1), audioStore.push(audioElement);
                }), new THREE.AudioAnalyser(audioElement, 128)), p = l.capabilities.isWebGL2 ? THREE.RedFormat : THREE.LuminanceFormat, w = {
                    tAudioData: {
                        value: new THREE.DataTexture(h.data, 64, 1, p)
                    }
                }, E = new THREE.ShaderMaterial({
                    uniforms: w,
                    vertexShader: document.getElementById("vertexShader").textContent,
                    fragmentShader: document.getElementById("fragmentShader").textContent
                }), g = new THREE.PlaneGeometry(1, 1), y = new THREE.Mesh(g, E);
                d.add(y), window.addEventListener("resize", function() {
                    l.setSize(a, r);
                }), s.addEventListener("pointerdown", function() {
                    console.log("button clicked"), e && audioElement ? (audioElement.context.currentTime, 
                    audioElement.pause(), e = !1) : (audioElement.play(), e = !0, 
                    t = audioElement.context.currentTime);
                }), function e() {
                    requestAnimationFrame(e), h.getFrequencyData(), w.tAudioData.value.needsUpdate = !0, 
                    l.render(d, c);
                }();
            }
        }, audioTriggered = !1, activateAudio = !0, resetTriggered = !1, localStorage.setItem("audioTriggered", audioTriggered), 
        localStorage.setItem("resetTriggered", resetTriggered), te.initAudio("undefined"), 
        this.initWallGenerator = function(e, t, n) {
            if (console.log("isInteractiveWall", isInteractiveWall), console.log("is3DWall", is3DWall), 
            console.log("isInteractiveShape", isInteractiveShape), isInteractiveWall) {
                var i = e;
                var I = t;
                var o = n;
                console.log("this func createInteractiveWall is triggered");
                var a, r, s = 0, d = new THREE.Vector3(), l = 6, B = (window.innerHeight, 
                new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)), F = new THREE.Raycaster(), c = [];
                function k() {
                    positions[3 * s - 3] = d.x, positions[3 * s - 2] = d.y, positions[3 * s - 1] = d.z, 
                    a.geometry.attributes.position.needsUpdate = !0;
                }
                function O(e) {
                    var t;
                    !0 === isInteractiveWall && (t = i.domElement.getBoundingClientRect(), 
                    d.x = (e.clientX - t.left) / (t.right - t.left) * 2 - 1, d.y = 2 * -((e.clientY - t.top) / (t.bottom - t.top)) + 1, 
                    F.setFromCamera(d, o), d = F.ray.intersectPlane(B, d), 0 !== s) && s < l && k();
                }
                function j() {
                    s < l ? (console.log("point nr " + s + ": " + d.x + " " + d.y + " " + d.z), 
                    positions[3 * s + 0] = d.x, positions[3 * s + 1] = d.y, positions[3 * s + 2] = d.z, 
                    s++, a.geometry.setDrawRange(0, s), k(), c.push(new THREE.Vector3(d.x, d.y, d.z))) : console.log("max points reached: " + l);
                }
                function G(e) {
                    !0 === isInteractiveWall && (0 === s && j(), s < l) && j();
                }
                (function() {
                    o.rotateX(-Math.PI / 2), o.position.set(-100, 1e3, 0), someMaterial = new THREE.MeshBasicMaterial({
                        color: 255,
                        side: THREE.DoubleSide,
                        transparent: !0,
                        opacity: .3
                    });
                    var e = new THREE.BufferGeometry(), t = (positions = new Float32Array(6), 
                    e.setAttribute("position", new THREE.BufferAttribute(positions, 3)), 
                    new THREE.LineBasicMaterial({
                        color: 16711680,
                        linewidth: 2
                    }));
                    (a = new THREE.Line(e, t)).position.z = 0, te.addObjScene(a), 
                    document.addEventListener("mousemove", O, !1), document.addEventListener("mousedown", G, !1), 
                    (e = document.createElement("button")).id = "create3DBtn", document.body.appendChild(e), 
                    e.innerHTML = "Create3D", e.id = "create3DBtn", e.addEventListener("pointerdown", () => {
                        var t;
                        !r && c && c.length && (r = new THREE.Mesh(), te.addObjScene(r), 
                        t = 1, c.forEach(e => {
                            t < c.length && (e = new ee(e, c[t], someMaterial, 200), 
                            r.add(e.mesh3D), t++);
                        }));
                    });
                })(), function e() {
                    requestAnimationFrame(e), i.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                    i.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                    i.render(I, o), i.setScissorTest(!0);
                }();
                class ee {
                    constructor(e, t, n, i) {
                        this.start = e, this.end = t, this.height = i, this.material = n, 
                        this.mesh3D = null, this.create3D();
                    }
                    create3D() {
                        var e;
                        this.start && this.end && (e = this.start.distanceTo(this.end), 
                        e = [ new THREE.Vector2(), new THREE.Vector2(0, this.height), new THREE.Vector2(e, this.height), new THREE.Vector2(e, 0) ], 
                        e = new THREE.Shape(e), (e = new THREE.ShapeGeometry(e)).applyMatrix4(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(0))), 
                        this.mesh3D = new THREE.Mesh(e, this.material), this.alignRotation(), 
                        this.alignPosition());
                    }
                    alignRotation() {
                        var e = this.start.clone(), t = this.end.clone(), n = new THREE.Vector3();
                        n.subVectors(t, e), n.normalize(), this.mesh3D.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), n);
                    }
                    alignPosition() {
                        if (!this.mesh3D) throw new Error("mesh3D null");
                        this.mesh3D.position.copy(this.start);
                    }
                }
            } else is3DWall ? (V = e, X = t, (P = n).rotateX(-Math.PI / 2), P.position.set(-1e3, 2e3, 0), 
            document.addEventListener("mousedown", function(e) {
                !0 === is3DWall && (D.x = e.clientX / window.innerWidth * 2 - 1, 
                D.y = 2 * -(e.clientY / window.innerHeight) + 1, Z.setFromCamera(D, P), 
                0 < (K = Z.intersectObjects(Q)).length && (L < J && (W[L] = K[0].point.clone(), 
                (e = new THREE.Mesh(new THREE.SphereGeometry(10, 100, 100), new THREE.MeshBasicMaterial({
                    color: "red"
                }))).position.copy(K[0].point), te.addObjScene(e), L++), L === J) && (shape = new THREE.Shape(), 
                (shape = new THREE.Shape()).moveTo(W[0].x, -W[0].z), shape.lineTo(W[1].x, -W[0].z), 
                shape.lineTo(W[1].x, -W[1].z), shape.lineTo(W[0].x, -W[1].z), shape.lineTo(W[0].x, -W[0].z), 
                (e = new THREE.ExtrudeBufferGeometry(shape, {
                    steps: 20,
                    depth: 200,
                    amount: 20,
                    bevelEnabled: !0,
                    bevelThickness: 10,
                    bevelSize: 10,
                    bevelOffset: 0,
                    bevelSegments: 1
                })).rotateX(-Math.PI / 2), wall = new THREE.Mesh(e, new THREE.MeshStandardMaterial({
                    color: "gray"
                })), te.addObjScene(wall), W = [], L = 0), $());
            }, !1), Q = [], Z = new THREE.Raycaster(), D = new THREE.Vector2(), 
            W = [], new THREE.Vector3(), L = 0, J = 2, (z = new THREE.PlaneGeometry(2e3, 2e3)).rotateX(-Math.PI / 2), 
            (z = new THREE.Mesh(z, new THREE.MeshStandardMaterial({
                color: "green"
            }))).visible = !1, te.addObjScene(z), Q.push(z)) : isInteractiveShape && (u = e, 
            q = t, h = n, (p = new THREE.Plane()).setFromCoplanarPoints(new THREE.Vector3(), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1)), 
            (w = []).push(m(new THREE.Vector3(-200, 0, 0), "white")), w.push(m(new THREE.Vector3(200, 0, -200), "white")), 
            w.push(m(new THREE.Vector3(0, 0, 200), "white")), w.push(m(new THREE.Vector3(0, 0, 0), "white")), 
            z = new THREE.LineBasicMaterial({
                color: "white"
            }), g = new THREE.Line(N(), z), te.addObjScene(g), U = {
                amount: 1,
                bevelEnabled: !1
            }, y = [], f = null, z = [ new THREE.MeshLambertMaterial({
                color: 11908533
            }), new THREE.MeshLambertMaterial({
                color: "aqua"
            }) ], T = new THREE.Mesh(E, z), te.addObjScene(T), g.geometry.vertices.forEach((e, t) => {
                y.push(new THREE.Vector2(e.x, e.z));
            }), _(), window.addEventListener("mousedown", function(e) {
                isInteractiveShape && (H = R.intersectObjects(w), console.log("intersects", H), 
                0 < H.length) && (controls.enableRotate = !1, S = H[0].object, p.setFromNormalAndCoplanarPoint(Y, H[0].point), 
                C.subVectors(S.position, H[0].point), b = !0);
            }, !1), window.addEventListener("mouseup", function(e) {
                isInteractiveShape && (controls.enableRotate = !0, S = null, b = !1);
            }, !1), window.addEventListener("mousemove", function(e) {
                isInteractiveShape && (v.x = e.clientX / window.innerWidth * 2 - 1, 
                v.y = 2 * -(e.clientY / window.innerHeight) + 1, 0 != H.length) && b && (R.ray.intersectPlane(p, M), 
                S.position.copy(M).add(C), g.geometry.dispose(), g.geometry = N(), 
                _());
            }, !1), R = new THREE.Raycaster(), v = new THREE.Vector2(), b = !1, 
            M = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0), C = new THREE.Vector3(), 
            A = x = 0, function e() {
                x = .001 * Date.now(), requestAnimationFrame(e), R.setFromCamera(v, h), 
                w.forEach((e, t) => {
                    A = Math.PI / 2 * t, e.material.opacity = .6 + .2 * Math.sin(x - A);
                }), u.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                u.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                u.render(q, h), u.setScissorTest(!0);
            }());
            function m(e, t) {
                var n = new THREE.BoxGeometry(.5, 1.55, .5, 1, 3, 1), t = (n.translate(0, .75, 0), 
                n.scale(20, 20, 20), new THREE.MeshBasicMaterial({
                    color: t,
                    wireframe: !1,
                    transparent: !0,
                    opacity: .5
                })), n = new THREE.Mesh(n, t);
                return n.position.copy(e), te.addObjScene(n), n;
            }
            function N() {
                var t = [], e = (w.forEach(e => {
                    t.push(e.position);
                }), new THREE.CatmullRomCurve3(t)), n = (e.closed = !0, new THREE.BufferGeometry());
                return n.vertices = e.getPoints(75), n.translate(0, 1, 0), n;
            }
            function _() {
                g.geometry.vertices.forEach((e, t) => {
                    y[t].set(e.x, e.z);
                }), f = new THREE.Shape(y), (E = new THREE.ExtrudeGeometry(f, U)).rotateX(.5 * Math.PI), 
                E.translate(0, 1, 0), T.geometry.dispose(), T.geometry = E;
            }
            var u, q, h, p, w, E, g, U, y, f, T, H, S, R, v, b, M, Y, C, x, A, V, X, P, K, Q, Z, D, W, L, J, z;
            function $() {
                requestAnimationFrame($), V.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                V.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                V.render(X, P), V.setScissorTest(!0);
            }
        }, []);
        function n(e) {
            t = 6;
            var t = Math.random().toString(36).substring(2, t + 2);
            e.name = t, i.push(t);
        }
        function o(t) {
            for (let e = 0; e < t.children.length; e++) {
                var n = t.children[e];
                i.includes(n.name) && (t.remove(n), e--);
            }
        }
        this.addObjScene = function(e) {
            var t;
            e && (t = e.clone(), n(e = e), scene3.add(e), e = t, decoScene) && (n(e), 
            decoScene.add(e));
        }, this.removeWallObjects = function(e, t) {
            var n = document.getElementById("create3DBtn"), n = (n && document.body.removeChild(n), 
            e.getObjectByName("Wall Object"));
            e && n && e.remove(n), o(e), o(t);
        };
        const e = new THREE.GLTFLoader();
        function E(e, t) {
            var n = new THREE.AudioListener();
            const i = new THREE.PositionalAudio(n);
            return new THREE.AudioLoader().load(t, function(e) {
                i.setBuffer(e), i.setRefDistance(20);
            }), e.add(i), i;
        }
        let g;
        const y = [];
        let l, c, m, a, r, s, u, h, d = !1, p = 0, f, T, z = "idle";
        const H = [], S = {
            idle: {
                weight: 1
            },
            walk: {
                weight: 0
            },
            run: {
                weight: 0
            }
        }, R = {
            sneak_pose: {
                weight: 0
            },
            sad_pose: {
                weight: 0
            },
            agree: {
                weight: 0
            },
            headShake: {
                weight: 0
            }
        };
        let w, v;
        const b = {
            state: "Walking"
        };
        function M(t, n, e) {
            let i, o;
            t.shadowMap.enabled = !0, t.shadowMap.type = THREE.PCFSoftShadowMap, 
            t.toneMapping = THREE.ACESFilmicToneMapping, t.toneMappingExposure = 1, 
            t.setAnimationLoop(render);
            (e = new THREE.OrbitControls(e, t.domElement)).minDistance = 2, e.maxDistance = 10, 
            e.maxPolarAngle = Math.PI / 2, e.target.set(0, 1, 0), e.update();
            var e = new THREE.HemisphereLight(16777215, 9276813, .15), a = (n.add(e), 
            new THREE.TextureLoader().setPath("../static/examples/textures/")), r = [ "disturb.jpg", "colors.png", "uv_grid_opengl.jpg" ], s = {
                none: null
            };
            for (let e = 0; e < r.length; e++) {
                var d = r[e], l = a.load(d);
                l.minFilter = THREE.LinearFilter, l.magFilter = THREE.LinearFilter, 
                l.colorSpace = THREE.SRGBColorSpace, s[d] = l;
            }
            (i = new THREE.SpotLight(16777215, 100)).position.set(2.5, 5, 2.5), 
            i.angle = Math.PI / 6, i.penumbra = 1, i.decay = 2, i.distance = 0, 
            i.map = s["../static/examples/textures/disturb.jpg"], i.castShadow = !0, 
            i.shadow.mapSize.width = 1024, i.shadow.mapSize.height = 1024, i.shadow.camera.near = 1, 
            i.shadow.camera.far = 10, i.shadow.focus = 1, n.add(i), o = new THREE.SpotLightHelper(i), 
            n.add(o);
            var e = new dat.GUI({
                id: "lightPanel"
            }), c = {
                map: s["disturb.jpg"],
                color: i.color.getHex(),
                intensity: i.intensity,
                distance: i.distance,
                angle: i.angle,
                penumbra: i.penumbra,
                decay: i.decay,
                focus: i.shadow.focus,
                shadows: !0
            };
            e.add(c, "map", s).onChange(function(e) {
                i.map = e;
            }), e.addColor(c, "color").onChange(function(e) {
                i.color.setHex(e);
            }), e.add(c, "intensity", 0, 500).onChange(function(e) {
                i.intensity = e;
            }), e.add(c, "distance", 50, 200).onChange(function(e) {
                i.distance = e;
            }), e.add(c, "angle", 0, Math.PI / 3).onChange(function(e) {
                i.angle = e;
            }), e.add(c, "penumbra", 0, 1).onChange(function(e) {
                i.penumbra = e;
            }), e.add(c, "decay", 1, 2).onChange(function(e) {
                i.decay = e;
            }), e.add(c, "focus", 0, 1).onChange(function(e) {
                i.shadow.focus = e;
            }), e.add(c, "shadows").onChange(function(e) {
                t.shadowMap.enabled = e, n.traverse(function(e) {
                    e.material && (e.material.needsUpdate = !0);
                });
            }), e.open();
        }
        function I(t) {
            console.log("this addSettingsModel1 func is triggered"), console.log("this gltf.scene", t.scene);
            const n = new THREE.SkeletonHelper(t.scene);
            t.scene.position.setY(-.8), n.visible = !1, scene1.add(t.scene), t.scene.rotateY(Math.PI), 
            scene1.add(n);
            var e, i, o, a, r, s, d = t.animations;
            g = new THREE.AnimationMixer(t.scene), this.showModel = function(e) {
                t.scene.visible = e;
            }, this.showSkeleton = function(e) {
                n.visible = e;
            }, this.modifyTimeScale = function(e) {
                g.timeScale = e;
            }, (panel1 = new dat.GUI({
                width: 310
            })).domElement.id = "panel1", e = panel1.addFolder("Visibility"), i = panel1.addFolder("Activation/Deactivation"), 
            o = panel1.addFolder("Pausing/Stepping"), a = panel1.addFolder("Crossfading"), 
            r = panel1.addFolder("Blend Weights"), s = panel1.addFolder("General Speed"), 
            h = {
                "show model": !0,
                "show skeleton": !1,
                "deactivate all": k,
                "activate all": O,
                "pause/continue": j,
                "make single step": G,
                "modify step size": .05,
                "from walk to idle": function() {
                    x(c, l, 1);
                },
                "from idle to walk": function() {
                    x(l, c, .5);
                },
                "from walk to run": function() {
                    x(c, m, 2.5);
                },
                "from run to walk": function() {
                    x(m, c, 5);
                },
                "use default duration": !0,
                "set custom duration": 3.5,
                "modify idle weight": 0,
                "modify walk weight": 1,
                "modify run weight": 0,
                "modify time scale": 1
            }, e.add(h, "show model").onChange(showModel), e.add(h, "show skeleton").onChange(showSkeleton), 
            i.add(h, "deactivate all"), i.add(h, "activate all"), o.add(h, "pause/continue"), 
            o.add(h, "make single step"), o.add(h, "modify step size", .01, .1, .001), 
            y.push(a.add(h, "from walk to idle")), y.push(a.add(h, "from idle to walk")), 
            y.push(a.add(h, "from walk to run")), y.push(a.add(h, "from run to walk")), 
            a.add(h, "use default duration"), a.add(h, "set custom duration", 0, 10, .01), 
            r.add(h, "modify idle weight", 0, 1, .01).listen().onChange(function(e) {
                V(l, e);
            }), r.add(h, "modify walk weight", 0, 1, .01).listen().onChange(function(e) {
                V(c, e);
            }), r.add(h, "modify run weight", 0, 1, .01).listen().onChange(function(e) {
                V(m, e);
            }), s.add(h, "modify time scale", 0, 1.5, .01).onChange(modifyTimeScale), 
            e.open(), i.open(), o.open(), a.open(), r.open(), s.open(), l = g.clipAction(d[0]), 
            c = g.clipAction(d[3]), m = g.clipAction(d[1]), u = [ l, c, m ], P(t.scene), 
            M(renderer, scene1, camera1);
            (audio1 = E(t.scene, "../static/examples/sounds/concrete-footsteps-6752.mp3")).autoplay = !1, 
            audio1.pause();
        }
        function B(e) {
            var t = new THREE.SkeletonHelper(e.scene), n = (scene1.add(e.scene), 
            e.scene.rotateY(Math.PI), t.visible = !1, e.animations), i = new THREE.AnimationMixer(e.scene), o = (scene1.add(t), 
            n.length);
            for (let t = 0; t !== o; ++t) {
                let e = n[t];
                var a, r = e.name;
                S[r] ? (D(a = i.clipAction(e)), S[r].action = a, H.push(a)) : R[r] && (THREE.AnimationUtils.makeClipAdditive(e), 
                e.name.endsWith("_pose") && (e = THREE.AnimationUtils.subclip(e, e.name, 2, 3, 30)), 
                D(a = i.clipAction(e)), R[r].action = a, H.push(a));
            }
            (panel2 = new dat.GUI({
                width: 310
            })).domElement.id = "panel2";
            var s = panel2.addFolder("Base Actions"), d = panel2.addFolder("Additive Action Weights"), t = panel2.addFolder("General Speed"), l = (f = {
                "modify time scale": 1
            }, [ "None", ...Object.keys(S) ]);
            for (let e = 0, t = l.length; e !== t; ++e) {
                var c = l[e];
                const h = S[c];
                f[c] = function() {
                    var e = S[z], e = e ? e.action : null, t = h ? h.action : null;
                    e !== t && x(e, t, .35);
                }, y.push(s.add(f, c));
            }
            for (const p of Object.keys(R)) {
                const w = R[p];
                f[p] = w.weight, d.add(f, p, 0, 1, .01).listen().onChange(function(e) {
                    W(w.action, e), w.weight = e;
                });
            }
            t.add(f, "modify time scale", 0, 1.5, .01).onChange(N), s.open(), d.open(), 
            t.open(), y.forEach(function(e) {
                e.setInactive = function() {
                    e.domElement.classList.add("control-inactive");
                }, e.setActive = function() {
                    e.domElement.classList.remove("control-inactive");
                };
                var t = S[e.property];
                t && t.weight || e.setInactive();
            }), requestAnimationFrame(animate);
            for (let e = 0; e !== T; ++e) {
                var m = H[e], u = m.getClip();
                (S[u.name] || R[u.name]).weight = m.getEffectiveWeight();
            }
            t = clock.getDelta();
            g.update(t), stats.update(), renderer.render(scene, camera), M(renderer, scene1, camera1);
            (audio2 = E(e.scene, "../static/examples/sounds/concrete-footsteps-6752.mp3")).autoplay = !1, 
            audio2.pause();
        }
        function F(e) {
            resetAudio();
            {
                var t = e.scene, n = e.animations, i = [ "Idle", "Walking", "Running", "Dance", "Death", "Sitting", "Standing" ], o = [ "Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp" ], a = ((panel3 = new dat.GUI()).domElement.id = "panel3", 
                g = new THREE.AnimationMixer(t), {});
                for (let e = 0; e < n.length; e++) {
                    var r = n[e], s = g.clipAction(r);
                    a[r.name] = s, (0 <= o.indexOf(r.name) || 4 <= i.indexOf(r.name)) && (s.clampWhenFinished = !0, 
                    s.loop = THREE.LoopOnce);
                }
                const u = panel3.addFolder("States"), h = u.add(b, "state").options(i), p = (h.onChange(function() {
                    L(b.state, .5);
                }), panel3.addFolder("Emotes"));
                function d() {
                    g.removeEventListener("finished", d), L(b.state, .2);
                }
                for (let e = 0; e < o.length; e++) !function(e) {
                    b[e] = function() {
                        L(e, .2), g.addEventListener("finished", d);
                    }, p.add(b, e);
                }(o[e]);
                var l = t.getObjectByName("Head_4"), c = Object.keys(l.morphTargetDictionary), m = panel3.addFolder("Expressions");
                for (let e = 0; e < c.length; e++) m.add(l.morphTargetInfluences, e, 0, 1, .01).name(c[e]);
                (w = a.Walking).play(), panel3.open();
            }
            scene1.add(e.scene), e.scene.rotateY(Math.PI);
            t = clock.getDelta();
            g && g.update(t), requestAnimationFrame(animate), M(renderer, scene1, camera1);
            (audio3 = E(e.scene, "../static/examples/sounds/concrete-footsteps-6752.mp3")).autoplay = !1, 
            audio3.pause();
        }
        Promise.all([ new Promise(t => {
            e.load("../static/examples/models/gltf/Soldier.glb", function(e) {
                t(e);
            });
        }), new Promise(t => {
            e.load("../static/examples/models/gltf/Xbot.glb", function(e) {
                t(e);
            });
        }), new Promise((t, n) => {
            e.load("../static/examples/models/gltf/RobotExpressive/RobotExpressive.glb", function(e) {
                t(e);
            }, void 0, function(e) {
                n(e);
            });
        }), new Promise((t, n) => {
            e.load("../static/media/gltf/tracker/junk-yard-robot-boy/source/multiclip.gltf", function(e) {
                t(e);
            }, void 0, function(e) {
                n(e);
            });
        }), new Promise((t, n) => {
            e.load("../static/examples/models/gltf/BoomBox.glb", function(e) {
                t(e);
            }, void 0, function(e) {
                n(e);
            });
        }) ]).then(s => {
            var [ , , , , ,  ] = s;
            console.log("boomBox", s.boomBox), this["Add IsolatorAudio"] = function() {
                if (decoScene) {
                    var e = decoScene.getObjectByName("Wall Object");
                    if (console.log("wall", e), e) {
                        {
                            var t = s[4];
                            var n = scene2;
                            var i = fpsCamera;
                            var o = "../static/examples/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3";
                            console.log("This func audioIsolator is triggered");
                            const a = new THREE.CubeTextureLoader().setPath("../static/examples/textures/cube/SwedishRoyalCastle/").load([ "px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg" ]), r = ((t = t.scene).position.x = e.position.x, 
                            t.position.y = e.position.y + 30, t.position.z = e.position.y - 50, 
                            t.scale.set(1, 1, 1), t.traverse(function(e) {
                                e.isMesh && (e.material.envMap = a, e.geometry.rotateY(-Math.PI), 
                                e.castShadow = !0);
                            }), e = new THREE.AudioListener(), i.add(e), new THREE.PositionalAudio(e));
                            new THREE.AudioLoader().load(o, function(e) {
                                r.setBuffer(e), r.setRefDistance(20), r.setDirectionalCone(180, 230, .1), 
                                r.play();
                            }), i = new THREE.PositionalAudioHelper(r, .1), r.add(i), 
                            t.add(r), n.add(t);
                        }
                        console.log("scene 2 is added audioIsolator");
                    }
                }
            }, this.trackModelPosition = function() {
                !function e() {
                    var t, n, i;
                    t = s, n = 100, renderer, 0 < t.length && ((i = t[0].scene).position.x = Math.round(fpsCamera.position.x), 
                    i.position.y = Math.round(fpsCamera.position.y), i.updateMatrixWorld(), 
                    t[1].scene.position.x = i.position.x + n, t[1].scene.position.y = i.position.y, 
                    t[1].scene.updateMatrixWorld(), t[3].scene.position.x = t[1].scene.position.x + n, 
                    t[3].scene.position.y = t[1].scene.position.y, t[3].scene.updateMatrixWorld()), 
                    renderer.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                    renderer.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
                    renderer.render(scene3, camera3), requestAnimationFrame(e);
                }();
            }, this["Model Select"] = function() {
                for (console.log("this function Model Select is triggered"), console.log("Model Selected", te["Model Options"]); 0 < scene1.children.length; ) {
                    var e = scene1.children[0];
                    scene1.remove(e);
                }
                "Soldier" === te["Model Options"] ? (t(), I(s[0])) : "SkinningRobot" === te["Model Options"] ? (t(), 
                B(s[1])) : "AnimatedRobot" === te["Model Options"] && (t(), F(s[2]));
            };
        }).catch(e => {
            console.error(e);
        });
        const t = () => {
            void 0 !== panel1 && null !== panel1 && panel1.hide(), void 0 !== panel2 && null !== panel2 && panel2.hide(), 
            void 0 !== panel3 && null !== panel3 && panel3.hide();
        };
        function k() {
            u.forEach(function(e) {
                e.stop();
            }), audio1.stop();
        }
        function O() {
            V(l, h["modify idle weight"]), V(c, h["modify walk weight"]), V(m, h["modify run weight"]), 
            u.forEach(function(e) {
                e.play();
            }), audio1.play();
        }
        function j() {
            d ? (d = !1, C()) : l.paused ? C() : u.forEach(function(e) {
                e.paused = !0, audio1.pause();
            });
        }
        function C() {
            u.forEach(function(e) {
                e.paused = !1, audio1.pause();
            });
        }
        function G() {
            C(), d = !0, p = h["modify step size"];
        }
        function x(e, t, n) {
            n = n;
            var i, o, a, n = h["use default duration"] ? n : h["set custom duration"];
            d = !1, C(), e === l ? A(e, t, n) : (i = e, o = t, a = n, g.addEventListener("loop", function e(t) {
                t.action === i && (g.removeEventListener("loop", e), A(i, o, a), 
                audio1.pause(), audioStartTime = audio1.context.currentTime, audio1.start(audioStartTime, 3, a));
            }));
        }
        function A(e, t, n) {
            V(t, 1), t.time = 0, e.crossFadeTo(t, n, !0);
        }
        function V(e, t) {
            e.enabled = !0, e.setEffectiveTimeScale(1), e.setEffectiveWeight(t);
        }
        function P(e) {
            requestAnimationFrame(P), a = l.getEffectiveWeight(), r = c.getEffectiveWeight(), 
            s = m.getEffectiveWeight(), h["modify idle weight"] = a, h["modify walk weight"] = r, 
            h["modify run weight"] = s, 1 === a && 0 === r && 0 === s && (y[0].disable(), 
            y[1].enable(), y[2].disable(), y[3].disable()), 0 === a && 1 === r && 0 === s && (y[0].enable(), 
            y[1].disable(), y[2].enable(), y[3].disable()), 0 === a && 0 === r && 1 === s && (y[0].disable(), 
            y[1].disable(), y[2].disable(), y[3].enable());
            let t = clock.getDelta();
            d && (t = p, p = 0), g.update(t), renderer.shadowMap.enabled = !0;
        }
        function D(e) {
            var t = e.getClip();
            W(e, (S[t.name] || R[t.name]).weight), e.play();
        }
        function N(e) {
            g.timeScale = e;
        }
        function W(e, t) {
            e.enabled = !0, e.setEffectiveTimeScale(1), e.setEffectiveWeight(t);
        }
        function L(e, t) {
            v = w, w = u[e], v !== w && v.fadeOut(t), w.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(t).play();
        }
    }(), n = (e.addFolder("Model Control").add(s, "Model Options", [ "Soldier", "SkinningRobot", "AnimatedRobot" ]).onFinishChange(function() {
        s["Model Select"]();
    }), e.addFolder("Enable Audio")), d = (n.add(s, "Enable Audio").onChange(function(e) {
        activateAudio = e, v(), console.log("activateAudio", activateAudio), localStorage.setItem("activateAudio", e), 
        activateAudio ? (h.open(), h.show(), s["Start Audio"]()) : (h.close(), h.hide(), 
        audioTriggered = !1, localStorage.setItem("audioTriggered", audioTriggered));
    }), e.addFolder("Enable SubAudio")), l = (d.add(t, "Enable SubAudio").onChange(function(e) {
        (isAudioFinder = e) ? (t["Sound Activate"](), c.show(), c.open(), m.open(), 
        m.show()) : (l.removeAudioFinder(), c.hide(), c.close(), m.hide(), m.close());
    }), new t.Soundsettings());
    const c = d.addFolder("Sound volume"), m = d.addFolder("Sound generator");
    function u() {
        l.listener.setMasterVolume(l.soundControls.master), sound1.setVolume(l.soundControls.msound1), 
        sound2.setVolume(l.soundControls.msound2), l.oscillator.frequency.setValueAtTime(l.generatorControls.frequency, l.listener.context.currentTime), 
        l.oscillator.type = l.generatorControls.wavetype;
    }
    c.add(l.soundControls, "master").min(0).max(1).step(.01).onFinishChange(u), 
    c.add(l.soundControls, "msound1").min(0).max(1).step(.01).onFinishChange(u), 
    c.add(l.soundControls, "msound2").min(0).max(1).step(.01).onFinishChange(u), 
    m.add(l.generatorControls, "frequency").min(50).max(5e3).step(1).onFinishChange(u), 
    m.add(l.generatorControls, "wavetype", [ "sine", "square", "sawtooth", "triangle" ]).onFinishChange(u), 
    c.hide(), c.close(), m.hide(), m.close();
    var h = n.addFolder("Audio Control"), p = h.add(s, "backgroundmusic", Object.keys(_)).onFinishChange(function() {
        activateAudio && (v(), w.setValue(defaultSettings.pitch), E.setValue(defaultSettings.delayVolume), 
        g.setValue(defaultSettings.delayOffset), s["Start Audio"]());
    }), w = h.add(s, "pitch", .5, 2).step(.01).onFinishChange(s.RegenerateAudio), E = h.add(s, "delayVolume", 0, 1).step(.01).onFinishChange(s.RegenerateAudio), g = h.add(s, "delayOffset", .1, 1).step(.01).onFinishChange(s.RegenerateAudio);
    h.add(s, "Reset Audio").onChange(function(e) {
        activateAudio && ((audioElement || 0 < audioStore.length) && (audioElement.pause(), 
        audioElement.currentTime = 0, audioStore.length = 0), resetTriggered = e, 
        localStorage.setItem("resetTriggered", resetTriggered), p.setValue(defaultSettings.audioURL), 
        w.setValue(defaultSettings.pitch), E.setValue(defaultSettings.delayVolume), 
        g.setValue(defaultSettings.delayOffset));
    }), h.add(s, "Toggle Display"), h.hide(), camera3.layers.enable(8), camera3.layers.enable(9), 
    camera3.layers.enable(10);
    var d = {
        "toggle model1": function() {
            camera3.layers.toggle(8);
        },
        "toggle model2": function() {
            camera3.layers.toggle(9);
        },
        "toggle model3": function() {
            camera3.layers.toggle(10);
        },
        "enable all": function() {
            camera3.layers.enableAll();
        },
        "disable all": function() {
            camera3.layers.disable(8), camera3.layers.disable(9), camera3.layers.disable(10);
        }
    }, n = e.addFolder("Character Control"), d = (n.add(d, "toggle model1"), n.add(d, "toggle model2"), 
    n.add(d, "toggle model3"), n.add(d, "enable all"), n.add(d, "disable all"), 
    n.close(), e.addFolder("Wall Control")), y = (d.add(s, "Wall Type", [ "Line", "Rectangle", "Circle", "Wireframe", "Spline" ]).onFinishChange(function(e) {
        y.setValue(defaultWallSettings.width), f.setValue(defaultWallSettings.depth), 
        T.setValue(defaultWallSettings.height), H.setValue(defaultWallSettings.radius), 
        S.setValue(defaultWallSettings.length), R.setValue(defaultWallSettings.segments), 
        is3DWall = !1, isInteractiveWall = !1, isInteractiveShape = !1, "Line" === e ? (y.domElement.style.display = "none", 
        f.domElement.style.display = "none", T.domElement.style.display = "none", 
        H.domElement.style.display = "none", R.domElement.style.display = "none") : "Rectangle" === e ? (y.domElement.style.display = "block", 
        f.domElement.style.display = "none", T.domElement.style.display = "block", 
        H.domElement.style.display = "none", R.domElement.style.display = "none") : "Circle" === e ? (y.domElement.style.display = "none", 
        f.domElement.style.display = "none", T.domElement.style.display = "none", 
        H.domElement.style.display = "block", R.domElement.style.display = "none") : "Wireframe" === e ? (y.domElement.style.display = "block", 
        f.domElement.style.display = "none", T.domElement.style.display = "block", 
        H.domElement.style.display = "none", R.domElement.style.display = "none") : "Spline" === e && (y.domElement.style.display = "none", 
        f.domElement.style.display = "none", T.domElement.style.display = "none", 
        H.domElement.style.display = "none", R.domElement.style.display = "block");
    }), d.add(s, "width", .5, 20).step(.5).onFinishChange(function() {
        s["Setup Wall"]();
    })), f = d.add(s, "depth", .5, 20).step(.5).onFinishChange(function() {
        s["Setup Wall"]();
    }), T = d.add(s, "height", .5, 200).step(10).onFinishChange(function() {
        s["Setup Wall"]();
    }), H = d.add(s, "radius", .5, 20).step(.5).onFinishChange(function() {
        s["Setup Wall"]();
    }), S = d.add(s, "length", .5, 200).step(10).onFinishChange(function() {
        s["Setup Wall"]();
    }), R = d.add(s, "segments", 10, 50).step(10).onFinishChange(function() {
        s["Setup Wall"]();
    });
    function v() {
        var e = document.getElementById("audio-container");
        e && document.body.removeChild(e), (audioElement || 0 < audioStore.length) && (audioElement.pause(), 
        audioElement.currentTime = 0, audioStore.length = 0);
    }
    y.domElement.style.display = "none", f.domElement.style.display = "none", T.domElement.style.display = "none", 
    H.domElement.style.display = "none", R.domElement.style.display = "none", d.add(s, "Regenerate Wall"), 
    d.add(s, "Interactive Wall").onFinishChange(function() {
        isInteractiveWall = !0, is3DWall = !1, isInteractiveShape = !1, s["Interactive Wall"]();
    }), d.add(s, "Create3D Wall").onFinishChange(function() {
        is3DWall = !0, isInteractiveWall = !1, isInteractiveShape = !1, s["Create3D Wall"]();
    }), d.add(s, "InteractiveShape Wall").onFinishChange(function() {
        is3DWall = !1, isInteractiveWall = !1, isInteractiveShape = !0, s["InteractiveShape Wall"]();
    }), d.add(s, "Remove Wall"), d.add(s, "IsolatorAudio"), d.close(), void 0 !== window.Stats && /[?&]stats=1\b/g.test(location.search) ? ((stats = new Stats()).setMode(0), 
    stats.domElement.style.position = "absolute", stats.domElement.style.left = "20px", 
    stats.domElement.style.bottom = "0px", document.body.appendChild(stats.domElement), 
    document.getElementById("code").style.left = "120px") : stats = {
        begin: function() {},
        end: function() {}
    };
}

function update(e) {
    terrainScene && (terrainScene.rotation.z = 1e-5 * Date.now()), controls.update && controls.update(e);
}

function watchFocus() {
    var e = !1;
    window.addEventListener("focus", function() {
        e && (e = !1, startAnimating(), controls.enabled = !0);
    }), window.addEventListener("blur", function() {
        stopAnimating(), e = !0, controls.enabled = !1;
    });
}

function __printCameraData() {
    var e = "", e = (e = (e = (e = (e = (e += "camera.position.x = " + Math.round(fpsCamera.position.x) + ";\n") + ("camera.position.y = " + Math.round(fpsCamera.position.y) + ";\n")) + ("camera.position.z = " + Math.round(fpsCamera.position.z) + ";\n")) + ("camera.rotation.x = " + Math.round(180 * fpsCamera.rotation.x / Math.PI) + " * Math.PI / 180;\n")) + ("camera.rotation.y = " + Math.round(180 * fpsCamera.rotation.y / Math.PI) + " * Math.PI / 180;\n")) + ("camera.rotation.z = " + Math.round(180 * fpsCamera.rotation.z / Math.PI) + " * Math.PI / 180;\n");
    console.log(e);
}

function applySmoothing(e, t) {
    var n = terrainScene.children[0], i = THREE.Terrain.toArray1D(n.geometry.attributes.position.array);
    "Conservative (0.5)" === e && THREE.Terrain.SmoothConservative(i, t, .5), "Conservative (1)" === e && THREE.Terrain.SmoothConservative(i, t, 1), 
    "Conservative (10)" === e ? THREE.Terrain.SmoothConservative(i, t, 10) : "Gaussian (0.5, 7)" === e ? THREE.Terrain.Gaussian(i, t, .5, 7) : "Gaussian (1.0, 7)" === e ? THREE.Terrain.Gaussian(i, t, 1, 7) : "Gaussian (1.5, 7)" === e ? THREE.Terrain.Gaussian(i, t, 1.5, 7) : "Gaussian (1.0, 5)" === e ? THREE.Terrain.Gaussian(i, t, 1, 5) : "Gaussian (1.0, 11)" === e ? THREE.Terrain.Gaussian(i, t, 1, 11) : "GaussianBox" === e ? THREE.Terrain.GaussianBoxBlur(i, t, 1, 3) : "Mean (0)" === e ? THREE.Terrain.Smooth(i, t, 0) : "Mean (1)" === e ? THREE.Terrain.Smooth(i, t, 1) : "Mean (8)" === e ? THREE.Terrain.Smooth(i, t, 8) : "Median" === e && THREE.Terrain.SmoothMedian(i, t), 
    THREE.Terrain.fromArray1D(n.geometry.attributes.position.array, i), THREE.Terrain.Normalize(n, t);
}

function buildTreeType1() {
    var e = new THREE.MeshLambertMaterial({
        color: 2968606
    }), t = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6, 1, !0), new THREE.MeshLambertMaterial({
        color: 4007959
    })), n = (t.position.setY(6), new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8), e)), i = (n.position.setY(18), 
    new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8), e)), e = (i.position.setY(25), 
    new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8), e)), o = (e.position.setY(32), 
    new THREE.Object3D());
    return o.add(t), o.add(n), o.add(i), o.add(e), o.scale.set(5, 1.25, 5), o;
}

function customInfluences(e, t) {
    var n, i = {};
    for (n in t) t.hasOwnProperty(n) && (i[n] = t[n]);
    i.maxHeight = .67 * t.maxHeight, i.minHeight = .67 * t.minHeight, THREE.Terrain.DiamondSquare(e, i);
    var o = .21 * Math.min(t.xSize, t.ySize), a = .8 * t.maxHeight;
    THREE.Terrain.Influence(e, t, THREE.Terrain.Influences.Hill, .25, .25, o, a, THREE.AdditiveBlending, THREE.Terrain.Linear), 
    THREE.Terrain.Influence(e, t, THREE.Terrain.Influences.Mesa, .75, .75, o, a, THREE.SubtractiveBlending, THREE.Terrain.EaseInStrong), 
    THREE.Terrain.Influence(e, t, THREE.Terrain.Influences.Flat, .75, .25, o, t.maxHeight, THREE.NormalBlending, THREE.Terrain.EaseIn), 
    THREE.Terrain.Influence(e, t, THREE.Terrain.Influences.Volcano, .25, .75, o, t.maxHeight, THREE.NormalBlending, THREE.Terrain.EaseInStrong);
}

function shuffle(e) {
    let t = e.length, n;
    for (;0 < t; ) n = Math.floor(Math.random() * t), t--, [ e[t], e[n] ] = [ e[n], e[t] ];
    return e;
}

function buildTreeType2() {
    var e = new THREE.CylinderGeometry(2, 2, 12, 6, 1, !0), t = new THREE.MeshLambertMaterial({
        color: 4007959
    }), e = new THREE.Mesh(e, t), t = (e.position.setY(6), new THREE.CylinderGeometry(0, 10, 14, 8)), n = new THREE.MeshLambertMaterial({
        color: 4007959
    }), t = new THREE.Mesh(t, n), i = (t.position.setY(18), new THREE.CylinderGeometry(0, 9, 13, 8)), i = new THREE.Mesh(i, n), o = (i.position.setY(25), 
    new THREE.CylinderGeometry(0, 8, 12, 8)), o = new THREE.Mesh(o, n), n = (o.position.setY(32), 
    new THREE.Object3D());
    return n.add(e), n.add(t), n.add(i), n.add(o), n.scale.set(5, 1.25, 5), n;
}

function onClick(e, t, n, i, o) {
    var a = new THREE.Raycaster(), r = new THREE.Vector2();
    r.x = e.clientX / window.innerWidth * 2 - 1, r.y = 2 * -(e.clientY / window.innerHeight) + 1, 
    a.setFromCamera(r, i);
    const s = [];
    t.traverse(e => {
        e.isMesh && s.push(e);
    });
    e = a.intersectObjects(s, !0);
    console.log("click now"), 0 < e.length && (console.log("got it now"), o());
}

function renderSceneSetup(e, t) {
    views[0].updateCamera(camera2, scene2, mouseX, mouseY), renderer.setViewport(0, 0, sliderVerticalPos, window.innerHeight), 
    renderer.setScissor(0, 0, sliderVerticalPos, window.innerHeight), renderer.render(e, t), 
    renderer.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
    renderer.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
    renderer.render(scene3, camera3), renderer.setViewport(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
    renderer.setScissor(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
    renderer.render(scene2, useFPS ? fpsCamera : camera2), renderer.setScissorTest(!0), 
    camera1.aspect = window.innerWidth / window.innerHeight, camera1.updateProjectionMatrix(), 
    camera2.aspect = window.innerWidth / window.innerHeight, camera2.updateProjectionMatrix(), 
    camera3.aspect = window.innerWidth / window.innerHeight, camera3.updateProjectionMatrix();
}

function renderSceneSetupScene3(e, t) {
    views[0].updateCamera(camera2, scene2, mouseX, mouseY), console.log("sliderVerticalPos renderSceneSetupScene3", sliderVerticalPos), 
    rendererCSS3D.setSize(sliderVerticalPos, window.innerHeight), rendererCSS3D.render(e, t), 
    renderer.setViewport(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
    renderer.setScissor(sliderVerticalPos, 0, window.innerWidth, window.innerHeight - sliderHorizontalPos), 
    renderer.render(scene3, camera3), renderer.setViewport(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
    renderer.setScissor(sliderVerticalPos, window.innerHeight - sliderHorizontalPos, window.innerWidth, window.innerHeight), 
    renderer.render(scene2, useFPS ? fpsCamera : camera2), renderer.setScissorTest(!0), 
    t.aspect = window.innerWidth / window.innerHeight, t.updateProjectionMatrix(), 
    camera2.aspect = window.innerWidth / window.innerHeight, camera2.updateProjectionMatrix(), 
    camera3.aspect = window.innerWidth / window.innerHeight, camera3.updateProjectionMatrix();
}

function initLoadScene1(e) {
    let n, i, o, a, r, s, d;
    const l = new THREE.Clock();
    var t;
    function c() {
        var e = 5e-4 * Date.now(), t = l.getDelta();
        d && (d.rotation.y -= .5 * t), o.position.x = 30 * Math.sin(.7 * e), o.position.y = 40 * Math.cos(.5 * e), 
        o.position.z = 30 * Math.cos(.3 * e), a.position.x = 30 * Math.cos(.3 * e), 
        a.position.y = 40 * Math.sin(.5 * e), a.position.z = 30 * Math.sin(.7 * e), 
        r.position.x = 30 * Math.sin(.7 * e), r.position.y = 40 * Math.cos(.3 * e), 
        r.position.z = 30 * Math.sin(.5 * e), s.position.x = 30 * Math.sin(.3 * e), 
        s.position.y = 40 * Math.cos(.7 * e), s.position.z = 30 * Math.sin(.5 * e), 
        renderSceneSetup(i, n);
    }
    (n = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 100)).position.z = 100, 
    i = new THREE.Scene(), scene1 = i.clone(), new THREE.OBJLoader().load("../static/examples/models/obj/walt/WaltHead.obj", function(e) {
        (d = e).scale.multiplyScalar(.8), d.position.y = -30, i.add(d);
    }), t = new THREE.SphereGeometry(.5, 16, 8), (o = new THREE.PointLight(16711744, 400)).add(new THREE.Mesh(t, new THREE.MeshBasicMaterial({
        color: 16711744
    }))), i.add(o), (a = new THREE.PointLight(16639, 400)).add(new THREE.Mesh(t, new THREE.MeshBasicMaterial({
        color: 16639
    }))), i.add(a), (r = new THREE.PointLight(8454016, 400)).add(new THREE.Mesh(t, new THREE.MeshBasicMaterial({
        color: 8454016
    }))), i.add(r), (s = new THREE.PointLight(16755200, 400)).add(new THREE.Mesh(t, new THREE.MeshBasicMaterial({
        color: 16755200
    }))), i.add(s), function e() {
        requestAnimationFrame(e);
        c();
    }();
}

function initLoadScene2(e) {
    console.log("execute scene2");
    let t, i;
    var n;
    function o() {
        renderSceneSetup(i, t);
    }
    (t = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200)).position.set(-.7, 14.6, 43.2), 
    (i = new THREE.Scene()).background = new THREE.Color(10526880), scene1 = i.clone(), 
    n = new THREE.AmbientLight(12303291), i.add(n), (n = new THREE.DirectionalLight(12698049, 3)).position.set(0, 200, 100), 
    i.add(n), (n = new THREE.GridHelper(200, 20, 0, 0)).material.opacity = .3, n.material.transparent = !0, 
    i.add(n), new THREE.LWOLoader().load("../static/examples/models/lwo/Objects/LWO3/Demo.lwo", function(e) {
        var t = e.meshes[0], n = (t.position.set(-2, 12, 0), e.meshes[1]), e = (n.position.set(2, 12, 0), 
        e.meshes[2]);
        e.position.set(0, 10.5, -1), i.add(t, n, e);
    }), e.setAnimationLoop(o), e.toneMapping = THREE.ACESFilmicToneMapping;
}

function removeScene3() {
    var e = document.getElementById("container1");
    e && document.body.removeChild(e);
}

function initLoadScene3(e) {
    console.log("sliderVerticalPos outside", sliderVerticalPos);
    let t, n, i;
    const o = [ "H", "Hydrogen", "1.00794", 1, 1, "He", "Helium", "4.002602", 18, 1, "Li", "Lithium", "6.941", 1, 2, "Be", "Beryllium", "9.012182", 2, 2, "B", "Boron", "10.811", 13, 2, "C", "Carbon", "12.0107", 14, 2, "N", "Nitrogen", "14.0067", 15, 2, "O", "Oxygen", "15.9994", 16, 2, "F", "Fluorine", "18.9984032", 17, 2, "Ne", "Neon", "20.1797", 18, 2, "Na", "Sodium", "22.98976...", 1, 3, "Mg", "Magnesium", "24.305", 2, 3, "Al", "Aluminium", "26.9815386", 13, 3, "Si", "Silicon", "28.0855", 14, 3, "P", "Phosphorus", "30.973762", 15, 3, "S", "Sulfur", "32.065", 16, 3, "Cl", "Chlorine", "35.453", 17, 3, "Ar", "Argon", "39.948", 18, 3, "K", "Potassium", "39.948", 1, 4, "Ca", "Calcium", "40.078", 2, 4, "Sc", "Scandium", "44.955912", 3, 4, "Ti", "Titanium", "47.867", 4, 4, "V", "Vanadium", "50.9415", 5, 4, "Cr", "Chromium", "51.9961", 6, 4, "Mn", "Manganese", "54.938045", 7, 4, "Fe", "Iron", "55.845", 8, 4, "Co", "Cobalt", "58.933195", 9, 4, "Ni", "Nickel", "58.6934", 10, 4, "Cu", "Copper", "63.546", 11, 4, "Zn", "Zinc", "65.38", 12, 4, "Ga", "Gallium", "69.723", 13, 4, "Ge", "Germanium", "72.63", 14, 4, "As", "Arsenic", "74.9216", 15, 4, "Se", "Selenium", "78.96", 16, 4, "Br", "Bromine", "79.904", 17, 4, "Kr", "Krypton", "83.798", 18, 4, "Rb", "Rubidium", "85.4678", 1, 5, "Sr", "Strontium", "87.62", 2, 5, "Y", "Yttrium", "88.90585", 3, 5, "Zr", "Zirconium", "91.224", 4, 5, "Nb", "Niobium", "92.90628", 5, 5, "Mo", "Molybdenum", "95.96", 6, 5, "Tc", "Technetium", "(98)", 7, 5, "Ru", "Ruthenium", "101.07", 8, 5, "Rh", "Rhodium", "102.9055", 9, 5, "Pd", "Palladium", "106.42", 10, 5, "Ag", "Silver", "107.8682", 11, 5, "Cd", "Cadmium", "112.411", 12, 5, "In", "Indium", "114.818", 13, 5, "Sn", "Tin", "118.71", 14, 5, "Sb", "Antimony", "121.76", 15, 5, "Te", "Tellurium", "127.6", 16, 5, "I", "Iodine", "126.90447", 17, 5, "Xe", "Xenon", "131.293", 18, 5, "Cs", "Caesium", "132.9054", 1, 6, "Ba", "Barium", "132.9054", 2, 6, "La", "Lanthanum", "138.90547", 4, 9, "Ce", "Cerium", "140.116", 5, 9, "Pr", "Praseodymium", "140.90765", 6, 9, "Nd", "Neodymium", "144.242", 7, 9, "Pm", "Promethium", "(145)", 8, 9, "Sm", "Samarium", "150.36", 9, 9, "Eu", "Europium", "151.964", 10, 9, "Gd", "Gadolinium", "157.25", 11, 9, "Tb", "Terbium", "158.92535", 12, 9, "Dy", "Dysprosium", "162.5", 13, 9, "Ho", "Holmium", "164.93032", 14, 9, "Er", "Erbium", "167.259", 15, 9, "Tm", "Thulium", "168.93421", 16, 9, "Yb", "Ytterbium", "173.054", 17, 9, "Lu", "Lutetium", "174.9668", 18, 9, "Hf", "Hafnium", "178.49", 4, 6, "Ta", "Tantalum", "180.94788", 5, 6, "W", "Tungsten", "183.84", 6, 6, "Re", "Rhenium", "186.207", 7, 6, "Os", "Osmium", "190.23", 8, 6, "Ir", "Iridium", "192.217", 9, 6, "Pt", "Platinum", "195.084", 10, 6, "Au", "Gold", "196.966569", 11, 6, "Hg", "Mercury", "200.59", 12, 6, "Tl", "Thallium", "204.3833", 13, 6, "Pb", "Lead", "207.2", 14, 6, "Bi", "Bismuth", "208.9804", 15, 6, "Po", "Polonium", "(209)", 16, 6, "At", "Astatine", "(210)", 17, 6, "Rn", "Radon", "(222)", 18, 6, "Fr", "Francium", "(223)", 1, 7, "Ra", "Radium", "(226)", 2, 7, "Ac", "Actinium", "(227)", 4, 10, "Th", "Thorium", "232.03806", 5, 10, "Pa", "Protactinium", "231.0588", 6, 10, "U", "Uranium", "238.02891", 7, 10, "Np", "Neptunium", "(237)", 8, 10, "Pu", "Plutonium", "(244)", 9, 10, "Am", "Americium", "(243)", 10, 10, "Cm", "Curium", "(247)", 11, 10, "Bk", "Berkelium", "(247)", 12, 10, "Cf", "Californium", "(251)", 13, 10, "Es", "Einstenium", "(252)", 14, 10, "Fm", "Fermium", "(257)", 15, 10, "Md", "Mendelevium", "(258)", 16, 10, "No", "Nobelium", "(259)", 17, 10, "Lr", "Lawrencium", "(262)", 18, 10, "Rf", "Rutherfordium", "(267)", 4, 7, "Db", "Dubnium", "(268)", 5, 7, "Sg", "Seaborgium", "(271)", 6, 7, "Bh", "Bohrium", "(272)", 7, 7, "Hs", "Hassium", "(270)", 8, 7, "Mt", "Meitnerium", "(276)", 9, 7, "Ds", "Darmstadium", "(281)", 10, 7, "Rg", "Roentgenium", "(280)", 11, 7, "Cn", "Copernicium", "(285)", 12, 7, "Nh", "Nihonium", "(286)", 13, 7, "Fl", "Flerovium", "(289)", 14, 7, "Mc", "Moscovium", "(290)", 15, 7, "Lv", "Livermorium", "(293)", 16, 7, "Ts", "Tennessine", "(294)", 17, 7, "Og", "Oganesson", "(294)", 18, 7 ], a = [], r = {
        table: [],
        sphere: [],
        helix: [],
        grid: []
    };
    var s = document.createElement("div"), d = (s.style.position = "absolute", s.style.top = "0", 
    s.style.left = "0", s.id = "container1", document.body.appendChild(s), document.createElement("div")), l = (d.id = "menu", 
    document.createElement("button")), c = (l.id = "table", l.textContent = "TABLE", 
    document.createElement("button")), m = (c.id = "sphere", c.textContent = "SPHERE", 
    document.createElement("button")), u = (m.id = "helix", m.textContent = "HELIX", 
    document.createElement("button"));
    u.id = "grid", u.textContent = "GRID", d.appendChild(l), d.appendChild(c), d.appendChild(m), 
    d.appendChild(u), s.appendChild(d), 0 === sliderVerticalPos ? document.getElementById("menu").style.display = "none" : document.getElementById("menu").style.display = "block", 
    (t = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1e4)).position.z = 3e3, 
    n = new THREE.Scene(), scene1 = n.clone();
    for (let e = 0; e < o.length; e += 5) {
        var h = document.createElement("div"), p = (h.className = "element", h.style.backgroundColor = "rgba(0,127,127," + (.5 * Math.random() + .25) + ")", 
        document.createElement("div")), p = (p.className = "number", p.textContent = e / 5 + 1, 
        h.appendChild(p), document.createElement("div")), p = (p.className = "symbol", 
        p.textContent = o[e], h.appendChild(p), document.createElement("div")), p = (p.className = "details", 
        p.innerHTML = o[e + 1] + "<br>" + o[e + 2], h.appendChild(p), new THREE.CSS3DObject(h)), h = (p.position.x = 4e3 * Math.random() - 2e3, 
        p.position.y = 4e3 * Math.random() - 2e3, p.position.z = 4e3 * Math.random() - 2e3, 
        n.add(p), a.push(p), new THREE.Object3D());
        h.position.x = 140 * o[e + 3] - 1330, h.position.y = -180 * o[e + 4] + 990, 
        r.table.push(h);
    }
    var w = new THREE.Vector3();
    for (let e = 0, t = a.length; e < t; e++) {
        var E = Math.acos(2 * e / t - 1), g = Math.sqrt(t * Math.PI) * E, y = new THREE.Object3D();
        y.position.setFromSphericalCoords(800, E, g), w.copy(y.position).multiplyScalar(2), 
        y.lookAt(w), r.sphere.push(y);
    }
    for (let e = 0, t = a.length; e < t; e++) {
        var f = .175 * e + Math.PI, T = -8 * e + 450, H = new THREE.Object3D();
        H.position.setFromCylindricalCoords(900, f, T), w.x = 2 * H.position.x, 
        w.y = H.position.y, w.z = 2 * H.position.z, H.lookAt(w), r.helix.push(H);
    }
    for (let e = 0; e < a.length; e++) {
        var S = new THREE.Object3D();
        S.position.x = e % 5 * 400 - 800, S.position.y = -Math.floor(e / 5) % 5 * 400 + 800, 
        S.position.z = 1e3 * Math.floor(e / 25) - 2e3, r.grid.push(S);
    }
    function R(t, n) {
        TWEEN.removeAll();
        for (let e = 0; e < a.length; e++) {
            var i = a[e], o = t[e];
            new TWEEN.Tween(i.position).to({
                x: o.position.x,
                y: o.position.y,
                z: o.position.z
            }, Math.random() * n + n).easing(TWEEN.Easing.Exponential.InOut).start(), 
            new TWEEN.Tween(i.rotation).to({
                x: o.rotation.x,
                y: o.rotation.y,
                z: o.rotation.z
            }, Math.random() * n + n).easing(TWEEN.Easing.Exponential.InOut).start();
        }
        new TWEEN.Tween(this).to({}, 2 * n).onUpdate(b).start();
    }
    function v() {
        t.aspect = window.innerWidth / window.innerHeight, t.updateProjectionMatrix(), 
        rendererCSS3D.setSize(window.innerWidth, window.innerHeight), b();
    }
    function b() {
        renderSceneSetupScene3(n, t);
    }
    rendererCSS3D = new THREE.CSS3DRenderer(), document.getElementById("container1").appendChild(rendererCSS3D.domElement), 
    (i = new THREE.TrackballControls(t, rendererCSS3D.domElement)).minDistance = 500, 
    i.maxDistance = 6e3, i.addEventListener("change", b), (l = document.getElementById("table")).addEventListener("pointerdown", function() {
        console.log("this is triggered"), R(r.table, 2e3);
    }), (c = document.getElementById("sphere")).addEventListener("pointerdown", function() {
        R(r.sphere, 2e3);
    }), (m = document.getElementById("helix")).addEventListener("pointerdown", function() {
        R(r.helix, 2e3);
    }), (u = document.getElementById("grid")).addEventListener("pointerdown", function() {
        R(r.grid, 2e3);
    }), R(r.table, 2e3), window.addEventListener("resize", v), function e() {
        requestAnimationFrame(e);
        TWEEN.update();
        i.update();
    }();
}

function initLoadScene4(e) {
    let t, a, r;
    const i = 512, o = [], s = [];
    let d = 0;
    {
        const y = document.createElement("div"), f = (y.style.position = "absolute", 
        y.style.top = "0", y.style.left = "0", y.id = "container1", document.body.appendChild(y), 
        (t = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5e3)).position.set(600, 400, 1500), 
        t.lookAt(0, 0, 0), a = new THREE.Scene(), scene1 = a.clone(), document.createElement("img"));
        f.addEventListener("load", function() {
            for (let e = 0; e < i; e++) {
                var t = new THREE.CSS3DSprite(f.cloneNode());
                t.position.x = 4e3 * Math.random() - 2e3, t.position.y = 4e3 * Math.random() - 2e3, 
                t.position.z = 4e3 * Math.random() - 2e3, a.add(t), s.push(t);
            }
            g();
        }), f.src = "../static/examples/textures/sprite.png";
        for (let e = 0; e < i; e++) {
            var n = e % 16 * 150, l = 150 * Math.floor(e / 16), c = 200 * (Math.sin(.5 * n) + Math.sin(.5 * l));
            o.push(n - 1125, c, l - 2325);
        }
        for (let e = 0; e < i; e++) {
            var m = e % 8 * 150, u = 150 * Math.floor(e / 8 % 8), h = 150 * Math.floor(e / 64);
            o.push(m - 525, u - 525, h - 525);
        }
        for (let e = 0; e < i; e++) o.push(4e3 * Math.random() - 2e3, 4e3 * Math.random() - 2e3, 4e3 * Math.random() - 2e3);
        for (let e = 0; e < i; e++) {
            var p = Math.acos(2 * e / i - 1), w = Math.sqrt(i * Math.PI) * p;
            o.push(750 * Math.cos(w) * Math.sin(p), 750 * Math.sin(w) * Math.sin(p), 750 * Math.cos(p));
        }
        rendererCSS3D = new THREE.CSS3DRenderer(), document.getElementById("container1").appendChild(rendererCSS3D.domElement), 
        r = new THREE.TrackballControls(t, rendererCSS3D.domElement), window.addEventListener("resize", E);
    }
    function E() {
        t.aspect = sliderVerticalPos / window.innerHeight, t.updateProjectionMatrix(), 
        rendererCSS3D.setSize(sliderVerticalPos, window.innerHeight);
    }
    function g() {
        for (let e = 0, t = d * i * 3; e < i; e++, t += 3) {
            var n = s[e];
            new TWEEN.Tween(n.position).to({
                x: o[t],
                y: o[t + 1],
                z: o[t + 2]
            }, 2e3 * Math.random() + 2e3).easing(TWEEN.Easing.Exponential.InOut).start();
        }
        new TWEEN.Tween(this).to({}, 6e3).onComplete(g).start(), d = (d + 1) % 4;
    }
    !function e() {
        requestAnimationFrame(e);
        TWEEN.update();
        r.update();
        const n = performance.now();
        for (let e = 0, t = s.length; e < t; e++) {
            const i = s[e], o = .3 * Math.sin(.002 * (Math.floor(i.position.x) + n)) + 1;
            i.scale.set(o, o, o);
        }
        renderSceneSetupScene3(a, t);
    }();
}

function initLoadScene5(r) {
    let x, s, A, d;
    const V = new THREE.Clock(), l = new THREE.Vector2(), c = new THREE.Raycaster(), m = new THREE.MeshPhongMaterial({
        color: 2105376
    }), u = 7.8;
    let h, P, p, w, D;
    const E = .05, W = new THREE.ConvexObjectBreaker(), L = [], g = new THREE.Vector3(), y = new THREE.Quaternion();
    let z, f;
    const I = [];
    for (let e = 0; e < 500; e++) I[e] = null;
    let B = 0;
    const F = new THREE.Vector3(), k = new THREE.Vector3();
    function T(e, t, n, i, o) {
        t = new THREE.Mesh(new THREE.BoxGeometry(2 * t.x, 2 * t.y, 2 * t.z), o);
        t.position.copy(n), t.quaternion.copy(i), W.prepareBreakableObject(t, e, new THREE.Vector3(), new THREE.Vector3(), !0), 
        O(t);
    }
    function O(e) {
        e.castShadow = !0, e.receiveShadow = !0;
        var t = function(n) {
            var i = new Ammo.btConvexHullShape();
            for (let e = 0, t = n.length; e < t; e += 3) {
                f.setValue(n[e], n[e + 1], n[e + 2]);
                var o = e >= t - 3;
                i.addPoint(f, o);
            }
            return i;
        }(e.geometry.attributes.position.array), t = (t.setMargin(E), H(e, t, e.userData.mass, null, null, e.userData.velocity, e.userData.angularVelocity)), n = new Ammo.btVector3(0, 0, 0);
        n.threeObject = e, t.setUserPointer(n);
    }
    function H(e, t, n, i, o, a, r) {
        i ? e.position.copy(i) : i = e.position, o ? e.quaternion.copy(o) : o = e.quaternion;
        var s = new Ammo.btTransform(), i = (s.setIdentity(), s.setOrigin(new Ammo.btVector3(i.x, i.y, i.z)), 
        s.setRotation(new Ammo.btQuaternion(o.x, o.y, o.z, o.w)), new Ammo.btDefaultMotionState(s)), o = new Ammo.btVector3(0, 0, 0), s = (t.calculateLocalInertia(n, o), 
        new Ammo.btRigidBodyConstructionInfo(n, i, t, o)), i = new Ammo.btRigidBody(s);
        return i.setFriction(.5), a && i.setLinearVelocity(new Ammo.btVector3(a.x, a.y, a.z)), 
        r && i.setAngularVelocity(new Ammo.btVector3(r.x, r.y, r.z)), e.userData.physicsBody = i, 
        e.userData.collided = !1, A.add(e), 0 < n && (L.push(e), i.setActivationState(4)), 
        D.addRigidBody(i), i;
    }
    function S(e) {
        return e = e || Math.floor(Math.random() * (1 << 24)), new THREE.MeshPhongMaterial({
            color: e
        });
    }
    function R() {
        x.aspect = window.innerWidth / window.innerHeight, x.updateProjectionMatrix(), 
        r.setSize(window.innerWidth, window.innerHeight);
    }
    function j() {
        requestAnimationFrame(j);
        var e = V.getDelta();
        D.stepSimulation(e, 10);
        for (let e = 0, t = L.length; e < t; e++) {
            var n, i = L[e], o = i.userData.physicsBody.getMotionState();
            o && (o.getWorldTransform(z), o = z.getOrigin(), n = z.getRotation(), 
            i.position.set(o.x(), o.y(), o.z()), i.quaternion.set(n.x(), n.y(), n.z(), n.w()), 
            i.userData.collided = !1);
        }
        for (let e = 0, t = P.getNumManifolds(); e < t; e++) {
            var a = P.getManifoldByIndexInternal(e), r = Ammo.castObject(a.getBody0(), Ammo.btRigidBody), s = Ammo.castObject(a.getBody1(), Ammo.btRigidBody), d = Ammo.castObject(r.getUserPointer(), Ammo.btVector3).threeObject, l = Ammo.castObject(s.getUserPointer(), Ammo.btVector3).threeObject;
            if (d || l) {
                var c = d ? d.userData : null, m = l ? l.userData : null, u = !!c && c.breakable, h = !!m && m.breakable, p = !!c && c.collided, w = !!m && m.collided;
                if (!(!u && !h || p && w)) {
                    let n = !1, i = 0;
                    for (let e = 0, t = a.getNumContacts(); e < t; e++) {
                        var E = a.getContactPoint(e);
                        if (E.getDistance() < 0) {
                            n = !0;
                            var g = E.getAppliedImpulse();
                            g > i && (i = g, g = E.get_m_positionWorldOnB(), E = E.get_m_normalWorldOnB(), 
                            F.set(g.x(), g.y(), g.z()), k.set(E.x(), E.y(), E.z()));
                            break;
                        }
                    }
                    if (n) {
                        if (u && !p && 250 < i) {
                            var y = W.subdivideByImpact(d, F, k, 1, 2, 1.5), f = y.length;
                            for (let e = 0; e < f; e++) {
                                var T = r.getLinearVelocity(), H = r.getAngularVelocity(), S = y[e];
                                S.userData.velocity.set(T.x(), T.y(), T.z()), S.userData.angularVelocity.set(H.x(), H.y(), H.z()), 
                                O(S);
                            }
                            I[B++] = d, c.collided = !0;
                        }
                        if (h && !w && 250 < i) {
                            var R = W.subdivideByImpact(l, F, k, 1, 2, 1.5), v = R.length;
                            for (let e = 0; e < v; e++) {
                                var b = s.getLinearVelocity(), M = s.getAngularVelocity(), C = R[e];
                                C.userData.velocity.set(b.x(), b.y(), b.z()), C.userData.angularVelocity.set(M.x(), M.y(), M.z()), 
                                O(C);
                            }
                            I[B++] = l, m.collided = !0;
                        }
                    }
                }
            }
        }
        for (let e = 0; e < B; e++) {
            t = void 0;
            var t = I[e];
            A.remove(t), D.removeRigidBody(t.userData.physicsBody);
        }
        B = 0, renderSceneSetup(A, x);
    }
    Ammo().then(function(e) {
        Ammo = e, x = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .2, 2e3), 
        (A = new THREE.Scene()).background = new THREE.Color(12571109), x.position.set(-14, 8, 16), 
        (s = new THREE.OrbitControls(x, r.domElement)).target.set(0, 2, 0), s.update(), 
        d = new THREE.TextureLoader();
        e = new THREE.AmbientLight(12303291);
        A.add(e), (e = new THREE.DirectionalLight(16777215, 3)).position.set(-10, 18, 5), 
        e.castShadow = !0, e.shadow.camera.left = -14, e.shadow.camera.right = 14, 
        e.shadow.camera.top = 14, e.shadow.camera.bottom = -14, e.shadow.camera.near = 2, 
        e.shadow.camera.far = 50, e.shadow.mapSize.x = 1024, e.shadow.mapSize.y = 1024, 
        A.add(e), window.addEventListener("resize", R), h = new Ammo.btDefaultCollisionConfiguration(), 
        P = new Ammo.btCollisionDispatcher(h), p = new Ammo.btDbvtBroadphase(), 
        w = new Ammo.btSequentialImpulseConstraintSolver(), (D = new Ammo.btDiscreteDynamicsWorld(P, p, w, h)).setGravity(new Ammo.btVector3(0, -u, 0)), 
        z = new Ammo.btTransform(), f = new Ammo.btVector3(0, 0, 0);
        {
            g.set(0, -.5, 0), y.set(0, 0, 0, 1);
            const n = function(e, t, n, i, o, a, r) {
                r = new THREE.Mesh(new THREE.BoxGeometry(e, t, n, 1, 1, 1), r), 
                e = new Ammo.btBoxShape(new Ammo.btVector3(.5 * e, .5 * t, .5 * n));
                return e.setMargin(E), H(r, e, i, o, a), r;
            }(40, 1, 40, 0, g, y, new THREE.MeshPhongMaterial({
                color: 16777215
            })), i = (n.receiveShadow = !0, d.load("../static/examples/textures/grid.png", function(e) {
                e.wrapS = THREE.RepeatWrapping, e.wrapT = THREE.RepeatWrapping, 
                e.repeat.set(40, 40), n.material.map = e, n.material.needsUpdate = !0;
            }), new THREE.Vector3(2, 5, 2)), o = (g.set(-8, 5, 0), y.set(0, 0, 0, 1), 
            T(1e3, i, g, y, S(11546644)), g.set(8, 5, 0), y.set(0, 0, 0, 1), T(1e3, i, g, y, S(11547156)), 
            new THREE.Vector3(7, .2, 1.5)), a = (g.set(0, 10.2, 0), y.set(0, 0, 0, 1), 
            T(100, o, g, y, S(11778149)), new THREE.Vector3(1, 2, .15));
            y.set(0, 0, 0, 1);
            for (let e = 0; e < 8; e++) g.set(0, 2, 15 * (.5 - e / 9)), T(120, a, g, y, S(11579568));
            var e = new THREE.Vector3(4, 5, 4), t = (g.set(5, .5 * e.y, -7), y.set(0, 0, 0, 1), 
            []), e;
            t.push(new THREE.Vector3(e.x, -e.y, e.z)), t.push(new THREE.Vector3(-e.x, -e.y, e.z)), 
            t.push(new THREE.Vector3(e.x, -e.y, -e.z)), t.push(new THREE.Vector3(-e.x, -e.y, -e.z)), 
            t.push(new THREE.Vector3(0, e.y, 0)), (e = new THREE.Mesh(new THREE.ConvexGeometry(t), S(11548692))).position.copy(g), 
            e.quaternion.copy(y), W.prepareBreakableObject(e, 860, new THREE.Vector3(), new THREE.Vector3(), !0), 
            O(e);
        }
        window.addEventListener("pointerdown", function(e) {
            l.set(e.clientX / window.innerWidth * 2 - 1, 2 * -(e.clientY / window.innerHeight) + 1), 
            c.setFromCamera(l, x);
            var e = new THREE.Mesh(new THREE.SphereGeometry(.4, 14, 10), m), t = (e.castShadow = !0, 
            e.receiveShadow = !0, new Ammo.btSphereShape(.4)), e = (t.setMargin(E), 
            g.copy(c.ray.direction), g.add(c.ray.origin), y.set(0, 0, 0, 1), H(e, t, 35, g, y));
            g.copy(c.ray.direction), g.multiplyScalar(24), e.setLinearVelocity(new Ammo.btVector3(g.x, g.y, g.z));
        }), j();
    });
}

function initLoadScene6(r) {
    let x, s, A, d;
    const V = new THREE.Clock(), l = new THREE.Vector2(), c = new THREE.Raycaster(), m = new THREE.MeshPhongMaterial({
        color: 2105376
    }), u = 7.8;
    let h, P, p, w, D;
    const E = .05, W = new THREE.ConvexObjectBreaker(), L = [], g = new THREE.Vector3(), y = new THREE.Quaternion();
    let z, f;
    const I = [];
    for (let e = 0; e < 500; e++) I[e] = null;
    let B = 0;
    const F = new THREE.Vector3(), k = new THREE.Vector3();
    function T(e, t, n, i, o) {
        t = new THREE.Mesh(new THREE.BoxGeometry(2 * t.x, 2 * t.y, 2 * t.z), o);
        t.position.copy(n), t.quaternion.copy(i), W.prepareBreakableObject(t, e, new THREE.Vector3(), new THREE.Vector3(), !0), 
        O(t);
    }
    function O(e) {
        e.castShadow = !0, e.receiveShadow = !0;
        var t = function(n) {
            var i = new Ammo.btConvexHullShape();
            for (let e = 0, t = n.length; e < t; e += 3) {
                f.setValue(n[e], n[e + 1], n[e + 2]);
                var o = e >= t - 3;
                i.addPoint(f, o);
            }
            return i;
        }(e.geometry.attributes.position.array), t = (t.setMargin(E), H(e, t, e.userData.mass, null, null, e.userData.velocity, e.userData.angularVelocity)), n = new Ammo.btVector3(0, 0, 0);
        n.threeObject = e, t.setUserPointer(n);
    }
    function H(e, t, n, i, o, a, r) {
        i ? e.position.copy(i) : i = e.position, o ? e.quaternion.copy(o) : o = e.quaternion;
        var s = new Ammo.btTransform(), i = (s.setIdentity(), s.setOrigin(new Ammo.btVector3(i.x, i.y, i.z)), 
        s.setRotation(new Ammo.btQuaternion(o.x, o.y, o.z, o.w)), new Ammo.btDefaultMotionState(s)), o = new Ammo.btVector3(0, 0, 0), s = (t.calculateLocalInertia(n, o), 
        new Ammo.btRigidBodyConstructionInfo(n, i, t, o)), i = new Ammo.btRigidBody(s);
        return i.setFriction(.5), a && i.setLinearVelocity(new Ammo.btVector3(a.x, a.y, a.z)), 
        r && i.setAngularVelocity(new Ammo.btVector3(r.x, r.y, r.z)), e.userData.physicsBody = i, 
        e.userData.collided = !1, A.add(e), 0 < n && (L.push(e), i.setActivationState(4)), 
        D.addRigidBody(i), i;
    }
    function S(e) {
        return e = e || Math.floor(Math.random() * (1 << 24)), new THREE.MeshPhongMaterial({
            color: e
        });
    }
    function R() {
        x.aspect = window.innerWidth / window.innerHeight, x.updateProjectionMatrix(), 
        r.setSize(window.innerWidth, window.innerHeight);
    }
    function j() {
        requestAnimationFrame(j);
        var e = V.getDelta();
        D.stepSimulation(e, 10);
        for (let e = 0, t = L.length; e < t; e++) {
            var n, i = L[e], o = i.userData.physicsBody.getMotionState();
            o && (o.getWorldTransform(z), o = z.getOrigin(), n = z.getRotation(), 
            i.position.set(o.x(), o.y(), o.z()), i.quaternion.set(n.x(), n.y(), n.z(), n.w()), 
            i.userData.collided = !1);
        }
        for (let e = 0, t = P.getNumManifolds(); e < t; e++) {
            var a = P.getManifoldByIndexInternal(e), r = Ammo.castObject(a.getBody0(), Ammo.btRigidBody), s = Ammo.castObject(a.getBody1(), Ammo.btRigidBody), d = Ammo.castObject(r.getUserPointer(), Ammo.btVector3).threeObject, l = Ammo.castObject(s.getUserPointer(), Ammo.btVector3).threeObject;
            if (d || l) {
                var c = d ? d.userData : null, m = l ? l.userData : null, u = !!c && c.breakable, h = !!m && m.breakable, p = !!c && c.collided, w = !!m && m.collided;
                if (!(!u && !h || p && w)) {
                    let n = !1, i = 0;
                    for (let e = 0, t = a.getNumContacts(); e < t; e++) {
                        var E = a.getContactPoint(e);
                        if (E.getDistance() < 0) {
                            n = !0;
                            var g = E.getAppliedImpulse();
                            g > i && (i = g, g = E.get_m_positionWorldOnB(), E = E.get_m_normalWorldOnB(), 
                            F.set(g.x(), g.y(), g.z()), k.set(E.x(), E.y(), E.z()));
                            break;
                        }
                    }
                    if (n) {
                        if (u && !p && 250 < i) {
                            var y = W.subdivideByImpact(d, F, k, 1, 2, 1.5), f = y.length;
                            for (let e = 0; e < f; e++) {
                                var T = r.getLinearVelocity(), H = r.getAngularVelocity(), S = y[e];
                                S.userData.velocity.set(T.x(), T.y(), T.z()), S.userData.angularVelocity.set(H.x(), H.y(), H.z()), 
                                O(S);
                            }
                            I[B++] = d, c.collided = !0;
                        }
                        if (h && !w && 250 < i) {
                            var R = W.subdivideByImpact(l, F, k, 1, 2, 1.5), v = R.length;
                            for (let e = 0; e < v; e++) {
                                var b = s.getLinearVelocity(), M = s.getAngularVelocity(), C = R[e];
                                C.userData.velocity.set(b.x(), b.y(), b.z()), C.userData.angularVelocity.set(M.x(), M.y(), M.z()), 
                                O(C);
                            }
                            I[B++] = l, m.collided = !0;
                        }
                    }
                }
            }
        }
        for (let e = 0; e < B; e++) {
            t = void 0;
            var t = I[e];
            A.remove(t), D.removeRigidBody(t.userData.physicsBody);
        }
        B = 0, renderSceneSetup(A, x);
    }
    Ammo().then(function(e) {
        Ammo = e, x = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .2, 2e3), 
        (A = new THREE.Scene()).background = new THREE.Color(12571109), x.position.set(-14, 8, 16), 
        (s = new THREE.OrbitControls(x, r.domElement)).target.set(0, 2, 0), s.update(), 
        d = new THREE.TextureLoader();
        e = new THREE.AmbientLight(12303291);
        A.add(e), (e = new THREE.DirectionalLight(16777215, 3)).position.set(-10, 18, 5), 
        e.castShadow = !0, e.shadow.camera.left = -14, e.shadow.camera.right = 14, 
        e.shadow.camera.top = 14, e.shadow.camera.bottom = -14, e.shadow.camera.near = 2, 
        e.shadow.camera.far = 50, e.shadow.mapSize.x = 1024, e.shadow.mapSize.y = 1024, 
        A.add(e), window.addEventListener("resize", R), h = new Ammo.btDefaultCollisionConfiguration(), 
        P = new Ammo.btCollisionDispatcher(h), p = new Ammo.btDbvtBroadphase(), 
        w = new Ammo.btSequentialImpulseConstraintSolver(), (D = new Ammo.btDiscreteDynamicsWorld(P, p, w, h)).setGravity(new Ammo.btVector3(0, -u, 0)), 
        z = new Ammo.btTransform(), f = new Ammo.btVector3(0, 0, 0);
        {
            g.set(0, -.5, 0), y.set(0, 0, 0, 1);
            const n = function(e, t, n, i, o, a, r) {
                r = new THREE.Mesh(new THREE.BoxGeometry(e, t, n, 1, 1, 1), r), 
                e = new Ammo.btBoxShape(new Ammo.btVector3(.5 * e, .5 * t, .5 * n));
                return e.setMargin(E), H(r, e, i, o, a), r;
            }(40, 1, 40, 0, g, y, new THREE.MeshPhongMaterial({
                color: 16777215
            })), i = (n.receiveShadow = !0, d.load("../static/examples/textures/grid.png", function(e) {
                e.wrapS = THREE.RepeatWrapping, e.wrapT = THREE.RepeatWrapping, 
                e.repeat.set(40, 40), n.material.map = e, n.material.needsUpdate = !0;
            }), new THREE.Vector3(2, 5, 2)), o = (g.set(-8, 5, 0), y.set(0, 0, 0, 1), 
            T(1e3, i, g, y, S(11546644)), g.set(8, 5, 0), y.set(0, 0, 0, 1), T(1e3, i, g, y, S(11547156)), 
            new THREE.Vector3(7, .2, 1.5)), a = (g.set(0, 10.2, 0), y.set(0, 0, 0, 1), 
            T(100, o, g, y, S(11778149)), new THREE.Vector3(1, 2, .15));
            y.set(0, 0, 0, 1);
            for (let e = 0; e < 8; e++) g.set(0, 2, 15 * (.5 - e / 9)), T(120, a, g, y, S(11579568));
            var e = new THREE.Vector3(4, 5, 4), t = (g.set(5, .5 * e.y, -7), y.set(0, 0, 0, 1), 
            []), e;
            t.push(new THREE.Vector3(e.x, -e.y, e.z)), t.push(new THREE.Vector3(-e.x, -e.y, e.z)), 
            t.push(new THREE.Vector3(e.x, -e.y, -e.z)), t.push(new THREE.Vector3(-e.x, -e.y, -e.z)), 
            t.push(new THREE.Vector3(0, e.y, 0)), (e = new THREE.Mesh(new THREE.ConvexGeometry(t), S(11548692))).position.copy(g), 
            e.quaternion.copy(y), W.prepareBreakableObject(e, 860, new THREE.Vector3(), new THREE.Vector3(), !0), 
            O(e);
        }
        window.addEventListener("pointerdown", function(e) {
            l.set(e.clientX / window.innerWidth * 2 - 1, 2 * -(e.clientY / window.innerHeight) + 1), 
            c.setFromCamera(l, x);
            var e = new THREE.Mesh(new THREE.SphereGeometry(.4, 14, 10), m), t = (e.castShadow = !0, 
            e.receiveShadow = !0, new Ammo.btSphereShape(.4)), e = (t.setMargin(E), 
            g.copy(c.ray.direction), g.add(c.ray.origin), y.set(0, 0, 0, 1), H(e, t, 35, g, y));
            g.copy(c.ray.direction), g.multiplyScalar(24), e.setLinearVelocity(new Ammo.btVector3(g.x, g.y, g.z));
        }), j();
    });
}

function initLoadScene7(t) {
    let h, p, r, w = [], s = (new THREE.Vector3(), null), E, d = {
        left: 0,
        right: 0,
        forward: 0,
        back: 0,
        up: 0,
        down: 0
    };
    const g = {
        DISABLE_DEACTIVATION: 4
    };
    let n, u, i;
    function l() {
        var e, t = clock.getDelta(), n = (e = d.right - d.left, n = d.back - d.forward, 
        0 == e && 0 == n || ((e = new Ammo.btVector3(e, 0, n)).op_mul(20), E.userData.physicsBody.setLinearVelocity(e)), 
        t);
        h.stepSimulation(n, 10);
        for (let e = 0; e < w.length; e++) {
            var i, o = w[e], a = o.userData.physicsBody.getMotionState();
            a && (a.getWorldTransform(s), a = s.getOrigin(), i = s.getRotation(), 
            o.position.set(a.x(), a.y(), a.z()), o.quaternion.set(i.x(), i.y(), i.z(), i.w()));
        }
        renderSceneSetup(p, r), requestAnimationFrame(l);
    }
    function e() {
        r.aspect = window.innerWidth / window.innerHeight, r.updateProjectionMatrix(), 
        t.setSize(window.innerWidth, window.innerHeight);
    }
    function o(e) {
        var t;
        switch (e.keyCode) {
          case 87:
            d.forward = 1;
            break;

          case 83:
            d.back = 1;
            break;

          case 65:
            d.left = 1;
            break;

          case 68:
            d.right = 1;
            break;

          case 84:
            h.contactTest(E.userData.physicsBody, n);
            break;

          case 74:
            i.hasContact = !1, h.contactPairTest(E.userData.physicsBody, u.userData.physicsBody, i), 
            i.hasContact && (t = new Ammo.btVector3(0, 15, 0), E.userData.physicsBody.setLinearVelocity(t));
        }
    }
    function a(e) {
        switch (e.keyCode) {
          case 87:
            d.forward = 0;
            break;

          case 83:
            d.back = 0;
            break;

          case 65:
            d.left = 0;
            break;

          case 68:
            d.right = 0;
        }
    }
    Ammo().then(function() {
        s = new Ammo.btTransform(), function() {
            var e = new Ammo.btDefaultCollisionConfiguration(), t = new Ammo.btCollisionDispatcher(e), n = new Ammo.btDbvtBroadphase(), i = new Ammo.btSequentialImpulseConstraintSolver();
            (h = new Ammo.btDiscreteDynamicsWorld(t, n, i, e)).setGravity(new Ammo.btVector3(0, -10, 0));
        }(), function() {
            clock = new THREE.Clock(), (p = new THREE.Scene()).background = new THREE.Color(11271935), 
            (r = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .2, 5e3)).position.set(0, 80, 40), 
            r.lookAt(new THREE.Vector3(0, 0, 0));
            var e = new THREE.HemisphereLight(16777215, 16777215, .1), e = (e.color.setHSL(.6, .6, .6), 
            e.groundColor.setHSL(.1, 1, .4), e.position.set(0, 50, 0), p.add(e), 
            new THREE.DirectionalLight(16777215, 1));
            e.color.setHSL(.1, 1, .95), e.position.set(-1, 1.75, 1), e.position.multiplyScalar(100), 
            p.add(e), e.castShadow = !0, e.shadow.mapSize.width = 2048, e.shadow.mapSize.height = 2048;
            e.shadow.camera.left = -50, e.shadow.camera.right = 50, e.shadow.camera.top = 50, 
            e.shadow.camera.bottom = -50, e.shadow.camera.far = 13500, t.gammaInput = !0, 
            t.gammaOutput = !0, t.shadowMap.enabled = !0;
        }(), function() {
            let e = 40, t = 6, n = 40, i = 0, o = 0, a = 0, r = 1;
            for (const m of [ {
                name: "yellow",
                color: 16776960,
                pos: {
                    x: -20,
                    y: 0,
                    z: 20
                }
            }, {
                name: "red",
                color: 16711680,
                pos: {
                    x: 20,
                    y: 0,
                    z: 20
                }
            }, {
                name: "green",
                color: 32768,
                pos: {
                    x: 20,
                    y: 0,
                    z: -20
                }
            }, {
                name: "blue",
                color: 255,
                pos: {
                    x: -20,
                    y: 0,
                    z: -20
                }
            } ]) {
                var s = m.pos, d = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({
                    color: m.color
                })), l = (d.position.set(s.x, s.y, s.z), d.scale.set(e, t, n), d.castShadow = !0, 
                d.receiveShadow = !0, d.userData.tag = m.name, p.add(d), new Ammo.btTransform()), s = (l.setIdentity(), 
                l.setOrigin(new Ammo.btVector3(s.x, s.y, s.z)), l.setRotation(new Ammo.btQuaternion(i, o, a, r)), 
                new Ammo.btDefaultMotionState(l)), l = new Ammo.btBoxShape(new Ammo.btVector3(.5 * e, .5 * t, .5 * n)), c = (l.setMargin(.05), 
                new Ammo.btVector3(0, 0, 0)), s = (l.calculateLocalInertia(0, c), 
                new Ammo.btRigidBodyConstructionInfo(0, s, l, c)), l = new Ammo.btRigidBody(s);
                l.setFriction(4), l.setRollingFriction(10), h.addRigidBody(l), l.threeObject = d, 
                "red" == m.name && (d.userData.physicsBody = l, u = d);
            }
        }(), function() {
            let e = 0, t = 10, n = 0, i = 0, o = 0, a = 0, r = 1, s = ((E = ballObject = new THREE.Mesh(new THREE.SphereBufferGeometry(1.5), new THREE.MeshPhongMaterial({
                color: 8388736
            }))).position.set(e, t, n), E.castShadow = !0, E.receiveShadow = !0, 
            E.userData.tag = "ball", p.add(E), new Ammo.btTransform()), d = (s.setIdentity(), 
            s.setOrigin(new Ammo.btVector3(e, t, n)), s.setRotation(new Ammo.btQuaternion(i, o, a, r)), 
            new Ammo.btDefaultMotionState(s)), l = new Ammo.btSphereShape(1.5), c = (l.setMargin(.05), 
            new Ammo.btVector3(0, 0, 0)), m = (l.calculateLocalInertia(1, c), new Ammo.btRigidBodyConstructionInfo(1, d, l, c)), u = new Ammo.btRigidBody(m);
            u.setFriction(4), u.setRollingFriction(10), u.setActivationState(g.DISABLE_DEACTIVATION), 
            h.addRigidBody(u), w.push(E), (E.userData.physicsBody = u).threeObject = E;
        }(), (n = new Ammo.ConcreteContactResultCallback()).addSingleResult = function(i, o, e, t, a, n, r) {
            var i = Ammo.wrapPointer(i, Ammo.btManifoldPoint), s = i.getDistance();
            if (!(0 < s)) {
                s = Ammo.wrapPointer(o, Ammo.btCollisionObjectWrapper), o = Ammo.castObject(s.getCollisionObject(), Ammo.btRigidBody), 
                s = Ammo.wrapPointer(a, Ammo.btCollisionObjectWrapper), a = Ammo.castObject(s.getCollisionObject(), Ammo.btRigidBody), 
                s = o.threeObject, o = a.threeObject;
                let e, t, n;
                n = "ball" != s.userData.tag ? (e = s.userData.tag, t = i.get_m_localPointA(), 
                i.get_m_positionWorldOnA()) : (e = o.userData.tag, t = i.get_m_localPointB(), 
                i.get_m_positionWorldOnB());
                a = {
                    x: t.x(),
                    y: t.y(),
                    z: t.z()
                }, s = {
                    x: n.x(),
                    y: n.y(),
                    z: n.z()
                };
                console.log({
                    tag: e,
                    localPosDisplay: a,
                    worldPosDisplay: s
                });
            }
        }, (i = new Ammo.ConcreteContactResultCallback()).hasContact = !1, i.addSingleResult = function(e, t, n, i, o, a, r) {
            0 < Ammo.wrapPointer(e, Ammo.btManifoldPoint).getDistance() || (this.hasContact = !0);
        }, window.addEventListener("resize", e, !1), window.addEventListener("keydown", o, !1), 
        window.addEventListener("keyup", a, !1), l();
    });
}

function initLoadScene8(e) {
    let t, n, i, b;
    const M = [], C = new THREE.Vector3(), x = new THREE.Vector3(), A = new THREE.Vector3(), V = new THREE.Vector3(), P = new THREE.Vector3(), o = {
        Atoms: 0,
        Bonds: 1,
        "Atoms + Bonds": 2
    }, a = {
        Ethanol: "ethanol.pdb",
        Aspirin: "aspirin.pdb",
        Caffeine: "caffeine.pdb",
        Nicotine: "nicotine.pdb",
        LSD: "lsd.pdb",
        Cocaine: "cocaine.pdb",
        Cholesterol: "cholesterol.pdb",
        Lycopene: "lycopene.pdb",
        Glucose: "glucose.pdb",
        "Aluminium oxide": "Al2O3.pdb",
        Cubane: "cubane.pdb",
        Copper: "cu.pdb",
        Fluorite: "caf2.pdb",
        Salt: "nacl.pdb",
        "YBCO superconductor": "ybco.pdb",
        Buckyball: "buckyball.pdb",
        Graphite: "graphite.pdb"
    }, D = {
        vizType: 2,
        molecule: "caffeine.pdb"
    }, r = new THREE.PDBLoader(), W = {}, L = document.createElement("img");
    var s;
    function z(e) {
        if (0 === e) for (let e = 0; e < M.length; e++) {
            var t = M[e];
            t instanceof CSS3DSprite ? (t.element.style.display = "", t.visible = !0) : (t.element.style.display = "none", 
            t.visible = !1);
        } else if (1 === e) for (let e = 0; e < M.length; e++) {
            var n = M[e];
            n instanceof CSS3DSprite ? (n.element.style.display = "none", n.visible = !1) : (n.element.style.display = "", 
            n.element.style.height = n.userData.bondLengthFull, n.visible = !0);
        } else for (let e = 0; e < M.length; e++) {
            var i = M[e];
            i.element.style.display = "", i.visible = !0, i instanceof THREE.CSS3DSprite || (i.element.style.height = i.userData.bondLengthShort);
        }
    }
    function d(e) {
        e = "../static/examples/models/pdb/" + e;
        for (let e = 0; e < M.length; e++) {
            var t = M[e];
            t.parent.remove(t);
        }
        M.length = 0, r.load(e, function(e) {
            var t = e.geometryAtoms, n = e.geometryBonds, i = e.json, o = (t.computeBoundingBox(), 
            t.boundingBox.getCenter(P).negate(), t.translate(P.x, P.y, P.z), n.translate(P.x, P.y, P.z), 
            t.getAttribute("position")), a = t.getAttribute("color"), r = new THREE.Vector3(), s = new THREE.Color();
            for (let e = 0; e < o.count; e++) {
                r.fromBufferAttribute(o, e), s.fromBufferAttribute(a, e);
                var d = i.atoms[e][4];
                if (!W[d]) {
                    l = L, u = m = c = void 0, c = l.width, m = l.height, (u = document.createElement("canvas")).width = c, 
                    u.height = m, u.getContext("2d").drawImage(l, 0, 0, c, m);
                    var l = u, c = l.getContext("2d"), m = (y = g = E = w = p = h = u = m = void 0, 
                    c), u = l.width, h = l.height, p = s, w = p.r, E = p.g, g = p.b, y = (p = m.getImageData(0, 0, u, h)).data;
                    for (let e = 0, t = y.length; e < t; e += 4) y[e + 0] *= w, 
                    y[e + 1] *= E, y[e + 2] *= g;
                    m.putImageData(p, 0, 0);
                    c = l.toDataURL();
                    W[d] = c;
                }
                u = W[d], h = document.createElement("img"), m = (h.src = u, new THREE.CSS3DSprite(h));
                m.position.copy(r), m.position.multiplyScalar(75), m.matrixAutoUpdate = !1, 
                m.updateMatrix(), b.add(m), M.push(m);
            }
            var f = n.getAttribute("position"), T = new THREE.Vector3(), H = new THREE.Vector3();
            for (let n = 0; n < f.count; n += 2) {
                T.fromBufferAttribute(f, n), H.fromBufferAttribute(f, n + 1), T.multiplyScalar(75), 
                H.multiplyScalar(75), C.subVectors(H, T);
                var S = C.length() - 50;
                let e = document.createElement("div"), t = (e.className = "bond", 
                e.style.height = S + "px", new THREE.CSS3DObject(e));
                t.position.copy(T), t.position.lerp(H, .5), t.userData.bondLengthShort = S + "px", 
                t.userData.bondLengthFull = 55 + S + "px";
                var R = x.set(0, 1, 0).cross(C), v = Math.acos(A.set(0, 1, 0).dot(V.copy(C).normalize())), R = new THREE.Matrix4().makeRotationAxis(R.normalize(), v), v = (t.matrix.copy(R), 
                t.quaternion.setFromRotationMatrix(t.matrix), t.matrixAutoUpdate = !1, 
                t.updateMatrix(), b.add(t), M.push(t), new THREE.Object3D());
                v.position.copy(T), v.position.lerp(H, .5), v.matrix.copy(R), v.quaternion.setFromRotationMatrix(v.matrix), 
                v.matrixAutoUpdate = !1, v.updateMatrix(), (e = document.createElement("div")).className = "bond", 
                e.style.height = S + "px", (t = new THREE.CSS3DObject(e)).rotation.y = Math.PI / 2, 
                t.matrixAutoUpdate = !1, t.updateMatrix(), t.userData.bondLengthShort = S + "px", 
                t.userData.bondLengthFull = 55 + S + "px", (t.userData.joint = v).add(t), 
                b.add(v), M.push(t);
            }
            z(D.vizType);
        });
    }
    function l() {
        t.aspect = window.innerWidth / window.innerHeight, t.updateProjectionMatrix(), 
        rendererCSS3D.setSize(window.innerWidth, window.innerHeight), c();
    }
    function c() {
        renderSceneSetupScene3(n, t);
    }
    (s = document.createElement("div")).style.position = "absolute", s.style.top = "0", 
    s.style.left = "0", s.id = "container1", document.body.appendChild(s), (t = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5e3)).position.z = 1e3, 
    n = new THREE.Scene(), scene1 = n.clone(), b = new THREE.Object3D(), n.add(b), 
    rendererCSS3D = new THREE.CSS3DRenderer(), document.getElementById("container1").appendChild(rendererCSS3D.domElement), 
    (i = new THREE.TrackballControls(t, e.domElement)).rotateSpeed = .5, L.onload = function() {
        d(D.molecule);
    }, L.src = "../static/examples/textures/sprites/ball.png", window.addEventListener("resize", l), 
    (s = new dat.GUI()).add(D, "vizType", o).onChange(z), s.add(D, "molecule", a).onChange(d), 
    s.open(), function e() {
        requestAnimationFrame(e);
        i.update();
        const t = 4e-4 * Date.now();
        b.rotation.x = t;
        b.rotation.y = .7 * t;
        c();
    }();
}

function initLoadScene9(e) {
    const i = new THREE.Clock(), o = new THREE.Scene(), a = (scene1 = o.clone(), 
    o.background = new THREE.Color(8965375), new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1e3));
    a.rotation.order = "YXZ";
    var t = new THREE.AmbientLight(6719692), t = (o.add(t), new THREE.DirectionalLight(16751001, .5)), t = (t.position.set(-1, 1, 2), 
    o.add(t), new THREE.DirectionalLight(8947967, .2)), t = (t.position.set(0, -1, 0), 
    o.add(t), new THREE.DirectionalLight(16777130, 1.2));
    t.position.set(-5, 25, -1), t.castShadow = !0, t.shadow.camera.near = .01, t.shadow.camera.far = 500, 
    t.shadow.camera.right = 30, t.shadow.camera.left = -30, t.shadow.camera.top = 30, 
    t.shadow.camera.bottom = -30, t.shadow.mapSize.width = 1024, t.shadow.mapSize.height = 1024, 
    t.shadow.radius = 4, t.shadow.bias = -6e-5, o.add(t);
    const u = 30;
    var n = new THREE.SphereGeometry(.2, 32, 32), r = new THREE.MeshStandardMaterial({
        color: 8947797,
        roughness: .8,
        metalness: .5
    });
    const c = [];
    let s = 0;
    for (let e = 0; e < 100; e++) {
        var d = new THREE.Mesh(n, r);
        d.castShadow = !0, d.receiveShadow = !0, o.add(d), c.push({
            mesh: d,
            collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), .2),
            velocity: new THREE.Vector3()
        });
    }
    const h = new THREE.Octree(), p = new THREE.Capsule(new THREE.Vector3(0, .35, 0), new THREE.Vector3(0, 1, 0), .35), w = new THREE.Vector3(), l = new THREE.Vector3();
    let m = !1, E = 0;
    const g = {}, y = new THREE.Vector3(), f = new THREE.Vector3(), T = new THREE.Vector3();
    function H(e) {
        let t = Math.exp(-4 * e) - 1;
        m || (w.y -= u * e, t *= .1), w.addScaledVector(w, t);
        var e = w.clone().multiplyScalar(e);
        p.translate(e), e = h.capsuleIntersect(p), m = !1, e && ((m = 0 < e.normal.y) || w.addScaledVector(e.normal, -e.normal.dot(w)), 
        p.translate(e.normal.multiplyScalar(e.depth))), a.position.copy(p.end);
    }
    function S(m) {
        c.forEach(e => {
            e.collider.center.addScaledVector(e.velocity, m);
            var t = h.sphereIntersect(e.collider), t = (t ? (e.velocity.addScaledVector(t.normal, 1.5 * -t.normal.dot(e.velocity)), 
            e.collider.center.add(t.normal.multiplyScalar(t.depth))) : e.velocity.y -= u * m, 
            Math.exp(-1.5 * m) - 1), n = (e.velocity.addScaledVector(e.velocity, t), 
            e), t = y.addVectors(p.start, p.end).multiplyScalar(.5), i = n.collider.center, o = p.radius + n.collider.radius, a = o * o;
            for (const c of [ p.start, p.end, t ]) {
                var r, s, d, l = c.distanceToSquared(i);
                l < a && (r = y.subVectors(c, i).normalize(), d = f.copy(r).multiplyScalar(r.dot(w)), 
                s = T.copy(r).multiplyScalar(r.dot(n.velocity)), w.add(s).sub(d), 
                n.velocity.add(d).sub(s), d = (o - Math.sqrt(l)) / 2, i.addScaledVector(r, -d));
            }
        });
        for (let t = 0, n = c.length; t < n; t++) {
            var i = c[t];
            for (let e = t + 1; e < n; e++) {
                var o, a, r, s = c[e], d = i.collider.center.distanceToSquared(s.collider.center), l = i.collider.radius + s.collider.radius;
                d < l * l && (o = y.subVectors(i.collider.center, s.collider.center).normalize(), 
                r = f.copy(o).multiplyScalar(o.dot(i.velocity)), a = T.copy(o).multiplyScalar(o.dot(s.velocity)), 
                i.velocity.add(a).sub(r), s.velocity.add(r).sub(a), r = (l - Math.sqrt(d)) / 2, 
                i.collider.center.addScaledVector(o, r), s.collider.center.addScaledVector(o, -r));
            }
        }
        for (const e of c) e.mesh.position.copy(e.collider.center);
    }
    function R() {
        return a.getWorldDirection(l), l.y = 0, l.normalize(), l;
    }
    function v() {
        return a.getWorldDirection(l), l.y = 0, l.normalize(), l.cross(a.up), l;
    }
    function b() {
        var t, n = Math.min(.05, i.getDelta()) / 5;
        for (let e = 0; e < 5; e++) t = n, t *= m ? 25 : 8, g.KeyW && w.add(R().multiplyScalar(t)), 
        g.KeyS && w.add(R().multiplyScalar(-t)), g.KeyA && w.add(v().multiplyScalar(-t)), 
        g.KeyD && w.add(v().multiplyScalar(t)), m && g.Space && (w.y = 15), H(n), 
        S(n), a.position.y <= -25 && (p.start.set(0, .35, 0), p.end.set(0, 1, 0), 
        p.radius = .35, a.position.copy(p.end), a.rotation.set(0, 0, 0));
        renderSceneSetup(o, a), requestAnimationFrame(b);
    }
    document.addEventListener("keydown", e => {
        g[e.code] = !0;
    }), document.addEventListener("keyup", e => {
        g[e.code] = !1;
    }), document.addEventListener("mousedown", () => {
        document.body.requestPointerLock(), E = performance.now();
    }), document.addEventListener("mouseup", () => {
        var e, t;
        e = c[s], a.getWorldDirection(l), e.collider.center.copy(p.end).addScaledVector(l, 1.5 * p.radius), 
        t = 15 + 30 * (1 - Math.exp(.001 * (E - performance.now()))), e.velocity.copy(l).multiplyScalar(t), 
        e.velocity.addScaledVector(w, 2), s = (s + 1) % c.length;
    }), document.body.addEventListener("mousemove", e => {
        document.pointerLockElement === document.body && (a.rotation.y -= e.movementX / 500, 
        a.rotation.x -= e.movementY / 500);
    }), window.addEventListener("resize", function() {
        a.aspect = window.innerWidth / window.innerHeight, a.updateProjectionMatrix(), 
        e.setSize(window.innerWidth, window.innerHeight);
    }), new THREE.GLTFLoader().setPath("../static/examples/models/gltf/").load("collision-world.glb", e => {
        o.add(e.scene), h.fromGraphNode(e.scene), e.scene.traverse(e => {
            e.isMesh && (e.castShadow = !0, e.receiveShadow = !0, e.material.map) && (e.material.map.anisotropy = 8);
        }), b();
    });
}

function viewDisplay1() {
    initLoadScene1(renderer);
}

function viewDisplay2() {
    initLoadScene2(renderer);
}

function viewDisplay3() {
    initLoadScene3(renderer);
}

function viewDisplay4() {
    initLoadScene4(renderer);
}

function viewDisplay5() {
    initLoadScene5(renderer);
}

function viewDisplay6() {
    initLoadScene6(renderer);
}

function viewDisplay7() {
    initLoadScene7(renderer);
}

init(), document.addEventListener("keyup", function(e) {
    "q" === e.key && useFPS && (controls.enabled = !controls.enabled);
}), document.addEventListener("mousemove", function(e) {
    paused || (mouseX = e.pageX, mouseY = e.pageY);
}, !1), Number.prototype.round = function(e, t) {
    void 0 === t && (t = e, e = this), t = t || 0;
    t = Math.pow(10, 0 | t);
    return Math.round(e * t) / t;
};