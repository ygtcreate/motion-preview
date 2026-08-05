"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Motion = { id: string; name: string; category: string; duration: number; fps: number; fileSize: string; updatedAt: string; url: string | null };

const PREVIEW_CHARACTER_URL = "/api/files/Preview/Character.fbx";

function Viewer({ motion, playing, speed, loop, onTime }: { motion?: Motion; playing: boolean; speed: number; loop: boolean; onTime: (n: number) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<{ mixer?: any; clock?: any; action?: any; frame?: number }>({});
  const playback = useRef({ playing, speed });
  useEffect(() => { playback.current = { playing, speed }; }, [playing, speed]);

  useEffect(() => {
    if (!host.current) return;
    const el = host.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#ebe8e1");
    scene.fog = new THREE.Fog("#ebe8e1", 7, 16);
    const camera = new THREE.PerspectiveCamera(35, el.clientWidth / el.clientHeight, .1, 100);
    camera.position.set(3.4, 2.6, 5.2);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.15, 0); controls.enableDamping = true;
    scene.add(new THREE.HemisphereLight("#ffffff", "#9c8f77", 2.2));
    const key = new THREE.DirectionalLight("#fff4df", 3.6); key.position.set(4, 6, 3); key.castShadow = true; scene.add(key);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: "#d7d2c7", roughness: 1 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(20, 40, "#c4bdb0", "#d5cfc4"); grid.position.y = .003; scene.add(grid);

    let subject: any;
    let disposed = false;
    const addDemo = () => {
      subject = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: "#202322", roughness: .68 });
      const accent = new THREE.MeshStandardMaterial({ color: "#d77d4a", roughness: .62 });
      const part = (geometry: any, material = mat) => { const m = new THREE.Mesh(geometry, material); m.castShadow = true; return m; };
      const torso = part(new THREE.CapsuleGeometry(.34, .72, 6, 12)); torso.position.y = 1.35; subject.add(torso);
      const head = part(new THREE.SphereGeometry(.24, 20, 20), accent); head.position.y = 2.12; subject.add(head);
      const limb = (x: number, y: number, z: number, arm = false) => { const pivot = new THREE.Group(); pivot.position.set(x, y, z); const mesh = part(new THREE.CapsuleGeometry(arm ? .09 : .12, arm ? .62 : .72, 5, 10)); mesh.position.y = arm ? -.37 : -.44; pivot.add(mesh); subject.add(pivot); return pivot; };
      const limbs = [limb(-.42,1.74,0,true),limb(.42,1.74,0,true),limb(-.18,1.0,0),limb(.18,1.0,0)];
      subject.userData.limbs = limbs; scene.add(subject);
    };
    if (motion?.url) {
      const loader = new FBXLoader();
      loader.load(PREVIEW_CHARACTER_URL, (character: any) => {
        if (disposed) return;
        subject = character;
        const box = new THREE.Box3().setFromObject(character);
        const size = box.getSize(new THREE.Vector3());
        character.scale.setScalar(2.2 / Math.max(size.y, .01));
        const scaledBox = new THREE.Box3().setFromObject(character);
        const center = scaledBox.getCenter(new THREE.Vector3());
        character.position.x -= center.x;
        character.position.z -= center.z;
        character.position.y -= scaledBox.min.y;
        character.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        scene.add(character);

        loader.load(motion.url!, (animationSource: any) => {
          if (disposed) return;
          const clip = animationSource.animations?.[0];
          if (!clip) return;
          state.current.mixer = new THREE.AnimationMixer(character);
          state.current.action = state.current.mixer.clipAction(clip);
          state.current.action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
          state.current.action.play();
          state.current.action.paused = !playing;
        }, undefined, (error) => console.error(`Failed to load motion: ${motion.url}`, error));
      }, undefined, (error) => { console.error(`Failed to load preview character: ${PREVIEW_CHARACTER_URL}`, error); addDemo(); });
    } else addDemo();
    const clock = new THREE.Clock(); state.current.clock = clock;
    const animate = () => { state.current.frame = requestAnimationFrame(animate); const delta = Math.min(clock.getDelta(), .05); const t = clock.elapsedTime * playback.current.speed;
      if (playback.current.playing) { state.current.mixer?.update(delta * playback.current.speed); if (subject?.userData.limbs) { const a = motion?.category === "Run" ? 1.05 : .55; subject.userData.limbs.forEach((l: any, i: number) => l.rotation.x = Math.sin(t * (motion?.category === "Idle" ? 1.2 : 4.4) + i * Math.PI) * a); subject.position.y = motion?.category === "Jump" ? Math.abs(Math.sin(t*2.2))*.55 : Math.abs(Math.sin(t*4.4))*.025; } onTime((t % (motion?.duration || 1))); }
      controls.update(); renderer.render(scene, camera); };
    animate();
    const resize = () => { if (!el.clientWidth) return; camera.aspect = el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); };
    const ro = new ResizeObserver(resize); ro.observe(el);
    return () => { disposed = true; ro.disconnect(); if (state.current.frame) cancelAnimationFrame(state.current.frame); state.current.mixer?.stopAllAction(); controls.dispose(); renderer.dispose(); el.replaceChildren(); };
  }, [motion?.id]);
  useEffect(() => { if (state.current.action) state.current.action.paused = !playing; }, [playing]);
  useEffect(() => { if (state.current.action) { state.current.action.timeScale = speed; state.current.action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1); } }, [speed, loop]);
  return <div className="viewer" ref={host}><div className="view-tag">PERSPECTIVE</div><div className="axis"><b>Y</b><span>X</span><i>Z</i></div></div>;
}

export default function MotionStudio() {
  const [motions, setMotions] = useState<Motion[]>([]); const [selected, setSelected] = useState(0); const [query, setQuery] = useState(""); const [playing, setPlaying] = useState(true); const [speed, setSpeed] = useState(1); const [loop, setLoop] = useState(true); const [time, setTime] = useState(0);
  useEffect(() => { fetch("/api/motions").then(r=>r.json()).then(setMotions); }, []);
  const filtered = useMemo(() => motions.filter(m => `${m.name} ${m.category}`.toLowerCase().includes(query.toLowerCase())), [motions, query]);
  const motion = motions[selected];
  return <main><header><a className="brand" href="#"><span className="brand-mark">M</span><span>MOTION<br/><b>ARCHIVE</b></span></a><div className="header-meta"><span>LIBRARY</span><b>{motions.length.toString().padStart(2,"0")} MOTIONS</b></div><button className="source"><span className="pulse"/>LOCAL SOURCE</button></header>
    <section className="workspace"><aside className="library"><div className="eyebrow">MOTION LIBRARY</div><h1>Movement,<br/><em>curated.</em></h1><p className="intro">キャラクターモーションを探索し、細部までプレビュー。</p><label className="search">⌕<input aria-label="モーションを検索" value={query} onChange={e=>setQuery(e.target.value)} placeholder="モーションを検索..."/><kbd>⌘ K</kbd></label><div className="list-head"><span>ALL MOTIONS</span><span>{filtered.length}</span></div><div className="motion-list">{filtered.map((m) => { const index = motions.indexOf(m); return <button key={m.id} className={`motion-row ${index===selected?"active":""}`} onClick={()=>{setSelected(index);setTime(0)}}><span className="thumb"><i/></span><span><b>{m.name}</b><small>{m.category} · {m.duration.toFixed(1)} sec</small></span><time>{m.updatedAt.slice(5)}</time></button>})}</div></aside>
      <section className="stage"><div className="stage-top"><div><span className="eyebrow">NOW PREVIEWING</span><h2>{motion?.name || "Loading motions…"}</h2></div><button className="icon-btn" aria-label="全画面">↗</button></div><Viewer motion={motion} playing={playing} speed={speed} loop={loop} onTime={setTime}/><div className="transport"><button className="play" onClick={()=>setPlaying(!playing)} aria-label={playing?"一時停止":"再生"}>{playing?"Ⅱ":"▶"}</button><div className="timeline"><div className="times"><span>{time.toFixed(2)} s</span><span>{motion?.duration.toFixed(2) || "0.00"} s</span></div><div className="track"><span style={{width:`${Math.min(100,time/(motion?.duration||1)*100)}%`}}/></div></div><button className={`loop ${loop?"on":""}`} onClick={()=>setLoop(!loop)}>↻ LOOP</button><select value={speed} onChange={e=>setSpeed(Number(e.target.value))} aria-label="再生速度"><option value={.5}>0.5×</option><option value={1}>1.0×</option><option value={1.5}>1.5×</option><option value={2}>2.0×</option></select></div></section>
      <aside className="details"><span className="eyebrow">MOTION DETAILS</span><div className="detail-block"><label>FORMAT</label><b>FBX</b></div><div className="detail-grid"><div><label>DURATION</label><b>{motion?.duration.toFixed(2)} s</b></div><div><label>FRAME RATE</label><b>{motion?.fps} fps</b></div><div><label>FILE SIZE</label><b>{motion?.fileSize}</b></div><div><label>LOOPABLE</label><b>{loop?"YES":"NO"}</b></div></div><div className="detail-block"><label>CATEGORY</label><span className="pill">{motion?.category || "—"}</span></div><div className="detail-block"><label>SOURCE</label><b className="path">{motion?.url || "PROCEDURAL PREVIEW"}</b></div>{motion?.url&&<a className="download" href={motion.url} download>↓ DOWNLOAD FBX</a>}<div className="tip"><span>i</span><p><b>操作方法</b><br/>ドラッグで回転、スクロールでズームできます。</p></div></aside>
    </section><footer><span>FBX MOTION VIEWER / 2026</span><span>API READY <i/> WEBGL</span></footer></main>;
}
