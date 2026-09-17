import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { projects, type District, type Project } from "../data";

// The four folded bands are the four project disciplines. Nodes open real work.
export default function Intelligence({
  district,
  onSelect,
  paused,
}: {
  district: District;
  onSelect: (p: Project) => void;
  paused: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLButtonElement>(null);
  const [focusProject, setFocusProject] = useState(
    projects.find((p) => p.id === "AssemblyAI")!,
  );
  const focused = useRef(focusProject);
  const state = useRef({ district, onSelect, paused });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    state.current = { district, onSelect, paused };
    if (district !== "all") {
      const p = projects.find((p) => p.district === district);
      if (p) {
        focused.current = p;
        setFocusProject(p);
      }
    }
  }, [district, onSelect, paused]);
  useEffect(() => {
    const el = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
    renderer.setClearColor(0xeeeeea, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 1, 8.8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = true;
    controls.rotateSpeed = 0.5;
    controls.autoRotateSpeed = 0.25;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(-3, 7, 5);
    scene.add(sun);
    const artifact = new THREE.Group();
    artifact.rotation.set(0.25, -0.25, -0.48);
    scene.add(artifact);
    const resources: (THREE.BufferGeometry | THREE.Material)[] = [];
    class RibbonCurve extends THREE.Curve<THREE.Vector3> {
      constructor() {
        super();
      }
      getPoint(t: number, target = new THREE.Vector3()) {
        const a = t * Math.PI * 2;
        return target.set(
          (Math.sin(a) + 1.85 * Math.sin(2 * a)) * 0.57,
          (Math.cos(a) - 1.85 * Math.cos(2 * a)) * 0.57,
          -Math.sin(3 * a) * 0.7,
        );
      }
    }
    const curve = new RibbonCurve();
    const frames = curve.computeFrenetFrames(320, true);
    const nodes: THREE.Mesh[] = [];
    const bands: THREE.Group[] = [];
    const bandMaterials: THREE.MeshPhysicalMaterial[] = [];
    const disciplines = ["agents", "systems", "human", "learning"];
    for (let b = 0; b < 4; b++) {
      const group = new THREE.Group();
      artifact.add(group);
      bands.push(group);
      const positions: number[] = [],
        uvs: number[] = [],
        indices: number[] = [];
      const steps = 80;
      const across = 8;
      const start = b / 4;
      for (let i = 0; i <= steps; i++) {
        const t = start + (i / steps) * 0.238;
        const p = curve.getPoint(t);
        const f = Math.min(320, Math.round(t * 320));
        const n = frames.normals[f],
          bin = frames.binormals[f];
        for (let j = 0; j <= across; j++) {
          const v = (j / across - 0.5) * 0.98;
          const twist = t * Math.PI * 4;
          const pos = p
            .clone()
            .addScaledVector(n, v * Math.cos(twist))
            .addScaledVector(bin, v * Math.sin(twist));
          positions.push(pos.x, pos.y, pos.z);
          uvs.push(i / steps, j / across);
          if (i < steps && j < across) {
            const a = i * (across + 1) + j;
            indices.push(
              a,
              a + across + 1,
              a + 1,
              a + 1,
              a + across + 1,
              a + across + 2,
            );
          }
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      resources.push(geo);
      const mat = new THREE.MeshPhysicalMaterial({
        color: b === 0 ? 0xff4a12 : b === 2 ? 0xd4d5d1 : 0x999e9c,
        metalness: b === 0 ? 0.25 : 1,
        roughness: b === 0 ? 0.32 : 0.24,
        side: THREE.DoubleSide,
        clearcoat: 0.35,
        clearcoatRoughness: 0.25,
      });
      resources.push(mat);
      bandMaterials.push(mat);
      group.add(new THREE.Mesh(geo, mat));
      // Fine longitudinal wires carry each band through its folds.
      for (let strand = 0; strand < 13; strand++) {
        const points = [];
        for (let i = 0; i <= steps; i++) {
          const t = start + (i / steps) * 0.238;
          const f = Math.min(320, Math.round(t * 320));
          const v = (strand / 12 - 0.5) * 1.02;
          const p = curve
            .getPoint(t)
            .addScaledVector(frames.normals[f], v * Math.cos(t * Math.PI * 4))
            .addScaledVector(
              frames.binormals[f],
              v * Math.sin(t * Math.PI * 4),
            );
          points.push(p);
        }
        const g = new THREE.BufferGeometry().setFromPoints(points);
        const m = new THREE.LineBasicMaterial({
          color: b === 0 ? 0x87220c : 0x343934,
          transparent: true,
          opacity: strand === 0 || strand === 12 ? 0.7 : 0.23,
        });
        resources.push(g, m);
        group.add(new THREE.Line(g, m));
      }
      // Small transverse marks make the public project positions legible on the material.
      const members = projects.filter((p) => p.district === disciplines[b]);
      members.forEach((project, index) => {
        const t =
          start + 0.018 + (index / Math.max(1, members.length - 1)) * 0.19;
        const p = curve.getPoint(t);
        const f = Math.min(320, Math.round(t * 320));
        const geo = new THREE.SphereGeometry(0.045, 12, 8);
        const m = new THREE.MeshBasicMaterial({
          color: b === 0 ? 0xf4eee4 : 0xff4a12,
        });
        resources.push(geo, m);
        const node = new THREE.Mesh(geo, m);
        node.position
          .copy(p)
          .addScaledVector(
            frames.binormals[f],
            0.085 * Math.cos(t * Math.PI * 4),
          )
          .addScaledVector(
            frames.normals[f],
            -0.085 * Math.sin(t * Math.PI * 4),
          );
        node.userData = { project };
        group.add(node);
        nodes.push(node);
      });
    }
    function makeFloor() {
      const g = new THREE.PlaneGeometry(200, 200);
      const m = new THREE.ShadowMaterial({ opacity: 0.08 });
      resources.push(g, m);
      const floor = new THREE.Mesh(g, m);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.5;
      scene.add(floor);
    }
    makeFloor();
    let needsRender = true;
    const markDirty = () => {
      needsRender = true;
    };
    controls.addEventListener("change", markDirty);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    function pick(e: PointerEvent) {
      const r = el.getBoundingClientRect();
      pointer.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(nodes)[0]?.object;
    }
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const n = pick(e);
      if (n) state.current.onSelect(n.userData.project);
    };
    const onMove = (e: PointerEvent) => {
      const n = pick(e);
      el.style.cursor = n ? "pointer" : "grab";
      if (n && focused.current.id !== n.userData.project.id) {
        needsRender = true;
        focused.current = n.userData.project;
        setFocusProject(n.userData.project);
      }
    };
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);
    renderer.domElement.addEventListener("pointermove", onMove);
    const resize = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight);
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      needsRender = true;
    });
    resize.observe(el);
    let visible = true;
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      needsRender = true;
    });
    observer.observe(el);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      last = 0,
      transitionUntil = 0,
      lastDistrict = state.current.district;
    const render = (time: number) => {
      frame = requestAnimationFrame(render);
      if (!visible || document.hidden || time - last < 28) return;
      last = time;
      controls.autoRotate = !state.current.paused && !reduced.matches;
      controls.update();
      if (lastDistrict !== state.current.district) {
        lastDistrict = state.current.district;
        transitionUntil = reduced.matches ? 0 : time + 1800;
        needsRender = true;
      }
      if (transitionUntil && time >= transitionUntil) {
        transitionUntil = 0;
        needsRender = true;
      }
      const settle = reduced.matches || transitionUntil === 0;
      // A stationary sculpture should not repeatedly redraw expensive physical materials.
      if (!needsRender && time >= transitionUntil) return;
      needsRender = false;
      const selected = disciplines.indexOf(state.current.district);
      bands.forEach((band, i) => {
        const explode = selected < 0 ? 0 : i === selected ? 0.6 : 0.15;
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * explode,
          y = Math.sin(angle) * explode;
        band.position.x = THREE.MathUtils.lerp(
          band.position.x,
          x,
          settle ? 1 : 0.04,
        );
        band.position.y = THREE.MathUtils.lerp(
          band.position.y,
          y,
          settle ? 1 : 0.04,
        );
        bandMaterials[i].color.lerp(
          new THREE.Color(
            i === (selected < 0 ? 0 : selected)
              ? 0xff4a12
              : i === 2
                ? 0xd4d5d1
                : 0x999e9c,
          ),
          settle ? 1 : 0.08,
        );
      });
      const focusNode = nodes.find(
        (n) => n.userData.project.id === focused.current.id,
      );
      if (focusNode && label.current) {
        const p = new THREE.Vector3();
        focusNode.getWorldPosition(p);
        p.project(camera);
        const x = (p.x * 0.5 + 0.5) * el.clientWidth,
          y = (-p.y * 0.5 + 0.5) * el.clientHeight;
        label.current.style.left = `${Math.max(35, Math.min(el.clientWidth - 170, x + 30))}px`;
        label.current.style.top = `${Math.max(50, Math.min(el.clientHeight - 65, y - 20))}px`;
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      controls.removeEventListener("change", markDirty);
      controls.dispose();
      resources.forEach((r) => r.dispose());
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  return (
    <div
      className="intelligence is-ready"
      ref={host}
      role="group"
      aria-label="Folded 3D map of four project disciplines. Drag to rotate; use the labeled project links for keyboard access."
    >
      {!failed && (
        <button
          className="sculpture-project-label"
          ref={label}
          onClick={() => onSelect(focusProject)}
        >
          <span>{focusProject.name}</span>
          <small>EXPLORE PROJECT ↗</small>
        </button>
      )}
      {failed && (
        <div className="scene-fallback">
          Explore the work index.<span>3D is unavailable on this device.</span>
        </div>
      )}
    </div>
  );
}
