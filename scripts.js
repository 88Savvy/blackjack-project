/* ======= PART 1: GAME ELEMENTS ======= */

// GAME STATE - VARIABLES
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

// DOM ELEMENTS
const cardModel = document.createElement("div");
cardModel.classList.add("card");
const dealer = document.getElementById("dealer");
const player = document.getElementById("player");
const hit = document.getElementById("hit");
const pass = document.getElementById("pass");
const placeBetButton = document.getElementById("place-bet");
const buttonContainer = document.getElementById("button-container");
const notice = document.getElementById("notice");
const nextHand = document.getElementById("next-hand");

/* ======= PART 2: CREATE & SHUFFLE DECKS, CHOOSE RANDOM CARD, DEAL INITIAL HANDS =======*/

const createDeck = () => {
  const deck = []; // initialize empty array to store cards
  suits.forEach((suit) => {
    values.forEach((value) => {
      const card = value + suit; // concatenate value + suits to create a card STRING
      deck.push(card); // append card to deck array
    });
  });
  return deck;
};

const shuffleDecks = (number) => {
  for (let i = 0; i < number; i++) {
    const newDeck = createDeck(); // calls createDeck function to create a (number) of decks
    allDecks = [...allDecks, ...newDeck];
  }
};

const chooseRandomCard = () => {
  let randomNumber = Math.floor(Math.random() * allDecks.length);
  const randomCard = allDecks[randomNumber];
  allDecks.splice(randomNumber, 1);
  return randomCard;
};

/* dealHands function simulates the beginning of each round, where each player gets 2 cards.*/
const dealHands = () => {
  dealerHand = [chooseRandomCard(), chooseRandomCard()];
  playerHand = [chooseRandomCard(), chooseRandomCard()];
  console.log(playerBalance);

  return { dealerHand, playerHand };
};

/* ======= PART 3: CALCULATE VALUE OF HANDS ======= 

A. Cards 2 - 10 = value correponds to the number value of the card
B. Cards J, Q, K = value correponds to 10
C. Card A = value can be either 1 OR 11*/

const calcHandValue = (hand) => {
  let value = 0;
  let hasAce = false;

  /* value is determined based on length:
  if card.length is 2, card has a single-digit value;
  if card.length > 2, card has a double-digit value (e.g., 10)*/
  hand.forEach((card) => {
    let cardValue;
    if (card.length === 2) {
      cardValue = card.substring(0, 1);
    } else {
      cardValue = card.substring(0, 2);
    }

    /* Conditional sum card values:
    if cardValue is A, hasAce is set to true;
    if cardValue is J, Q or K, add 10 to value; 
    if cardValue is a number, CONVERT STRING to INTEGER and add numer to value*/
    if (cardValue === "A") {
      hasAce = true;
    } else if (cardValue === "J" || cardValue === "Q" || cardValue === "K") {
      value += 10;
    } else {
      value += Number(cardValue);
    }
  });

  /* After checking cards, checks if hasAce is true and determines if +1 OR +11 */
  if (hasAce) {
    if (value + 11 > 21) {
      value += 1;
    } else {
      value += 11;
    }
  }

  return value;
};

/* ======= PART 4: Notice & Determine Winner ======= */

const showNotice = (text) => {
  notice.children[0].children[0].innerHTML = text;

  /*if (showPlayAgainButton) {
    const playAgainButton = document.createElement("button");
    playAgainButton.textContent = "Play Again";
    playAgainButton.addEventListener("click", playAgain);

    notice.children[0].children[1].innerHTML = ""; // Clear previous content
    notice.children[0].children[1].appendChild(playAgainButton);
  }*/

  notice.style.display = "flex";
  buttonContainer.style.display = "none";

  if (dealerHand.length === 2 && calcHandValue(dealerHand) > 21) {
    playerBalance += currentBet * 2; // Increase balance by bet amount * 2
    text += "<br><b>Dealer bust! You win!</b>";
    updatePlayerBalance(playerBalance); // Update player balance display
  }
};

const determineWinner = () => {
  let playerValue = calcHandValue(playerHand);
  let dealerValue = calcHandValue(dealerHand);

  let result;
  if (dealerValue > 21 || (playerValue > dealerValue && dealerValue <= 21)) {
    result = "<br><b>You win!</b>";
    playerBalance += currentBet * 2; // Increase balance by bet amount * 2
  } else if (playerValue === dealerValue) {
    result = "<br><b>It's a tie!</b>";
    playerBalance += currentBet; // Return the placed bet amount to the player
  } else {
    result = "<br><b>Dealer Wins!</b>";
    playerBalance -= currentBet; // Decrease balance by bet amount
  }

  let text = `
    Your hand is ${playerHand} with a value of ${playerValue}.
    The dealer's hand is ${dealerHand} with a value of ${dealerValue}.
    ${result}
  `;

  if (dealerValue > 21) {
    // Additional check for dealer going bust
    playerBalance += currentBet * 2; // Increase balance by bet amount * 2
    text += "<br><b>Dealer bust! You win!</b>";
  }

  showNotice(text);
  updatePlayerBalance(playerBalance); // Update player balance display
};

/* ======= PART 5: Player and Dealer Hit ======= */

const hitDealer = () => {
  const hiddenCard = dealer.children[0];
  hiddenCard.classList.remove("back");
  hiddenCard.innerHTML = dealerHand[0];
  const card = chooseRandomCard();
  dealerHand.push(card);
  const newCard = cardModel.cloneNode(true);
  newCard.innerHTML = card;
  dealer.append(newCard);
  let handValue = calcHandValue(dealerHand);
  if (handValue <= 16) {
    hitDealer();
  } else if (handValue === 21) {
    showNotice("Dealer has 21! Dealer wins!");
  } else if (handValue > 21) {
    playerBalance += currentBet * 2; // Update player's balance for dealer bust
    let text = "Dealer bust! You win!";
    updatePlayerBalance(playerBalance); // Update player balance display
    showNotice(text);
  } else {
    determineWinner();
  }
};

const hitPlayer = () => {
  const card = chooseRandomCard();
  playerHand.push(card);
  let handValue = calcHandValue(playerHand);
  const newCard = cardModel.cloneNode(true);
  newCard.innerHTML = card;
  player.append(newCard); // append new card to player
  if (handValue > 21) {
    let text = `Bust! Your hand is ${playerHand} with a value of ${handValue}.`;
    showNotice(text);
  }
};

/* ======= PART 6: Gameplay Logic ======= */

// CLEAR HANDS FUNCTION
const clearHands = () => {
  while (dealer.children.length > 0) {
    dealer.children[0].remove(); // remove method used to eliminate cards
  }
  while (player.children.length > 0) {
    player.children[0].remove(); // remove method used to eliminate cards
  }
  return true;
};

// PLAY FUNCTION
const play = () => {
  clearHands(); // remove existing cards
  const { dealerHand, playerHand } = dealHands(); // returns object with dealer and player hands

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

// UPDATE PLAYER BALANCE FUNCTION
const playerBalanceSpan = document.getElementById("player-balance");
const updatePlayerBalance = (balance) => {
  playerBalanceSpan.textContent = `${balance}`;
};

// HANDLE PLACE BET FUNCTION
const handlePlaceBet = () => {
  const betInput = document.getElementById("bet-input");
  const betAmount = parseInt(betInput.value);
  console.log(betInput);
  console.log(betAmount);
  const currentBalance = Number(playerBalanceSpan);

  if (isNaN(betAmount) || betAmount <= 0) {
    showNotice("Invalid bet amount.");
    return;
  }

  if (betAmount > currentBalance) {
    showNotice("Not enough money to place bet.");
    return;
  }

  currentBet = betAmount; // Assign the bet amount to currentBet variable

  console.log(playerBalance);
  console.log(betAmount);
  console.log(currentBalance);
  console.log(Number(playerBalanceSpan.innerText));

  if (Number(playerBalanceSpan.innerText) >= 2000) {
    showNotice("You win! The dealer is broke.");
    return;
  }

  if (Number(playerBalanceSpan.innerText) <= 0) {
    showNotice("Game Over");
    console.log("hello");
    return;
  }

  playerBalance -= currentBet; // Decrease player's balance by the bet amount

  buttonContainer.style.display = "block";
  updatePlayerBalance(playerBalance);
};

// EVENT LISTENERS
hit.addEventListener("click", hitPlayer);
pass.addEventListener("click", hitDealer);
placeBetButton.addEventListener("click", handlePlaceBet);
nextHand.addEventListener("click", play);

shuffleDecks(4);
play();
