// Studio renderer: progressive accumulation (jittered sub-pixel AA + jittered area lights = soft shadows).
import * as THREE from 'three';

export const BG = new THREE.Color('rgb(245,243,240)');      // page --color-bg
export const RED = new THREE.Color('rgb(127,20,22)');        // page --color-primary

// Studio look: glossy surfaces take highlights only from the soft environment softboxes, not from the
// (jittered, point-like) direct lights - avoids sparkle dots and harsh speculars.
THREE.ShaderChunk.lights_physical_pars_fragment = THREE.ShaderChunk.lights_physical_pars_fragment
  .replace('clearcoatSpecularDirect += ccIrradiance', 'clearcoatSpecularDirect += 0.0 * ccIrradiance')
  .replace('reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;',
           'reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation * smoothstep(0.3, 0.55, material.roughness);');

let renderer, rt, accum, quadScene, quadCam, addMat, finalMat;

function quad(mat) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.frustumCulled = false; return m; }

export function init(W, H) {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: false });
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    quadScene = new THREE.Scene();
    addMat = new THREE.ShaderMaterial({
      uniforms: { t: { value: null }, w: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader: 'uniform sampler2D t; uniform float w; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(t,vUv).rgb*w,1.); }',
      blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false,
    });
    finalMat = new THREE.ShaderMaterial({
      uniforms: { t: { value: null }, bg: { value: new THREE.Vector3() }, aspect: { value: 1 }, edge: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader: `
        #include <tonemapping_pars_fragment>
        uniform sampler2D t; uniform vec3 bg; uniform float aspect; uniform float edge; varying vec2 vUv;
        vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1./2.4))-0.055, step(0.0031308,c)); }
        void main(){
          vec3 c = texture2D(t, vUv).rgb * toneMappingExposure;
          c = NeutralToneMapping(c);
          c = toSRGB(clamp(c,0.,1.));
          // feather the outer frame into the exact page background so tiles sit seamlessly on the page
          vec2 q = abs(vUv-0.5)*2.; q.x = 1. - (1.-q.x)*aspect; float e = max(q.x,q.y);
          float m = smoothstep(0.62, 1.0, e) * edge;
          c = mix(c, bg, m);
          // tiny dither against banding
          float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898,78.233)))*43758.5453) - 0.5;
          gl_FragColor = vec4(c + n/255., 1.);
        }`,
      depthTest: false, depthWrite: false, toneMapped: false,
    });
    quadScene.add(quad(addMat));
  }
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.domElement.style.width = W + 'px';
  rt?.dispose(); accum?.dispose();
  rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  accum = new THREE.WebGLRenderTarget(W, H, { type: THREE.FloatType, depthBuffer: false });
  return renderer;
}

// Soft studio environment: warm-grey gradient dome + two large softboxes (top-left key, right strip) for smooth highlights.
function studioEnv() {
  const sc = new THREE.Scene();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 64, 32), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 p; void main(){ float h = p.y*0.5+0.5; vec3 c = mix(vec3(0.42,0.40,0.38), vec3(0.95,0.94,0.92), smoothstep(0.25,0.9,h)); gl_FragColor = vec4(c,1.); }',
  }));
  sc.add(dome);
  const box = (w, h, pos, I) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(I, I, I * 0.97), side: THREE.DoubleSide }));
    m.position.copy(pos); m.lookAt(0, 0, 0); sc.add(m); };
  box(36, 26, new THREE.Vector3(-22, 30, 18), 4.0);   // key softbox
  box(10, 40, new THREE.Vector3(34, 8, -10), 2.0);    // strip from right/back
  box(30, 30, new THREE.Vector3(0, 44, 0), 1.6);      // overhead
  return sc;
}

export function envMap() {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(studioEnv(), 0.035).texture;
  pm.dispose();
  return env;
}

// Studio: seamless floor + sweep, key light top-left, big overhead softbox, env fill.
export function makeStudio(scene, { size = 40, center = new THREE.Vector3() } = {}) {
  scene.background = BG.clone().convertSRGBToLinear();
  scene.environment = envMap();
  scene.environmentIntensity = 0.6;
  const floorMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('rgb(210,209,207)'), roughness: 0.95, metalness: 0 });
  // floor that curves up into a back wall (sweep)
  const R = size * 2.5, L = size * 10, W = L * 2;
  const geo = new THREE.BufferGeometry(), verts = [], idx = [];
  const prof = [[L, 0]];
  for (let i = 0; i <= 24; i++) { const a = (i / 24) * (Math.PI / 2); prof.push([-Math.sin(a) * R, R - Math.cos(a) * R]); }
  prof.push([-R, L]);
  // prof[i] = [z, y]; floor at y=0 from z=L to 0, then curving up to wall at z=-R
  prof.forEach(([z, y]) => verts.push(-W, y, z, W, y, z));
  for (let i = 0; i < prof.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  const sweep = new THREE.Mesh(geo, floorMat);
  sweep.position.set(center.x, 0, center.z - size * 1.2);
  sweep.receiveShadow = true;
  scene.add(sweep);

  const key = new THREE.DirectionalLight(0xfffaf5, 2.3);
  key.castShadow = true;
  const fill = new THREE.DirectionalLight(0xf4f6ff, 1.1);   // overhead softbox
  fill.castShadow = true;
  for (const l of [key, fill]) {
    l.shadow.mapSize.set(2048, 2048);
    const s = size * 1.1;
    Object.assign(l.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.1, far: size * 12 });
    l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02 * size / 20;
    l.target.position.copy(center);
    scene.add(l, l.target);
  }
  const rim = new THREE.DirectionalLight(0xffffff, 0.3); // soft back-right rim, no shadow
  rim.position.set(center.x + size * 2, center.y + size * 2, center.z - size * 3);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xeeeeee, 0.12));
  const keyDir = new THREE.Vector3(-0.75, 1.15, 0.85).normalize();
  const fillDir = new THREE.Vector3(0.05, 1, 0.15).normalize();
  return {
    jitter(i, n) {
      // stratified disk samples (golden angle)
      const r = Math.sqrt((i + 0.5) / n), a = i * 2.39996;
      const place = (l, dir, spread) => {
        const d = dir.clone();
        const u = new THREE.Vector3(0, 1, 0).cross(d).normalize(), v = d.clone().cross(u).normalize();
        d.addScaledVector(u, Math.cos(a) * r * spread).addScaledVector(v, Math.sin(a) * r * spread).normalize();
        l.position.copy(center).addScaledVector(d, size * 5);
      };
      place(key, keyDir, 0.22);
      place(fill, fillDir, 0.45);
    },
  };
}

// Render `scene` from `camera` with N accumulated passes. Returns PNG data URL.
export function render(scene, camera, jitterFn, N, W, H, { edge = 1 } = {}) {
  renderer.setRenderTarget(accum); renderer.setClearColor(0x000000, 1); renderer.clear();
  addMat.uniforms.w.value = 1 / N;
  for (let i = 0; i < N; i++) {
    jitterFn(i, N);
    const jx = ((i * 0.618034) % 1) - 0.5, jy = ((i * 0.754878) % 1) - 0.5;
    camera.setViewOffset(W, H, jx, jy, W, H);
    renderer.shadowMap.needsUpdate = true;
    renderer.setRenderTarget(rt); renderer.render(scene, camera);
    addMat.uniforms.t.value = rt.texture;
    renderer.setRenderTarget(accum); renderer.autoClear = false; renderer.render(quadScene, quadCam); renderer.autoClear = true;
  }
  camera.clearViewOffset();
  const fs = new THREE.Scene(); fs.add(quad(finalMat));
  finalMat.uniforms.t.value = accum.texture;
  finalMat.uniforms.bg.value.set(245 / 255, 243 / 255, 240 / 255);
  finalMat.uniforms.aspect.value = W / H > 1 ? 1 : 1;
  finalMat.uniforms.edge.value = edge;
  renderer.setRenderTarget(null); renderer.render(fs, quadCam);
  return renderer.domElement.toDataURL('image/png');
}

// Fit camera so the object's projected bbox fills (1 - 2*margin) of the frame, centred.
export function frame(camera, obj, { az = 32, el = 16, margin = 0.12, aspect = 1, offsetX = 0 } = {}) {
  const box = new THREE.Box3().setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3());
  const dir = new THREE.Vector3(Math.sin(THREE.MathUtils.degToRad(az)) * Math.cos(THREE.MathUtils.degToRad(el)),
    Math.sin(THREE.MathUtils.degToRad(el)), Math.cos(THREE.MathUtils.degToRad(az)) * Math.cos(THREE.MathUtils.degToRad(el)));
  const corners = [];
  for (let i = 0; i < 8; i++) corners.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
  let target = c.clone(), dist = box.getSize(new THREE.Vector3()).length() * 4;
  camera.aspect = aspect;
  for (let it = 0; it < 12; it++) {
    camera.position.copy(target).addScaledVector(dir, dist); camera.lookAt(target); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of corners) { const q = p.clone().project(camera); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
    const ext = Math.max((x1 - x0) / 2, (y1 - y0) / 2 * 1);
    const want = 1 - 2 * margin;
    // shift target so bbox is centred (in camera space)
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist;
    target.addScaledVector(right, ((x0 + x1) / 2 - offsetX) * hh * aspect).addScaledVector(up, ((y0 + y1) / 2) * hh);
    dist *= ext / want;
  }
  camera.position.copy(target).addScaledVector(dir, dist); camera.lookAt(target); camera.updateProjectionMatrix();
  return { target, dist, box };
}
