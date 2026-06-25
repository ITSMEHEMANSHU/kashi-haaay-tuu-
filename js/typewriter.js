class Typewriter {
    constructor(containerId, buttonId = 'nextButton') {
        this.container = document.getElementById(containerId);
        this.button = document.getElementById(buttonId);
        this.typingInterval = null;
        this.currentTimeout = null;
        this.onNextCallback = null;
        
        // Bind next button
        this.button.addEventListener('click', () => {
            this.hideButton();
            if (this.onNextCallback) {
                const callback = this.onNextCallback;
                this.onNextCallback = null;
                callback();
            }
        });
    }

    // Type text with specific speed
    type(text, speed, onComplete) {
        this.clear();
        this.hideButton();
        this.container.style.opacity = 1;
        let i = 0;
        
        this.typingInterval = setInterval(() => {
            if (i < text.length) {
                if (text.charAt(i) === '\n') {
                    this.container.innerHTML += '<br>';
                } else {
                    this.container.innerHTML += text.charAt(i);
                }
                i++;
                
                // Auto-scroll to bottom as text appears
                this.container.scrollTop = this.container.scrollHeight;
            } else {
                clearInterval(this.typingInterval);
                
                // Show Next button when typing completes
                this.showButton();
                
                if (onComplete) {
                    // Store callback, but don't execute until Next is clicked
                    this.onNextCallback = onComplete;
                }
            }
        }, speed);
    }

    // Show the Next button
    showButton() {
        this.button.classList.add('show');
    }

    // Hide the Next button
    hideButton() {
        this.button.classList.remove('show');
    }

    // Fade out current text
    fadeOut(duration, onComplete) {
        this.hideButton();
        gsap.to(this.container, {
            opacity: 0,
            duration: duration || 2,
            ease: "power2.inOut",
            onComplete: () => {
                this.container.innerHTML = '';
                this.container.style.opacity = 1;
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
        this.hideButton();
    }

    // Allow scrolling back up
    enableScroll() {
        this.container.style.pointerEvents = 'auto';
    }

    destroy() {
        this.clear();
        gsap.killTweensOf(this.container);
    }
}