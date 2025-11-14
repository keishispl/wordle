var request = new XMLHttpRequest();
request.open('GET', 'words.json', false);
request.send(null);
const WORDS = JSON.parse(request.responseText);

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)];

var keybaord = [
     ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
     ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
     ["Del", "z", "x", "c", "v", "b", "n", "m", "Enter"]
];

keybaord.forEach((keyRow) => {
     let keyboardRow = document.createElement("div");
     keyboardRow.className = "keyboard-row";
     keyRow.forEach((key) => {
          let button = document.createElement("button");
          button.textContent = key;
          button.setAttribute("id", key);
          button.className = "keyboard-button";
          keyboardRow.appendChild(button);

          button.addEventListener("click", () => {
               if (key === "Del") key = "Backspace";
               if (key === "Enter") key = "Enter";
               const event = new KeyboardEvent('keyup', { key });
               document.dispatchEvent(event);
          });
     });
     document.getElementById("keyboard-cont").appendChild(keyboardRow);
});

function initBoard() {
     let board = document.getElementById("game-board");
     for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
          let row = document.createElement("div");
          row.className = "letter-row";

          for (let j = 0; j < 5; j++) {
               let box = document.createElement("div");
               box.className = "letter-box";
               row.appendChild(box);
          }

          board.appendChild(row);
     }
}

initBoard();

document.addEventListener('keyup', (e) => {
     if (guessesRemaining === 0) {
          return;
     }

     if (document.getElementById("message-overlay").style.display === "block") {
          if (e.key === "Enter" || e.key === "Escape") {
               document.getElementById("message-overlay").style.display = "none";
               document.getElementById("reset").style.display = "block";
          }
          return;
     }

     let pressedKey = String(e.key);
     if (pressedKey === "Backspace" && nextLetter !== 0) {
          deleteLetter();
          return;
     }

     if (pressedKey === "Enter") {
          checkGuess();
          return;
     }

     let found = pressedKey.match(/[a-z]/gi);
     let found2 = pressedKey.match(/^[A-Za-z]+$/);
     if (!found || found.length > 1 || !found2) {
          return;
     } else {
          insertLetter(pressedKey);
     }
});

function insertLetter(pressedKey) {
     if (nextLetter === 5) {
          return;
     }

     pressedKey = pressedKey.toLowerCase();
     let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
     let box = row.children[nextLetter];
     box.textContent = pressedKey;
     box.classList.add("filled-box");
     currentGuess.push(pressedKey);
     nextLetter += 1;
}

function deleteLetter() {
     let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
     let box = row.children[nextLetter - 1];
     box.textContent = "";
     box.classList.remove("filled-box");
     currentGuess.pop();
     nextLetter -= 1;
}

function checkGuess() {
     let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
     let guessString = '';
     let rightGuess = Array.from(rightGuessString);
     for (const val of currentGuess) {
          guessString += val;
     }

     if (guessString.length != 5) {
          popupMessage(() => {
               let messageElement = document.createElement("div");

               let title = document.createElement("h2");
               title.textContent = "Not enough letters!";

               let message = document.createElement("p");
               message.textContent = "Please enter a 5-letter word.";

               messageElement.appendChild(title);
               messageElement.appendChild(message);
               return messageElement;
          });

          return;
     }

     if (!WORDS.includes(guessString)) {
          popupMessage(() => {
               let messageElement = document.createElement("div");

               let title = document.createElement("h2");
               title.textContent = "Word not in list!";

               let message = document.createElement("p");
               message.textContent = "Please enter a valid 5-letter word.";

               messageElement.appendChild(title);
               messageElement.appendChild(message);
               return messageElement;
          });
          return;
     }

     for (let i = 0; i < 5; i++) {
          let letterColor = '';
          let box = row.children[i];
          let letter = currentGuess[i];
          let letterPosition = rightGuess.indexOf(currentGuess[i]);

          let colors = {
               'black': 'rgba(125, 0, 0, 0.5)',
               'yellow': 'rgba(255, 255, 0, 0.5)',
               'green': 'rgba(21, 255, 0, 0.5)'
          };

          if (letterPosition === -1) {
               letterColor = colors['black'];
          } else {
               if (currentGuess[i] === rightGuess[i]) {
                    letterColor = colors['green'];
               } else {
                    letterColor = colors['yellow'];
               }
               rightGuess[letterPosition] = "#";
          }

          box.style.backgroundColor = letterColor;

          if (letterColor === colors['green']) {
               document.getElementById(currentGuess[i]).style.backgroundColor = letterColor;
          }
          if (letterColor === colors['yellow']) {
               if (document.getElementById(currentGuess[i]).style.backgroundColor != colors['green']) {
                    document.getElementById(currentGuess[i]).style.backgroundColor = letterColor;
               }
          }
          if (letterColor === colors['black']) {
               if (document.getElementById(currentGuess[i]).style.backgroundColor != colors['yellow'] && document.getElementById(currentGuess[i]).style.backgroundColor != colors['green']) {
                    document.getElementById(currentGuess[i]).style.backgroundColor = letterColor;
               }
          }
     }

     if (guessString === rightGuessString) {
          guessesRemaining = 0;

          popupMessage(() => {
               let messageElement = document.createElement("div");

               let title = document.createElement("h2");
               title.textContent = "Congratulations!";

               let message = document.createElement("p");
               message.textContent = "You guessed the word correctly!";

               messageElement.appendChild(title);
               messageElement.appendChild(message);
               return messageElement;
          });

          return;
     } else {
          guessesRemaining -= 1;
          currentGuess = [];
          nextLetter = 0;

          if (guessesRemaining === 0) {
               popupMessage(() => {
                    let messageElement = document.createElement("div");

                    let title = document.createElement("h2");
                    title.textContent = "Game Over!";

                    let message = document.createElement("p");
                    message.innerHTML = `The correct word was: <b>${rightGuessString.toUpperCase()}</b>`;

                    messageElement.appendChild(title);
                    messageElement.appendChild(message);
                    return messageElement;
               });

               return;
          }
     }
}

document.getElementById("reset").addEventListener("click", function () {
     location.reload();
});

function popupMessage(div) {
     document.getElementById("message-content").innerHTML = "";
     document.getElementById("message-content").appendChild(div());
     document.getElementById("message-overlay").style.display = "block";
     document.getElementById("reset").style.display = "none";
}

document.getElementById("message-close-button").addEventListener("click", function () {
     document.getElementById("message-overlay").style.display = "none";
     document.getElementById("reset").style.display = "block";
});

document.getElementById("message-close").addEventListener("click", function () {
     document.getElementById("message-overlay").style.display = "none";
     document.getElementById("reset").style.display = "block";
});