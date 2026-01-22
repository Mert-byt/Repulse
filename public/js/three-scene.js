// 3D Scene with Three.js and GLB Model
let scene, camera, renderer, model;
let videoCanvas, videoCtx;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let currentRotationX = 0, currentRotationY = 0;
let isMouseDown = false;
let previousMouseX = 0, previousMouseY = 0;

// Leaf System Variables
let leaves = [];
let windStrength = 0;

// Initialize 3D Scene
function initThreeScene() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1b0f);
    scene.fog = new THREE.Fog(0x0d1b0f, 10, 50);

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        50,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 8);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Add lights - Enhanced lighting for organic look
    const ambientLight = new THREE.AmbientLight(0x6b9b7a, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x4a7c59, 1.2);
    directionalLight1.position.set(5, 8, 5);
    directionalLight1.castShadow = true;
    directionalLight1.shadow.mapSize.width = 2048;
    directionalLight1.shadow.mapSize.height = 2048;
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xd4c5a9, 0.6);
    directionalLight2.position.set(-5, -3, -5);
    scene.add(directionalLight2);

    const pointLight1 = new THREE.PointLight(0x4a7c59, 0.8, 30);
    pointLight1.position.set(0, 5, 8);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6b9b7a, 0.5, 30);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Add subtle rim light
    const rimLight = new THREE.DirectionalLight(0xd4c5a9, 0.4);
    rimLight.position.set(0, 0, -10);
    scene.add(rimLight);

    // Load GLB Model
    loadGLBModel();

    // Mouse interaction
    setupMouseInteraction(canvas);

    // Animation
    animate();

    // Handle resize
    window.addEventListener('resize', onWindowResize);
}

function loadGLBModel() {
    // Try to load GLB model, fallback to procedural geometry if not found
    // GLTFLoader should be available from Three.js examples
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, using fallback');
        createFallbackModel();
        return;
    }

    // Try to use GLTFLoader from THREE namespace or global
    let LoaderClass = null;
    if (THREE.GLTFLoader) {
        LoaderClass = THREE.GLTFLoader;
    } else if (typeof GLTFLoader !== 'undefined') {
        LoaderClass = GLTFLoader;
    } else {
        console.warn('GLTFLoader not available, using fallback');
        createFallbackModel();
        return;
    }

    const loader = new LoaderClass();

    loader.load(
        '/models/tree-spruce.glb',
        (gltf) => {
            model = gltf.scene;

            // Traverse and configure model
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Enhance materials
                    if (child.material) {
                        child.material.metalness = 0.3;
                        child.material.roughness = 0.7;
                        child.material.envMapIntensity = 1.0;

                        // Add emissive for glow effect
                        if (!child.material.emissive) {
                            child.material.emissive = new THREE.Color(0x2d4a2f);
                            child.material.emissiveIntensity = 0.2;
                        }
                    }
                }
            });

            // Scale and position
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 4 / maxDim;
            model.scale.multiplyScalar(scale);

            model.position.sub(center.multiplyScalar(scale));
            model.position.y -= 0.5;

            scene.add(model);
        },
        (progress) => {
            // Loading progress
            console.log('Loading model:', (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
            console.warn('GLB model not found, using fallback geometry:', error);
            createFallbackModel();
        }
    );
}

function createFallbackModel() {
    // AUTUMN OAK TREE - Matching Reference Image Exactly
    const tree = new THREE.Group();

    // === 1. THICK GNARLY TRUNK ===
    const trunkHeight = 2.8;
    const trunkBaseRadius = 0.6;
    const trunkTopRadius = 0.35;
    const trunkGeometry = new THREE.CylinderGeometry(trunkTopRadius, trunkBaseRadius, trunkHeight, 16);

    // Distort trunk for gnarly oak bark effect
    const trunkPos = trunkGeometry.attributes.position;
    for (let i = 0; i < trunkPos.count; i++) {
        const y = trunkPos.getY(i);
        const x = trunkPos.getX(i);
        const z = trunkPos.getZ(i);
        const angle = Math.atan2(z, x);
        const r = Math.sqrt(x * x + z * z);

        // Add bulges and twists
        const bulge = Math.sin(y * 4 + angle * 2) * 0.08;
        const twist = Math.sin(y * 2) * 0.1;

        trunkPos.setX(i, (r + bulge) * Math.cos(angle + twist));
        trunkPos.setZ(i, (r + bulge) * Math.sin(angle + twist));

        // Slight lean
        if (y > 0) trunkPos.setX(i, trunkPos.getX(i) + y * 0.08);
    }
    trunkGeometry.computeVertexNormals();

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3728, // Rich brown bark
        roughness: 1.0
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // === 2. MAIN BRANCHES (Visible Arms) ===
    const branchMaterial = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 1.0 });

    const branchConfigs = [
        { length: 1.8, angle: 0.7, rotation: 0, yPos: 2.2 },
        { length: 1.6, angle: 0.6, rotation: Math.PI * 0.5, yPos: 2.4 },
        { length: 1.7, angle: 0.65, rotation: Math.PI, yPos: 2.1 },
        { length: 1.5, angle: 0.55, rotation: Math.PI * 1.5, yPos: 2.5 },
        { length: 1.2, angle: 0.3, rotation: Math.PI * 0.25, yPos: 2.8 }, // Upward
        { length: 1.3, angle: 0.4, rotation: Math.PI * 1.25, yPos: 2.7 }
    ];

    branchConfigs.forEach(config => {
        const branchGeo = new THREE.CylinderGeometry(0.08, 0.18, config.length, 8);
        const branch = new THREE.Mesh(branchGeo, branchMaterial);
        branch.position.set(0, config.yPos, 0);
        branch.rotation.set(config.angle, config.rotation, 0);
        branch.translateY(config.length / 2);
        branch.castShadow = true;
        tree.add(branch);
    });

    // === 3. FOLIAGE CROWN (Dense Cloud of Autumn Colors) ===
    // Reference colors: Deep Red, Bright Orange, Golden Yellow, Some Pink
    const foliageColors = [
        0xE63946, // Deep Red
        0xFF6B35, // Bright Orange
        0xFF8C42, // Light Orange
        0xFFC107, // Golden Yellow
        0xFFD93D, // Bright Yellow
        0xD62828, // Darker Red
        0xF77F00  // Orange
    ];

    const foliageCount = 90; // Dense crown

    for (let i = 0; i < foliageCount; i++) {
        const size = 0.5 + Math.random() * 0.6;
        const geo = new THREE.DodecahedronGeometry(size, 0);

        // Distort for organic look
        const pos = geo.attributes.position;
        for (let j = 0; j < pos.count; j++) {
            pos.setX(j, pos.getX(j) + (Math.random() - 0.5) * 0.25);
            pos.setY(j, pos.getY(j) + (Math.random() - 0.5) * 0.25);
            pos.setZ(j, pos.getZ(j) + (Math.random() - 0.5) * 0.25);
        }
        geo.computeVertexNormals();

        const color = new THREE.Color(foliageColors[Math.floor(Math.random() * foliageColors.length)]);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.75,
            metalness: 0.0,
            flatShading: true
        });

        const leafCluster = new THREE.Mesh(geo, mat);

        // Spherical distribution for dome shape
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.8 + Math.random() * 1.8;

        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.cos(phi);
        let z = r * Math.sin(phi) * Math.sin(theta);

        // Position above trunk, dome shape (cut bottom)
        const crownY = 3.5 + Math.abs(y) * 1.2;

        // Flatten sides a bit for oak shape
        leafCluster.position.set(x * 1.2, crownY, z * 1.2);
        leafCluster.scale.setScalar(0.8 + Math.random() * 0.5);
        leafCluster.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

        leafCluster.castShadow = true;
        leafCluster.receiveShadow = true;
        tree.add(leafCluster);
    }

    // === 4. GRASS BASE ===
    const grassGeo = new THREE.CircleGeometry(2.5, 32);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7CB342, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.01;
    grass.receiveShadow = true;
    tree.add(grass);

    model = tree;
    scene.add(model);

    // Camera positioned to show full tree
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 3, 0);
}

function setupMouseInteraction(canvas) {
    // Only drag interaction - no hover rotation
    canvas.style.cursor = 'grab';

    // Mouse down for dragging
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });

    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
        canvas.style.cursor = 'grab';
    });

    // Only move when dragging
    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;

            targetRotationY += deltaX * 0.015;
            targetRotationX += deltaY * 0.015;

            // Clamp rotation
            targetRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, targetRotationX));

            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
            e.preventDefault();
        }
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isMouseDown = true;
        const touch = e.touches[0];
        previousMouseX = touch.clientX;
        previousMouseY = touch.clientY;
    });

    canvas.addEventListener('touchend', () => {
        isMouseDown = false;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isMouseDown) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - previousMouseX;
            const deltaY = touch.clientY - previousMouseY;

            targetRotationY += deltaX * 0.01;
            targetRotationX += deltaY * 0.01;

            previousMouseX = touch.clientX;
            previousMouseY = touch.clientY;
        }
    });
}

// Falling Leaves Logic
function createLeaf(position) {
    const geometry = new THREE.PlaneGeometry(0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.08 + Math.random() * 0.06, 0.9, 0.5), // Orange/Gold hues
        side: THREE.DoubleSide
    });
    const leaf = new THREE.Mesh(geometry, material);

    // Spawn near the position
    leaf.position.copy(position);
    leaf.position.x += (Math.random() - 0.5) * 3;
    leaf.position.z += (Math.random() - 0.5) * 3;
    leaf.position.y += Math.random() * 1;

    leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

    scene.add(leaf);

    leaves.push({
        mesh: leaf,
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            -Math.random() * 0.05 - 0.02,
            (Math.random() - 0.5) * 0.05
        ),
        rotationSpeed: new THREE.Vector3(
            Math.random() * 0.1,
            Math.random() * 0.1,
            Math.random() * 0.1
        )
    });
}

function updateLeaves() {
    for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];

        // Apply gravity and wind
        leaf.mesh.position.add(leaf.velocity);
        leaf.mesh.position.x += windStrength * 0.1; // Blow with wind

        // Rotate
        leaf.mesh.rotation.x += leaf.rotationSpeed.x;
        leaf.mesh.rotation.y += leaf.rotationSpeed.y;
        leaf.mesh.rotation.z += leaf.rotationSpeed.z;

        // Remove if too low
        if (leaf.mesh.position.y < -3) {
            scene.remove(leaf.mesh);
            leaf.mesh.geometry.dispose();
            leaf.mesh.material.dispose();
            leaves.splice(i, 1);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Wind Logic
    const windCycle = time % 3;
    let targetWind = 0;
    if (windCycle < 0.5) {
        targetWind = 0.8 + Math.random() * 0.3; // Strong Gust
    } else if (windCycle < 2) {
        targetWind = 0.1; // Breeze
    }

    windStrength += (targetWind - windStrength) * 0.05;

    if (model) {
        // Smooth rotation interpolation
        currentRotationX += (targetRotationX - currentRotationX) * 0.05;
        currentRotationY += (targetRotationY - currentRotationY) * 0.05;

        // Add wind shake to rotation and position
        const windShake = Math.sin(time * 15) * windStrength * 0.05;

        model.rotation.x = currentRotationX + windShake * 0.5;
        model.rotation.y = currentRotationY;
        model.rotation.z = windShake;

        // Subtle floating animation
        model.position.y = -0.5 + Math.sin(time) * 0.1;

        // Very subtle auto-rotation when not interacting
        if (!isMouseDown) {
            model.rotation.y += 0.002;
        }

        // Spawn leaves during wind gusts
        if (windStrength > 0.4 && Math.random() < 0.1) {
            createLeaf(new THREE.Vector3(0, 3, 0));
        }
    }

    updateLeaves();

    // Update camera for subtle movement
    camera.position.x = Math.sin(time * 0.3) * 0.5;
    camera.lookAt(0, 2.5, 0);

    renderer.render(scene, camera);
}

function onWindowResize() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
}

// Video Background Animation
function initVideoBackground() {
    videoCanvas = document.getElementById('video-canvas');
    if (!videoCanvas) return;

    videoCtx = videoCanvas.getContext('2d');

    // Set canvas size
    function resizeCanvas() {
        videoCanvas.width = window.innerWidth;
        videoCanvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create animated pattern - subtle, repeating
    let time = 0;
    const particles = [];
    const particleCount = 60;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * videoCanvas.width,
            y: Math.random() * videoCanvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.2 + 0.05,
            phase: Math.random() * Math.PI * 2
        });
    }

    function draw() {
        time += 0.008;

        // Clear with slight fade for trailing effect
        videoCtx.fillStyle = 'rgba(13, 27, 15, 0.15)';
        videoCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);

        // Draw particles with organic movement
        particles.forEach((particle, i) => {
            // Update position with wave motion
            particle.x += particle.vx + Math.sin(time + particle.phase) * 0.2;
            particle.y += particle.vy + Math.cos(time * 0.7 + particle.phase) * 0.2;

            // Wrap around edges seamlessly
            if (particle.x < 0) particle.x = videoCanvas.width;
            if (particle.x > videoCanvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = videoCanvas.height;
            if (particle.y > videoCanvas.height) particle.y = 0;

            // Draw particle with varying opacity
            const opacity = particle.opacity * (0.7 + Math.sin(time * 2 + particle.phase) * 0.3);
            videoCtx.beginPath();
            videoCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            videoCtx.fillStyle = `rgba(107, 155, 122, ${opacity})`;
            videoCtx.fill();

            // Draw connections to nearby particles
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    videoCtx.beginPath();
                    videoCtx.moveTo(particle.x, particle.y);
                    videoCtx.lineTo(otherParticle.x, otherParticle.y);
                    const lineOpacity = 0.08 * (1 - distance / 120);
                    videoCtx.strokeStyle = `rgba(107, 155, 122, ${lineOpacity})`;
                    videoCtx.lineWidth = 1;
                    videoCtx.stroke();
                }
            });
        });

        // Draw subtle gradient waves that repeat
        const waveTime = time % (Math.PI * 2);
        const gradient = videoCtx.createLinearGradient(0, 0, videoCanvas.width, videoCanvas.height);
        gradient.addColorStop(0, `rgba(74, 124, 89, ${0.03 * Math.sin(waveTime)})`);
        gradient.addColorStop(0.5, `rgba(107, 155, 122, ${0.02 * Math.cos(waveTime * 1.5)})`);
        gradient.addColorStop(1, `rgba(45, 74, 47, ${0.03 * Math.sin(waveTime * 0.8)})`);

        videoCtx.fillStyle = gradient;
        videoCtx.fillRect(0, 0, videoCanvas.width, videoCanvas.height);

        requestAnimationFrame(draw);
    }

    draw();
}

// Video element handler with seamless loop
function initVideo() {
    const video = document.getElementById('bg-video');
    if (video) {
        video.addEventListener('loadeddata', () => {
            video.play().catch(e => console.log('Video autoplay prevented:', e));
        });

        // Seamless loop - restart before end for smooth transition
        video.addEventListener('timeupdate', () => {
            // If video is near the end (last 0.1 seconds), restart smoothly
            if (video.duration - video.currentTime < 0.1) {
                video.currentTime = 0;
            }
        });

        // Fallback seamless loop
        video.addEventListener('ended', () => {
            video.currentTime = 0;
            video.play();
        });

        // Ensure video is visible but not overwhelming
        video.style.opacity = '0.25';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initThreeScene();
        initVideoBackground();
        initVideo();
    });
} else {
    initThreeScene();
    initVideoBackground();
    initVideo();
}
