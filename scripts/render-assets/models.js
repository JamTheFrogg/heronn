// Product models built from primitives. Units ~cm. Every model faces +z, origin anywhere (normalised later).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RED } from './studio.js';

const M = {
  white: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(238,237,234)', roughness: 0.48, clearcoat: 0.25, clearcoatRoughness: 0.5, sheen: 0.2 }),
  grey: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(205,202,197)', roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.5 }),
  graphite: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(58,59,62)', roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
  metal: () => new THREE.MeshStandardMaterial({ color: 'rgb(170,170,172)', metalness: 1, roughness: 0.32 }),
  darkMetal: () => new THREE.MeshStandardMaterial({ color: 'rgb(70,71,74)', metalness: 1, roughness: 0.35 }),
  glass: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(14,15,18)', roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4 }),
  smoke: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(30,32,36)', roughness: 0.04, transparent: true, opacity: 0.72, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false }),
  coat: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(28,34,58)', metalness: 0.6, roughness: 0.12, iridescence: 0.6, clearcoat: 1 }),
  led: () => new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 2.2, roughness: 0.3 }),
  redRing: () => new THREE.MeshStandardMaterial({ color: RED, roughness: 0.4 }),
  ir: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(36,24,28)', roughness: 0.15, clearcoat: 1 }),
  lamp: () => new THREE.MeshStandardMaterial({ color: 'rgb(250,248,240)', emissive: 'rgb(255,246,228)', emissiveIntensity: 0.55, roughness: 0.35 }),
  frost: () => new THREE.MeshPhysicalMaterial({ color: 'rgb(246,246,244)', roughness: 0.3, transmission: 0, clearcoat: 0.6, sheen: 0.4 }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 'rgb(48,48,50)', roughness: 0.85 }),
};
export const mats = M;

const mesh = (g, m) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; return o; };
const rbox = (w, h, d, r, m, seg = 5) => mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)), m);
const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const group = (...k) => { const g = new THREE.Group(); k.forEach((c) => g.add(c)); return g; };

// Lathe a cylinder with rounded top/bottom edges (axis = y). r: radius, h: height, b: bevel radius.
function rcylGeo(r, h, b = 0.3, seg = 64) {
  const pts = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, b + Math.sin(a) * b)); }
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(r - b + Math.cos(a) * b, h - b + Math.sin(a) * b)); }
  pts.push(new THREE.Vector2(0, h));
  const g = new THREE.LatheGeometry(pts, seg); g.translate(0, -h / 2, 0); return g;
}
const rcyl = (r, h, b, m, seg) => mesh(rcylGeo(r, h, b, seg), m);
// along z (front facing)
const zcyl = (r, h, b, m) => { const o = rcyl(r, h, b, m); o.geometry.rotateX(Math.PI / 2); return o; };

function rrectShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
// rounded-rect slab, extruded along z, centred, with soft bevel
function slab(w, h, d, r, m, bev = 0.25) {
  const b = Math.min(bev, d / 2.2);
  const g = new THREE.ExtrudeGeometry(rrectShape(w - 2 * b, h - 2 * b, Math.max(0.01, r - b)), { depth: d - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 24 });
  g.translate(0, 0, -(d - 2 * b) / 2); g.computeVertexNormals();
  return mesh(g, m);
}

// Camera lens assembly facing +z, front at z = 0. R = outer radius.
function lens(R, { bezel = M.graphite() } = {}) {
  const g = new THREE.Group();
  g.add(at(zcyl(R, R * 0.35, R * 0.1, bezel), 0, 0, -R * 0.17));
  g.add(at(zcyl(R * 0.82, R * 0.2, R * 0.06, M.darkMetal()), 0, 0, -R * 0.02));
  const glass = mesh(new THREE.SphereGeometry(R * 0.72, 48, 24, 0, Math.PI * 2, 0, 0.55), M.glass());
  glass.rotation.x = Math.PI / 2; glass.position.z = -R * 0.6; g.add(glass);
  const el = mesh(new THREE.SphereGeometry(R * 0.36, 40, 20, 0, Math.PI * 2, 0, 0.9), M.coat());
  el.rotation.x = Math.PI / 2; el.position.z = -R * 0.18; g.add(el);
  g.add(at(mesh(new THREE.TorusGeometry(R * 0.5, R * 0.03, 12, 48), M.darkMetal()), 0, 0, 0.02));
  return g;
}
const led = (r = 0.12) => mesh(new THREE.SphereGeometry(r, 16, 12), M.led());
function irRing(R, n, r, z = 0) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; const s = mesh(new THREE.SphereGeometry(r, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.ir()); s.rotation.x = Math.PI / 2; s.position.set(Math.cos(a) * R, Math.sin(a) * R, z); g.add(s); }
  return g;
}
function antenna(len = 9, m = M.graphite()) {
  const g = new THREE.Group();
  g.add(rcyl(0.38, 0.9, 0.12, M.darkMetal()));
  const stick = rcyl(0.32, len, 0.3, m); stick.position.y = len / 2 + 0.3; g.add(stick);
  return g;
}

// Ball-joint stand from floor: base disc, arm, joint. Returns {group, top}
function floorMount(h, m = M.white(), lean = 0) {
  const g = new THREE.Group();
  g.add(at(rcyl(3.4, 0.9, 0.4, m), 0, 0.45, 0));
  g.add(at(rcyl(1.6, 0.5, 0.2, m), 0, 1.1, 0));
  const arm = rcyl(0.75, h, 0.3, m); arm.position.set(0, 1.1 + h / 2, 0); arm.rotation.x = lean; g.add(arm);
  const top = new THREE.Vector3(0, 1.1 + Math.cos(lean) * h, Math.sin(lean) * h);
  g.add(at(mesh(new THREE.SphereGeometry(1.05, 32, 20), m), top.x, top.y, top.z));
  return { g, top };
}

// ---------- Cameras ----------
function bullet({ body = M.white(), antennas = false, spot = false } = {}) {
  const root = new THREE.Group();
  const { g: mount, top } = floorMount(5.5, body.clone(), -0.25);
  root.add(mount);
  const cam = new THREE.Group();
  // housing: lathe along z
  const L = 15, R = 3.3;
  const pts = [new THREE.Vector2(0, -L / 2)];
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI / 2; pts.push(new THREE.Vector2(R * 0.82 + Math.cos(a) * R * 0.18, -L / 2 + R * 0.18 + Math.sin(a) * R * 0.18)); }
  pts.push(new THREE.Vector2(R, L / 2 - 0.4)); pts.push(new THREE.Vector2(R - 0.2, L / 2)); pts.push(new THREE.Vector2(0, L / 2));
  const hg = new THREE.LatheGeometry(pts, 72); hg.rotateX(Math.PI / 2); cam.add(mesh(hg, body));
  // front face plate
  cam.add(at(mesh(new THREE.TorusGeometry(R - 0.2, 0.22, 16, 96), body), 0, 0, L / 2));
  cam.add(at(zcyl(R - 0.3, 0.3, 0.1, M.glass()), 0, 0, L / 2 - 0.05));
  cam.add(at(lens(1.25), 0, 0.35, L / 2 + 0.25));
  cam.add(irRing(2.25, 8, 0.2, L / 2 + 0.2));
  // sun visor: partial cylinder shell over top
  // sun visor: thick arc shell over the top, extruded along z with soft bevel
  const vs = new THREE.Shape(); const a0 = 0.32, a1 = Math.PI - 0.32, ro = R + 0.75, ri = R + 0.2;
  vs.absarc(0, 0, ro, a0, a1, false); vs.absarc(0, 0, ri, a1, a0, true);
  const vg = new THREE.ExtrudeGeometry(vs, { depth: L * 0.7, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.18, bevelSegments: 4, curveSegments: 64 });
  vg.translate(0, 0, L / 2 - L * 0.7 + 1.6);
  const visor = mesh(vg, body);
  cam.add(visor);
  cam.add(at(led(0.13), 0, -2.0, L / 2 + 0.22));
  if (spot) cam.add(at(zcyl(0.42, 0.2, 0.08, M.lamp()), 1.6, -1.2, L / 2 + 0.22));
  // neck to joint
  cam.add(at(rcyl(0.8, 2.4, 0.3, body), 0, -R - 0.6, -1.2));
  if (antennas) { const a1 = antenna(8); a1.position.set(-1.6, R - 0.6, -L / 2 + 1.2); a1.rotation.z = 0.12; cam.add(a1); const a2 = antenna(8); a2.position.set(1.6, R - 0.6, -L / 2 + 1.2); a2.rotation.z = -0.12; cam.add(a2); }
  cam.position.set(top.x, top.y + R + 1.4, top.z + 1.2);
  cam.rotation.x = 0.1;
  root.add(cam);
  return root;
}

function floodlight() {
  const root = new THREE.Group(), w = M.white();
  root.add(at(slab(9, 9, 2.2, 1.6, w, 0.5), 0, 4.5, -2, 0, 0, 0)); // wall plate standing
  root.add(at(rbox(3, 2.6, 4.5, 0.8, w), 0, 5.2, 1));
  // two lamp heads angled outwards
  for (const s of [-1, 1]) {
    const head = new THREE.Group();
    head.add(slab(7.5, 5.2, 2.6, 1.4, w, 0.5));
    head.add(at(slab(6.6, 4.3, 0.3, 1.0, M.lamp(), 0.1), 0, 0, 1.25));
    head.position.set(s * 6.2, 7.6, 2.2); head.rotation.set(-0.35, s * 0.45, 0);
    root.add(head);
  }
  // camera pod below
  const pod = new THREE.Group();
  pod.add(mesh(new THREE.SphereGeometry(2.4, 48, 32), w));
  pod.add(at(zcyl(1.7, 0.4, 0.15, M.glass()), 0, 0, 2.05));
  pod.add(at(lens(0.95), 0, 0.1, 2.3));
  pod.add(at(led(0.11), 0, -1.15, 2.25));
  pod.position.set(0, 2.6, 2.4); pod.rotation.x = -0.15;
  root.add(pod);
  // feet so it stands
  root.add(at(rbox(10, 0.6, 7, 0.28, w), 0, 0.3, 0));
  return root;
}

function dome({ vandal = false } = {}) {
  const root = new THREE.Group(), w = M.white();
  const R = vandal ? 6.4 : 5.8;
  root.add(at(rcyl(R, 1.6, 0.6, w), 0, 0.8, 0));
  if (vandal) {
    root.add(at(rcyl(R - 0.6, 1.6, 0.45, M.white()), 0, 2.2, 0));
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.5; root.add(at(rcyl(0.22, 0.15, 0.05, M.metal()), Math.cos(a) * (R - 1.2), 3.05, Math.sin(a) * (R - 1.2))); }
  } else root.add(at(rcyl(R - 0.8, 0.6, 0.25, M.grey()), 0, 1.75, 0));
  const y0 = vandal ? 3.0 : 2.0, gr = vandal ? 4.2 : 3.9;
  // inner eyeball visible through smoked bubble
  const eye = new THREE.Group();
  eye.add(mesh(new THREE.SphereGeometry(gr * 0.72, 48, 32), M.graphite()));
  const l = lens(1.25, { bezel: M.graphite() }); l.position.z = gr * 0.72 - 0.05; eye.add(l);
  eye.position.y = y0 + 0.2; eye.rotation.x = -0.55; root.add(eye);
  const bub = mesh(new THREE.SphereGeometry(gr, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), M.smoke()); bub.position.y = y0; bub.castShadow = false;
  root.add(bub);
  root.add(at(mesh(new THREE.TorusGeometry(gr + 0.08, 0.22, 16, 96), vandal ? M.graphite() : w), 0, y0, 0, Math.PI / 2));
  root.add(at(led(0.12), R - 0.9, 1.68, 1.4));
  return root;
}

function turret() {
  const root = new THREE.Group(), w = M.white();
  root.add(at(rcyl(5.6, 1.8, 0.7, w), 0, 0.9, 0));
  const ball = new THREE.Group();
  ball.add(mesh(new THREE.SphereGeometry(4.0, 64, 48), w));
  ball.add(at(zcyl(2.6, 1.2, 0.3, M.glass()), 0, 0, 3.55));
  ball.add(at(lens(1.15), 0, 0.15, 4.25));
  ball.add(irRing(1.85, 6, 0.18, 4.12));
  ball.position.y = 4.6; ball.rotation.x = -0.32; root.add(ball);
  // cradle ring holding the ball
  root.add(at(mesh(new THREE.TorusGeometry(4.15, 0.55, 24, 96, Math.PI * 2), w), 0, 3.3, 0, Math.PI / 2));
  root.add(at(rcyl(4.6, 1.4, 0.5, w), 0, 2.4, 0));
  root.add(at(led(0.12), 3.2, 2.6, 3.4));
  return root;
}

function ptz() {
  const root = new THREE.Group(), w = M.white();
  root.add(at(rcyl(4.6, 1.2, 0.5, w), 0, 0.6, 0));
  root.add(at(rcyl(3.4, 2.4, 0.6, w), 0, 2.4, 0));
  // yoke housing
  root.add(at(rcyl(4.3, 4.0, 1.4, w), 0, 5.4, 0));
  // ball head
  const head = new THREE.Group();
  head.add(mesh(new THREE.SphereGeometry(4.6, 72, 48), w));
  head.add(at(mesh(new THREE.SphereGeometry(4.64, 72, 24, 0, Math.PI * 2, 0, 0.72), M.glass()), 0, 0, 0, Math.PI / 2));
  head.add(at(lens(1.35), 0, 0, 4.72));
  head.add(irRing(2.15, 8, 0.17, 4.12));
  head.position.y = 10.6; head.rotation.x = 0.18;
  root.add(head);
  root.add(at(rcyl(3.2, 1.4, 0.5, M.grey()), 0, 7.6, 0));
  root.add(at(led(0.12), 0, 5.5, 4.32));
  return root;
}

function panTilt() {
  const root = new THREE.Group(), w = M.white();
  root.add(at(rcyl(3.6, 4.6, 1.5, w), 0, 2.3, 0));
  root.add(at(mesh(new THREE.TorusGeometry(3.55, 0.08, 12, 96), M.grey()), 0, 3.6, 0, Math.PI / 2));
  const head = new THREE.Group();
  head.add(mesh(new THREE.SphereGeometry(3.6, 72, 48), w));
  head.add(at(mesh(new THREE.SphereGeometry(3.62, 72, 24, 0, Math.PI * 2, 0, 0.78), M.glass()), 0, 0, 0, Math.PI / 2));
  head.add(at(lens(1.05), 0, 0.3, 3.7));
  head.add(at(led(0.1), 0, -1.6, 3.32));
  head.position.y = 7.3; head.rotation.x = 0.05;
  root.add(head);
  return root;
}

function cube({ body = M.white() } = {}) {
  const root = new THREE.Group();
  const c = new THREE.Group();
  c.add(rbox(7, 7, 6, 1.9, body, 8));
  c.add(at(slab(5.8, 5.8, 0.4, 1.4, M.glass(), 0.12), 0, 0, 2.95));
  c.add(at(lens(1.15), 0, 0.5, 3.2));
  c.add(at(led(0.12), 0, -1.7, 3.12));
  c.position.y = 7.2; root.add(c);
  // stand
  root.add(at(rcyl(0.9, 3, 0.3, body), 0, 3.0, 0));
  root.add(at(rcyl(3.2, 0.9, 0.4, body), 0, 0.45, 0));
  return root;
}

function batteryCam({ solar = false } = {}) {
  const root = new THREE.Group(), w = M.white();
  const { g: mount, top } = floorMount(4.5, w, 0);
  root.add(mount);
  const c = new THREE.Group();
  // pill body: capsule lying along x, flattened
  const cap = mesh(new THREE.CapsuleGeometry(3.6, 3.2, 12, 48), w); cap.rotation.z = Math.PI / 2; cap.scale.set(1, 1, 0.95); c.add(cap);
  const face = mesh(new THREE.CapsuleGeometry(3.0, 3.2, 12, 48), M.glass()); face.rotation.z = Math.PI / 2; face.scale.set(1, 1, 0.3); face.position.z = 2.75; c.add(face);
  c.add(at(lens(1.3), -0.5, 0, 3.72));
    c.add(at(zcyl(0.5, 0.3, 0.1, M.lamp()), 2.1, 0.4, 3.58));
  c.add(at(led(0.12), 2.1, -0.9, 3.62));
  c.position.set(top.x, top.y + 3.9, top.z); root.add(c);
  if (solar) {
    const p = new THREE.Group();
    const frame = slab(12.5, 9.5, 0.6, 0.5, M.metal(), 0.15); p.add(frame);
    const cells = mesh(new THREE.PlaneGeometry(11.8, 8.8), solarMat()); cells.position.z = 0.31; p.add(cells);
    p.position.set(0, 16.5, -3.5); p.rotation.x = -0.95; root.add(p);
    root.add(at(rcyl(0.5, 9.0, 0.25, M.white()), 0, 11.0, -3.6));
    root.add(at(rcyl(1.2, 1.2, 0.3, M.white()), 0, 15.2, -3.6));
  }
  return root;
}

let _solar;
function solarMat() {
  if (_solar) return _solar;
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 768; const x = cv.getContext('2d');
  x.fillStyle = '#1b2233'; x.fillRect(0, 0, 1024, 768);
  const cols = 8, rows = 6, cw = 1024 / cols, ch = 768 / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const g = x.createLinearGradient(i * cw, j * ch, (i + 1) * cw, (j + 1) * ch); g.addColorStop(0, '#26304a'); g.addColorStop(1, '#1a2133');
    x.fillStyle = g; x.fillRect(i * cw + 3, j * ch + 3, cw - 6, ch - 6);
    x.strokeStyle = 'rgba(160,170,190,0.35)'; x.lineWidth = 1.2;
    for (let k = 1; k < 4; k++) { x.beginPath(); x.moveTo(i * cw + (k * cw) / 4, j * ch + 3); x.lineTo(i * cw + (k * cw) / 4, (j + 1) * ch - 3); x.stroke(); }
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  _solar = new THREE.MeshPhysicalMaterial({ map: t, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, metalness: 0.2 });
  return _solar;
}

// ---------- Doorbells ----------
function doorbell({ dark = false, intercom = false } = {}) {
  const root = new THREE.Group();
  const body = dark ? M.graphite() : M.white();
  const W = intercom ? 6.4 : 4.6, H = intercom ? 16 : 13.5, D = 2.4;
  const d = new THREE.Group();
  d.add(slab(W, H, D, W * 0.48, body, 0.6));
  // glass top
  const gh = intercom ? 6.0 : 6.2;
  d.add(at(slab(W - 0.8, gh, 0.3, (W - 0.8) * 0.48, M.glass(), 0.1), 0, H / 2 - gh / 2 - 0.45, D / 2));
  d.add(at(lens(0.85), 0, H / 2 - 2.4, D / 2 + 0.2));
  if (intercom) {
    // speaker grille + call button
    for (let i = 0; i < 5; i++) d.add(at(rbox(3.2, 0.22, 0.2, 0.1, M.darkMetal()), 0, -0.6 - i * 0.6, D / 2 + 0.02));
    d.add(at(zcyl(1.0, 0.5, 0.18, M.metal()), 0, -H / 2 + 2.6, D / 2 + 0.1));
    d.add(at(mesh(new THREE.TorusGeometry(1.1, 0.06, 10, 64), M.redRing()), 0, -H / 2 + 2.6, D / 2 + 0.06));
  } else {
    d.add(at(zcyl(1.35, 0.5, 0.2, dark ? M.graphite() : M.grey()), 0, -H / 2 + 2.9, D / 2 + 0.05));
    d.add(at(mesh(new THREE.TorusGeometry(1.42, 0.06, 10, 72), M.redRing()), 0, -H / 2 + 2.9, D / 2 + 0.02));
  }
  d.add(at(led(0.1), 0, H / 2 - 4.1, D / 2 + 0.17));
  d.position.y = H / 2; d.rotation.x = -0.05;
  root.add(d);
  return root;
}

// ---------- Recorders ----------
function recorder({ pro = false } = {}) {
  const root = new THREE.Group();
  const W = pro ? 34 : 24, H = pro ? 6.5 : 4.2, D = pro ? 24 : 18;
  const top = pro ? M.graphite() : M.white();
  const r = new THREE.Group();
  r.add(rbox(W, H, D, 0.9, top, 6));
  // front fascia
  r.add(at(rbox(W - 0.6, H - 0.8, 0.5, 0.35, pro ? M.darkMetal() : M.graphite()), 0, 0, D / 2));
  // vent lines
  for (let i = 0; i < (pro ? 14 : 10); i++) r.add(at(rbox(0.25, H - 2.2, 0.2, 0.1, M.rubber()), W / 2 - 3 - i * 0.6, 0, D / 2 + 0.28));
  if (pro) for (let i = 0; i < 4; i++) r.add(at(rbox(4.2, H - 2.2, 0.25, 0.25, M.graphite()), -W / 2 + 4 + i * 4.8, 0, D / 2 + 0.3));
  // status LEDs: one red, rest neutral
  r.add(at(led(0.16), -W / 2 + 1.8, 0, D / 2 + 0.3));
  for (let i = 1; i < 4; i++) r.add(at(mesh(new THREE.SphereGeometry(0.14, 12, 10), M.grey()), -W / 2 + 1.8 + i * 0.7, 0, D / 2 + 0.28));
  r.position.y = H / 2 + 0.5;
  root.add(r);
  for (const x of [-1, 1]) for (const z of [-1, 1]) root.add(at(rcyl(0.9, 0.5, 0.2, M.rubber()), x * (W / 2 - 2), 0.25, z * (D / 2 - 2)));
  return root;
}

// ---------- Sensors ----------
function motionSensor() {
  const root = new THREE.Group(), w = M.white();
  const s = new THREE.Group();
  s.add(slab(6.4, 9.6, 4.4, 2.4, w, 1.2));
  // fresnel dome window
  const lensG = new THREE.SphereGeometry(2.3, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2.4);
  const fl = mesh(lensG, M.frost()); fl.rotation.x = Math.PI / 2; fl.scale.set(1, 1, 0.55); fl.position.set(0, 1.2, 1.6); s.add(fl);
  for (let i = 1; i < 5; i++) s.add(at(mesh(new THREE.TorusGeometry(i * 0.48, 0.035, 8, 64), M.grey()), 0, 1.2, 2.2 + 0.0 - i * 0.03));
  s.add(at(led(0.11), 0, -2.9, 2.22));
  s.position.y = 4.8; s.rotation.x = -0.04;
  root.add(s);
  return root;
}
function contactSensor() {
  const root = new THREE.Group(), w = M.white();
  const a = slab(3.2, 8.8, 1.8, 1.1, w, 0.6); a.position.set(-1.0, 4.4, 0); root.add(a);
  root.add(at(led(0.1), -1.0, 7.2, 0.92));
  const b = slab(1.6, 4.4, 1.6, 0.7, w, 0.55); b.position.set(2.2, 2.2, 0.6); root.add(b);
  return root;
}
function puckSensor() {
  const root = new THREE.Group(), w = M.white();
  const p = new THREE.Group();
  p.add(zcyl(4.6, 2.4, 0.9, w));
  // grille
  for (let i = 0; i < 19; i++) { const a = i * 2.39996, r = Math.sqrt(i / 19) * 1.7; p.add(at(mesh(new THREE.CircleGeometry(0.16, 16), M.rubber()), Math.cos(a) * r, Math.sin(a) * r + 0.4, 1.21)); }
  p.add(at(mesh(new THREE.TorusGeometry(2.4, 0.05, 8, 64), M.grey()), 0, 0.4, 1.2));
  p.add(at(led(0.1), 0, -2.6, 1.15));
  p.position.y = 4.6; p.rotation.x = -0.12;
  root.add(p);
  root.add(at(rbox(4, 0.8, 3.2, 0.3, M.white()), 0, 0.4, -0.6));
  return root;
}

// ---------- Alarm ----------
function alarmHub() {
  const root = new THREE.Group(), w = M.white();
  const hub = new THREE.Group();
  hub.add(slab(9, 12, 3.6, 2.6, w, 1.0));
  hub.add(at(mesh(new THREE.TorusGeometry(1.6, 0.1, 12, 96), M.lamp()), 0, 2.2, 1.8));
  hub.add(at(led(0.12), 0, 2.2, 1.8));
  for (let i = 0; i < 4; i++) hub.add(at(rbox(4.2, 0.18, 0.2, 0.08, M.grey()), 0, -2.4 - i * 0.55, 1.8));
  hub.position.set(-3.5, 6, -1); hub.rotation.x = -0.06; root.add(hub);
  root.add(at(rbox(7.2, 0.7, 3.4, 0.3, w), -3.5, 0.35, -0.6));
  // keypad lying in front, slightly raised
  const kp = new THREE.Group();
  kp.add(slab(7, 9, 1.4, 1.2, w, 0.5));
  kp.add(at(slab(6, 7.8, 0.2, 0.8, M.glass(), 0.08), 0, 0, 0.66));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) kp.add(at(mesh(new THREE.CircleGeometry(0.42, 32), M.grey()), (i - 1) * 1.6, (j - 1.5) * 1.6, 0.78));
  kp.position.set(4.8, 0.95, 3.2); kp.rotation.set(-Math.PI / 2 + 0.28, 0, 0);
  root.add(kp);
  root.add(at(rbox(6, 1.6, 3, 0.4, w), 4.8, 0.8, 0.0));
  return root;
}
function siren() {
  const root = new THREE.Group(), w = M.white();
  const s = new THREE.Group();
  s.add(slab(11, 14, 4.2, 3.2, w, 1.3));
  // strobe lens (frosted, warm) at top
  s.add(at(slab(7.5, 3.0, 1.4, 1.4, M.frost(), 0.5), 0, 3.6, 2.0));
  s.add(at(rbox(7.0, 0.12, 0.2, 0.05, M.redRing()), 0, 1.75, 2.15));
  for (let i = 0; i < 6; i++) s.add(at(rbox(6.5, 0.3, 0.3, 0.14, M.grey()), 0, -0.8 - i * 0.85, 2.1));
  s.add(at(led(0.12), 4.0, -5.2, 2.15));
  s.position.y = 7; s.rotation.x = -0.05;
  root.add(s);
  return root;
}

// ---------- Locks ----------
function smartLock() {
  const root = new THREE.Group(), w = M.white();
  const l = new THREE.Group();
  l.add(slab(6.6, 10.5, 4.2, 2.6, w, 1.2));
  l.add(at(zcyl(2.2, 0.6, 0.25, M.grey()), 0, 0.9, 2.05));
  l.add(at(mesh(new THREE.TorusGeometry(2.32, 0.05, 10, 96), M.redRing()), 0, 0.9, 2.12));
  l.add(at(rbox(0.9, 3.0, 0.7, 0.35, M.white()), 0, 0.9, 2.55));
  l.add(at(led(0.1), 0, -3.4, 2.12));
  l.position.y = 5.25 + 0.6; l.rotation.x = -0.03;
  root.add(l);
  root.add(at(rbox(7.4, 0.6, 5.4, 0.25, M.grey()), 0, 0.3, 0));
  return root;
}
function keypadLock({ fingerprint = false } = {}) {
  const root = new THREE.Group(), g = M.graphite();
  const e = new THREE.Group();
  e.add(slab(6.8, 26, 2.4, 3.0, g, 0.6));
  e.add(at(slab(5.4, 9.5, 0.2, 1.4, M.glass(), 0.08), 0, 6.2, 1.2));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) e.add(at(mesh(new THREE.CircleGeometry(0.34, 24), M.grey()), (i - 1) * 1.5, 4.0 + j * 1.5, 1.33));
  if (fingerprint) { e.add(at(zcyl(1.0, 0.4, 0.15, M.darkMetal()), 0, 10.0, 1.2)); e.add(at(mesh(new THREE.TorusGeometry(1.05, 0.05, 8, 64), M.redRing()), 0, 10.0, 1.28)); }
  else e.add(at(led(0.11), 0, 10.0, 1.3));
  // lever handle
  e.add(at(rcyl(1.4, 2.4, 0.4, M.metal()), 0, -3.5, 2.1, Math.PI / 2));
  const lever = rbox(10, 1.6, 1.6, 0.7, M.metal()); lever.position.set(-4.4, -3.5, 3.5); e.add(lever);
  e.add(at(zcyl(0.6, 0.3, 0.12, M.darkMetal()), 0, -8.5, 1.25));
  e.position.y = 13; e.rotation.x = -0.03;
  root.add(e);
  root.add(at(rbox(7, 0.6, 5, 0.25, M.graphite()), 0, 0.3, 0));
  return root;
}

export const MODELS = {
  'bullet': () => bullet(),
  'bullet-wifi': () => bullet({ antennas: true }),
  'bullet-colour': () => bullet({ body: M.graphite(), spot: true }),
  'floodlight': floodlight,
  'dome': () => dome(),
  'dome-vandal': () => dome({ vandal: true }),
  'turret': turret,
  'ptz': ptz,
  'pan-tilt': panTilt,
  'cube': () => cube(),
  'cube-graphite': () => cube({ body: M.graphite() }),
  'battery-camera': () => batteryCam(),
  'solar-camera': () => batteryCam({ solar: true }),
  'doorbell': () => doorbell(),
  'doorbell-intercom': () => doorbell({ dark: true, intercom: true }),
  'recorder': () => recorder(),
  'recorder-pro': () => recorder({ pro: true }),
  'motion-sensor': motionSensor,
  'contact-sensor': contactSensor,
  'puck-sensor': puckSensor,
  'alarm-hub': alarmHub,
  'siren': siren,
  'smart-lock': smartLock,
  'keypad-lock': () => keypadLock(),
  'fingerprint-lock': () => keypadLock({ fingerprint: true }),
};

// Put model on floor (min y = 0), centred in x/z.
export function ground(o) {
  o.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3());
  o.position.x -= c.x; o.position.z -= c.z; o.position.y -= b.min.y;
  const wrap = new THREE.Group(); wrap.add(o); return wrap;
}
