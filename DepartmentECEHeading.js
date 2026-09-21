/**
 * DepartmentECEHeading.js
 * Premium Reusable Heading Component with Real HTML/CSS Typography and
 * Real-Time Procedural Canvas Electric Lightning Arcs.
 * 
 * Accurately tracks text boundaries so lightning hugs the top and bottom
 * letter contours simultaneously, shoots electrical forks, and creates
 * the iconic high-voltage electric aura.
 */

(function (global) {
    'use strict';

    class DepartmentECEHeading {
        constructor(target, options = {}) {
            this.container = typeof target === 'string' ? document.querySelector(target) : target;
            if (!this.container) {
                console.warn('[DepartmentECEHeading] Target container not found:', target);
                return;
            }

            this.options = Object.assign({
                textDept: 'DEPARTMENT OF',
                textEce: 'ECE',
                strikeIntervalMin: 3200,
                strikeIntervalMax: 5000,
                minTopBolts: 2,
                minBottomBolts: 2,
                minBridgeBolts: 1
            }, options);

            this.bolts = [];
            this.sparks = [];
            this.animId = null;
            this.strikeTimeout = null;
            this.isDestroyed = false;
            this.isVisible = true;
            this.reducedMotion = false;
            this.width = 0;
            this.height = 0;
            this.dpr = 1;

            // Cached text bounds relative to canvas
            this.bounds = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, centerY: 0 };

            this._initDOM();
            this._initCanvas();
            this._checkReducedMotion();
            this._initIntersectionObserver();
            this._startAnimation();
            this._scheduleNextSurge();
        }

        _initDOM() {
            this.container.classList.add('dept-ece-heading-container');

            // Ambient background glow flare
            this.ambient = document.createElement('div');
            this.ambient.className = 'dept-ece-heading-ambient';

            // Canvas for procedural lightning
            this.canvas = document.createElement('canvas');
            this.canvas.className = 'dept-ece-lightning-canvas';
            this.ctx = this.canvas.getContext('2d');

            // Semantic HTML heading
            this.title = document.createElement('h1');
            this.title.className = 'dept-ece-heading-title';
            this.title.setAttribute('aria-label', `${this.options.textDept} ${this.options.textEce}`);

            this.wordDept = document.createElement('span');
            this.wordDept.className = 'dept-ece-word-dept';
            this.wordDept.textContent = this.options.textDept;

            this.wordEce = document.createElement('span');
            this.wordEce.className = 'dept-ece-word-ece';
            this.wordEce.textContent = this.options.textEce;

            this.title.appendChild(this.wordDept);
            this.title.appendChild(document.createTextNode(' '));
            this.title.appendChild(this.wordEce);

            // Clean previous contents and append
            this.container.innerHTML = '';
            this.container.appendChild(this.ambient);
            this.container.appendChild(this.canvas);
            this.container.appendChild(this.title);
        }

        _initCanvas() {
            this._resizeCanvas = this._resizeCanvas.bind(this);
            this.resizeObserver = new ResizeObserver(this._resizeCanvas);
            this.resizeObserver.observe(this.container);
            this._resizeCanvas();
        }

        _resizeCanvas() {
            if (!this.canvas || !this.container) return;
            const rect = this.canvas.getBoundingClientRect();
            const width = Math.max(rect.width, 320);
            const height = Math.max(rect.height, 120);

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.canvas.width = Math.floor(width * dpr);
            this.canvas.height = Math.floor(height * dpr);

            this.width = width;
            this.height = height;
            this.dpr = dpr;

            this._updateTextBounds();
        }

        _updateTextBounds() {
            if (!this.title || !this.canvas) return;
            const titleRect = this.title.getBoundingClientRect();
            const canvasRect = this.canvas.getBoundingClientRect();

            if (canvasRect.width === 0 || canvasRect.height === 0) return;

            const left = ((titleRect.left - canvasRect.left) / canvasRect.width) * this.width;
            const right = ((titleRect.right - canvasRect.left) / canvasRect.width) * this.width;
            const top = ((titleRect.top - canvasRect.top) / canvasRect.height) * this.height;
            const bottom = ((titleRect.bottom - canvasRect.top) / canvasRect.height) * this.height;

            this.bounds = {
                left,
                right,
                top,
                bottom,
                width: right - left,
                height: bottom - top,
                centerY: (top + bottom) * 0.5
            };
        }

        _checkReducedMotion() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotion = mediaQuery.matches;
            this._motionListener = (e) => {
                this.reducedMotion = e.matches;
                if (this.reducedMotion) {
                    this._clearCanvas();
                }
            };
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', this._motionListener);
            }
        }

        _initIntersectionObserver() {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    this.isVisible = entry.isIntersecting;
                    if (this.isVisible && !this.animId && !this.reducedMotion) {
                        this._startAnimation();
                    }
                }
            }, { threshold: 0.05 });

            this.intersectionObserver.observe(this.container);
        }

        /**
         * Generate realistic jagged branching lightning path using recursive midpoint displacement
         */
        _createBolt(x1, y1, x2, y2, displace, roughness, isSurge = false, maxDepth = 6, branchDirection = 0, boltType = 'ambient') {
            const segments = [];
            const minLen = isSurge ? 5 : 7;

            function subdivide(ax, ay, bx, by, disp, depth) {
                const dx = bx - ax;
                const dy = by - ay;
                const len = Math.hypot(dx, dy);

                if (len < minLen || depth >= maxDepth) {
                    segments.push({ x1: ax, y1: ay, x2: bx, y2: by });
                    return;
                }

                // Normal vector perpendicular to current line
                const nx = -dy / len;
                const ny = dx / len;
                const midX = (ax + bx) * 0.5 + nx * (Math.random() - 0.5) * disp;
                const midY = (ay + by) * 0.5 + ny * (Math.random() - 0.5) * disp;

                subdivide(ax, ay, midX, midY, disp * roughness, depth + 1);
                subdivide(midX, midY, bx, by, disp * roughness, depth + 1);

                // Natural branching forks shooting outward
                const branchProb = isSurge ? 0.44 : 0.34;
                if (Math.random() < branchProb && depth <= 3 && len > 18) {
                    let branchAngle = (Math.random() - 0.5) * 1.2;
                    if (branchDirection !== 0) {
                        branchAngle = (branchDirection * 0.65) + (Math.random() - 0.5) * 0.65;
                    }
                    const cos = Math.cos(branchAngle);
                    const sin = Math.sin(branchAngle);
                    const branchLenFactor = 0.35 + Math.random() * 0.35;
                    const bdx = (dx * cos - dy * sin) * branchLenFactor;
                    const bdy = (dx * sin + dy * cos) * branchLenFactor;
                    subdivide(midX, midY, midX + bdx, midY + bdy, disp * roughness * 0.6, depth + 1);
                }
            }

            subdivide(x1, y1, x2, y2, displace, 0);

            return {
                segments,
                isSurge,
                boltType,
                alpha: 1.0,
                maxLife: isSurge ? 9 : (5 + Math.floor(Math.random() * 5)),
                life: 0
            };
        }

        _spawnTopArc() {
            if (!this.width || !this.height) return;
            const b = this.bounds;
            const bLeft = b.width > 0 ? b.left : this.width * 0.15;
            const bRight = b.width > 0 ? b.right : this.width * 0.85;
            const capTop = b.height > 0 ? (b.top + b.height * 0.14) : this.height * 0.35;

            const startX = bLeft + Math.random() * (bRight - bLeft) * 0.65;
            const arcWidth = (bRight - bLeft) * (0.2 + Math.random() * 0.4);
            const endX = Math.min(bRight + 25, startX + arcWidth);
            const startY = capTop + (Math.random() - 0.5) * 6;
            const endY = capTop + (Math.random() - 0.5) * 6;
            const displace = 15 + Math.random() * 15;

            this.bolts.push(this._createBolt(startX, startY, endX, endY, displace, 0.58, false, 6, -1, 'top'));
        }

        _spawnBottomArc() {
            if (!this.width || !this.height) return;
            const b = this.bounds;
            const bLeft = b.width > 0 ? b.left : this.width * 0.15;
            const bRight = b.width > 0 ? b.right : this.width * 0.85;
            const baseBottom = b.height > 0 ? (b.bottom - b.height * 0.12) : this.height * 0.65;

            const startX = bLeft + Math.random() * (bRight - bLeft) * 0.65;
            const arcWidth = (bRight - bLeft) * (0.2 + Math.random() * 0.4);
            const endX = Math.min(bRight + 25, startX + arcWidth);
            const startY = baseBottom + (Math.random() - 0.5) * 6;
            const endY = baseBottom + (Math.random() - 0.5) * 6;
            const displace = 15 + Math.random() * 15;

            this.bolts.push(this._createBolt(startX, startY, endX, endY, displace, 0.58, false, 6, 1, 'bottom'));
        }

        _spawnBridgeArc() {
            if (!this.width || !this.height) return;
            const b = this.bounds;
            const bLeft = b.width > 0 ? b.left : this.width * 0.15;
            const bRight = b.width > 0 ? b.right : this.width * 0.85;
            const bCenterY = (b.top + b.bottom) * 0.5;

            const startX = bLeft + Math.random() * (bRight - bLeft);
            const endX = startX + (Math.random() - 0.5) * 140;
            const startY = bCenterY + (Math.random() - 0.5) * (b.height * 0.5);
            const endY = bCenterY + (Math.random() - 0.5) * (b.height * 0.5);
            const displace = 18 + Math.random() * 16;

            this.bolts.push(this._createBolt(startX, startY, endX, endY, displace, 0.58, false, 6, 0, 'bridge'));

            if (Math.random() < 0.4) {
                this._spawnSparks(startX, startY, 2);
            }
        }

        /**
         * Trigger periodic high-energy electrical surge strike
         */
        _triggerSurgeStrike() {
            if (this.isDestroyed || this.reducedMotion || !this.isVisible) return;
            if (!this.width || !this.height) return;

            const b = this.bounds;
            const bLeft = b.width > 0 ? b.left : this.width * 0.15;
            const bRight = b.width > 0 ? b.right : this.width * 0.85;
            const capTop = b.height > 0 ? (b.top + b.height * 0.14) : this.height * 0.35;
            const baseBottom = b.height > 0 ? (b.bottom - b.height * 0.12) : this.height * 0.65;

            // Trigger visual surge highlight on DOM container
            this.container.classList.add('surge-active');
            setTimeout(() => {
                if (!this.isDestroyed) {
                    this.container.classList.remove('surge-active');
                }
            }, 260);

            // Bold horizontal strike hugging top edge end-to-end
            this.bolts.push(this._createBolt(bLeft - 40, capTop, bRight + 40, capTop, 30, 0.6, true, 7, -1, 'surge'));

            // Bold horizontal strike hugging bottom edge end-to-end
            this.bolts.push(this._createBolt(bLeft - 40, baseBottom, bRight + 40, baseBottom, 30, 0.6, true, 7, 1, 'surge'));

            // 2-3 diagonal crossing electrical arcs
            const crossingCount = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < crossingCount; i++) {
                const sX = bLeft + Math.random() * (bRight - bLeft) * 0.4;
                const eX = bRight - Math.random() * (bRight - bLeft) * 0.4;
                const sY = i % 2 === 0 ? capTop : baseBottom;
                const eY = i % 2 === 0 ? baseBottom : capTop;
                this.bolts.push(this._createBolt(sX, sY, eX, eY, 34, 0.62, true, 7, 0, 'surge'));
            }

            // Burst of vibrant sparks around the center and edges
            this._spawnSparks((bLeft + bRight) * 0.5, (capTop + baseBottom) * 0.5, 12);
            this._spawnSparks(bLeft, capTop, 6);
            this._spawnSparks(bRight, baseBottom, 6);
        }

        _spawnSparks(x, y, count = 3) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.4 + Math.random() * 4.2;
                this.sparks.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0,
                    maxLife: 10 + Math.floor(Math.random() * 15),
                    size: 1.2 + Math.random() * 2.2
                });
            }
        }

        _scheduleNextSurge() {
            if (this.isDestroyed) return;
            const delay = this.options.strikeIntervalMin +
                Math.random() * (this.options.strikeIntervalMax - this.options.strikeIntervalMin);

            this.strikeTimeout = setTimeout(() => {
                this._triggerSurgeStrike();
                this._scheduleNextSurge();
            }, delay);
        }

        _clearCanvas() {
            if (!this.ctx || !this.canvas) return;
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }

        _render() {
            if (this.isDestroyed) return;

            if (!this.isVisible || this.reducedMotion) {
                this.animId = requestAnimationFrame(() => this._render());
                return;
            }

            const ctx = this.ctx;
            if (!ctx || !this.width || !this.height) {
                this.animId = requestAnimationFrame(() => this._render());
                return;
            }

            // Periodically refresh text bounds in case of layout shift
            if (Math.random() < 0.02) {
                this._updateTextBounds();
            }

            // Count bolts per type
            let topCount = 0;
            let bottomCount = 0;
            let bridgeCount = 0;
            for (const b of this.bolts) {
                if (b.boltType === 'top') topCount++;
                else if (b.boltType === 'bottom') bottomCount++;
                else if (b.boltType === 'bridge') bridgeCount++;
            }

            // Maintain continuous crackle on top, bottom, and bridge
            while (topCount < this.options.minTopBolts) {
                this._spawnTopArc();
                topCount++;
            }
            while (bottomCount < this.options.minBottomBolts) {
                this._spawnBottomArc();
                bottomCount++;
            }
            while (bridgeCount < this.options.minBridgeBolts) {
                this._spawnBridgeArc();
                bridgeCount++;
            }

            this._clearCanvas();

            ctx.save();
            ctx.scale(this.dpr, this.dpr);
            ctx.globalCompositeOperation = 'lighter'; // Additive blending for electric plasma glow
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Soft electric blue aura band behind text letters
            const b = this.bounds;
            if (b.width > 0) {
                const glowGrad = ctx.createRadialGradient(
                    (b.left + b.right) * 0.5, b.centerY, 10,
                    (b.left + b.right) * 0.5, b.centerY, b.width * 0.55
                );
                glowGrad.addColorStop(0, 'rgba(0, 150, 255, 0.14)');
                glowGrad.addColorStop(0.5, 'rgba(0, 80, 255, 0.07)');
                glowGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = glowGrad;
                ctx.fillRect(b.left - 60, b.top - 30, b.width + 120, b.height + 60);
            }

            // 1. Draw lightning bolts with 3 distinct glow passes
            for (let i = this.bolts.length - 1; i >= 0; i--) {
                const bolt = this.bolts[i];
                bolt.life++;
                const progress = bolt.life / bolt.maxLife;
                const flicker = 0.76 + Math.random() * 0.24;
                const alpha = Math.max(0, (1.0 - progress) * flicker);

                if (bolt.life >= bolt.maxLife || alpha <= 0.01) {
                    this.bolts.splice(i, 1);
                    continue;
                }

                // Pass A: Deep Electric Blue Broad Glow
                ctx.strokeStyle = `rgba(0, 75, 255, ${alpha * 0.45})`;
                ctx.shadowColor = '#0055ff';
                ctx.shadowBlur = bolt.isSurge ? 32 : 20;
                ctx.lineWidth = bolt.isSurge ? 12 : 7;
                ctx.beginPath();
                for (const seg of bolt.segments) {
                    const jx = (Math.random() - 0.5) * 1.5;
                    const jy = (Math.random() - 0.5) * 1.5;
                    ctx.moveTo(seg.x1 + jx, seg.y1 + jy);
                    ctx.lineTo(seg.x2 + jx, seg.y2 + jy);
                }
                ctx.stroke();

                // Pass B: Intense Cyan Glowing Sheath
                ctx.strokeStyle = `rgba(0, 230, 255, ${alpha * 0.9})`;
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = bolt.isSurge ? 14 : 9;
                ctx.lineWidth = bolt.isSurge ? 4.5 : 2.8;
                ctx.beginPath();
                for (const seg of bolt.segments) {
                    ctx.moveTo(seg.x1, seg.y1);
                    ctx.lineTo(seg.x2, seg.y2);
                }
                ctx.stroke();

                // Pass C: White-Hot Plasma Core
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                ctx.lineWidth = bolt.isSurge ? 1.8 : 1.1;
                ctx.beginPath();
                for (const seg of bolt.segments) {
                    ctx.moveTo(seg.x1, seg.y1);
                    ctx.lineTo(seg.x2, seg.y2);
                }
                ctx.stroke();
            }

            // 2. Draw Sparks
            for (let s = this.sparks.length - 1; s >= 0; s--) {
                const sp = this.sparks[s];
                sp.life++;
                sp.x += sp.vx;
                sp.y += sp.vy;
                sp.vy += 0.05; // gravity
                sp.vx *= 0.96; // air drag

                const progress = sp.life / sp.maxLife;
                const alpha = Math.max(0, 1.0 - progress);

                if (sp.life >= sp.maxLife) {
                    this.sparks.splice(s, 1);
                    continue;
                }

                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 8;
                ctx.fillStyle = `rgba(225, 250, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, sp.size * (1 - progress * 0.4), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            this.animId = requestAnimationFrame(() => this._render());
        }

        _startAnimation() {
            if (this.animId) cancelAnimationFrame(this.animId);
            this.animId = requestAnimationFrame(() => this._render());
        }

        /**
         * Clean up all event listeners, observers, timers and animation loops
         */
        destroy() {
            this.isDestroyed = true;
            if (this.animId) cancelAnimationFrame(this.animId);
            if (this.strikeTimeout) clearTimeout(this.strikeTimeout);
            if (this.resizeObserver) this.resizeObserver.disconnect();
            if (this.intersectionObserver) this.intersectionObserver.disconnect();

            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (mediaQuery.removeEventListener && this._motionListener) {
                mediaQuery.removeEventListener('change', this._motionListener);
            }

            this.bolts = [];
            this.sparks = [];
            this._clearCanvas();
            this.container.innerHTML = '';
        }

        /**
         * Auto-initialize on any matching DOM elements
         */
        static initAll(selector = '#DepartmentECEHeading, [data-department-ece-heading]') {
            const elements = document.querySelectorAll(selector);
            const instances = [];
            elements.forEach((el) => {
                if (!el._deptEceHeadingInstance) {
                    const inst = new DepartmentECEHeading(el);
                    el._deptEceHeadingInstance = inst;
                    instances.push(inst);
                }
            });
            return instances;
        }
    }

    // Auto-init on DOMContentLoaded if element exists
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                DepartmentECEHeading.initAll();
            });
        } else {
            DepartmentECEHeading.initAll();
        }
    }

    global.DepartmentECEHeading = DepartmentECEHeading;

})(typeof window !== 'undefined' ? window : this);
