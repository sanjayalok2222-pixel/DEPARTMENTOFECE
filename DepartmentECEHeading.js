/**
 * DepartmentECEHeading.js
 * Premium Animated Heading Component with Procedural Real-Time Electrical Discharge Lightning.
 * 
 * Animation Architecture:
 * - Natural High-Voltage Strike Lifecycle:
 *   IDLE (clean dark state, 1.6s - 3.8s, canvas 100% blank)
 *   -> STRIKE PROPAGATION (fast jagged path drawing 100ms - 180ms)
 *   -> INTENSE WHITE-BLUE PEAK FLASH (70ms - 120ms, text edge highlight & ambient bloom)
 *   -> RAPID FADE & DISINTEGRATION (140ms - 220ms)
 *   -> COMPLETE DISAPPEARANCE (canvas 100% cleared, zero residual lines)
 * - 3-Layer Electric Rendering:
 *   Layer 1: Sharp white-hot core (1.8px, #ffffff)
 *   Layer 2: Vivid electric blue body (4.0px, #00e5ff)
 *   Layer 3: Soft cyan-blue glow (10px, #0055ff, blur 28px)
 * - 5 Distinct Strike Patterns:
 *   Pattern A: Horizontal arc behind text
 *   Pattern B: Top-Left to Center
 *   Pattern C: Center to Bottom-Right
 *   Pattern D: High-voltage strike near ECE
 *   Pattern E: Massive full-span branching strike
 * - Click-to-strike interactive support
 * - Occasional realistic double-strike
 * - Clean lifecycle management & accessibility (prefers-reduced-motion)
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
                idleMin: 1600, // ms between strikes
                idleMax: 3800
            }, options);

            this.currentStrike = null;
            this.animId = null;
            this.nextStrikeTimer = null;
            this.isDestroyed = false;
            this.isVisible = true;
            this.reducedMotion = false;
            this.width = 600;
            this.height = 180;
            this.dpr = 1;

            // Bounding boxes
            this.bounds = { left: 50, right: 550, top: 40, bottom: 140, width: 500, height: 100, centerY: 90 };
            this.eceBounds = { left: 400, right: 550, top: 40, bottom: 140, width: 150, height: 100 };
            this.deptBounds = { left: 50, right: 380, top: 40, bottom: 140, width: 330, height: 100 };

            this._initDOM();
            this._initCanvas();
            this._checkReducedMotion();
            this._initIntersectionObserver();
            this._initInteractiveClick();

            if (!this.reducedMotion) {
                this._scheduleNextStrike(600); // Initial strike shortly after load
            }
        }

        _initDOM() {
            this.container.classList.add('dept-ece-heading-container');

            // Ambient background glow flare
            this.ambient = document.createElement('div');
            this.ambient.className = 'dept-ece-heading-ambient';

            // Canvas for procedural dynamic lightning
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
            this.wordDept.setAttribute('data-text', this.options.textDept);

            this.wordEce = document.createElement('span');
            this.wordEce.className = 'dept-ece-word-ece';
            this.wordEce.textContent = this.options.textEce;
            this.wordEce.setAttribute('data-text', this.options.textEce);

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

        _initInteractiveClick() {
            // Clicking the heading immediately triggers a high-voltage strike
            this._clickHandler = () => {
                this.triggerStrike();
            };
            this.container.addEventListener('click', this._clickHandler);
        }

        _resizeCanvas() {
            if (!this.canvas || !this.container) return;
            const rect = this.canvas.getBoundingClientRect();
            const width = Math.max(rect.width, 360);
            const height = Math.max(rect.height, 140);

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
            const canvasRect = this.canvas.getBoundingClientRect();
            if (canvasRect.width === 0 || canvasRect.height === 0) return;

            const titleRect = this.title.getBoundingClientRect();
            const left = ((titleRect.left - canvasRect.left) / canvasRect.width) * this.width;
            const right = ((titleRect.right - canvasRect.left) / canvasRect.width) * this.width;
            const top = ((titleRect.top - canvasRect.top) / canvasRect.height) * this.height;
            const bottom = ((titleRect.bottom - canvasRect.top) / canvasRect.height) * this.height;

            this.bounds = {
                left,
                right,
                top,
                bottom,
                width: Math.max(100, right - left),
                height: Math.max(40, bottom - top),
                centerY: (top + bottom) * 0.5
            };

            if (this.wordDept) {
                const dRect = this.wordDept.getBoundingClientRect();
                this.deptBounds = {
                    left: ((dRect.left - canvasRect.left) / canvasRect.width) * this.width,
                    right: ((dRect.right - canvasRect.left) / canvasRect.width) * this.width,
                    top: ((dRect.top - canvasRect.top) / canvasRect.height) * this.height,
                    bottom: ((dRect.bottom - canvasRect.top) / canvasRect.height) * this.height
                };
            }

            if (this.wordEce) {
                const eRect = this.wordEce.getBoundingClientRect();
                this.eceBounds = {
                    left: ((eRect.left - canvasRect.left) / canvasRect.width) * this.width,
                    right: ((eRect.right - canvasRect.left) / canvasRect.width) * this.width,
                    top: ((eRect.top - canvasRect.top) / canvasRect.height) * this.height,
                    bottom: ((eRect.bottom - canvasRect.top) / canvasRect.height) * this.height
                };
            }
        }

        _checkReducedMotion() {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.reducedMotion = mediaQuery.matches;
            this._motionListener = (e) => {
                this.reducedMotion = e.matches;
                if (this.reducedMotion) {
                    this._cancelCurrentStrike();
                    this._clearCanvas();
                } else {
                    this._scheduleNextStrike(800);
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
                    if (!this.isVisible) {
                        this._cancelCurrentStrike();
                        this._clearCanvas();
                    } else if (!this.currentStrike && !this.nextStrikeTimer && !this.reducedMotion) {
                        this._scheduleNextStrike(400);
                    }
                }
            }, { threshold: 0.05 });

            this.intersectionObserver.observe(this.container);
        }

        /**
         * Generate a chaotic, jagged electrical path with sharp irregular angles
         */
        _generateJaggedPath(x1, y1, x2, y2, segmentsCount, roughness) {
            const points = [{ x: x1, y: y1 }];
            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.hypot(dx, dy);
            if (dist < 5) return points;

            const nx = -dy / dist;
            const ny = dx / dist;

            for (let i = 1; i < segmentsCount; i++) {
                const t = i / segmentsCount;
                const bx = x1 + dx * t;
                const by = y1 + dy * t;
                const envelope = Math.sin(t * Math.PI);
                const disp = (Math.random() - 0.5) * (dist * roughness) * envelope;
                const jitterX = (Math.random() - 0.5) * 5;
                const jitterY = (Math.random() - 0.5) * 5;

                points.push({
                    x: bx + nx * disp + jitterX,
                    y: by + ny * disp + jitterY
                });
            }
            points.push({ x: x2, y: y2 });
            return points;
        }

        /**
         * Builds a complete electrical strike with main trunk and 2-6 jagged branching forks
         */
        _createStrikeData() {
            const w = Math.max(this.width, 360);
            const h = Math.max(this.height, 140);
            this._updateTextBounds();

            const b = this.bounds;
            const bLeft = b.width > 0 ? b.left : w * 0.15;
            const bRight = b.width > 0 ? b.right : w * 0.85;
            const bTop = b.height > 0 ? b.top : h * 0.35;
            const bBottom = b.height > 0 ? b.bottom : h * 0.65;
            const bCenterY = (bTop + bBottom) * 0.5;

            // 5 distinct strike patterns
            const patterns = ['A', 'B', 'C', 'D', 'E'];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];

            let startX, startY, endX, endY, segmentsCount, roughness;
            let targetArea = 'general';

            switch (pattern) {
                case 'A': // Horizontal arc behind text
                    startX = bLeft - 25 - Math.random() * 35;
                    endX = bRight + 25 + Math.random() * 35;
                    startY = bCenterY + (Math.random() - 0.5) * 25;
                    endY = bCenterY + (Math.random() - 0.5) * 25;
                    segmentsCount = 18 + Math.floor(Math.random() * 8);
                    roughness = 0.44;
                    break;

                case 'B': // Top-left to center
                    startX = bLeft + Math.random() * (b.width * 0.3);
                    startY = Math.max(10, bTop - 50 - Math.random() * 35);
                    endX = bLeft + b.width * (0.35 + Math.random() * 0.25);
                    endY = bCenterY + (Math.random() - 0.5) * 20;
                    segmentsCount = 14 + Math.floor(Math.random() * 6);
                    roughness = 0.48;
                    targetArea = 'dept';
                    break;

                case 'C': // Center to bottom-right
                    startX = bLeft + b.width * (0.35 + Math.random() * 0.25);
                    startY = bCenterY + (Math.random() - 0.5) * 20;
                    endX = bRight + 20 + Math.random() * 35;
                    endY = Math.min(h - 10, bBottom + 35 + Math.random() * 35);
                    segmentsCount = 15 + Math.floor(Math.random() * 6);
                    roughness = 0.46;
                    targetArea = 'ece';
                    break;

                case 'D': // High-voltage short strike directly striking near ECE
                    const eb = this.eceBounds.width > 0 ? this.eceBounds : { left: bRight - 160, right: bRight, top: bTop, bottom: bBottom, width: 160 };
                    startX = eb.left + Math.random() * eb.width;
                    startY = Math.max(10, eb.top - 45 - Math.random() * 35);
                    endX = eb.left + Math.random() * eb.width;
                    endY = Math.min(h - 10, eb.bottom + 30 + Math.random() * 30);
                    segmentsCount = 12 + Math.floor(Math.random() * 6);
                    roughness = 0.54;
                    targetArea = 'ece';
                    break;

                case 'E': // Large dramatic branching strike crossing behind entire heading
                default:
                    startX = bLeft - 45 + Math.random() * 40;
                    startY = Math.max(10, bTop - 40 - Math.random() * 30);
                    endX = bRight + 35 + Math.random() * 45;
                    endY = Math.min(h - 10, bBottom + 30 + Math.random() * 40);
                    segmentsCount = 22 + Math.floor(Math.random() * 8);
                    roughness = 0.50;
                    targetArea = 'full';
                    break;
            }

            // 1. Generate Main Jagged Trunk
            const mainPoints = this._generateJaggedPath(startX, startY, endX, endY, segmentsCount, roughness);

            // 2. Generate 3 to 7 natural branching paths
            const branches = [];
            const branchCount = 3 + Math.floor(Math.random() * 5);
            const totalMain = mainPoints.length;

            for (let bIdx = 0; bIdx < branchCount; bIdx++) {
                const originIdx = 1 + Math.floor(Math.random() * (totalMain - 2));
                const origin = mainPoints[originIdx];
                const nextPt = mainPoints[originIdx + 1] || mainPoints[originIdx];

                const mainDx = nextPt.x - origin.x;
                const mainDy = nextPt.y - origin.y;
                const mainAngle = Math.atan2(mainDy, mainDx);

                const forkSide = Math.random() > 0.5 ? 1 : -1;
                const forkAngle = mainAngle + forkSide * (0.45 + Math.random() * 0.6);
                const forkLen = 30 + Math.random() * 75;

                const branchEndX = origin.x + Math.cos(forkAngle) * forkLen;
                const branchEndY = origin.y + Math.sin(forkAngle) * forkLen;

                const branchPts = this._generateJaggedPath(
                    origin.x, origin.y,
                    branchEndX, branchEndY,
                    6 + Math.floor(Math.random() * 5),
                    0.54
                );

                branches.push({
                    originIndex: originIdx,
                    points: branchPts
                });
            }

            // Timing characteristics for this strike
            const growDuration = 100 + Math.random() * 60; // 100ms - 160ms (propagation)
            const flashDuration = 60 + Math.random() * 45; // 60ms - 105ms (peak flash hold)
            const fadeDuration = 140 + Math.random() * 90; // 140ms - 230ms (rapid fade)

            return {
                pattern,
                targetArea,
                mainPoints,
                branches,
                growDuration,
                flashDuration,
                fadeDuration,
                totalDuration: growDuration + flashDuration + fadeDuration,
                startTime: performance.now(),
                hasFlashed: false
            };
        }

        _startStrike() {
            if (this.isDestroyed || this.reducedMotion) return;
            if (!this.isVisible) {
                this._scheduleNextStrike(600);
                return;
            }

            this.currentStrike = this._createStrikeData();
            if (!this.currentStrike) {
                this._scheduleNextStrike(600);
                return;
            }

            if (!this.animId) {
                this.animId = requestAnimationFrame((ts) => this._render(ts));
            }
        }

        _triggerPeakFlash(targetArea) {
            // Brief ambient pulse
            this.container.classList.add('strike-active');
            setTimeout(() => {
                if (!this.isDestroyed) this.container.classList.remove('strike-active');
            }, 120);

            // Text interactions
            if (targetArea === 'ece' || targetArea === 'full') {
                this.wordEce.classList.add('electrified');
                setTimeout(() => {
                    if (!this.isDestroyed) this.wordEce.classList.remove('electrified');
                }, 160);
            }

            if (targetArea === 'dept' || targetArea === 'full') {
                this.wordDept.classList.add('electrified');
                setTimeout(() => {
                    if (!this.isDestroyed) this.wordDept.classList.remove('electrified');
                }, 130);
            }
        }

        _clearCanvas() {
            if (!this.ctx || !this.canvas) return;
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        }

        _render(now) {
            if (this.isDestroyed) return;

            if (!this.isVisible || this.reducedMotion) {
                this._clearCanvas();
                this.animId = null;
                return;
            }

            const strike = this.currentStrike;
            if (!strike) {
                this._clearCanvas();
                this.animId = null;
                return;
            }

            const elapsed = now - strike.startTime;

            // STRIKE FINISHED: Completely clear canvas and return to clean dark state!
            if (elapsed >= strike.totalDuration) {
                this._clearCanvas();
                this.currentStrike = null;
                this.animId = null;

                // Occasional quick secondary double-strike (30% chance after 140ms)
                if (Math.random() < 0.3) {
                    this._scheduleNextStrike(140 + Math.random() * 90);
                } else {
                    this._scheduleNextStrike();
                }
                return;
            }

            const ctx = this.ctx;
            this._clearCanvas();

            ctx.save();
            ctx.scale(this.dpr, this.dpr);
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            let alpha = 1.0;
            let progressFraction = 1.0;

            if (elapsed < strike.growDuration) {
                // Phase 1: Rapid Jagged Stepped Propagation
                progressFraction = Math.max(0.1, elapsed / strike.growDuration);
                alpha = 0.9 + Math.random() * 0.1;
            } else if (elapsed < strike.growDuration + strike.flashDuration) {
                // Phase 2: Intense Peak Flash
                progressFraction = 1.0;
                alpha = 0.95 + Math.random() * 0.05;

                if (!strike.hasFlashed) {
                    strike.hasFlashed = true;
                    this._triggerPeakFlash(strike.targetArea);
                }
            } else {
                // Phase 3: Rapid Fade & Disappearance
                const fadeElapsed = elapsed - (strike.growDuration + strike.flashDuration);
                const fadeProgress = fadeElapsed / strike.fadeDuration;
                alpha = Math.max(0, (1.0 - fadeProgress) * (0.8 + Math.random() * 0.2));
                progressFraction = 1.0;
            }

            if (alpha > 0.02) {
                const totalMainPts = strike.mainPoints.length;
                const visibleMainCount = Math.max(2, Math.floor(totalMainPts * progressFraction));

                // Micro-jitter to simulate live electrical vibration
                const jx = (Math.random() - 0.5) * 1.8;
                const jy = (Math.random() - 0.5) * 1.8;

                const tracePath = (pts, count) => {
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x + jx, pts[0].y + jy);
                    for (let i = 1; i < count; i++) {
                        ctx.lineTo(pts[i].x + jx, pts[i].y + jy);
                    }
                };

                const traceAll = () => {
                    tracePath(strike.mainPoints, visibleMainCount);
                    ctx.stroke();

                    for (const br of strike.branches) {
                        if (visibleMainCount >= br.originIndex) {
                            const brVisible = Math.max(2, Math.floor(br.points.length * progressFraction));
                            tracePath(br.points, brVisible);
                            ctx.stroke();
                        }
                    }
                };

                // LAYER 3 — SOFT CYAN-BLUE OUTER GLOW
                ctx.strokeStyle = `rgba(0, 102, 255, ${alpha * 0.45})`;
                ctx.lineWidth = 10;
                ctx.shadowColor = '#0055ff';
                ctx.shadowBlur = 28;
                traceAll();

                // LAYER 2 — VIVID ELECTRIC BLUE BODY
                ctx.strokeStyle = `rgba(0, 235, 255, ${alpha * 0.95})`;
                ctx.lineWidth = 4.0;
                ctx.shadowColor = '#00e5ff';
                ctx.shadowBlur = 12;
                traceAll();

                // LAYER 1 — SHARP WHITE-HOT PLASMA CORE
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
                ctx.lineWidth = 1.8;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 4;
                traceAll();
            }

            ctx.restore();

            this.animId = requestAnimationFrame((ts) => this._render(ts));
        }

        _scheduleNextStrike(customDelay) {
            if (this.isDestroyed || this.reducedMotion) return;
            if (this.nextStrikeTimer) clearTimeout(this.nextStrikeTimer);

            const delay = typeof customDelay === 'number'
                ? customDelay
                : this.options.idleMin + Math.random() * (this.options.idleMax - this.options.idleMin);

            this.nextStrikeTimer = setTimeout(() => {
                this.nextStrikeTimer = null;
                this._startStrike();
            }, delay);
        }

        _cancelCurrentStrike() {
            if (this.nextStrikeTimer) {
                clearTimeout(this.nextStrikeTimer);
                this.nextStrikeTimer = null;
            }
            if (this.animId) {
                cancelAnimationFrame(this.animId);
                this.animId = null;
            }
            this.currentStrike = null;
            this.container.classList.remove('strike-active');
            if (this.wordDept) this.wordDept.classList.remove('electrified');
            if (this.wordEce) this.wordEce.classList.remove('electrified');
        }

        /**
         * Manually trigger a strike immediately (e.g. on click or external event)
         */
        triggerStrike() {
            this._cancelCurrentStrike();
            this._startStrike();
        }

        destroy() {
            this.isDestroyed = true;
            this._cancelCurrentStrike();
            if (this._clickHandler) {
                this.container.removeEventListener('click', this._clickHandler);
            }
            if (this.resizeObserver) this.resizeObserver.disconnect();
            if (this.intersectionObserver) this.intersectionObserver.disconnect();

            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            if (mediaQuery.removeEventListener && this._motionListener) {
                mediaQuery.removeEventListener('change', this._motionListener);
            }

            this._clearCanvas();
            this.container.innerHTML = '';
        }

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
            if (instances.length > 0 && typeof window !== 'undefined') {
                window.deptEceHeading = instances[0];
            }
            return instances;
        }
    }

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
