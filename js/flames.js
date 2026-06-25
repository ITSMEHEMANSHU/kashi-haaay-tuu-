class FlameSystem {
    constructor(canvas, ctx, isMobile = false, displayWidth, displayHeight) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.blueFlickers = [];
        this.steamParticles = [];
        this.flameSources = [];
        this.isStorm = true;
        this.colorShift = 0;
        this.isMobile = isMobile;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.yBase = displayHeight;
        
        this.initFlameSources();
    }
    
    initFlameSources() {
        this.flameSources = [];
        const sourceCount = this.isMobile ? 6 : 8;
        const spacing = this.displayWidth / sourceCount;
        
        for (let i = 0; i < sourceCount; i++) {
            this.flameSources.push({
                x: spacing * i + spacing / 2 + (Math.random() * 40 - 20),
                intensity: 0.5 + Math.random() * 0.5,
                height: 0.5 + Math.random() * 0.5,
                width: 20 + Math.random() * 60
            });
        }
    }

    resize() {
        this.displayWidth = window.innerWidth;
        this.displayHeight = window.innerHeight;
        this.yBase = this.displayHeight;
        this.initFlameSources();
    }

    addParticle(source) {
        let size;
        let decayRate;
        
        if (this.isMobile) {
            // Mobile uses slightly larger particles to maintain thick texture with fewer total particles
            let r = Math.random();
            if (r < 0.3) size = Math.random() * 12 + 6;
            else if (r < 0.7) size = Math.random() * 25 + 12;
            else size = Math.random() * 45 + 25;
            
            // Slightly faster decay on mobile naturally manages array size without CPU-heavy array shifting
            decayRate = Math.random() * 0.016 + 0.01; 
        } else {
            let r = Math.random();
            if (r < 0.3) size = Math.random() * 10 + 5;
            else if (r < 0.7) size = Math.random() * 20 + 10;
            else size = Math.random() * 35 + 25;
            
            decayRate = Math.random() * 0.012 + 0.006;
        }
        
        this.particles.push({
            x: source.x + (Math.random() - 0.5) * source.width,
            y: this.yBase + Math.random() * 5,
            vx: (Math.random() - 0.5) * 0.6,
            vy: Math.random() * -2 - 1.5 * source.height,
            life: 1,
            decay: decayRate,
            size: size,
            sourceIntensity: source.intensity
        });
    }

    addBlueFlicker(source) {
        if (this.isMobile) return; 
        
        this.blueFlickers.push({
            x: source.x + (Math.random() - 0.5) * 20,
            y: this.yBase - Math.random() * 15,
            life: 1,
            decay: 0.08 + Math.random() * 0.12,
            size: 2 + Math.random() * 6,
            vx: (Math.random() - 0.5) * 0.3,
            vy: Math.random() * -0.5 - 0.3
        });
    }

    addSteam(x, y) {
        if (this.isMobile) return; 
        
        this.steamParticles.push({
            x: x, y: y,
            life: 1,
            decay: 0.02 + Math.random() * 0.03,
            size: 3 + Math.random() * 8,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * -0.5 - 0.5
        });
    }

    transitionToSteady() {
        this.isStorm = false;
        gsap.to(this, { colorShift: 1, duration: 4, ease: "power2.inOut" });
    }

    draw(intensityMultiplier = 1) {
        if (!intensityMultiplier) intensityMultiplier = 1;
        
        for (let source of this.flameSources) {
            // FRACTIONAL SPAWNING: Fixes the bug where flames vanished during the rain
            let baseRate = this.isStorm ? (this.isMobile ? 1.5 : 4) : (this.isMobile ? 2.5 : 7);
            let targetSpawn = baseRate * intensityMultiplier;
            let count = Math.floor(targetSpawn);
            
            // Decimal remainder gives a % chance to spawn an extra particle
            if (Math.random() < (targetSpawn - count)) count++;
            
            for (let i = 0; i < count; i++) {
                if (Math.random() < source.intensity) {
                    this.addParticle(source);
                }
            }
            
            if (!this.isMobile && this.isStorm && Math.random() < 0.08) {
                this.addBlueFlicker(source);
            }
            
            if (!this.isMobile && this.isStorm && Math.random() < 0.25) {
                let steamX = source.x + (Math.random() - 0.5) * source.width;
                let steamY = this.yBase + Math.random() * 20;
                this.addSteam(steamX, steamY);
            }
        }

        this.ctx.globalCompositeOperation = 'screen';
        
        if (!this.isMobile) {
            this.drawSteam();
        }
        
        this.drawMainFlames(intensityMultiplier);
        
        if (!this.isMobile && this.isStorm) {
            this.drawBlueFlickers();
        }
        
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawSteam() {
        for (let i = 0; i < this.steamParticles.length; i++) {
            let s = this.steamParticles[i];
            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;
            
            if (s.life <= 0) {
                this.steamParticles.splice(i, 1);
                i--;
                continue;
            }
            
            let gradient = this.ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size);
            gradient.addColorStop(0, `rgba(200, 210, 220, ${s.life * 0.15})`);
            gradient.addColorStop(1, `rgba(200, 210, 220, 0)`);
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawBlueFlickers() {
        for (let i = 0; i < this.blueFlickers.length; i++) {
            let bf = this.blueFlickers[i];
            bf.x += bf.vx;
            bf.y += bf.vy;
            bf.life -= bf.decay;
            
            if (bf.life <= 0) {
                this.blueFlickers.splice(i, 1);
                i--;
                continue;
            }
            
            let gradient = this.ctx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.size);
            gradient.addColorStop(0, `rgba(150, 200, 255, ${bf.life * 0.8})`);
            gradient.addColorStop(0.5, `rgba(100, 160, 255, ${bf.life * 0.3})`);
            gradient.addColorStop(1, `rgba(50, 100, 255, 0)`);
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(bf.x, bf.y, bf.size * bf.life, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

drawMainFlames(intensityMultiplier) {
        // CPU INTENSIVE ARRAY SHIFT LOOP COMPLETELY REMOVED.
        // Particles decay naturally, creating 0 lag.
        
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            if (this.isStorm) {
                p.vx += (Math.random() - 0.5) * 0.8;
                p.decay += (Math.random() * 0.005);
            } else {
                p.vx += (Math.random() - 0.5) * 0.2;
            }

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0 || p.y < -50) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }

            let r, g, b;

            // --- THE FIX: RESTORED STRICT BLUE/ORANGE SPLIT ---
            let rStorm, gStorm, bStorm;
            if (p.life > 0.75) {
                // Bottom 25% (touching ground): Deep Orange
                rStorm = 255; gStorm = 120; bStorm = 20;
            } else {
                // Top 75%: Cinematic Blue
                rStorm = 10; gStorm = 120; bStorm = 255;
            }

            // SUN PHASE: Standard fire
            let rSun, gSun, bSun;
            if (p.life > 0.7) {
                rSun = 255; gSun = 240; bSun = 100;
            } else if (p.life > 0.5) {
                rSun = 255; gSun = 130; bSun = 15;
            } else if (p.life > 0.25) {
                rSun = 230; gSun = 40; bSun = 5;
            } else {
                rSun = 180; gSun = 15; bSun = 0;
            }

            // Interpolate colors based on weather transition
            r = Math.round(rStorm + (rSun - rStorm) * this.colorShift);
            g = Math.round(gStorm + (gSun - gStorm) * this.colorShift);
            b = Math.round(bStorm + (bSun - bStorm) * this.colorShift);

            let baseOpacity = this.isStorm ? 0.7 : 0.85;
            let visualIntensity = 0.5 + (0.5 * intensityMultiplier);
            let opacity = p.life * baseOpacity * visualIntensity;
            
            // Draw realistic gradient texture for both Mobile and Desktop
            this.ctx.beginPath();
            let gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life);
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacity})`);
            gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${opacity * 0.5})`);
            gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${opacity * 0.15})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}