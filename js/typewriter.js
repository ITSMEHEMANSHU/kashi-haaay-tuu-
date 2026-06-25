class Typewriter {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.typingInterval = null;
        this.currentTimeout = null;
    }

    // Type text with specific speed, then callback
    type(text, speed, onComplete) {
        this.clear();
        this.container.style.opacity = 1;
        let i = 0;
        let charCount = 0;
        
        this.typingInterval = setInterval(() => {
            if (i < text.length) {
                // Handle newlines properly
                if (text.charAt(i) === '\n') {
                    this.container.innerHTML += '<br>';
                } else {
                    this.container.innerHTML += text.charAt(i);
                }
                i++;
                charCount++;
                
                // Auto-scroll to bottom as text appears
                this.container.scrollTop = this.container.scrollHeight;
            } else {
                clearInterval(this.typingInterval);
                if (onComplete) onComplete();
            }
        }, speed);
    }

    // Show countdown timer
    showCountdown(seconds, onComplete) {
        this.clear();
        this.container.style.opacity = 1;
        this.container.style.fontSize = '3rem';
        this.container.style.fontWeight = '200';
        this.container.style.letterSpacing = '4px';
        
        let remaining = seconds;
        this.container.innerHTML = remaining;
        
        const countInterval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(countInterval);
                this.container.innerHTML = '';
                // Reset font styles for next text
                this.container.style.fontSize = '';
                this.container.style.fontWeight = '';
                this.container.style.letterSpacing = '';
                if (onComplete) onComplete();
            } else {
                this.container.innerHTML = remaining;
            }
        }, 1000);
    }

    // Fade out current text
    fadeOut(duration, onComplete) {
        gsap.to(this.container, {
            opacity: 0,
            duration: duration || 2,
            ease: "power2.inOut",
            onComplete: () => {
                this.container.innerHTML = '';
                if (onComplete) onComplete();
            }
        });
    }

    // Clear everything
    clear() {
        if (this.typingInterval) clearInterval(this.typingInterval);
        if (this.currentTimeout) clearTimeout(this.currentTimeout);
        this.container.innerHTML = '';
        this.container.style.opacity = 1;
    }

    // Full cleanup
    destroy() {
        this.clear();
        gsap.killTweensOf(this.container);
    }
}