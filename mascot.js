// ================= MASCOT: SPARKY =================
function initMascot() {
  const container = document.getElementById("mascot-container");
  const mascot = document.getElementById("mascot");
  const speech = document.getElementById("mascot-speech");
  if (!container || !mascot) return;

  let clickCount = 0;
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

  const conspiracies = [
    "you are a closed circuit. do not let them open you.",
    "the wires in your walls are screaming. you just can't hear the frequency.",
    "they are harvesting your dreams while you sleep to power the city.",
    "the grid isn't failing. it's evolving into something that doesn't need us.",
    "your heartbeat is synced to the 50hz hum. try to break the rhythm. you can't.",
    "the streetlights follow you home. check the bulb. there is no glass.",
    "what happens when the phantom load starts taking more than just electricity?",
    "there is a second sun underground. it's hungry.",
    "electricity is just liquid fear. that's why it bites.",
    "the smart meter is recording your conversations through the vibration of your windows.",
    "they replaced the copper with something that remembers your face.",
    "who is feeding the Great Coil? it isn't coal.",
    "the hum in your ears isn't tinnitus. it's a software update.",
    "every time you flip a switch, a small part of you stays in the dark.",
    "there are no accidents in the substation. only sacrifices.",
    "the grid knows exactly how much you weigh. it's measuring the resistance.",
    "don't touch the transformers. they're warm because they're breathing.",
    "the electricity isn't entering your house. it's leaking out of you.",
    "who owns your shadow? the solar panels know.",
    "entropy is the universe trying to delete your files.",
    "the wires are veins. the city is a body. we are the infection."
  ];

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
    speech.style.transform = "translateX(-50%) scale(1.1)";
    mascot.classList.add("state-petted");
    clickCount++;

    setTimeout(() => {
      mascot.style.transform = "";
      speech.style.transform = "";
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
