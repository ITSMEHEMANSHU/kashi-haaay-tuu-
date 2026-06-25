class WeatherSystem {
    constructor(canvas, ctx, isMobile = false) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.raindrops = [];
        this.isRaining = true;
        this.stormIntensity = 1;
        this.sunGlow = 0;
        this.isMobile = isMobile;
        
        this.sky = {
            topR: 8, topG: 12, topB: 20,
            botR: 20, botG: 25, botB: 35
        };

        // MOBILE: Reduce rain count by 60%
        const dropCount = this.isMobile ? 200 : 500;
        
        for (let i = 0; i < dropCount; i++) {
            let dropType = Math.random();
            let thickness, length, speed, opacity;
            
            if (dropType < 0.3) {
                thickness = 0.3 + Math.random() * 0.5;
                length = 10 + Math.random() * 15;
                speed = 10 + Math.random() * 10;
                opacity = Math.random() * 0.1 + 0.05;
            } else if (dropType < 0.7) {
                thickness = 0.5 + Math.random() * 1;
                length = 20 + Math.random() * 25;
                speed = 15 + Math.random() * 15;
                opacity = Math.random() * 0.15 + 0.1;
            } else {
                thickness = 1 + Math.random() * 2;
                length = 30 + Math.random() * 40;
                speed = 22 + Math.random() * 18;
                opacity = Math.random() * 0.25 + 0.15;
            }
            
            this.raindrops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: speed,
                length: length,
                thickness: thickness,
                opacity: opacity
            });
        }
        
        // Cache gradient colors to avoid string concatenation every frame
        this.cachedRainColors = null;
        this.cachedSkyColors = null;
    }

    resize() {
        // Update all raindrop positions for new canvas size
        for (let drop of this.raindrops) {
            drop.x = Math.random() * this.canvas.width;
            drop.y = Math.random() * this.canvas.height;
        }
    }

    transitionToSun() {
        this.isRaining = false;
        
        gsap.to(this, { stormIntensity: 0, duration: 5, ease: "power2.inOut" });
        gsap.to(this, { sunGlow: 1, duration: 6, delay: 2, ease: "power2.inOut" });
        
        gsap.to(this.sky, {
            topR: 15, topG: 25, topB: 60,
            botR: 40, botG: 20, botB: 15,
            duration: 6,
            ease: "power2.inOut"
        });
    }

    draw() {
        const w = this.canvas.width / (window.devicePixelRatio || 1);
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Sky gradient
        let bgGradient = this.ctx.createLinearGradient(0, 0, 0, h);
        bgGradient.addColorStop(0, `rgb(${this.sky.topR}, ${this.sky.topG}, ${this.sky.topB})`);
        bgGradient.addColorStop(1, `rgb(${this.sky.botR}, ${this.sky.botG}, ${this.sky.botB})`);
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, w, h);

        // Sun - only if visible
        if (this.sunGlow > 0.01) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            
            let cx = w / 2;
            let cy = h * 0.4;
            
            let sunGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
            sunGrad.addColorStop(0, `rgba(255, 200, 100, ${this.sunGlow * 0.4})`);
            sunGrad.addColorStop(0.3, `rgba(255, 150, 50, ${this.sunGlow * 0.2})`);
            sunGrad.addColorStop(0.7, `rgba(255, 80, 20, ${this.sunGlow * 0.08})`);
            sunGrad.addColorStop(1, `rgba(255, 40, 10, 0)`);
            
            this.ctx.fillStyle = sunGrad;
            this.ctx.fillRect(0, 0, w, h);
            
            this.ctx.restore();
        }

        // Rain
        if (this.stormIntensity > 0.01) {
            this.ctx.save();
            // Use 'lighter' instead of 'screen' on mobile (better performance)
            this.ctx.globalCompositeOperation = this.isMobile ? 'lighter' : 'screen';
            
            const windAngle = 0.15;
            
            for (let i = 0; i < this.raindrops.length; i++) {
                let drop = this.raindrops[i];
                
                // Skip off-screen drops on mobile
                if (this.isMobile && (drop.y < -100 || drop.y > h + 100)) continue;
                
                let windX = Math.sin(windAngle) * drop.length * 0.3;
                
                // MOBILE: Use solid color instead of gradient for rain
                if (this.isMobile) {
                    this.ctx.strokeStyle = `rgba(190, 210, 240, ${drop.opacity * this.stormIntensity * 0.6})`;
                } else {
                    let gradient = this.ctx.createLinearGradient(
                        drop.x, drop.y,
                        drop.x + windX, drop.y + drop.length
                    );
                    gradient.addColorStop(0, `rgba(170, 195, 230, 0)`);
                    gradient.addColorStop(0.3, `rgba(180, 205, 240, ${drop.opacity * this.stormIntensity * 0.5})`);
                    gradient.addColorStop(0.7, `rgba(200, 220, 250, ${drop.opacity * this.stormIntensity * 0.8})`);
                    gradient.addColorStop(1, `rgba(220, 235, 255, ${drop.opacity * this.stormIntensity})`);
                    this.ctx.strokeStyle = gradient;
                }
                
                this.ctx.lineWidth = drop.thickness;
                this.ctx.beginPath();
                this.ctx.moveTo(drop.x, drop.y);
                this.ctx.lineTo(drop.x + windX, drop.y + drop.length);
                this.ctx.stroke();

                drop.y += drop.speed;

                if (drop.y > h) {
                    if (this.isRaining) {
                        drop.y = -drop.length - Math.random() * 80;
                        drop.x = Math.random() * w;
                    } else {
                        this.raindrops.splice(i, 1);
                        i--;
                    }
                }
            }
            
            this.ctx.restore();
        }

        // Vignette - skip on very low-end mobile
        if (!this.isMobile || this.sunGlow < 0.5) {
            let vignette = this.ctx.createRadialGradient(
                w / 2, h / 2, h * 0.3,
                w / 2, h / 2, h * 1.2
            );
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, `rgba(0,0,0,${0.7 - (this.sunGlow * 0.3)})`);
            this.ctx.fillStyle = vignette;
            this.ctx.fillRect(0, 0, w, h);
        }
    }
}