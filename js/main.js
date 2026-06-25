const canvas = document.getElementById('sceneCanvas');
const ctx = canvas.getContext('2d');

let weather, flames, typewriter;
let isMobile = false;
let dpr = 1;
let displayWidth, displayHeight;

function detectMobile() {
    isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth < 768;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
}

function resizeCanvas() {
    displayWidth = window.innerWidth;
    displayHeight = window.innerHeight;
    
    // Set canvas actual size (higher res for retina)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    
    // Set canvas display size
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // Reset transform and scale for retina
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    if (flames) flames.resize();
    if (weather) weather.resize();
}

function init() {
    detectMobile();
    resizeCanvas();
    
    window.addEventListener('resize', () => {
        detectMobile();
        resizeCanvas();
    });

    weather = new WeatherSystem(canvas, ctx, isMobile, displayWidth, displayHeight);
    flames = new FlameSystem(canvas, ctx, isMobile, displayWidth, displayHeight);
    typewriter = new Typewriter('textContainer');

    requestAnimationFrame(animate);

    setTimeout(() => {
        typewriter.type("SYSTEM CALIBRATION REQUIRED...\n\nANALYZING CURRENT TRAJECTORY.", 60, () => {
            weather.transitionToSun();
            flames.transitionToSteady();
        });
    }, 1500);
}

function animate() {
    // Clear using display dimensions
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    weather.draw();
    
    // Pass storm intensity for flame dampening
    let flameIntensity = 1;
    if (weather.isRaining && weather.stormIntensity > 0.5) {
        flameIntensity = 0.4;
    } else if (weather.stormIntensity > 0) {
        flameIntensity = 1 - (weather.stormIntensity * 0.6);
    }
    flames.draw(flameIntensity);

    requestAnimationFrame(animate);
}

window.onload = init;