/* ==========================================================================
   Codermug Theme - Circuit Background Animation
   ========================================================================== */

class CircuitAnimation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.lines = [];
    this.nodes = [];
    this.particles = [];

    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */

  init() {
    this.resize();
    this.createGrid();
    this.createNodes();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.lines = [];
    this.nodes = [];
    this.createGrid();
    this.createNodes();
  }

  /* ==========================================================================
     GRID CREATION
     ========================================================================== */

  createGrid() {
    const spacing = 80;
    const offsetX = (this.width % spacing) / 2;
    const offsetY = (this.height % spacing) / 2;

    for (let y = offsetY; y < this.height; y += spacing) {
      if (Math.random() > 0.6) {
        const segments = this.createLineSegments(0, y, this.width, y, 'horizontal');
        this.lines.push(...segments);
      }
    }

    for (let x = offsetX; x < this.width; x += spacing) {
      if (Math.random() > 0.6) {
        const segments = this.createLineSegments(x, 0, x, this.height, 'vertical');
        this.lines.push(...segments);
      }
    }

    for (let i = 0; i < 8; i++) {
      if (Math.random() > 0.5) {
        const startX = Math.random() * this.width;
        const startY = Math.random() * this.height;
        const length = 100 + Math.random() * 200;
        const angle = (Math.random() > 0.5 ? 1 : -1) * Math.PI / 4;

        this.lines.push({
          x1: startX,
          y1: startY,
          x2: startX + Math.cos(angle) * length,
          y2: startY + Math.sin(angle) * length,
          opacity: 0.1 + Math.random() * 0.2,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    }
  }

  createLineSegments(x1, y1, x2, y2, direction) {
    const segments = [];
    const numSegments = 2 + Math.floor(Math.random() * 3);
    const totalLength = direction === 'horizontal' ? (x2 - x1) : (y2 - y1);

    let currentPos = 0;

    for (let i = 0; i < numSegments; i++) {
      const gapBefore = Math.random() * (totalLength / numSegments) * 0.3;
      const segmentLength = (totalLength / numSegments) * (0.4 + Math.random() * 0.4);

      currentPos += gapBefore;

      if (currentPos + segmentLength > totalLength) break;

      if (direction === 'horizontal') {
        segments.push({
          x1: x1 + currentPos, y1: y1,
          x2: x1 + currentPos + segmentLength, y2: y2,
          opacity: 0.1 + Math.random() * 0.15,
          pulseOffset: Math.random() * Math.PI * 2
        });
      } else {
        segments.push({
          x1: x1, y1: y1 + currentPos,
          x2: x2, y2: y1 + currentPos + segmentLength,
          opacity: 0.1 + Math.random() * 0.15,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }

      currentPos += segmentLength;
    }

    return segments;
  }

  /* ==========================================================================
     NODES CREATION
     ========================================================================== */

  createNodes() {
    const nodeCount = Math.floor((this.width * this.height) / 50000);

    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 2 + Math.random() * 3,
        pulseOffset: Math.random() * Math.PI * 2,
        connections: []
      });
    }

    this.nodes.forEach((node, i) => {
      this.nodes.forEach((otherNode, j) => {
        if (i !== j) {
          const dist = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
          if (dist < 200 && Math.random() > 0.7) {
            node.connections.push(j);
          }
        }
      });
    });
  }

  /* ==========================================================================
     PARTICLES
     ========================================================================== */

  spawnParticle() {
    if (this.lines.length === 0) return;

    const line = this.lines[Math.floor(Math.random() * this.lines.length)];
    const progress = Math.random();

    this.particles.push({
      x: line.x1 + (line.x2 - line.x1) * progress,
      y: line.y1 + (line.y2 - line.y1) * progress,
      vx: (line.x2 - line.x1) * 0.002,
      vy: (line.y2 - line.y1) * 0.002,
      life: 1,
      decay: 0.005 + Math.random() * 0.01,
      size: 1 + Math.random() * 2
    });
  }

  /* ==========================================================================
     UPDATE & DRAW
     ========================================================================== */

  update(time) {
    if (Math.random() > 0.95) {
      this.spawnParticle();
    }

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      return p.life > 0;
    });
  }

  draw(time) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.lines.forEach(line => {
      const pulse = Math.sin(time * 0.001 + line.pulseOffset) * 0.5 + 0.5;
      const opacity = line.opacity * (0.5 + pulse * 0.5);

      this.ctx.beginPath();
      this.ctx.moveTo(line.x1, line.y1);
      this.ctx.lineTo(line.x2, line.y2);
      this.ctx.strokeStyle = `rgba(255, 107, 0, ${opacity})`;
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    });

    this.nodes.forEach((node) => {
      node.connections.forEach(j => {
        const otherNode = this.nodes[j];
        const pulse = Math.sin(time * 0.002 + node.pulseOffset) * 0.5 + 0.5;

        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(otherNode.x, otherNode.y);
        this.ctx.strokeStyle = `rgba(255, 107, 0, ${0.05 + pulse * 0.1})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
      });
    });

    this.nodes.forEach(node => {
      const pulse = Math.sin(time * 0.003 + node.pulseOffset) * 0.5 + 0.5;

      const gradient = this.ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, node.radius * 4
      );
      gradient.addColorStop(0, `rgba(255, 107, 0, ${0.3 * pulse})`);
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0)');

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 107, 0, ${0.4 + pulse * 0.4})`;
      this.ctx.fill();
    });

    this.particles.forEach(p => {
      const gradient = this.ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.size * 3
      );
      gradient.addColorStop(0, `rgba(255, 140, 0, ${p.life})`);
      gradient.addColorStop(0.5, `rgba(255, 107, 0, ${p.life * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0)');

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
    });
  }

  /* ==========================================================================
     ANIMATION LOOP
     ========================================================================== */

  animate(time = 0) {
    this.update(time);
    this.draw(time);
    requestAnimationFrame((t) => this.animate(t));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CircuitAnimation('circuitCanvas');
});
