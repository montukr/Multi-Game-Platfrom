import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function App() {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const moveQueue = useRef([]);

  // movement logic
  const queueMove = (dir) => {
    moveQueue.current.push(dir);
  };

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 5, 3);
    scene.add(light);

    // ground
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // player cube
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.y = 0.5;
    scene.add(cube);
    playerRef.current = cube;

    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const speed = 0.3;

    // keyboard
    const handleKey = (e) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") queueMove("forward");
      if (key === "s" || key === "arrowdown") queueMove("backward");
      if (key === "a" || key === "arrowleft") queueMove("left");
      if (key === "d" || key === "arrowright") queueMove("right");
    };
    window.addEventListener("keydown", handleKey);

    // touch swipe
    let startX = 0, startY = 0;
    window.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    });
    window.addEventListener("touchend", (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < 30) return;
      if (absDx > absDy) {
        if (dx > 0) queueMove("right");
        else queueMove("left");
      } else {
        if (dy > 0) queueMove("backward");
        else queueMove("forward");
      }
    });

    // animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (moveQueue.current.length > 0) {
        const dir = moveQueue.current.shift();
        const p = cube.position;
        if (dir === "forward") p.z -= speed;
        if (dir === "backward") p.z += speed;
        if (dir === "left") p.x -= speed;
        if (dir === "right") p.x += speed;
        camera.lookAt(cube.position);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("keydown", handleKey);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#111",
      }}
    />
  );
}
