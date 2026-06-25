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
        // Same number of sources for mobile, just spread across screen width
        const sourceCount = 8;
        
        for (let i = 0; i < sourceCount; i++) {
            this.flameSources.push({
                x: (this.displayWidth / sourceCount) * i + (Math.random() * 60 - 30),
                intensity: 0.5 + Math.random() * 0.5,
                height: 0.5 + Math.random() * 0.5,
                width: 20 + Math.random() * 80
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
        let sizeVariation = Math.random();
        let size;
        if (sizeVariation < 0.3) {
            size = Math.random() * 10 + 5;
        } else if (sizeVariation < 0.7) {
            size = Math.random() * 20 + 10;
        } else {
            size = Math.random() * 35 + 25;
        }
        
        this.particles.push({
            x: source.x + (Math.random() - 0.5) * source.width,
            y: this.yBase + Math.random() * 5,
            vx: (Math.random() - 0.5) * 0.6,
            vy: Math.random() * -2 - 1.5 * source.height,
            life: 1,
            decay: Math.random() * 0.012 + 0.006,
            size: size,
            sourceIntensity: source.intensity
        });
    }

    addBlueFlicker(source) {
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
        this.steamParticles.push({
            x: x,
            y: y,
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
        
        const baseCount = this.isStorm ? 4 : 7;
        const count = Math.floor(baseCount * intensityMultiplier);
        
        for (let source of this.flameSources) {
            for (let i = 0; i < count; i++) {
                if (Math.random() < source.intensity * intensityMultiplier) {
                    this.addParticle(source);
                }
            }
            
            if (this.isStorm && Math.random() < 0.08) {
                this.addBlueFlicker(source);
            }
            
            if (this.isStorm && Math.random() < 0.25) {
                let steamX = source.x + (Math.random() - 0.5) * source.width;
                let steamY = this.yBase + Math.random() * 20;
                this.addSteam(steamX, steamY);
            }
        }

        this.ctx.globalCompositeOperation = 'screen';
        
        this.drawSteam();
        this.drawMainFlames(intensityMultiplier);
        
        if (this.isStorm) {
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
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            if (this.isStorm) {
                p.vx += (Math.random() - 0.5) * 0.8;
                p.decay = 0.015 + Math.random() * 0.01;
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

            let rStorm, gStorm, bStorm;
            if (p.life > 0.7) {
                rStorm = 255; gStorm = 180; bStorm = 40;
            } else if (p.life > 0.4) {
                rStorm = 230; gStorm = 110; bStorm = 20;
            } else {
                rStorm = 160; gStorm = 30; bStorm = 5;
            }

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

            r = Math.round(rStorm + (rSun - rStorm) * this.colorShift);
            g = Math.round(gStorm + (gSun - gStorm) * this.colorShift);
            b = Math.round(bStorm + (bSun - bStorm) * this.colorShift);

            let opacity = p.life * 0.55 * intensityMultiplier;
            if (!this.isStorm) {
                opacity = p.life * 0.85;
            }
            
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