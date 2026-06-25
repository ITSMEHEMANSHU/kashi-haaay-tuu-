class Typewriter {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    type(text, speed, onComplete) {
        this.container.innerHTML = '';
        this.container.style.opacity = 1;
        let i = 0;
        
        const typeInterval = setInterval(() => {
            this.container.innerHTML += text.charAt(i);
            i++;
            
            if (i >= text.length) {
                clearInterval(typeInterval);
                
                // Keep the text on screen for 2.5 seconds before fading
                setTimeout(() => {
                    this.fadeOut(onComplete);
                }, 2500); 
            }
        }, speed);
    }

    fadeOut(onComplete) {
        gsap.to(this.container, {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut",
            onComplete: onComplete
        });
    }
}