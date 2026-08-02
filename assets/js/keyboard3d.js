import * as THREE from "three";

// The main visual controls live here so the model can be recalibrated without
// hunting through scene-construction code. World units use one key width = 1.
const CONFIG = Object.freeze({
    geometry: {
        keyWidth: 1,
        keyDepth: 1.04,
        keyHeight: 0.56,
        keyCornerRadius: 0.125,
        keyBevel: 0.065,
        keyBottomScale: 1.04,
        keyShoulderScale: 0.93,
        keyTopScale: 0.84,
        keyDishDepth: 0.008,
        cornerSegments: 6,
        baseHeight: 0.18,
        baseBevel: 0.055,
        baseCornerRadius: 0.105
    },
    layout: {
        keyGap: 0.1,
        baseSideMargin: 0.14,
        baseDepthMargin: 0.12,
        keyLift: 0.012,
        rowDepthGap: 0.18,
        // The isometric view pushes the back row to the right, so a purely
        // axis-centred PAW row reads as right of centre. Nudge it back by a
        // fraction of a key width instead of matching screen-space centres,
        // which would leave it flush with VELLE's left edge.
        upperRowOffsetX: -0.4
    },
    camera: {
        position: [9.8, 10.6, 11.2],
        targetOffset: [-0.25, 0.24, 0],
        desktopFill: 1.02,
        compactFill: 0.92,
        compactBreakpoint: 520
    },
    lighting: {
        hemisphereIntensity: 1.45,
        keyIntensity: 3.1,
        fillIntensity: 0.72,
        shadowOpacity: 0.15,
        exposure: 1.05
    },
    animation: {
        pressDepth: 0.13,
        downMs: 82,
        holdMs: 42,
        returnMs: 245,
        reducedPressDepth: 0.052,
        reducedDownMs: 42,
        reducedHoldMs: 18,
        reducedReturnMs: 92,
        celebrationDown: 0.065,
        celebrationLift: 0.06,
        celebrationDownMs: 86,
        celebrationLiftMs: 145,
        celebrationSettleMs: 230,
        celebrationStaggerMs: 10,
        reducedCelebrationScale: 0.42
    }
});

const KEY_ROWS = Object.freeze([
    Object.freeze({ name: "PAW", keys: Object.freeze(["P", "A", "W"]) }),
    Object.freeze({ name: "VELLE", keys: Object.freeze(["V", "E1", "L1", "L2", "E2"]) })
]);

const KEY_LETTERS = Object.freeze({
    P: "P",
    A: "A",
    W: "W",
    V: "V",
    E1: "E",
    L1: "L",
    L2: "L",
    E2: "E"
});

const NAME_WORD = "PAWVELLE";
const PHYSICAL_KEYS = new Set(["P", "A", "W", "V", "E", "L"]);

const container = document.querySelector("[data-hero-keyboard]");

if (container && container.dataset.keyboardInitialized !== "true") {
    initKeyboardScene(container);
}

function initKeyboardScene(containerElement) {
    containerElement.dataset.keyboardInitialized = "true";

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CONFIG.lighting.exposure;
    renderer.domElement.setAttribute("aria-hidden", "true");
    containerElement.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 50);
    scene.add(camera);

    const hemisphereLight = new THREE.HemisphereLight(
        0xffffff,
        0x232326,
        CONFIG.lighting.hemisphereIntensity
    );
    scene.add(hemisphereLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, CONFIG.lighting.keyIntensity);
    keyLight.position.set(-4.5, 9.5, 7.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.00035;
    keyLight.shadow.normalBias = 0.018;
    keyLight.shadow.radius = 5;
    scene.add(keyLight);
    scene.add(keyLight.target);

    const fillLight = new THREE.DirectionalLight(0xffffff, CONFIG.lighting.fillIntensity);
    fillLight.position.set(6, 4, -5);
    scene.add(fillLight);

    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.ShadowMaterial({
        color: 0x000000,
        opacity: CONFIG.lighting.shadowOpacity,
        transparent: true
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.name = "Keyboard_Shadow_Ground";
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.008;
    ground.receiveShadow = true;
    scene.add(ground);

    const keyGeometry = createKeycapGeometry();
    const labelGeometry = new THREE.PlaneGeometry(0.54, 0.54);
    const baseGeometries = [];
    const labelTextures = new Map();
    const labelMaterials = new Map();

    const keyMaterials = [
        new THREE.MeshStandardMaterial({
            color: 0x373739,
            roughness: 0.76,
            metalness: 0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x28282a,
            roughness: 0.84,
            metalness: 0
        })
    ];

    const baseMaterials = [
        new THREE.MeshStandardMaterial({
            color: 0xd2d2d2,
            roughness: 0.75,
            metalness: 0
        }),
        new THREE.MeshStandardMaterial({
            color: 0x8c8c8c,
            roughness: 0.82,
            metalness: 0
        })
    ];

    function getLabelMaterial(letter) {
        if (labelMaterials.has(letter)) return labelMaterials.get(letter);

        const texture = makeLabelTexture(letter, renderer.capabilities.getMaxAnisotropy());
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            side: THREE.DoubleSide
        });
        labelTextures.set(letter, texture);
        labelMaterials.set(letter, material);
        return material;
    }

    const keyboardGroup = new THREE.Group();
    keyboardGroup.name = "Pawvelle_Keyboard";
    scene.add(keyboardGroup);

    const keyStates = new Map();
    const keyStateList = [];
    const pressableMeshes = [];
    const baseStates = [];

    const keyPitch = CONFIG.geometry.keyWidth + CONFIG.layout.keyGap;
    const baseDepth = CONFIG.geometry.keyDepth + CONFIG.layout.baseDepthMargin * 2;
    const rowDepthDistance = baseDepth + CONFIG.layout.rowDepthGap;

    KEY_ROWS.forEach((row, rowIndex) => {
        const rowSpan = row.keys.length * CONFIG.geometry.keyWidth
            + (row.keys.length - 1) * CONFIG.layout.keyGap;
        const rowGroup = new THREE.Group();
        rowGroup.name = `Row_${row.name}`;
        rowGroup.position.set(
            rowIndex === 0 ? CONFIG.layout.upperRowOffsetX : 0,
            0,
            rowIndex === 0 ? -rowDepthDistance / 2 : rowDepthDistance / 2
        );
        keyboardGroup.add(rowGroup);

        const baseWidth = rowSpan + CONFIG.layout.baseSideMargin * 2;
        const baseGeometry = createBaseGeometry(baseWidth, baseDepth);
        baseGeometries.push(baseGeometry);
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterials);
        baseMesh.name = `Base_${row.name}`;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        rowGroup.add(baseMesh);
        baseStates.push({ mesh: baseMesh, restY: 0, index: rowIndex });

        row.keys.forEach((keyId, keyIndex) => {
            const keyAssembly = new THREE.Group();
            keyAssembly.name = `${keyId}_Assembly`;
            keyAssembly.position.set(
                -rowSpan / 2 + CONFIG.geometry.keyWidth / 2 + keyIndex * keyPitch,
                CONFIG.geometry.baseHeight + CONFIG.layout.keyLift,
                0
            );
            rowGroup.add(keyAssembly);

            const keyMesh = new THREE.Mesh(keyGeometry, keyMaterials);
            keyMesh.name = `Key_${keyId}`;
            keyMesh.castShadow = true;
            keyMesh.receiveShadow = true;
            keyMesh.userData.keyId = keyId;
            keyAssembly.add(keyMesh);

            const labelMesh = new THREE.Mesh(labelGeometry, getLabelMaterial(KEY_LETTERS[keyId]));
            labelMesh.name = `Legend_${keyId}`;
            labelMesh.rotation.x = -Math.PI / 2;
            labelMesh.position.y = CONFIG.geometry.keyHeight + 0.012;
            labelMesh.renderOrder = 2;
            keyAssembly.add(labelMesh);

            const state = {
                id: keyId,
                group: keyAssembly,
                restY: keyAssembly.position.y,
                phase: "idle",
                startedAt: 0,
                pressOffset: 0,
                celebrationIndex: keyStateList.length
            };
            keyStates.set(keyId, state);
            keyStateList.push(state);
            pressableMeshes.push(keyMesh);
        });
    });

    const modelBounds = new THREE.Box3().setFromObject(keyboardGroup);
    const modelCenter = modelBounds.getCenter(new THREE.Vector3());
    const cameraTarget = modelCenter.clone().add(new THREE.Vector3(...CONFIG.camera.targetOffset));
    camera.position.copy(cameraTarget).add(new THREE.Vector3(...CONFIG.camera.position));
    camera.lookAt(cameraTarget);
    camera.updateMatrixWorld(true);
    keyLight.target.position.copy(modelCenter);

    const projectedExtents = measureCameraPlaneExtents(modelBounds, camera);

    let eCycleIndex = 0;
    let lCycleIndex = 0;
    let namePosition = 0;
    let nameEIndex = 0;
    let nameLIndex = 0;
    let pendingCelebration = false;
    let celebrationActive = false;
    let celebrationStartedAt = 0;
    let resizeObserver = null;
    let isDisposed = false;

    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    function pressProfile() {
        if (reducedMotionQuery.matches) {
            return {
                depth: CONFIG.animation.reducedPressDepth,
                down: CONFIG.animation.reducedDownMs,
                hold: CONFIG.animation.reducedHoldMs,
                up: CONFIG.animation.reducedReturnMs
            };
        }

        return {
            depth: CONFIG.animation.pressDepth,
            down: CONFIG.animation.downMs,
            hold: CONFIG.animation.holdMs,
            up: CONFIG.animation.returnMs
        };
    }

    function pressKey(keyId) {
        const state = keyStates.get(keyId);
        if (!state || isDisposed) return;

        // Every press is calculated from restY. Rapid input can restart a key,
        // but it can never accumulate positional error from its current frame.
        state.group.position.y = state.restY;
        state.pressOffset = 0;
        state.phase = "down";
        state.startedAt = performance.now();
        containerElement.dataset.activeKey = keyId;
        containerElement.dataset.lastKey = keyId;
    }

    function updatePresses(now) {
        const profile = pressProfile();
        const releaseStart = profile.down + profile.hold;
        const totalDuration = releaseStart + profile.up;

        for (let index = 0; index < keyStateList.length; index += 1) {
            const state = keyStateList[index];

            if (state.phase === "idle") {
                state.pressOffset = 0;
                continue;
            }

            const elapsed = now - state.startedAt;
            if (elapsed < profile.down) {
                state.pressOffset = -profile.depth * easeOutCubic(elapsed / profile.down);
            } else if (elapsed < releaseStart) {
                state.phase = "hold";
                state.pressOffset = -profile.depth;
            } else if (elapsed < totalDuration) {
                state.phase = "return";
                const progress = (elapsed - releaseStart) / profile.up;
                state.pressOffset = -profile.depth * (1 - easeOutBack(progress, 0.72));
            } else {
                state.phase = "idle";
                state.pressOffset = 0;
                if (containerElement.dataset.activeKey === state.id) {
                    delete containerElement.dataset.activeKey;
                }

                if (state.id === "E2" && pendingCelebration) {
                    pendingCelebration = false;
                    startCelebration(now);
                }
            }
        }
    }

    function startCelebration(now = performance.now()) {
        celebrationActive = true;
        celebrationStartedAt = now;
        containerElement.dataset.celebrating = "true";
    }

    function celebrationOffset(now, itemIndex, amplitudeScale = 1) {
        if (!celebrationActive) return 0;

        const reducedScale = reducedMotionQuery.matches
            ? CONFIG.animation.reducedCelebrationScale
            : 1;
        const stagger = reducedMotionQuery.matches ? 0 : CONFIG.animation.celebrationStaggerMs;
        const elapsed = now - celebrationStartedAt - itemIndex * stagger;
        if (elapsed <= 0) return 0;

        const downDuration = CONFIG.animation.celebrationDownMs * reducedScale;
        const liftDuration = CONFIG.animation.celebrationLiftMs * reducedScale;
        const settleDuration = CONFIG.animation.celebrationSettleMs * reducedScale;
        const downAmount = CONFIG.animation.celebrationDown * reducedScale * amplitudeScale;
        const liftAmount = CONFIG.animation.celebrationLift * reducedScale * amplitudeScale;

        if (elapsed < downDuration) {
            return -downAmount * easeOutCubic(elapsed / downDuration);
        }

        if (elapsed < downDuration + liftDuration) {
            const progress = (elapsed - downDuration) / liftDuration;
            return THREE.MathUtils.lerp(-downAmount, liftAmount, easeOutCubic(progress));
        }

        if (elapsed < downDuration + liftDuration + settleDuration) {
            const progress = (elapsed - downDuration - liftDuration) / settleDuration;
            return THREE.MathUtils.lerp(liftAmount, 0, easeInOutCubic(progress));
        }

        return 0;
    }

    function updateCelebration(now) {
        if (!celebrationActive) return;

        const reducedScale = reducedMotionQuery.matches
            ? CONFIG.animation.reducedCelebrationScale
            : 1;
        const stagger = reducedMotionQuery.matches ? 0 : CONFIG.animation.celebrationStaggerMs;
        const duration = (
            CONFIG.animation.celebrationDownMs
            + CONFIG.animation.celebrationLiftMs
            + CONFIG.animation.celebrationSettleMs
        ) * reducedScale + (keyStateList.length - 1) * stagger;

        if (now - celebrationStartedAt < duration) return;

        celebrationActive = false;
        delete containerElement.dataset.celebrating;
    }

    function applyAnimatedPositions(now) {
        for (let index = 0; index < keyStateList.length; index += 1) {
            const state = keyStateList[index];
            state.group.position.y = state.restY + state.pressOffset
                + celebrationOffset(now, state.celebrationIndex);
        }

        for (let index = 0; index < baseStates.length; index += 1) {
            const state = baseStates[index];
            state.mesh.position.y = state.restY + celebrationOffset(now, index * 2, 0.36);
        }
    }

    function generalKeyId(letter) {
        if (letter === "E") {
            const keyId = eCycleIndex % 2 === 0 ? "E1" : "E2";
            eCycleIndex += 1;
            return keyId;
        }

        if (letter === "L") {
            const keyId = lCycleIndex % 2 === 0 ? "L1" : "L2";
            lCycleIndex += 1;
            return keyId;
        }

        return letter;
    }

    function resetNameMatch() {
        namePosition = 0;
        nameEIndex = 0;
        nameLIndex = 0;
        containerElement.dataset.nameProgress = "0";
    }

    function startNameMatch() {
        namePosition = 1;
        nameEIndex = 0;
        nameLIndex = 0;
        containerElement.dataset.nameProgress = "1";
        return "P";
    }

    function nameKeyId(letter) {
        if (letter === "E") {
            const keyId = nameEIndex === 0 ? "E1" : "E2";
            nameEIndex += 1;
            return keyId;
        }

        if (letter === "L") {
            const keyId = nameLIndex === 0 ? "L1" : "L2";
            nameLIndex += 1;
            return keyId;
        }

        return letter;
    }

    function resolvePhysicalKey(letter) {
        if (namePosition === 0) {
            return letter === "P" ? startNameMatch() : generalKeyId(letter);
        }

        const expectedLetter = NAME_WORD[namePosition];
        if (letter === expectedLetter) {
            const keyId = nameKeyId(letter);
            namePosition += 1;

            if (namePosition === NAME_WORD.length) {
                pendingCelebration = true;
                resetNameMatch();
            } else {
                containerElement.dataset.nameProgress = String(namePosition);
            }

            return keyId;
        }

        if (letter === "P") return startNameMatch();

        resetNameMatch();
        return generalKeyId(letter);
    }

    function pointerToKey(event) {
        const bounds = renderer.domElement.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return null;

        pointerNdc.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointerNdc.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
        raycaster.setFromCamera(pointerNdc, camera);
        const intersections = raycaster.intersectObjects(pressableMeshes, false);
        return intersections.length ? intersections[0].object.userData.keyId : null;
    }

    function onPointerDown(event) {
        const keyId = pointerToKey(event);
        if (!keyId) return;
        pressKey(keyId);
    }

    function onKeyDown(event) {
        if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;

        const target = event.target;
        if (
            target instanceof HTMLElement
            && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
        ) return;

        const letter = event.key.toUpperCase();
        if (!PHYSICAL_KEYS.has(letter)) {
            if (namePosition > 0 && event.key.length === 1) resetNameMatch();
            return;
        }
        pressKey(resolvePhysicalKey(letter));
    }

    function resize() {
        if (isDisposed) return;
        const bounds = containerElement.getBoundingClientRect();
        const width = Math.max(Math.round(bounds.width), 1);
        const height = Math.max(Math.round(bounds.height), 1);
        const aspect = width / height;
        const fill = width <= CONFIG.camera.compactBreakpoint
            ? CONFIG.camera.compactFill
            : CONFIG.camera.desktopFill;
        const viewHeight = Math.max(
            projectedExtents.height / fill,
            projectedExtents.width / (aspect * fill)
        );
        const viewWidth = viewHeight * aspect;

        camera.left = -viewWidth / 2;
        camera.right = viewWidth / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(width, height, false);
    }

    function renderFrame(now) {
        if (isDisposed) return;
        updatePresses(now);
        updateCelebration(now);
        applyAnimatedPositions(now);
        renderer.render(scene, camera);
    }

    function cleanup() {
        if (isDisposed) return;
        isDisposed = true;
        renderer.setAnimationLoop(null);
        resizeObserver?.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pagehide", onPageHide);

        keyGeometry.dispose();
        labelGeometry.dispose();
        groundGeometry.dispose();
        groundMaterial.dispose();
        baseGeometries.forEach((geometry) => geometry.dispose());
        keyMaterials.forEach((material) => material.dispose());
        baseMaterials.forEach((material) => material.dispose());
        labelMaterials.forEach((material) => material.dispose());
        labelTextures.forEach((texture) => texture.dispose());
        renderer.dispose();
        renderer.domElement.remove();
        delete containerElement.dataset.keyboardInitialized;
    }

    function onPageHide(event) {
        if (!event.persisted) cleanup();
    }

    renderer.domElement.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pagehide", onPageHide);
    containerElement.setAttribute("tabindex", "0");
    containerElement.dataset.nameProgress = "0";

    if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(containerElement);
    } else {
        window.addEventListener("resize", resize, { passive: true });
    }

    resize();
    renderer.setAnimationLoop(renderFrame);
}

function createKeycapGeometry() {
    const shape = CONFIG.geometry;
    const halfWidth = shape.keyWidth / 2;
    const halfDepth = shape.keyDepth / 2;
    const bevel = shape.keyBevel;
    const levels = [
        {
            y: 0,
            halfWidth: halfWidth * (shape.keyBottomScale - 0.04),
            halfDepth: halfDepth * (shape.keyBottomScale - 0.04),
            radius: shape.keyCornerRadius * 0.82
        },
        {
            y: bevel,
            halfWidth: halfWidth * shape.keyBottomScale,
            halfDepth: halfDepth * shape.keyBottomScale,
            radius: shape.keyCornerRadius
        },
        {
            y: shape.keyHeight * 0.76,
            halfWidth: halfWidth * shape.keyShoulderScale,
            halfDepth: halfDepth * shape.keyShoulderScale,
            radius: shape.keyCornerRadius * 0.9
        },
        {
            y: shape.keyHeight - bevel * 0.55,
            halfWidth: halfWidth * (shape.keyTopScale + 0.035),
            halfDepth: halfDepth * (shape.keyTopScale + 0.035),
            radius: shape.keyCornerRadius * 0.78
        },
        {
            y: shape.keyHeight,
            halfWidth: halfWidth * shape.keyTopScale,
            halfDepth: halfDepth * shape.keyTopScale,
            radius: shape.keyCornerRadius * 0.72
        }
    ];

    return createLayeredRoundedGeometry(
        levels,
        shape.cornerSegments,
        shape.keyHeight - shape.keyDishDepth
    );
}

function createBaseGeometry(width, depth) {
    const shape = CONFIG.geometry;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const bevel = shape.baseBevel;
    const levels = [
        {
            y: 0,
            halfWidth: halfWidth - bevel * 0.5,
            halfDepth: halfDepth - bevel * 0.5,
            radius: shape.baseCornerRadius * 0.72
        },
        {
            y: bevel,
            halfWidth,
            halfDepth,
            radius: shape.baseCornerRadius
        },
        {
            y: shape.baseHeight - bevel,
            halfWidth,
            halfDepth,
            radius: shape.baseCornerRadius
        },
        {
            y: shape.baseHeight,
            halfWidth: halfWidth - bevel * 0.42,
            halfDepth: halfDepth - bevel * 0.42,
            radius: shape.baseCornerRadius * 0.78
        }
    ];

    return createLayeredRoundedGeometry(levels, shape.cornerSegments, shape.baseHeight);
}

function createLayeredRoundedGeometry(levels, cornerSegments, topCenterY) {
    const positions = [];
    const sideIndices = [];
    const bottomIndices = [];
    const topIndices = [];
    const rings = levels.map((level) => roundedRectangleRing(
        level.halfWidth,
        level.halfDepth,
        level.radius,
        cornerSegments
    ));
    const ringLength = rings[0].length;

    for (let levelIndex = 0; levelIndex < levels.length; levelIndex += 1) {
        const level = levels[levelIndex];
        const ring = rings[levelIndex];
        for (let pointIndex = 0; pointIndex < ringLength; pointIndex += 1) {
            positions.push(ring[pointIndex].x, level.y, ring[pointIndex].z);
        }
    }

    for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex += 1) {
        const lowerStart = levelIndex * ringLength;
        const upperStart = (levelIndex + 1) * ringLength;
        for (let pointIndex = 0; pointIndex < ringLength; pointIndex += 1) {
            const next = (pointIndex + 1) % ringLength;
            sideIndices.push(
                lowerStart + pointIndex,
                upperStart + next,
                upperStart + pointIndex,
                lowerStart + pointIndex,
                lowerStart + next,
                upperStart + next
            );
        }
    }

    const bottomRingStart = positions.length / 3;
    const bottomRing = rings[0];
    for (let pointIndex = 0; pointIndex < ringLength; pointIndex += 1) {
        positions.push(bottomRing[pointIndex].x, levels[0].y, bottomRing[pointIndex].z);
    }
    const bottomCenter = positions.length / 3;
    positions.push(0, levels[0].y, 0);
    for (let pointIndex = 0; pointIndex < ringLength; pointIndex += 1) {
        const next = (pointIndex + 1) % ringLength;
        bottomIndices.push(bottomCenter, bottomRingStart + next, bottomRingStart + pointIndex);
    }

    const topLevel = levels[levels.length - 1];
    const topRing = rings[rings.length - 1];
    const topRingStart = positions.length / 3;
    for (let pointIndex = 0; pointIndex < ringLength; pointIndex += 1) {
        positions.push(topRing[pointIndex].x, topLevel.y, topRing[pointIndex].z);
    }
    const topCenter = positions.length / 3;
    positions.push(0, topCenterY, 0);
    for (let pointIndex = 0; pointIndex < ringLength; pointIndex += 1) {
        const next = (pointIndex + 1) % ringLength;
        topIndices.push(topCenter, topRingStart + pointIndex, topRingStart + next);
    }

    const indices = sideIndices.concat(bottomIndices, topIndices);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.clearGroups();
    geometry.addGroup(0, sideIndices.length + bottomIndices.length, 1);
    geometry.addGroup(sideIndices.length + bottomIndices.length, topIndices.length, 0);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
}

function roundedRectangleRing(halfWidth, halfDepth, radius, segments) {
    const safeRadius = Math.min(radius, halfWidth, halfDepth);
    const corners = [
        { x: halfWidth - safeRadius, z: halfDepth - safeRadius, start: Math.PI / 2 },
        { x: halfWidth - safeRadius, z: -halfDepth + safeRadius, start: 0 },
        { x: -halfWidth + safeRadius, z: -halfDepth + safeRadius, start: -Math.PI / 2 },
        { x: -halfWidth + safeRadius, z: halfDepth - safeRadius, start: -Math.PI }
    ];
    const points = [];

    for (let cornerIndex = 0; cornerIndex < corners.length; cornerIndex += 1) {
        const corner = corners[cornerIndex];
        for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
            const angle = corner.start - (Math.PI / 2) * (segmentIndex / segments);
            points.push({
                x: corner.x + Math.cos(angle) * safeRadius,
                z: corner.z + Math.sin(angle) * safeRadius
            });
        }
    }

    return points;
}

function makeLabelTexture(letter, maxAnisotropy) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, size, size);
    context.fillStyle = "#ffffff";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "300 324px 'Poppins', 'Montserrat', -apple-system, sans-serif";
    context.fillText(letter, size / 2, size / 2 + 8);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(maxAnisotropy, 8);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

function measureCameraPlaneExtents(bounds, camera) {
    const min = bounds.min;
    const max = bounds.max;
    const corners = [
        new THREE.Vector3(min.x, min.y, min.z),
        new THREE.Vector3(min.x, min.y, max.z),
        new THREE.Vector3(min.x, max.y, min.z),
        new THREE.Vector3(min.x, max.y, max.z),
        new THREE.Vector3(max.x, min.y, min.z),
        new THREE.Vector3(max.x, min.y, max.z),
        new THREE.Vector3(max.x, max.y, min.z),
        new THREE.Vector3(max.x, max.y, max.z)
    ];
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    camera.updateMatrixWorld(true);
    for (let index = 0; index < corners.length; index += 1) {
        corners[index].applyMatrix4(camera.matrixWorldInverse);
        minX = Math.min(minX, corners[index].x);
        maxX = Math.max(maxX, corners[index].x);
        minY = Math.min(minY, corners[index].y);
        maxY = Math.max(maxY, corners[index].y);
    }

    return { width: maxX - minX, height: maxY - minY };
}

function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
    return value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutBack(value, overshoot) {
    const c3 = overshoot + 1;
    return 1 + c3 * Math.pow(value - 1, 3) + overshoot * Math.pow(value - 1, 2);
}
