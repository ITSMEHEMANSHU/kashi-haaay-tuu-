const canvas = document.getElementById('sceneCanvas');
const ctx = canvas.getContext('2d');

let weather, flames, typewriter;
let isMobile = false;
let dpr = 1;

function detectMobile() {
    isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth < 768;
    dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
}

function resizeCanvas() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
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

    // Pass mobile flag for optimization
    weather = new WeatherSystem(canvas, ctx, isMobile);
    flames = new FlameSystem(canvas, ctx, isMobile);
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
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    
    weather.draw();
    flames.draw();

    requestAnimationFrame(animate);
}

window.onload = init;