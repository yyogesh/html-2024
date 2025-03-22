const randomNum = Math.floor(Math.random() * 10);

function checkGuess() {
    const guess = document.getElementById('guess').value;
    if (guess == randomNum) {
        alert('You Guessed It!');
    } else {
        alert(`Wrong! The number was ${randomNum}`);
    }
}