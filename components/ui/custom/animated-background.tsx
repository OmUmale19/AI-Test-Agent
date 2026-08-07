"use client";

import React, { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  label?: string;
  status?: "pass" | "exec" | "ai";
}

interface Packet {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking
    const mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Node labels representing AI Test Automation operations
    const labels = [
      { text: "✓ test_suite.spec.ts", type: "pass" as const },
      { text: "⚡ AI_synthesize()", type: "ai" as const },
      { text: "🧪 running_coverage", type: "exec" as const },
      { text: "✓ auth.test.ts", type: "pass" as const },
      { text: "⚡ LLM_test_agent", type: "ai" as const },
      { text: "✓ stripe_webhook.test", type: "pass" as const },
      { text: "🧪 integration_pipeline", type: "exec" as const },
      { text: "✓ neon_db_schema.test", type: "pass" as const },
      { text: "⚡ 99.8% Coverage", type: "ai" as const },
      { text: "✓ github_action_pass", type: "pass" as const },
    ];

    // Generate Nodes
    const nodeCount = Math.min(Math.floor((width * height) / 25000), 30);
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const item = labels[i % labels.length];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 2,
        label: i % 3 === 0 ? item.text : undefined,
        status: item.type,
      });
    }

    // Generate Data Packets traveling between nodes
    const packets: Packet[] = [];
    const createPacket = () => {
      if (nodes.length < 2) return;
      const fromNode = Math.floor(Math.random() * nodes.length);
      let toNode = Math.floor(Math.random() * nodes.length);
      while (toNode === fromNode) {
        toNode = Math.floor(Math.random() * nodes.length);
      }
      packets.push({
        fromNode,
        toNode,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
      });
    };

    // Keep around 12 active packets
    for (let i = 0; i < 12; i++) {
      createPacket();
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.25;
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and draw mouse attraction connections
      for (let i = 0; i < nodes.length; i++) {
        const dx = mouse.x - nodes[i].x;
        const dy = mouse.y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const alpha = (1 - dist / mouse.radius) * 0.45;
          ctx.strokeStyle = `rgba(250, 204, 21, ${alpha})`; // Yellow glow connection
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Update and draw packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.progress += p.speed;
        if (p.progress >= 1) {
          packets.splice(i, 1);
          createPacket();
          continue;
        }

        const n1 = nodes[p.fromNode];
        const n2 = nodes[p.toNode];
        if (!n1 || !n2) continue;

        const px = n1.x + (n2.x - n1.x) * p.progress;
        const py = n1.y + (n2.y - n1.y) * p.progress;

        // Draw glowing packet dot
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#38bdf8";
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Update and draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Move nodes
        n.x += n.vx;
        n.y += n.vy;

        // Bounce on edges
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // Draw Node circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        if (n.status === "pass") {
          ctx.fillStyle = "#10b981"; // Emerald green
        } else if (n.status === "ai") {
          ctx.fillStyle = "#facc15"; // Yellow
        } else {
          ctx.fillStyle = "#38bdf8"; // Sky blue
        }
        ctx.fill();

        // Draw Node label badge if present
        if (n.label) {
          ctx.font = "11px monospace";
          const textWidth = ctx.measureText(n.label).width;
          const padX = 6;
          const padY = 4;

          // Badge background box
          ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
          ctx.strokeStyle =
            n.status === "pass"
              ? "rgba(16, 185, 129, 0.4)"
              : n.status === "ai"
              ? "rgba(250, 204, 21, 0.4)"
              : "rgba(56, 189, 248, 0.4)";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.roundRect(
            n.x + 8,
            n.y - 12,
            textWidth + padX * 2,
            16 + padY,
            4
          );
          ctx.fill();
          ctx.stroke();

          // Badge text
          ctx.fillStyle =
            n.status === "pass"
              ? "#34d399"
              : n.status === "ai"
              ? "#fde047"
              : "#7dd3fc";
          ctx.fillText(n.label, n.x + 8 + padX, n.y + 2);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
