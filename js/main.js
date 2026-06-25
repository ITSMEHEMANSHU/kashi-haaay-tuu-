const canvas = document.getElementById('sceneCanvas');
const ctx = canvas.getContext('2d');

let weather, flames, typewriter;
let isMobile = false;
let dpr = 1;
let displayWidth, displayHeight;
let textContainer;
let nextButton;
let bgMusic;
let musicToggle;

function detectMobile() {
    isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
               || window.innerWidth < 768;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
}

function resizeCanvas() {
    displayWidth = window.innerWidth;
    displayHeight = window.innerHeight;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    
    if (flames) flames.resize();
    if (weather) weather.resize();
}

function moveContainerForSun() {
    // Add sunMode class to move container up and button above flames
    if (textContainer) textContainer.classList.add('sunMode');
    if (nextButton) nextButton.classList.add('sunMode');
}

function moveContainerForRain() {
    // Remove sunMode class for rain sequence
    if (textContainer) textContainer.classList.remove('sunMode');
    if (nextButton) nextButton.classList.remove('sunMode');
}

function initAudio() {
    bgMusic = document.getElementById('bgMusic');
    musicToggle = document.getElementById('musicToggle');
    
    // Set start time to 2:30
    bgMusic.currentTime = 150; // 150 seconds = 2:30
    
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            musicToggle.textContent = '🔊';
            musicToggle.classList.remove('muted');
        }).catch(() => {
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('muted');
        });
    }
    
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicToggle.textContent = '🔊';
                musicToggle.classList.remove('muted');
            });
        } else {
            bgMusic.pause();
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('muted');
        }
    });
    
    // For mobile: play on first touch, also start at 2:30
    document.addEventListener('touchstart', () => {
        if (bgMusic.paused) {
            bgMusic.currentTime = 150;
            bgMusic.play().then(() => {
                musicToggle.textContent = '🔊';
                musicToggle.classList.remove('muted');
            }).catch(() => {});
        }
    }, { once: true });
}

function init() {
    detectMobile();
    resizeCanvas();
    
    textContainer = document.getElementById('textContainer');
    nextButton = document.getElementById('nextButton');
    
    initAudio();
    
    window.addEventListener('resize', () => {
        detectMobile();
        resizeCanvas();
    });

    weather = new WeatherSystem(canvas, ctx, isMobile, displayWidth, displayHeight);
    flames = new FlameSystem(canvas, ctx, isMobile, displayWidth, displayHeight);
    typewriter = new Typewriter('textContainer', 'nextButton');

    requestAnimationFrame(animate);

    startSequence();
}

function startSequence() {
    // Rain - container and button stay low
    moveContainerForRain();
    
    setTimeout(() => {
        typewriter.type(FIRST_MESSAGE, 45, () => {
            typewriter.fadeOut(1.5, () => {
                weather.transitionToSun();
                flames.transitionToSteady();
                
                // Sun - move container and button up
                moveContainerForSun();
                
                setTimeout(() => {
                    startSecondSequence();
                }, 7000);
            });
        });
    }, 1500);
}

function startSecondSequence() {
    typewriter.type(SECOND_MESSAGE_PART1, 50, () => {
        typewriter.fadeOut(1.5, () => {
            setTimeout(() => {
                typewriter.type(SECOND_MESSAGE_PART2, 50, () => {
                    typewriter.fadeOut(1.5, () => {
                        setTimeout(() => {
                            typewriter.type(SECOND_MESSAGE_PART3, 50, () => {
                                typewriter.fadeOut(3);
                            });
                        }, 500);
                    });
                });
            }, 500);
        });
    });
}

function animate() {
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    weather.draw();
    
    let flameIntensity = 1;
    if (weather.isRaining && weather.stormIntensity > 0.5) {
        flameIntensity = 0.4;
    } else if (weather.stormIntensity > 0) {
        flameIntensity = 1 - (weather.stormIntensity * 0.6);
    }
    flames.draw(flameIntensity);

    requestAnimationFrame(animate);
}

// Message content
const FIRST_MESSAGE = `okay now listen carefully to me okay this is not smtg that will require your emotional energy ...just listen to me okay...

i dont exactly know whats the cause ...but as much as ik on that basis and as you told me earlier too see ik we're moving into a new phase of life and right now things little bit not going exactly as we had planned

ik tanvi you had planned that just as you'd go back home you'd start onto dsa and m3 right but i can understand you must be tired kinda doing that much all task thinking most students amongst us have already started

so what i am going to tell you now listen ....

right now as you can see its raining and below you could see flames which are burning at little low intensity aint the way how a fire should burn right ....

tell me whenever flames keep burning its obvious right that after some time their intensity would go low i am not saying totally off the fire ain't turning off look....

so just similarly consider yourself in an off-day phase ....you are also just like these flames right ....

whenever you are consistent and at potent energy levels you truly burn to execute all those things ...you're sharp , grasping power is high .....

but when you are continously doing things just burning and burning ofc you'll be little weak right not saying entirely shut off just a recalibration period we could.....

in this 6 month internship i have seen you burning constantly doing all those activities you didn't even took many days off only if it was clg stuff or hackathons right....

others whom have started by now they haven't done the same ....they have done all that enjoyment too going here and there taking leaves , wfhs....

by saying this i am not saying this as an excuse but what i am trying to imply is you and them there is a big difference ....

in short i'll say again that what takes them 10 days will take you 1-2 days....

and yes i had also told you to take days or an entire week off right then why to feel tensed or all pressured na....

also here again you'd see once the message ends smtg will happen that will also imply smtg ....

(right now you know the raining is like your off time...the fire is you....low but not totally shut down)`;

const SECOND_MESSAGE_PART1 = `as you saw the rain turned off we are back to our usual weather right ....if you notice look at the flames they are back to normal ...burning with full intensity ....thats what i am saying ...once your off-phase ends you'll start with double charging ...more strength ....

i hope you get to know it again that you ain't late just you're taking time for your mind recalibration.....and don't doubt yourself...ik this gap smtimes might make you overthink abt the time we spend together too....and ig yesterday out of this you said that.....`;

const SECOND_MESSAGE_PART2 = `see i don't know right now if telling you this you understood that you're not less than anyone .....from this i want you to know that you are much better than everyone....i'm always with you ....the way you allow me to think out of the box the same way i want you to know abt your own strength .....plus you deserve this gap after that much hardwork also on high scoring....

i can understand you are doing lot of work though but don't have any overload on your mind by worrying.....and allow me to keep few things regarding to learning a surprise everytime you ask me wyd i can't go on saying "planning our way to cracking an internship with high ppto".....`;

const SECOND_MESSAGE_PART3 = `you ain't going to clg to be part of a group ...the students there must realise you're far above their level....knowing you in the competition must make them lose the hope....the way you want me to be strong and successful this is what i want you to be..... 

so don't feel you'll be distracted ...ig you forgot the way i could care abt you like mumma na the same way right now being strict and practically telling you too... this is also what i have.....apart from the emotional connection we share we also share these goals....

lets hit out prime .....and dw i am your frnd ....more than i am your 'aga' and you my 'aaho'`;

window.onload = init;