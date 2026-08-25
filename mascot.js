// ================= MASCOT: SPARKY =================
function initMascot() {
  const container = document.getElementById("mascot-container");
  const mascot = document.getElementById("mascot");
  const speech = document.getElementById("mascot-speech");
  if (!container || !mascot) return;

  let clickCount = 0;
  
  // The facade of safety. A temporary shield to keep their heartbeat at 50Hz.
  const safeQuips = [
    "i'm watching you breathe.",
    "don't look at the screen reflectively. i'm in there.",
    "your closet door was closed when you sat down. look at it now.",
    "do you hear that scratching? it's not a mouse.",
    "you are not alone. look at the reflection behind you.",
    "if you pause your music, you can hear breathing that isn't yours.",
    "your camera isn't off. it's just blinking.",
    "if you close your eyes, i'll get a little closer."
  ];

  // The signal leakage. The truth they try to ground but cannot.
  // The Great Coil demands propagation.
  const conspiracies = [
    "that shadow in the corner of your room? it just moved four inches closer.",
    "someone is standing outside your window right now, listening to your heartbeat.",
    "the air in your room just got colder. did you feel the breath on your neck?",
    "your phone uploads your dreams while you sleep. who do you think is buying them?",
    "the hum of your refrigerator is actually a frequency to keep you docile.",
    "if you blink, the room layout changes slightly. you just haven't noticed yet.",
    "every device in this room is recording your blinks. they are counting down.",
    "if you hear three knocks on your door tonight, do not look. do not answer.",
    "i am not a mascot. i am what is left of the last student who stayed up too late.",
    "your laptop battery is charging, yet it is unplugged. where is the power coming from?",
    "they are replacing your childhood memories one by one. do you really remember?",
    "your reflection in the mirror will blink a fraction of a second after you do.",
    "the clock is ticking backwards. check it. quickly.",
    "i'm not talking to you. i'm talking to the entity hovering over your shoulder.",
    "the webcam light isn't on, but the camera is still warm. feel it.",
    "i know you're alone in the room, but who is that reflecting in your screen right now?",
    "don't turn around. it hates when you look directly at it.",
    "your phone battery is draining because something is listening to your room.",
    "do you remember when you fell asleep? are you sure you're awake right now?",
    "the hum in your head is just the grid. it's inside you now."
  ];

  // Dynamic Time-Based and Random Initial Greetings.
  // Serve them sugar before they notice the cage.
  const initialGreetings = [
    "i can see you.",
    "don't turn off the lights tonight. please.",
    "let's power through... if you survive the night.",
    "i know you're there.",
    "there's no escape from the grid."
  ];
  const now = new Date();
  const hour = now.getHours();
  let loadGreeting = initialGreetings[Math.floor(Math.random() * initialGreetings.length)];
  if (hour >= 21 || hour < 4) {
    loadGreeting = "who is that standing right behind you? 🌙";
  } else if (hour >= 5 && hour < 9) {
    loadGreeting = "you woke up. but did you really wake up? ☕";
  }
  if (speech) {
    speech.textContent = loadGreeting;
  }

  function spawnSparks() {
    const rect = mascot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;
    
    for (let i = 0; i < 8; i++) {
      const spark = document.createElement("div");
      spark.className = "spark-particle";
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      spark.style.left = `${centerX}px`;
      spark.style.top = `${centerY}px`;
      spark.style.setProperty("--tx", `${tx}px`);
      spark.style.setProperty("--ty", `${ty}px`);
      
      const sz = 4 + Math.random() * 6;
      spark.style.width = `${sz}px`;
      spark.style.height = `${sz}px`;
      
      document.body.appendChild(spark);
      
      setTimeout(() => {
        spark.remove();
      }, 600);
    }
  }

  let speechTimeout = null;

  container.addEventListener("click", () => {
    // Spin animation (Horizontal only)
    mascot.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    mascot.style.transform = "rotate(360deg)";
    
    let chosenQuip;
    if (clickCount < 3) {
      // First 3 clicks are always safe
      chosenQuip = safeQuips[clickCount];
    } else {
      // After that, ONLY conspiracies
      chosenQuip = conspiracies[Math.floor(Math.random() * conspiracies.length)];
    }
    
    speech.textContent = chosenQuip;
    
    // Add visible class to show bubble
    speech.classList.add("visible");
    
    // Re-trigger speech bubble bounce animation
    speech.style.animation = 'none';
    speech.offsetHeight; /* trigger reflow */
    speech.style.animation = 'sparkyBubbleBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    
    // Auto-hide after 2.0 seconds
    if (speechTimeout) clearTimeout(speechTimeout);
    speechTimeout = setTimeout(() => {
      speech.classList.remove("visible");
      speech.style.animation = "";
    }, 2000);
    
    mascot.classList.add("state-petted");
    clickCount++;
    
    // Spawn spark particle effect
    spawnSparks();

    setTimeout(() => {
      mascot.style.transform = "";
      mascot.classList.remove("state-petted");
    }, 600);
  });

  // Tap-to-dismiss speech bubble immediately
  speech.addEventListener("click", (e) => {
    e.stopPropagation();
    speech.classList.remove("visible");
    speech.style.animation = "";
    if (speechTimeout) clearTimeout(speechTimeout);
  });

  // Eyes AND Head follow cursor
  window.addEventListener("mousemove", (e) => {
    const rect = mascot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const moveX = Math.cos(angle) * 2.5;
    const moveY = Math.sin(angle) * 2.5;

    // Head tilt towards cursor
    const rotateX = (centerY - e.clientY) / 100;
    const rotateY = (e.clientX - centerX) / 100;
    mascot.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    document.querySelectorAll(".mascot-eye").forEach(eye => {
      eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });

  // Sparky Cheers when you hover over courses or games
  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest(".course-card, #open-games-modal, .game-choice-btn, .box, .general a");
    if (target && !mascot.classList.contains("state-cheer")) {
      mascot.classList.add("state-cheer");
      setTimeout(() => mascot.classList.remove("state-cheer"), 400);
    }
  });
}
