const values = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const suits = ["♠", "♥", "♣", "♦"];

let allDecks = [];
let dealerHand = [];
let playerHand = [];
let playerBalance = 1000;
let currentBet = 0;

const cardModel = document.createElement("div");
cardModel.classList.add("card");

const dealer = document.getElementById("dealer");
const player = document.getElementById("player");
const hit = document.getElementById("hit");
const pass = document.getElementById("pass");
const betInput = document.getElementById("bet-input");
const placeBetButton = document.getElementById("place-bet");
const playerBalanceSpan = document.getElementById("player-balance");
const buttonContainer = document.getElementById("button-container");
const notice = document.getElementById("notice");
const nextHand = document.getElementById("next-hand");
const gameOverNotice = document.getElementById("game-over-notice");
const youWinNotice = document.getElementById("you-win-notice");
const playAgainButton = document.getElementById("play-again");

const createDeck = () => {
  const deck = [];
  suits.forEach((suit) => {
    values.forEach((value) => {
      const card = value + suit;
      deck.push(card);
    });
  });
  return deck;
};

const shuffleDecks = (number) => {
  for (let i = 0; i < number; i++) {
    const newDeck = createDeck();
    allDecks = [...allDecks, ...newDeck];
  }
};

const chooseRandomCard = () => {
  const totalCards = allDecks.length;
  let randomNumber = Math.floor(Math.random() * totalCards);
  const randomCard = allDecks[randomNumber];
  allDecks.splice(randomNumber, 1);
  return randomCard;
};

const dealHands = async () => {
  dealerHand = [await chooseRandomCard(), await chooseRandomCard()];
  playerHand = [await chooseRandomCard(), await chooseRandomCard()];

  return { dealerHand, playerHand };
};

const calcHandValue = (hand) => {
  let value = 0;
  let hasAce = false;
  hand.forEach((card) => {
    let cardValue;
    if (card.length === 2) {
      cardValue = card.substring(0, 1);
    } else {
      cardValue = card.substring(0, 2);
    }
    if (cardValue === "A") {
      hasAce = true;
    } else if (cardValue === "J" || cardValue === "Q" || cardValue === "K") {
      value += 10;
    } else {
      value += Number(cardValue);
    }
  });
  if (hasAce) {
    if (value + 11 > 21) {
      value += 1;
    } else {
      value += 11;
    }
  }
  return value;
};

const showNotice = (text, isGameOver = false, isYouWin = false) => {
  notice.children[0].children[0].innerHTML = text;
  notice.style.display = "flex";
  buttonContainer.style.display = "none";

  if (isGameOver) {
    gameOverNotice.style.display = "block";
    nextHand.style.display = "none";
  }

  if (isYouWin) {
    youWinNotice.style.display = "block";
    nextHand.style.display = "none";
  }
};

const updatePlayerBalance = (balance) => {
  playerBalanceSpan.textContent = `${balance}`;
};

const placeBet = () => {
  console.log(currentBet);
  if (isNaN(currentBet) || currentBet <= 0) {
    showNotice("Please enter a valid bet amount.");
    return;
  }
  if (currentBet > playerBalance) {
    showNotice("Not enough money to place bet.");
    return;
  }
  playerBalance -= currentBet;
  updatePlayerBalance(playerBalance);
  buttonContainer.style.display = "block";
};

const determineWinner = async () => {
  let currentPlayerBalance = parseInt(playerBalanceSpan);
  let playerValue = await calcHandValue(playerHand);
  let dealerValue = await calcHandValue(dealerHand);
  let text = `
Your hand is ${playerHand} with a value of ${playerValue}.
The dealer's hand is ${dealerHand} with a value of ${dealerValue}.
`;

  if (playerValue > dealerValue) {
    text += "<br>You win!";
    playerBalance += currentBet * 2;
    updatePlayerBalance(playerBalance);
  } else {
    text += "<br>Dealer Wins!";
  }

  showNotice(text);
};

const checkBalance = () => {
  if (playerBalance === 0) {
    showNotice("Game Over", true);
  } else if (playerBalance === 2000) {
    showNotice("You win! Dealer's gone Broke!", false, true);
  }
};

const hitDealer = async () => {
  console.log(currentBet);
  const hiddenCard = dealer.children[0];
  hiddenCard.classList.remove("back");
  hiddenCard.innerHTML = dealerHand[0];
  const card = await chooseRandomCard();
  dealerHand.push(card);
  const newCard = cardModel.cloneNode(true);
  newCard.innerHTML = card;
  dealer.append(newCard);
  let handValue = await calcHandValue(dealerHand);
  if (handValue <= 16) {
    hitDealer();
  } else if (handValue === 21) {
    showNotice("Dealer has 21! Dealer wins!");
  } else if (handValue > 21) {
    showNotice("Dealer bust! You win!");
    playerBalance += currentBet * 2;
    updatePlayerBalance(playerBalance);
  } else {
    determineWinner();
  }
  checkBalance();
};

const hitPlayer = async () => {
  const card = await chooseRandomCard();
  playerHand.push(card);
  const newCard = cardModel.cloneNode(true);
  newCard.innerHTML = card;
  player.append(newCard);
  let handValue = await calcHandValue(playerHand);
  if (handValue > 21) {
    let text = `Bust! Your hand is ${playerHand} with a value of ${handValue}.`;
    showNotice(text);
  }
  checkBalance();
};

const clearHands = () => {
  while (dealer.children.length > 0) {
    dealer.children[0].remove();
  }
  while (player.children.length > 0) {
    player.children[0].remove();
  }
  return true;
};

const play = async () => {
  if (allDecks.length < 10) {
    shuffleDecks();
  }
  clearHands();
  const { dealerHand, playerHand } = await dealHands();
  dealerHand.forEach((card, index) => {
    const newCard = cardModel.cloneNode(true);
    if (card[card.length - 1] === "♥" || card[card.length - 1] === "♦") {
      newCard.setAttribute("data-red", true);
    }
    if (index === 0) {
      newCard.classList.add("back");
    } else {
      newCard.innerHTML = card;
    }
    dealer.append(newCard);
  });
  playerHand.forEach((card) => {
    const newCard = cardModel.cloneNode(true);
    if (card[card.length - 1] === "♥" || card[card.length - 1] === "♦") {
      newCard.setAttribute("data-red", true);
    }
    newCard.innerHTML = card;
    player.append(newCard);
  });
  notice.style.display = "none";
  buttonContainer.style.display = "none";
};

hit.addEventListener("click", hitPlayer);
pass.addEventListener("click", hitDealer);
placeBetButton.addEventListener("click", placeBet);
betInput.addEventListener("input", () => {
  currentBet = parseInt(betInput.value) || 0;
});
nextHand.addEventListener("click", play);
playAgainButton.addEventListener("click", () => {
  location.reload();
});

shuffleDecks(3);
play();
