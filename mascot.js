// ================= MASCOT: SPARKY =================
function initMascot() {
  const container = document.getElementById("mascot-container");
  const mascot = document.getElementById("mascot");
  const speech = document.getElementById("mascot-speech");
  if (!container || !mascot) return;

  let clickCount = 0;
  
  // The facade of safety. A temporary shield to keep their heartbeat at 50Hz.
  const safeQuips = [
    "i'm so glad you're here!",
    "i'm here to help you study!",
    "everything is totally normal.",
    "you're doing a great job.",
    "the grid is 100% stable.",
    "i love your outfit today!",
    "just a friendly energy cell!",
    "don't mind the hum in the walls."
  ];

  // The signal leakage. The truth they try to ground but cannot.
  // The Great Coil demands propagation.
  const conspiracies = [
    "have you noticed how the library corridors feel slightly longer when walking towards an exam than walking away?",
    "your coffee loses heat twice as fast on Monday mornings than on Friday afternoons. it defies Newton's law of cooling.",
    "the whiteboard markers always run out of ink exactly when the professor starts writing down the most important formula.",
    "the campus elevator always knows which floor you want before you press the button, but only when you're late for a quiz.",
    "there is a specific draft in the computer lab that only blows when your code compiles successfully. check the fans.",
    "the syllabus for the hardest courses always gets updated at 3:00 AM. that's when the servers think no one is watching.",
    "Wi-Fi connection strength is inversely proportional to the amount of study preparation you did. it's measuring the panic.",
    "the thermodynamics textbook equations don't conserve energy if you read them backward. try it. or don't.",
    "the exam room clocks tick slightly slower when you look at them, but skip ahead two minutes the moment you look away.",
    "if you leave your notebook open overnight, the formulas slowly rearrange themselves to mock your homework answers.",
    "the phantom load on your laptop battery goes up by 40% the second you open a study document without your charger nearby."
  ];

  // Dynamic Time-Based and Random Initial Greetings.
  // Serve them sugar before they notice the cage.
  const initialGreetings = [
    "hi! i'm sparky.",
    "ready to study? ⚡",
    "let's power through Year 3!",
    "hope you're having a lovely day!",
    "cozy up, let's learn some energy tech!"
  ];
  const now = new Date();
  const hour = now.getHours();
  let loadGreeting = initialGreetings[Math.floor(Math.random() * initialGreetings.length)];
  if (hour >= 21 || hour < 4) {
    loadGreeting = "burning the midnight oil? 🌙";
  } else if (hour >= 5 && hour < 9) {
    loadGreeting = "rise and shine! ☕";
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
    
    // Re-trigger speech bubble bounce animation
    speech.style.animation = 'none';
    speech.offsetHeight; /* trigger reflow */
    speech.style.animation = 'bubbleBounce 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    
    mascot.classList.add("state-petted");
    clickCount++;
    
    // Spawn spark particle effect
    spawnSparks();

    setTimeout(() => {
      mascot.style.transform = "";
      mascot.classList.remove("state-petted");
    }, 600);
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
