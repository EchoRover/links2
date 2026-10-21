
// ====== Games Modal Logic ======
document.addEventListener("DOMContentLoaded", function() {
	const modal = document.getElementById("games-modal");
	const closeBtn = document.getElementById("close-games-modal");
	const gameBtns = document.querySelectorAll(".game-choice-btn");

	// Delegated: the Games pill is rendered by scripts.js on window's
	// DOMContentLoaded, which fires after this document listener, so the
	// pill does not exist yet when this runs.
	document.addEventListener("click", (e) => {
		if (modal && e.target.closest("#open-games-modal")) {
			e.preventDefault();
			modal.style.display = "block";
		}
	});
	if (closeBtn && modal) {
		closeBtn.addEventListener("click", () => {
			modal.style.display = "none";
		});
	}
	window.addEventListener("click", function(event) {
		if (event.target === modal) {
			modal.style.display = "none";
		}
	});

	gameBtns.forEach(btn => {
		btn.addEventListener("click", function() {
			const game = btn.getAttribute("data-game");
			if (game) {
				window.open(game + ".html", "_blank");
				modal.style.display = "none";
			}
		});
	});
});
