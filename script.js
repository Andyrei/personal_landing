const lines = [
  "> Initializing system...",
  "> Boot sequence started",
  "> Loading modules...",
  "> Connecting to 0xAndrei.dev...",
  "> Access granted.",
  "> Welcome, I'm Andrei.",
  "> Portfolio system under construction",
  "> Estimated launch: Soon™",
  "> Rubber duck online. Listening on port :1337",
  "> Debugging mode: HONK activated",
  "> Tip: When in doubt, ask the duck",
  "> 🐤 Your silent pair programmer",
];

const typed = document.getElementById("typed-text");
const cursor = document.getElementById("cursor");
const duck = document.getElementById("rubber-duck");

let lineIndex = 0;
let charIndex = 0;

function typeLine() {
  if (lineIndex < lines.length) {
    const currentLine = lines[lineIndex];

    typed.textContent += currentLine.charAt(charIndex);
    charIndex++;

    if (charIndex < currentLine.length) {
      setTimeout(typeLine, 40);
    } else {
      typed.textContent += "\n";
      charIndex = 0;
      lineIndex++;
      setTimeout(typeLine, 300);
    }
  } else {
    cursor.style.display = 'inline-block';
    duck.classList.remove("hidden");
    duck.classList.add("reveal");
  }
}

setTimeout(typeLine, 500);