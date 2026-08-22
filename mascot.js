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
    "why does the campus Wi-Fi require your biometric profile? it's not for authentication.",
    "check the timetables. notice how we never have classes during the solar peaks? they are draining us.",
    "the M2.2.007 room doesn't have windows, but you can still hear the breathing. look up at the vents.",
    "the library security cameras aren't watching for books. they are tracking the rate of your pupil dilation.",
    "the semester schedule is an algorithm designed to induce sleep deprivation. they feed on the theta waves.",
    "why are the shuttle schedules perfectly synced to the local tide? there is water under the desert, but it's not fresh.",
    "the professors don't leave the campus at night. they just shut down to stand in the server racks.",
    "have you noticed the blue lights on the ceiling? they aren't emergency lights. they are mapping your retinas.",
    "don't drink the water in M3-1-009. the pH is normal, but the memory retention isn't.",
    "the smart lockers at KCA3 only open when your body temperature matches the ambient grid load.",
    "if you sit in the lobby long enough, you'll hear the hum. it's reciting your registration number in binary.",
    "the grades aren't evaluation metrics. they are compatibility rankings for the next phase of the grid.",
    "they put the bio labs in KCA so the runoff could reach the water mains without passing the filtration plant.",
    "the campus isn't built on land. it's floating on a giant cooling cell. don't look under the main lobby floorboards.",
    "every time you tap your student card, a tiny fraction of your pulse is stored in the central accumulator.",
    "why does KCA1 have three fire exits that open into solid concrete walls? what are they locking in?",
    "the exam hall clocks tick at 0.98 seconds per second. they are stealing time. you enter for three hours but only live for two and a half.",
    "the water coolers in the sports complex aren't connected to any pipes. check the base. it goes straight into the concrete slab.",
    "don't look at the mirrors in KCA2 restrooms between 3:12 AM and 3:15 AM. your reflection won't be looking at you.",
    "the shuttle driver never blinks. check his mirrors next time you ride. they are painted on.",
    "the syllabus for AGRL130 was written in 1984. the course didn't exist then, but the student names were already listed.",
    "why do the campus emergency alarms sound like a human voice pitch shifted down three octaves?",
    "look closely at the logo of the institute. the lines aren't geometric. it's a map of the underground tunnels under KCA3.",
    "they don't grade your exams in the staff room. they feed the pages to the central boiler. the heat signature determines your GPA."
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
