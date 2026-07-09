import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class EnterpriseLaboratory {
  constructor() {
    // 1. DOM References
    this.canvas = document.querySelector("#webgl-viewport");
    this.tooltip = document.querySelector("#telemetry-tooltip");

    // 2. Scene Foundation
    this.scene = new THREE.Scene();
    this.scene.background = null; // Let the CSS procedural grid show through
    this.scene.fog = new THREE.FogExp2(0x030407, 0.025);

    // 3. Advanced Optical Rig (Camera)
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 8, 22);

    // 4. Industry-Standard WebGL2 Rendering Pipeline
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Modern Physical Color Pipeline
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 5. Orbital Navigation Controls
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.01; // Prevent diving below the floor
    this.controls.minDistance = 4;
    this.controls.maxDistance = 40;

    // 6. Raycasting & User Telemetry Matrix
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-1000, -1000);
    this.interactiveMeshes = [];
    this.hoveredEntity = null;

    // 7. Engine Clock for frame-independent physics
    this.clock = new THREE.Clock();

    // Execute Startup Sequence
    this.init();
  }

  init() {
    this.buildPhysicallyCorrectLighting();
    this.buildGroundStage();
    this.buildExhibitionArray();
    this.registerEventListeners();

    // Ignite the WebGL Tick Loop
    this.tick();
  }

  // ==========================================
  //      CINEMATIC STUDIO LIGHTING
  // ==========================================

  buildPhysicallyCorrectLighting() {
    // Ambient fill for deep shadows
    const ambient = new THREE.AmbientLight(0xffffff, 0.1);

    // Primary Key Light (Warm Solar Angle)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 3.5);
    keyLight.position.set(12, 18, 12);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0001;
    const frustum = 12;
    keyLight.shadow.camera.top = frustum;
    keyLight.shadow.camera.bottom = -frustum;
    keyLight.shadow.camera.left = -frustum;
    keyLight.shadow.camera.right = frustum;

    // Secondary Fill Light (Cool Cyan Under-glow)
    const fillLight = new THREE.PointLight(0x00f2fe, 4.0, 25);
    fillLight.position.set(-12, 4, -8);

    // Tertiary Rim Light (Deep Blue Silhouette Punch)
    const rimLight = new THREE.SpotLight(
      0x0044ff,
      12.0,
      35,
      Math.PI / 4,
      0.8,
      2,
    );
    rimLight.position.set(0, 10, -18);

    this.scene.add(ambient, keyLight, fillLight, rimLight);
  }

  buildGroundStage() {
    // Ground Reflection Plane
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x04060a,
      roughness: 0.5,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ground Center Alignment Grid
    const gridHelper = new THREE.GridHelper(40, 40, 0x00f2fe, 0x111b24);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);
  }

  // ==========================================
  //        GEOMETRY & MATERIAL LAB
  // ==========================================

  buildExhibitionArray() {
    this.stageGroup = new THREE.Group();

    // 1. Corrected Box Geometry (Left Showcase)
    // 6 arguments max: width, height, depth, wSeg, hSeg, dSeg
    const boxGeo = new THREE.BoxGeometry(2, 2, 2, 2, 2, 2);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.7,
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.position.set(-7, 2.5, 0);
    this.mountToPedestal(
      boxMesh,
      "SECTOR_A // CONTAINMENT",
      "MeshStandardMaterial",
    );

    // 2. Quantum Torus Knot (Center Showcase)
    const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 16);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 1.5,
      ior: 1.5,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotMat);
    knotMesh.position.set(0, 3.0, 0);
    this.mountToPedestal(
      knotMesh,
      "SECTOR_B // OPTICAL KNOT",
      "MeshPhysicalMaterial",
    );
    this.centerKnot = knotMesh; // Store reference for compound rotation

    // 3. Custom BufferGeometry Shard (Right Showcase)
    const shardGeo = this.generateProceduralCrystal();
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x00ffcc,
      roughness: 0.3,
      metalness: 0.2,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const shardMesh = new THREE.Mesh(shardGeo, shardMat);
    shardMesh.position.set(7, 3.0, 0);
    this.mountToPedestal(
      shardMesh,
      "SECTOR_C // DATA SHARD",
      "Custom BufferGeometry",
    );
    this.floatingShard = shardMesh;

    this.scene.add(this.stageGroup);
  }

  mountToPedestal(mesh, entityName, shaderType) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // Attach enterprise metadata directly inside Three.js Object3D
    mesh.userData = {
      name: entityName,
      shader: shaderType,
      baseY: mesh.position.y,
    };

    // Sci-Fi Base Pod
    const podGeo = new THREE.CylinderGeometry(1.8, 2.1, 0.4, 32);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0x090d14,
      roughness: 0.8,
    });
    const pod = new THREE.Mesh(podGeo, podMat);
    pod.position.set(mesh.position.x, 0.2, mesh.position.z);
    pod.receiveShadow = true;

    // Glowing Gravity Ring
    const ringGeo = new THREE.RingGeometry(1.4, 1.6, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(mesh.position.x, 0.41, mesh.position.z);

    this.stageGroup.add(pod, ring, mesh);
    this.interactiveMeshes.push(mesh);
  }


  generateProceduralCrystal() {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0.0,
      2.0,
      0.0,
      -0.8,
      0.0,
      0.8,
      0.8,
      0.0,
      0.8, // Top Front
      0.0,
      2.0,
      0.0,
      0.8,
      0.0,
      0.8,
      0.8,
      0.0,
      -0.8, // Top Right
      0.0,
      2.0,
      0.0,
      0.8,
      0.0,
      -0.8,
      -0.8,
      0.0,
      -0.8, // Top Back
      0.0,
      2.0,
      0.0,
      -0.8,
      0.0,
      -0.8,
      -0.8,
      0.0,
      0.8, // Top Left
      0.0,
      -2.0,
      0.0,
      0.8,
      0.0,
      0.8,
      -0.8,
      0.0,
      0.8, // Bottom Front
      0.0,
      -2.0,
      0.0,
      0.8,
      0.0,
      -0.8,
      0.8,
      0.0,
      0.8, // Bottom Right
      0.0,
      -2.0,
      0.0,
      -0.8,
      0.0,
      -0.8,
      0.8,
      0.0,
      -0.8, // Bottom Back
      0.0,
      -2.0,
      0.0,
      -0.8,
      0.0,
      0.8,
      -0.8,
      0.0,
      -0.8, // Bottom Left
    ]);

    geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    // Let the GPU compute the perpendicular light-bouncing vectors
    geom.computeVertexNormals();
    return geom;
  }

  // ==========================================
  //           TELEMETRY & RAYCASTING
  // ==========================================

  registerEventListeners() {
    window.addEventListener("resize", () => this.handleResize());
    window.addEventListener("pointermove", (e) => this.handlePointerMove(e));
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  handlePointerMove(event) {
    // Convert mouse coordinates to WebGL Normalized Device Coordinates (-1 to +1)
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Anchor DOM tooltip to mouse position
    this.tooltip.style.left = `${event.clientX + 20}px`;
    this.tooltip.style.top = `${event.clientY - 10}px`;
  }

  executeRaycastMatrix() {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersections = this.raycaster.intersectObjects(
      this.interactiveMeshes,
      false,
    );

    if (intersections.length > 0) {
      const targetMesh = intersections[0].object;

      if (this.hoveredEntity !== targetMesh) {
        // Clear previous state
        if (this.hoveredEntity) this.resetMeshShading(this.hoveredEntity);

        // Engage active scan state
        this.hoveredEntity = targetMesh;
        document.body.style.cursor = "crosshair";
        this.hoveredEntity.material.wireframe = true;

        if (this.hoveredEntity.material.emissive) {
          this.hoveredEntity.material.emissive.setHex(0x004455);
        }


        document.querySelector("#tt-name").innerText = targetMesh.userData.name;
        document.querySelector("#tt-mat").innerText =
          targetMesh.userData.shader;
        this.tooltip.classList.remove("opacity-0");
      }
    } else {
      if (this.hoveredEntity) {
        this.resetMeshShading(this.hoveredEntity);
        this.hoveredEntity = null;
        document.body.style.cursor = "default";
        this.tooltip.classList.add("opacity-0");
      }
    }
  }

  resetMeshShading(mesh) {
    mesh.material.wireframe = false;
    if (mesh.material.emissive) {
      mesh.material.emissive.setHex(0x000000);
    }
  }



  tick() {
    requestAnimationFrame(() => this.tick());


    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

  
    if (this.centerKnot) {
      this.centerKnot.rotation.x += 0.4 * deltaTime;
      this.centerKnot.rotation.y += 0.2 * deltaTime;
    }


    if (this.floatingShard) {
      this.floatingShard.position.y =
        this.floatingShard.userData.baseY + Math.sin(elapsedTime * 2.5) * 0.2;
      this.floatingShard.rotation.y += 0.5 * deltaTime;
    }


    this.controls.update();
    this.executeRaycastMatrix();


    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new EnterpriseLaboratory();
});
