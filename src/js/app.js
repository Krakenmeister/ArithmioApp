import { Capacitor } from '@capacitor/core';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';

AdMob.initialize({
	requestTrackingAuthorization: true,
	initializeForTesting: true,
	testingDevices: ['00008030-001C496A3E03402E'],
});

// AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info) => {
// 	console.log("Ad loaded!");
// });

async function interstitial() {
	let options = {};

	if (Capacitor.getPlatform() === 'ios') {
		options = {
			// adId: 'ca-app-pub-9790404589582022/6829844339'
			adId: 'ca-app-pub-3940256099942544/4411468910'
		};
	} else if (Capacitor.getPlatform() === 'android') {
		options = {
			adId: 'ca-app-pub-9790404589582022/1708561351'
		};
	}

    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
}

// window.screen.orientation.lock('landscape');

const hostname = "https://krakenmeister.com";
const route = "/arithmio";

const css = window.document.styleSheets[0];

let focusCard;
let focusX;
let focusY;
let isDragging;
let offsetX;
let offsetY;
let lastTouch;

let total = 0;
let gameType;
let lives;
let isMultiplayer;
let lastCard;

let forceMath = true;

let deck;
let hand;
let cardIDCounter;
let score;
let isMyTurn;
let clientHand;
let clientTurn;

let socket = io("https://krakenmeister.com");
let appRoomCode;
let appPlayerId;

let keyboardUp = false;

import { Keyboard } from '@capacitor/keyboard';

Keyboard.addListener((Capacitor.getPlatform() === 'ios' ? "keyboardWillShow" : "keyboardDidShow"), (info) => {
	keyboardUp = true;

	if (document.getElementById("wrapper")) {
		document.getElementById("wrapper").style.backgroundSize = `100% ${window.innerHeight + info.keyboardHeight}px`;
	}
	let allCards = document.querySelectorAll('[class$="card"]');
	for (let card of allCards) {
		card.style.display = "none";
	}
	if (document.getElementById('playerInfo')) {
		document.getElementById('playerInfo').style.display = "none";
	}
	if (document.getElementById('myInfo')) {
		document.getElementById('myInfo').style.display = "none";
	}
	if (document.getElementById('multiplayerMenu')) {
		document.getElementById('multiplayerMenu').style.display = "none";
	}
	if (document.getElementById('totalWrapper')) {
		document.getElementById('totalWrapper').style.display = "none";
	}
	if (document.getElementById('chatWrapper')) {
		if (!document.getElementById('winner')) {
			document.getElementById('chatWrapper').style.width = "90vw";
			document.getElementById('messageWrapper').style.fontSize = "2vw";
			document.getElementById('messageWrapper').style.height = "auto";
		}
	}
	if (document.getElementById('endTurnBtn')) {
		document.getElementById('endTurnBtn').style.display = "none";
	}
});

Keyboard.addListener((Capacitor.getPlatform() === 'ios' ? "keyboardWillHide" : "keyboardDidHide"), (info) => {
	keyboardUp = false;

	if (document.getElementById("wrapper")) {
		document.getElementById("wrapper").style.backgroundSize = "100% 100%";
	}
	let allCards = document.querySelectorAll('[class$="card"]');
	for (let card of allCards) {
		card.style.display = "flex";
	}
	if (document.getElementById('playerInfo')) {
		document.getElementById('playerInfo').style.display = "flex";
	}
	if (document.getElementById('myInfo')) {
		document.getElementById('myInfo').style.display = "flex";
	}
	if (document.getElementById('multiplayerMenu')) {
		document.getElementById('multiplayerMenu').style.display = "flex";
	}
	if (document.getElementById('totalWrapper')) {
		document.getElementById('totalWrapper').style.display = "flex";
	}
	if (document.getElementById('chatWrapper')) {
		if (!document.getElementById('winner')) {
			document.getElementById('chatWrapper').style.width = "14vw";
			document.getElementById('messageWrapper').style.fontSize = "1.3vw";
			document.getElementById('messageWrapper').style.height = "70vh";
		}
	}
	if (document.getElementById('endTurnBtn')) {
		document.getElementById('endTurnBtn').style.display = "flex";
	}
});

function home () {
	removeAllChildNodes(document.getElementById('wrapper'));
	document.getElementById('wrapper').innerHTML = `
		<div class="homepage" id="title" style="margin-bottom: 10vh">Arithmio</div>
		<div style="display: flex; flex-direction: row; align-items: center; justify-content: center">
			<div class="homepageButton" id="singleplayerButton">
				<span>S</span>
				<span>o</span>
				<span>l</span>
				<span>i</span>
				<span>t</span>
				<span>a</span>
				<span>i</span>
				<span>r</span>
				<span>e</span>
			</div>
			<div class="homepageButton" id="multiplayerButton">
				<span>M</span>
				<span>u</span>
				<span>l</span>
				<span>t</span>
				<span>i</span>
				<span>p</span>
				<span>l</span>
				<span>a</span>
				<span>y</span>
				<span>e</span>
				<span>r</span>
			</div>
			<div class="homepageButton" id="aboutButton">
				<span>T</span>
				<span>u</span>
				<span>t</span>
				<span>o</span>
				<span>r</span>
				<span>i</span>
				<span>a</span>
				<span>l</span>
			</div>
		</div>
	`;

	document.getElementById('singleplayerButton').addEventListener('click', () => {
		document.getElementById('wrapper').remove();
		let singleplayerBackground = document.createElement("div");
		singleplayerBackground.id = "singleplayerBackground";
		document.getElementsByTagName('body')[0].appendChild(singleplayerBackground);

		deck = [];
		hand = [];
		cardIDCounter = 0;
		score = 0;
		isMyTurn = true;
		gameType = 0;
		isMultiplayer = false;
		lastCard = -1;

		startGame();
	});

	document.getElementById('multiplayerButton').addEventListener('click', () => {
		multiplayerChoice();
	});

	document.getElementById('aboutButton').addEventListener('click', () => {
		tutorial();
	});
}

function createCard (num, x, y, z, scaleX, scaleY, parent, id) {
	let card = document.createElement('div');
	card.style.position = 'absolute';
	card.style.left = x;
	card.style.top = y;
	card.style.zIndex = z;
	card.style.width = scaleX;
	card.style.height = scaleY;
	card.className = `${num}card`;
	card.id = id;
	parent.appendChild(card);
}

function moveCard (id, x, y, z, scaleX, scaleY, time) {
	let card = document.getElementById(id);
	css.insertRule(`
		@keyframes anim${css.cssRules.length} {
			0% {
				left: ${card.style.left};
				top: ${card.style.top};
				width: ${card.style.width};
				height: ${card.style.height};
			}
			100% {
				left: ${x};
				top: ${y};
				width: ${scaleX};
				height: ${scaleY};
			}
		}
	`, css.cssRules.length);
	card.style.left = x;
	card.style.top = y;
	card.style.zIndex = z;
	card.style.width = scaleX;
	card.style.height = scaleY;
	card.style.animation = `anim${css.cssRules.length-1} ${time}s ease-in-out`;
}

async function getLastCard (room, player) {
	const response = await fetch(`${hostname}${route}/gameInfo`, {
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			roomCode: room,
			playerID: player
		}),
		method: 'POST'
	});
	// const response = await axios.post(`${hostname}${route}/gameInfo`, {roomCode: room, playerID: player});
	lastCard = response.data.lastCard;
}

function handToDest (handSize, handOrder, cardNum, isMyTurn = true, lastCard = -1) {
	let space = 5;
	let width = 9;
	let dest = [];
	if (handSize > 13) {
		space = 3;
	} else if (handSize > 9) {
		space = 4;
	}
	if (isMultiplayer) {
		space--;
	}
	if (total % cardNum != 0 || total == 0 || !isMyTurn || gameType === 2 || lastCard == cardNum || forceMath) {
		dest = [`${50 - (width + space * (handSize - 1)) / 2 + space * handOrder}vw`, `70vh`, `${handOrder}`, `${width}vw`, `25vh`];
	} else {
		dest = [`${50 - (width + space * (handSize - 1)) / 2 + space * handOrder}vw`, `67vh`, `${handOrder}`, `${width}vw`, `25vh`];
	}
	return dest;
}

const timer = ms => new Promise(res => setTimeout(res, ms));

async function shakeElement (e) {
	e.style.animation = 'shake 0.5s';
	await timer(500);
	e.style.animation = '';
}

function startDrag (e) {
	if (!e) {
		let e = window.event;
	}

	focusCard = e.target ? e.target : e.srcElement;

	if (!focusCard.className.includes('card')) {
		return;
	}

	if(!isMyTurn) {
		return;
	}

	if (total % parseInt(focusCard.className) != 0) {
		if (gameType === 2) {
			loseLife();
		}
		shakeElement(focusCard);
		return;
	}

	if (e.type == 'touchstart') {
		offsetX = e.touches[0].clientX;
		offsetY = e.touches[0].clientY;
	} else {
		offsetX = e.clientX;
		offsetY = e.clientY;
	}

	if (isMultiplayer && parseInt(focusCard.className) == lastCard) {
		repeatCard();
		return;
	}

	if (focusCard.style.left.includes('vw')) {
		focusX = window.innerWidth * parseFloat(focusCard.style.left) / 100;
	} else {
		focusX = parseInt(focusCard.style.left);
	}
	if (focusCard.style.top.includes('vh')) {
		focusY = window.innerHeight * parseFloat(focusCard.style.top) / 100;
	} else {
		focusY = parseFloat(focusCard.style.top);
	}

	isDragging = true;

	return false;
}

function dragCard (e) {
	if (!isDragging || !focusCard.className.includes('card') || (total % parseInt(focusCard.className) != 0)) {
		return;
	}
	if (!e) {
		let e = window.event;
	}

	if (e.type == 'touchmove') {
		focusCard.style.left = `${focusX + e.touches[0].clientX - offsetX}px`;
		focusCard.style.top = `${focusY + e.touches[0].clientY - offsetY}px`;
	} else {
		focusCard.style.left = `${focusX + e.clientX - offsetX}px`;
		focusCard.style.top = `${focusY + e.clientY - offsetY}px`;
	}

	let increaseRect = document.getElementById('increaseTotal').getBoundingClientRect();
	let decreaseRect = document.getElementById('decreaseTotal').getBoundingClientRect();
	if (e.type == 'touchmove') {
		if (e.touches[0].clientX > increaseRect.left && e.touches[0].clientX < increaseRect.right && e.touches[0].clientY > increaseRect.top && e.touches[0].clientY < increaseRect.bottom) {
			document.getElementById('totalDisplay').style.color = 'green';
			lastTouch = 1;
		} else if (e.touches[0].clientX > decreaseRect.left && e.touches[0].clientX < decreaseRect.right && e.touches[0].clientY > decreaseRect.top && e.touches[0].clientY < decreaseRect.bottom) {
			document.getElementById('totalDisplay').style.color = 'darkred';
			lastTouch = -1;
		} else {
			document.getElementById('totalDisplay').style.color = 'black';
			lastTouch = 0;
		}
	} else {
		if (e.clientX > increaseRect.left && e.clientX < increaseRect.right && e.clientY > increaseRect.top && e.clientY < increaseRect.bottom) {
			document.getElementById('totalDisplay').style.color = 'green';
		} else if (e.clientX > decreaseRect.left && e.clientX < decreaseRect.right && e.clientY > decreaseRect.top && e.clientY < decreaseRect.bottom) {
			document.getElementById('totalDisplay').style.color = 'darkred';
		} else {
			document.getElementById('totalDisplay').style.color = 'black';
		}
	}

	return false;
}

function stopDrag (e) {
	if (!focusCard.className.includes('card') || (total % parseInt(focusCard.className) != 0) || !isMyTurn) {
		return;
	}

	if (isMultiplayer && parseInt(focusCard.className) == lastCard) {
		return;
	}

	isDragging = false;
	let destX = `${100 * focusX / window.innerWidth}vw`;
	let destY = `${100 * focusY / window.innerHeight}vh`;
	css.insertRule(`
		@keyframes anim${css.cssRules.length} {
			0% {
				left: ${focusCard.style.left};
				top: ${focusCard.style.top};
			}
			100% {
				left: ${destX};
				top: ${destY};
			}
		}
	`, css.cssRules.length);
	focusCard.style.left = destX;
	focusCard.style.top = destY;
	focusCard.style.animation = `anim${css.cssRules.length-1} 0.5s ease-in-out`;


	let increaseRect = document.getElementById('increaseTotal').getBoundingClientRect();
	let decreaseRect = document.getElementById('decreaseTotal').getBoundingClientRect();
	if (e.type == 'touchend') {
		if (lastTouch == 1) {
//		if (e.touches[0].clientX > increaseRect.left && e.touches[0].clientX < increaseRect.right && e.touches[0].clientY > increaseRect.top && e.touches[0].clientY < increaseRect.bottom) {
			total += parseInt(focusCard.className);
			changeTotal(total);
			playCard(focusCard.id, 1);
		} else if (lastTouch == -1) {
//		} else if (e.touches[0].clientX > decreaseRect.left && e.touches[0].clientX < decreaseRect.right && e.touches[0].clientY > decreaseRect.top && e.touches[0].clientY < decreaseRect.bottom) {
			total -= parseInt(focusCard.className);
			changeTotal(total);
			playCard(focusCard.id, -1);
		}
	} else {
		if (e.clientX > increaseRect.left && e.clientX < increaseRect.right && e.clientY > increaseRect.top && e.clientY < increaseRect.bottom) {
			total += parseInt(focusCard.className);
			changeTotal(total);
			playCard(focusCard.id, 1);
		} else if (e.clientX > decreaseRect.left && e.clientX < decreaseRect.right && e.clientY > decreaseRect.top && e.clientY < decreaseRect.bottom) {
			total -= parseInt(focusCard.className);
			changeTotal(total);
			playCard(focusCard.id, -1);
		}
	}
}

async function repeatCard () {
	shakeElement(focusCard);
	let notice = document.createElement('div');
	notice.style.position = 'absolute';
	notice.style.fontSize = '1.2vw';
	notice.style.width = '15vw';
	notice.style.height = '8vh';
	notice.style.backgroundColor = 'white';
	notice.style.border = '5px solid black';
	notice.style.borderRadius = '10px';
	notice.style.animation = 'fade 20s';
	notice.style.zIndex = '9999';
	notice.style.display = 'flex';
	notice.style.alignItems = 'center';
	notice.style.justifyContent = 'center';
	notice.style.left = `${offsetX}px`;
	notice.style.top = `${offsetY}px`;
	notice.style.textAlign = 'center';
	notice.style.padding = '3px';
	notice.innerHTML = '<div>In multiplayer, you can\'t play the same card twice in a row</div>';
	document.getElementById('gameWrapper').appendChild(notice);
	await timer(2500);
	notice.remove();
}

window.onload = () => {
	document.onmousedown = startDrag;
	document.onmouseup = stopDrag;
	document.ontouchstart = startDrag;
	document.ontouchend = stopDrag;
	document.onmousemove = dragCard;
	document.ontouchmove = dragCard;
}


async function changeTotal (newTotal) {
	let totalDisplay = document.getElementById('totalDisplay');
	let tempTotal = parseInt(totalDisplay.innerHTML);
	let change = 1;
	if (tempTotal < newTotal) {
		change = 1;
		totalDisplay.style.color = 'green';
	} else if (tempTotal > newTotal) {
		change = -1;
		totalDisplay.style.color = 'darkred';
	}
	while (tempTotal != newTotal) {
		if (Math.abs(tempTotal - newTotal) > 200) {
			if (change > 0) {
				change = 71;
			} else {
				change = -71;
			}
		} else {
			if (change > 0) {
				change = 1;
			} else {
				change = -1;
			}
		}
		tempTotal += change;
		totalDisplay.innerHTML = tempTotal;
		if (tempTotal > 999) {
			totalDisplay.style.fontSize = '30vh';
		} else if (tempTotal > 99) {
			totalDisplay.style.fontSize = '40vh';
		} else {
			totalDisplay.style.fontSize = '50vh';
		}
		await timer(300/(Math.abs(tempTotal - newTotal) + 1));
	}
	totalDisplay.style.color = 'black';
}

async function loseLife () {
	const finalScore = score;

	document.getElementById(`life${lives}`).style.animation = 'disappear 0.6s';
	await timer(500);
	document.getElementById(`life${lives}`).remove();

	lives--;
	if (lives === 0) {
		endGame(`Game over! You achieved a score of ${finalScore}`);
	}

}


function removeAllChildNodes (parent) {
	while (parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}





function shuffleDeck () {
	for (let i=0; i<deck.length * 7; i++) {
		let firstCard = Math.floor(Math.random() * deck.length);
		let secondCard = Math.floor(Math.random() * deck.length);
		[deck[firstCard], deck[secondCard]] = [deck[secondCard], deck[firstCard]];
	}
}

function drawCard () {
	let newCard;
	if (gameType == 1) {
		newCard = Math.floor(Math.random() * 1.5 * Math.sqrt(cardIDCounter + 25)) + 1;
		let goodCop = Math.floor(Math.random() * 10);
		if (goodCop == 0) {
			newCard = 1;
		}
		if (newCard > 19) {
			let badCop = Math.floor(Math.random() * 3);
			if (badCop == 0) {
				newCard = 13;
			} else if (badCop == 1) {
				newCard = 17;
			} else {
				newCard = 19;
			}
		}
	} else {
		newCard = deck.pop();
	}
	hand.push([newCard, cardIDCounter]);
	cardIDCounter++;
	createCard(`${newCard}`, '86vw', '70vh', 10, '9vw', '25vh', document.body, `${hand[hand.length - 1][1]}`);
	hand.sort((card1, card2) => {
		return card1[0] - card2[0];
	});
	moveHand();
	let hasDivisor = false;
	for (let i=0; i<hand.length; i++) {
		if (total % hand[i][0] == 0) {
			hasDivisor = true;
		}
	}
	if (gameType == 1) {
		document.getElementById('deckDisplay').innerHTML = `Score: ${score}`;
	} else {
		document.getElementById('deckDisplay').innerHTML = `Cards Left: ${deck.length}`;
	}
	if (!hasDivisor) {
		endGame(`Game over! You achieved a score of ${score}`);
	}
}

async function drawHand () {
	for (let i=0; i<5; i++) {
		if (document.getElementById('wrapper')) {
			return;
		}
		drawCard();
		await timer(500);
	}
	let maxDivisors = 0;
	let min = 30;
	let max = 60;
	if (gameType == 2) {
		min = Math.floor(Math.random() * 9000) + 500;
		max = min + 50;
	}
	for (let i=min; i<=max; i++) {
		let divisors = 0;
		for (let j=0; j<hand.length; j++) {
			if (i % hand[j][0] == 0) {
				divisors++;
			}
		}
		if (divisors > maxDivisors) {
			maxDivisors = divisors;
			total = i;
		}
	}
	changeTotal(total);
	moveHand();
}

function moveHand () {
	for (let i=0; i<hand.length; i++) {
		let dest = handToDest(hand.length, i, hand[i][0]);
		moveCard(hand[i][1], dest[0], dest[1], dest[2], dest[3], dest[4], 0.5);
	}
}

function playCard (id, direction) {
	if (isMultiplayer) {
		for (let i=0; i<clientHand.length; i++) {
			if (clientHand[i][1] == id) {
				socket.emit('playCard', appRoomCode, appPlayerId, clientHand[i][0], direction);
				clientHand.splice(i, 1);
			}
		}
		document.body.removeChild(document.getElementById(id));
	} else {
		for (let i=0; i<hand.length; i++) {
			if (hand[i][1] == id) {
				score += hand[i][0];
				hand.splice(i, 1);
			}
		}
		document.body.removeChild(document.getElementById(id));
		if (deck.length == 0 && gameType != 1) {
			if (hand.length == 0) {
				endGame('Congratulations! You win.');
				return;
			}
			moveHand();
			let hasDivisor = false;
			for (let i=0; i<hand.length; i++) {
				if (total % hand[i][0] == 0) {
					hasDivisor = true;
				}
			}
			if (!hasDivisor) {
				endGame(`Game over! You achieved a score of ${score}`);
				return;
			}
		} else {
			drawCard();
		}
		if (total == 0) {
			endGame(`Game over! You achieved a score of ${score}`);
		}
	}
}

function requestFullscreen (element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	}
}

function startGame () {
	if (document.getElementById('alertWrapper')) {
		document.getElementById('alertWrapper').remove();
	}

	let alertWrapper = document.createElement('div');
	alertWrapper.id = 'alertWrapper';

	let startDisplay = document.createElement('div');
	startDisplay.id = 'startDisplay';
	startDisplay.className = 'gameAlert';
	startDisplay.innerHTML = 'Select the gamemode you wish to play:';

	let optionWrapper = document.createElement('div');
	optionWrapper.id = 'optionWrapper';

	let option1 = document.createElement('div');
	option1.className = 'gameOption';
	option1.innerHTML = `
		<span>C</span>
		<span>l</span>
		<span>a</span>
		<span>s</span>
		<span>s</span>
		<span>i</span>
		<span>c</span>
	`;
	option1.addEventListener('click', () => {
		requestFullscreen(document.body);
		startClassicGame();
	});

	let option2 = document.createElement('div');
	option2.className = 'gameOption';
	option2.innerHTML = `
		<span>E</span>
		<span>n</span>
		<span>d</span>
		<span>l</span>
		<span>e</span>
		<span>s</span>
		<span>s</span>
	`;
	option2.addEventListener('click', () => {
		requestFullscreen(document.body);
		startEndlessGame();
	});

	let option3 = document.createElement('div');
	option3.className = 'gameOption';
	option3.innerHTML = `
		<span>H</span>
		<span>a</span>
		<span>r</span>
		<span>d</span>
		<span>c</span>
		<span>o</span>
		<span>r</span>
		<span>e</span>
	`;
	option3.addEventListener('click', () => {
		requestFullscreen(document.body);
		startHardcoreGame();
	});

	optionWrapper.appendChild(option1);
	optionWrapper.appendChild(option2);
	optionWrapper.appendChild(option3);
	startDisplay.appendChild(optionWrapper);
	alertWrapper.appendChild(startDisplay);
	document.body.appendChild(alertWrapper);
}

function startClassicGame () {
	document.getElementById('alertWrapper').remove();

	deck =
		[1, 1, 1, 1,
		2, 2, 2, 2,
		3, 3, 3, 3,
		4, 4, 4, 4,
		5, 5, 5, 5,
		6, 6, 6, 6,
		7, 7, 7, 7,
		8, 8, 8, 8,
		9, 9, 9, 9,
		10, 10, 10, 10,
		11, 11, 11, 11];

	hand = [];
	cardIDCounter = 0;
	score = 0;
	gameType = 0;

	let deckDisplay = document.createElement('div');
	deckDisplay.id = 'deckDisplay';
	deckDisplay.innerHTML = `Cards Left: ${deck.length}`;
	document.body.appendChild(deckDisplay);

	let menuButton = document.createElement('div');
	menuButton.id = 'menuButton';
	menuButton.addEventListener("click", () => {
		removeAllChildNodes(document.getElementsByTagName('body')[0]);

		let homePage = document.createElement('div');
		homePage.id = 'wrapper';
		homePage.className = 'homepage';

		document.getElementsByTagName('body')[0].appendChild(homePage);
		interstitial();
		home();
	});
	menuButton.innerHTML = `
		<span>Q</span>
		<span>u</span>
		<span>i</span>
		<span>t</span>
	`;
	menuButton.className = 'homepageButton';
	document.body.appendChild(menuButton);

	let totalWrapper = document.createElement('div');
	totalWrapper.id = 'totalWrapper';

	let totalDisplay = document.createElement('div');
	totalDisplay.id = 'totalDisplay';
	total = 0;
	totalDisplay.innerHTML = total;

	let decreaseTotal = document.createElement('div');
	decreaseTotal.id = 'decreaseTotal';

	let increaseTotal = document.createElement('div');
	increaseTotal.id = 'increaseTotal';

	totalWrapper.appendChild(decreaseTotal);
	totalWrapper.appendChild(totalDisplay);
	totalWrapper.appendChild(increaseTotal);
	document.body.appendChild(totalWrapper);

	shuffleDeck();
	drawHand();
}

function startEndlessGame () {
	document.getElementById('alertWrapper').remove();

	hand = [];
	cardIDCounter = 0;
	score = 0;
	gameType = 1;

	let deckDisplay = document.createElement('div');
	deckDisplay.id = 'deckDisplay';
	deckDisplay.innerHTML = `Score: ${score}`;
	document.body.appendChild(deckDisplay);

	let menuButton = document.createElement('div');
	menuButton.id = 'menuButton';
	menuButton.onclick = () => {
		removeAllChildNodes(document.getElementsByTagName('body')[0]);

		let homePage = document.createElement('div');
		homePage.id = 'wrapper';
		homePage.className = 'homepage';

		document.getElementsByTagName('body')[0].appendChild(homePage);
		interstitial();
		home();
	};
	menuButton.innerHTML = `
		<span>Q</span>
		<span>u</span>
		<span>i</span>
		<span>t</span>
	`;
	menuButton.className = 'homepageButton';
	document.body.appendChild(menuButton);

	let totalWrapper = document.createElement('div');
	totalWrapper.id = 'totalWrapper';

	let totalDisplay = document.createElement('div');
	totalDisplay.id = 'totalDisplay';
	total = 0;
	totalDisplay.innerHTML = total;

	let decreaseTotal = document.createElement('div');
	decreaseTotal.id = 'decreaseTotal';

	let increaseTotal = document.createElement('div');
	increaseTotal.id = 'increaseTotal';

	totalWrapper.appendChild(decreaseTotal);
	totalWrapper.appendChild(totalDisplay);
	totalWrapper.appendChild(increaseTotal);
	document.body.appendChild(totalWrapper);

	drawHand();
}

function startHardcoreGame () {
	document.getElementById('alertWrapper').remove();

	hand = [];
	cardIDCounter = 0;
	score = 0;
	gameType = 2;
	lives = 3;

	deck =
		[1, 1, 1, 1,
		2, 2, 2, 2,
		3, 3, 3, 3,
		4, 4, 4, 4,
		5, 5, 5, 5,
		6, 6, 6, 6,
		7, 7, 7, 7,
		8, 8, 8, 8,
		9, 9, 9, 9,
		10, 10, 10, 10,
		11, 11, 11, 11];

	let deckDisplay = document.createElement('div');
	deckDisplay.id = 'deckDisplay';
	deckDisplay.innerHTML = `Cards Left: ${deck.length}`;
	document.body.appendChild(deckDisplay);

	let menuButton = document.createElement('div');
	menuButton.id = 'menuButton';
	menuButton.onclick = () => {
		removeAllChildNodes(document.getElementsByTagName('body')[0]);

		let homePage = document.createElement('div');
		homePage.id = 'wrapper';
		homePage.className = 'homepage';

		document.getElementsByTagName('body')[0].appendChild(homePage);
		interstitial();
		home();
	};
	menuButton.innerHTML = `
		<span>Q</span>
		<span>u</span>
		<span>i</span>
		<span>t</span>
	`;
	menuButton.className = 'homepageButton';
	document.body.appendChild(menuButton);

	let totalWrapper = document.createElement('div');
	totalWrapper.id = 'totalWrapper';

	let totalDisplay = document.createElement('div');
	totalDisplay.id = 'totalDisplay';
	total = 0;
	totalDisplay.innerHTML = total;

	let decreaseTotal = document.createElement('div');
	decreaseTotal.id = 'decreaseTotal';

	let increaseTotal = document.createElement('div');
	increaseTotal.id = 'increaseTotal';

	totalWrapper.appendChild(decreaseTotal);
	totalWrapper.appendChild(totalDisplay);
	totalWrapper.appendChild(increaseTotal);
	document.body.appendChild(totalWrapper);

	let lifeWrapper = document.createElement('div');
	lifeWrapper.id = 'lifeWrapper';
	lifeWrapper.innerHTML = `
		<img class="lifeIcon" id="life3" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
		<img class="lifeIcon" id="life2" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
		<img class="lifeIcon" id="life1" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
	`;

	document.body.appendChild(lifeWrapper);

	shuffleDeck();
	drawHand();
}

function endGame (message) {
	document.getElementById('deckDisplay').remove();
	document.getElementById('totalWrapper').remove();
	document.getElementById('menuButton').remove();
	if (document.getElementById('lifeWrapper')) document.getElementById('lifeWrapper').remove();
	let allCards = document.querySelectorAll('[class$="card"]');
	allCards.forEach(thisCard => {
		thisCard.remove();
	});

	let alertWrapper = document.createElement('div');
	alertWrapper.id = 'alertWrapper';

	let startDisplay = document.createElement('div');
	startDisplay.id = 'startDisplay';
	startDisplay.className = 'gameAlert';
	startDisplay.innerHTML = `${message}`;

	let optionWrapper = document.createElement('div');
	optionWrapper.id = 'optionWrapper';

	let option1 = document.createElement('div');
	option1.className = 'gameOption';
	option1.innerHTML = `
		<span>M</span>
		<span>e</span>
		<span>n</span>
		<span>u</span>
	`;
	option1.onclick = () => {
		removeAllChildNodes(document.getElementsByTagName('body')[0]);

		let homePage = document.createElement('div');
		homePage.id = 'wrapper';
		homePage.className = 'homepage';

		document.getElementsByTagName('body')[0].appendChild(homePage);
		interstitial();
		home();
	};

	let option2 = document.createElement('div');
	option2.className = 'gameOption';
	option2.innerHTML = `
		<span>N</span>
		<span>e</span>
		<span>w</span>
		<span>&nbsp;</span>
		<span>G</span>
		<span>a</span>
		<span>m</span>
		<span>e</span>
	`;
	option2.addEventListener("click", () => {
		interstitial();
		startGame();
	});

	optionWrapper.appendChild(option1);
	optionWrapper.appendChild(option2);
	startDisplay.appendChild(optionWrapper);
	alertWrapper.appendChild(startDisplay);
	document.body.appendChild(alertWrapper);
}

function tutorial () {
	removeAllChildNodes(document.getElementById('wrapper'));

	let pageWrapper = document.createElement('div');
	pageWrapper.id = 'pageWrapper';
	document.getElementById('wrapper').appendChild(pageWrapper);

	goToPage(0);
}

function goToPage (tutorialPage) {
	let page = document.createElement('div');
	page.id = 'page';
	if (tutorialPage == 0) {
		page.innerHTML = `
			<div id="page0Text">
				<div class="tutorialText">
					Welcome to Arithmio, a game of arithmetic and clever combinations! There are four modes: classic, endless, hardcore, and multiplayer. Each mode offers its own twist on the main premise of divisor hopping. The classic version can also be played with a standard deck of cards with Ace = 1 up to Jack = 11, removing all other cards.
				</div>
			</div>
		`;
	} else if (tutorialPage == 1) {
		page.innerHTML = `
			<div id="totalWrapper">
				<img id="decreaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
				<div id="totalDisplay">56</div>
				<img id="increaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
			</div>
			<div id="page1Text">
				<div class="tutorialText">
					The central number on screen is the Aggregate. You can only play cards whose value divides the Aggregate evenly. In this example, the Aggregate is 56 so the only playable cards would be 1, 2, 4, 7, 8 (and 14, 16 in Endless).
				</div>
			</div>
		`;
	} else if (tutorialPage == 2) {
		page.innerHTML = `
			<div id="totalWrapper">
				<img id="decreaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
				<div id="totalDisplay" style="color:green">63</div>
				<img id="increaseTotal" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E">
			</div>
			<div id="page2Text">
				<div class="tutorialText">
					In order to play a card, <u>click and drag it onto the plus or the minus symbol</u>. Playing it on the plus will add its value to the Aggregate, while playing it on the minus will subtract it from the Aggregate. You will receive points equal to the value of the card played. If the Aggregate ever reaches 0, the game immediately ends.
				</div>
			</div>
		`;
	} else if (tutorialPage == 3) {
		page.innerHTML = `
			<div id="page3Text">
				<div class="tutorialText">
					Classic mode is the original Arithmio experience. You start with four of each number 1 through 11 randomly shuffled and your aim is to run out of cards.
				</div>
			</div>
		`;
	} else if (tutorialPage == 4) {
		page.innerHTML = `
			<div id="page4Text">
				<div class="tutorialText">
					Endless mode is entirely focused on survival. The value of cards drawn is completely random, but will also steadily increase over time. Your score is technically unlimited, but will become progressively more difficult to obtain.
				</div>
			</div>
		`;
	} else if (tutorialPage == 5) {
		page.innerHTML = `
			<div id="tutorialLifeWrapper">
				<img class="lifeIcon" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
				<img class="lifeIcon" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
				<img class="lifeIcon" src="data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E" alt>
			</div>
			<div id="page5Text">
				<div class="tutorialText">
					Hardcore is similar to classic in that the deck is finite and you win if you run through the entire deck, but you are now limited to 3 lives. Divisors of the Aggregate will no longer be emphasized, and if you attempt to play a card that is not a divisor, you will lose a life. Lose all 3 lives and the game ends. Furthermore, the initial Aggregate can be in the thousands, requiring you to truly master modular arithmetic in order to overcome this challenge.
				</div>
			</div>
		`;
	} else if (tutorialPage == 6) {
		page.innerHTML = `
			<div id="page6Text">
				<div class="tutorialText">
					During multiplayer, players take turns playing as many cards as they can before drawing new ones. Note though that you cannot play the same card twice in a row during your turn (i.e. you can play 3 -> 6 -> 3, but not 6 -> 3 -> 3). If you end your turn without playing any cards, you will draw a 1. Players compete to reach the point goal first, but can also prematurely end the game by driving the Aggregate to 0. However, the player to do so will receive a 50 point penalty before final scores are calculated.
				</div>
			</div>
		`;
	} else if (tutorialPage == 7) {
		page.innerHTML = `
			<div id="page7Text">
				<div class="tutorialText">
					You are now ready to try Arithmio! The game is meant to facilitate the learning of arithmetic, in particular division. Hope you enjoy and thanks for playing!
				</div>
			</div>
		`;
	}

	const pageCount = 7;
	if (tutorialPage == pageCount) {
		page.innerHTML = `${page.innerHTML}
			<div id="doneButton" class="tutorialButton">
				<span>D</span>
				<span>o</span>
				<span>n</span>
				<span>e</span>
			</div>
		`;
	} else {
		page.innerHTML = `${page.innerHTML}
			<div id="forwardButton" class="tutorialButton">
				<span>N</span>
				<span>e</span>
				<span>x</span>
				<span>t</span>
			</div>
		`;
	}

	page.innerHTML = `${page.innerHTML}
		<div id="backButton" class="tutorialButton">
			<span>B</span>
			<span>a</span>
			<span>c</span>
			<span>k</span>
		</div>
	`;

	removeAllChildNodes(document.getElementById('wrapper'));
	document.getElementById('wrapper').appendChild(page);

	if (document.getElementById('backButton')) {
		document.getElementById('backButton').addEventListener('click', () => {
			if (tutorialPage <= 0) {
				home();
			} else {
				goToPage(tutorialPage - 1);
			}
		});
	}
	if (document.getElementById('forwardButton')) {
		document.getElementById('forwardButton').addEventListener('click', () => {
			goToPage(tutorialPage + 1);
		});
	}
	if (document.getElementById('doneButton')) {
		document.getElementById('doneButton').addEventListener('click', () => {
			home();
		});
	}
}

function multiplayerChoice () {
	removeAllChildNodes(document.getElementById('wrapper'));

	let choiceDisplay = document.createElement('div');
	choiceDisplay.id = 'choiceDisplay';
	choiceDisplay.innerHTML = `
		<div id="goHome" class="homepageButton">
			<span>B</span>
			<span>a</span>
			<span>c</span>
			<span>k</span>
		</div>
		<div id="joinGame" class="homepageButton">
			<span>J</span>
			<span>o</span>
			<span>i</span>
			<span>n</span>
		</div>
		<div id="hostGame" class="homepageButton">
			<span>H</span>
			<span>o</span>
			<span>s</span>
			<span>t</span>
		</div>
	`;

	document.getElementById('wrapper').appendChild(choiceDisplay);
	document.getElementById('goHome').addEventListener("click", () => home());
	document.getElementById('joinGame').addEventListener("click", () => join());
	document.getElementById('hostGame').addEventListener("click", () => chooseSettings());
}

function chooseSettings () {
	removeAllChildNodes(document.getElementById('wrapper'));

	let settingsDisplay = document.createElement('div');
	settingsDisplay.id = 'settingsDisplay';
	settingsDisplay.innerHTML = `
		<div>Game Settings</div>
		<div id="wrapper1" class="settingsWrapper">
			<div>Players:</div>
			<input type="number" id="maxPlayers" name="maxPlayers" min="2" max="8" value="4">
		</div>
		<div id="wrapper2" class="settingsWrapper">
			<div>Victory Points:</div>
			<input type="number" id="winPoints" name="winPoints" min="100" max="1000" value="200">
		</div>
		<div id="wrapper3" class="settingsWrapper">
			<div>Game Speed:</div>
			<select id="gameSpeed" name="gameSpeed">
				<option value="-1">Unlimited</option>
				<option value="90">Slow</option>
				<option value="40" selected>Normal</option>
				<option value="20">Fast</option>
				<option value="10">Lightning</option>
			</select>
		</div>
		<div id="wrapper4" class="settingsWrapper2">
			<div id="multiplayerChoice" class="homepageButton" style="font-size:4vw">
				<span>B</span>
				<span>a</span>
				<span>c</span>
				<span>k</span>
			</div>
			<div id="createGame" class="homepageButton" style="font-size:4vw">
				<span>C</span>
				<span>r</span>
				<span>e</span>
				<span>a</span>
				<span>t</span>
				<span>e</span>
			</div>
		</div>
	`;

	document.getElementById('wrapper').appendChild(settingsDisplay);
	document.getElementById('multiplayerChoice').addEventListener("click", () => multiplayerChoice());
	document.getElementById('createGame').addEventListener("click", () => createGame());
}

function join () {
	removeAllChildNodes(document.getElementById('wrapper'));

	let joinDisplay = document.createElement('div');
	joinDisplay.id = 'joinDisplay';
	joinDisplay.innerHTML = `
		<div id="wrapper1" class="settingsWrapper">
			<div>Room Code:</div>
			<input type="text" id="joinCode" name="joinCode">
		</div>
		<div id="wrapper2" class="settingsWrapper">
			<div>Name:</div>
			<input type="text" id="joinName" name="joinName">
		</div>
		<div id="wrapper3" class="settingsWrapper2">
			<div id="multiplayerChoice" class="homepageButton" style="font-size:4vw">
				<span>B</span>
				<span>a</span>
				<span>c</span>
				<span>k</span>
			</div>
			<div id="joinGame" class="homepageButton" style="font-size:4vw">
				<span>J</span>
				<span>o</span>
				<span>i</span>
				<span>n</span>
			</div>
		</div>
	`;

	document.getElementById('wrapper').appendChild(joinDisplay);

	document.getElementById('multiplayerChoice').addEventListener('click', () => multiplayerChoice());
	document.getElementById('joinGame').addEventListener('click', () => joinGame());

	document.getElementById('joinCode').addEventListener('input', () => {
		document.getElementById('joinCode').value = document.getElementById('joinCode').value.toUpperCase();
	});
}

function createGame () {
	const maxPlayers = document.getElementById('maxPlayers').value;
	const winPoints = document.getElementById('winPoints').value;
	const gameSpeed = document.getElementById('gameSpeed').value;

	if (maxPlayers != parseInt(maxPlayers)) {
		alert('Please enter a valid number of players.');
		return;
	}

	if (winPoints != parseInt(winPoints)) {
		alert('Please enter a valid score.');
		return;
	}
	
	fetch(`${hostname}${route}/start`, {
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			maxPlayers: maxPlayers,
			winPoints: winPoints,
			gameSpeed: gameSpeed
		}),
		method: 'POST'
	})
	.then(res => res.json())
	.then(data => {
		removeAllChildNodes(document.getElementById('wrapper'));

		let codeDisplay = document.createElement('div');
		codeDisplay.id = 'codeDisplay';
		codeDisplay.innerHTML = `
			<div id="codeTitle">${data.roomCode}</div>
			<div id="wrapper1" class="settingsWrapper">
				<div>Name: </div>
				<input type="text" id="joinName" name="joinName">
			</div>
			<div id="wrapper2" class="settingsWrapper2">
				<div id="multiplayerChoice" class="homepageButton" style="font-size:4vw">
					<span>B</span>
					<span>a</span>
					<span>c</span>
					<span>k</span>
				</div>
				<div id="joinGame" class="homepageButton" style="font-size:4vw">
					<span>J</span>
					<span>o</span>
					<span>i</span>
					<span>n</span>
				</div>
			</div>
		`;

		document.getElementById('wrapper').appendChild(codeDisplay);

		document.getElementById('multiplayerChoice').addEventListener('click', () => multiplayerChoice());
		document.getElementById('joinGame').addEventListener('click', () => joinGame());
	})
	.catch(err => {
		console.log(err);
	});
}

function joinGame () {
	let code;
	if (document.getElementById('joinCode')) {
		code = document.getElementById('joinCode').value;
	} else {
		code = document.getElementById('codeTitle').innerHTML;
	}
	console.log(code);
	let name = document.getElementById('joinName').value;
	if (name.length > 13) {
		alert('Please pick a shorter name.');
		return;
	}
	for (let i=0; i<name.length; i++) {
		let ascii = name.charCodeAt(i);
		if (!(ascii > 47 && ascii < 58) && !(ascii > 64 && ascii < 91) && !(ascii > 96 && ascii < 123)) {
			alert('Please use valid characters in name.');
			return;
		}
	}
	// axios.post(`${hostname}${route}/join`,
	// 	{joinCode: code,
	// 	joinName: name})
	fetch(`${hostname}${route}/join`, {
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			joinCode: code,
			joinName: name
		}),
		method: 'POST'
	})
	.then(res => res.json())
	.then(data => {
		if (data.access === 'dne') {
			alert('Room does not exist.');
		} else if (data.access === 'full') {
			alert('Room is full.');
		} else if (data.access === 'dupl') {
			alert('That name is already taken.');
		} else if (data.access === 'granted') {
			appRoomCode = code;
			appPlayerId = data.playerID;
				clientHand = [];
				cardIDCounter = 0;
				isMyTurn = false;
				clientTurn = -1;
				isMultiplayer = true;

				socket.emit('joinArithmio', appRoomCode, appPlayerId);


				let multiplayerBackground = document.createElement('div');
				multiplayerBackground.id = "multiplayerBackground";
				let gameWrapper = document.createElement("div");
				gameWrapper.id = "gameWrapper";

				document.getElementById('wrapper').remove();

				document.getElementsByTagName('body')[0].appendChild(multiplayerBackground);
				document.getElementsByTagName('body')[0].appendChild(gameWrapper);

				getLastCard(appRoomCode, appPlayerId);
		}
	})
	.catch(err => {
		console.log(err);
	});
}

socket.on('updateArithmio', (gameState) => {
	renderGame(gameState);
});

socket.on('sendChat', (name, message) => {
	if (document.getElementById('messageWrapper')) {
		let messageWrapper = document.getElementById('messageWrapper');

		let chatMessage = document.createElement('div');
		chatMessage.className = 'chatMessage';
		if (messageWrapper.children.length % 2 == 0) {
			chatMessage.style.backgroundColor = 'white';
		} else {
			chatMessage.style.backgroundColor = '#dddddd';
		}

		let chatName = document.createElement('div');
		chatName.className = 'chatName';
		chatName.textContent = `${name}:`;

		let chatContent = document.createElement('div');
		chatContent.className = 'chatContent';
		chatContent.textContent = `${message}`;

		chatMessage.appendChild(chatName);
		chatMessage.appendChild(chatContent);
		messageWrapper.insertBefore(chatMessage, messageWrapper.firstChild);

		if (document.getElementById('winner')) {
			let messages = messageWrapper.children;
			for (let i=0; i<messages.length; i++) {
				if (i > 9) {
					messages[i].remove();
				} else {
					messages[i].style.opacity = `${1 - 0.1 * i}`;
				}
			}
		}
	}
});

async function moveHandMultiplayer (isMyTurn) {
	for (let i=0; i<clientHand.length; i++) {
		let dest = handToDest(clientHand.length, i, clientHand[i][0], isMyTurn, lastCard);
		moveCard(clientHand[i][1], dest[0], dest[1], dest[2], dest[3], dest[4], 0.5);
	}
}

async function displayTimer (parentPlayer, totalTime, turnNumber) {
	if (document.getElementById('playerTimer')) document.getElementById('playerTimer').remove();

	let playerTimer = document.createElement('div');
	playerTimer.id = 'playerTimer';
	if (parentPlayer.id.includes('player')) {
		let rect = parentPlayer.getBoundingClientRect();
		playerTimer.style.height = `${rect.bottom - rect.top}px`;
		playerTimer.style.left = '-3px';
	}

	parentPlayer.appendChild(playerTimer);

	if (totalTime <= 0) {
		return;
	}
	totalTime *= 1000;

	let timedTime = 0;
	const timeIncrement = 50;
	while (timedTime < totalTime) {
		timedTime += timeIncrement;
		let timeout = timedTime;
		setTimeout(() => {
			if (clientTurn == turnNumber && document.getElementById('playerTimer')) {
				document.getElementById('playerTimer').style.width = `${103 * timeout / totalTime}%`;
			}
		}, timeout);
	}
	await timer(totalTime);

	socket.emit('forceEndTurn', appRoomCode, appPlayerId, turnNumber);
	return;
}

function renderGame (gameState) {
	if (gameState.phase == 0) {
		let playerList = ``;
		for (let i=0; i<gameState.players.length; i++) {
			playerList += `<div>${gameState.players[i].name}</div>`;
		}
		document.getElementById('gameWrapper').innerHTML = `
			<div id="lobbyDisplay">
				<div id="codeTitle">${appRoomCode}</div>
				<div id="playerCount">Players: ${gameState.players.length}/${gameState.settings.maxPlayers}</div>
				<div id="playerDisplay">
					${playerList}
				</div>
			</div>
		`;
	} else if (gameState.phase == 1) {
		if (document.getElementById('lobbyDisplay')) document.getElementById('lobbyDisplay').remove();
		if (document.getElementById('totalWrapper')) document.getElementById('totalWrapper').remove();

		isMyTurn = appPlayerId == gameState.game.turn % gameState.players.length;
		lastCard = gameState.players[appPlayerId].lastCard;

		let totalWrapper = document.createElement('div');
		totalWrapper.id = 'totalWrapper';
		totalWrapper.style.width = "90vw";

		let totalDisplay = document.createElement('div');
		totalDisplay.id = 'totalDisplay';
		totalDisplay.innerHTML = total;

		let decreaseTotal = document.createElement('div');
		decreaseTotal.id = 'decreaseTotal';
		decreaseTotal.style.width = "12vw";

		let increaseTotal = document.createElement('div');
		increaseTotal.id = 'increaseTotal';
		increaseTotal.style.width = "12vw";

		if (!isMyTurn) {
			decreaseTotal.style.visibility = 'hidden';
			increaseTotal.style.visibility = 'hidden';
		}

		if (keyboardUp) {
			totalWrapper.style.display = "none";
		}

		totalWrapper.appendChild(decreaseTotal);
		totalWrapper.appendChild(totalDisplay);
		totalWrapper.appendChild(increaseTotal);
		document.getElementById('gameWrapper').appendChild(totalWrapper);

		if (total != gameState.game.total) {
			changeTotal(gameState.game.total);
			total = gameState.game.total;
		}
		if (total > 999) {
			totalDisplay.style.fontSize = '30vh';
		} else if (total > 99) {
			totalDisplay.style.fontSize = '40vh';
		} else {
			totalDisplay.style.fontSize = '50vh';
		}

		if (clientHand != gameState.players[appPlayerId].hand) {
			let tempClientHand = [];
			let tempServerHand = [];

			for (let i=0; i<clientHand.length; i++) {
				tempClientHand.push(clientHand[i]);
			}
			for (let i=0; i<gameState.players[appPlayerId].hand.length; i++) {
				tempServerHand.push(gameState.players[appPlayerId].hand[i]);
			}

			//Find which cards the server has in our hand that we actually don't have in our hand
			for (let i=0; i<tempServerHand.length; i++) {
				for (let j=0; j<tempClientHand.length; j++) {
					if (tempClientHand[j][0] == tempServerHand[i]) {
						tempClientHand.splice(j, 1);
						tempServerHand.splice(i, 1);
						i--;
						j = tempClientHand.length;
					}
				}
			}

			//Draw all the cards we need
			for (let i=0; i<tempServerHand.length; i++) {
				clientHand.push([tempServerHand[i], cardIDCounter]);
				cardIDCounter++;
				createCard(`${tempServerHand[i]}`, '86vw', '70vh', 10, '9vw', '25vh', document.body, `${clientHand[clientHand.length - 1][1]}`);
				clientHand.sort((card1, card2) => {
					return card1[0] - card2[0];
				});
			}

			moveHandMultiplayer(isMyTurn);
		}

		if (gameState.game.turn != clientTurn) {
			if (document.getElementById('playerInfo')) document.getElementById('playerInfo').remove();
			let playerInfo = document.createElement('div');
			playerInfo.id = 'playerInfo';
			for (let i=1; i<gameState.players.length; i++) {
				let thisPlayerWrapper = document.createElement('div');
				thisPlayerWrapper.id = `${(appPlayerId + i) % gameState.players.length}player`;
				thisPlayerWrapper.className = 'playerWrapper';

				let thisPlayerName = document.createElement('div');
				thisPlayerName.className = 'playerName';
				thisPlayerName.innerHTML = `${gameState.players[(appPlayerId + i) % gameState.players.length].name}:`;

				let thisPlayerScore = document.createElement("div");
					thisPlayerScore.className = "playerScore";
				if (gameState.players[(appPlayerId + i) % gameState.players.length].hasResigned) {
					thisPlayerScore.innerHTML = `X`;
				} else {
					thisPlayerScore.innerHTML = `${gameState.players[(appPlayerId + i) % gameState.players.length].score}`;
				}

				if (gameState.players[(appPlayerId + i) % gameState.players.length].name.length > 8) {
					thisPlayerName.style.fontSize = '1.5vw';
				}

				if (((appPlayerId + i) % gameState.players.length) == (gameState.game.turn % gameState.players.length)) {
					thisPlayerWrapper.style.boxShadow = '0 0 5px 2px #000000, 0 0 5px 2px #000000, 0 0 5px 2px #000000';
					thisPlayerWrapper.style.borderRadius = '15px';
				} else {
					thisPlayerWrapper.style.boxShadow = 'none';
				}

				thisPlayerWrapper.appendChild(thisPlayerName);
				thisPlayerWrapper.appendChild(thisPlayerScore);
				playerInfo.appendChild(thisPlayerWrapper);
			}

			if (keyboardUp) {
				playerInfo.style.display = "none";
			}
			document.getElementById('gameWrapper').appendChild(playerInfo);

		}

		if (document.getElementById('endTurnBtn')) document.getElementById('endTurnBtn').remove();
		if (isMyTurn) {
			let endTurnBtn = document.createElement('div');
			endTurnBtn.id = 'endTurnBtn';
			endTurnBtn.innerHTML = 'End Turn';
			endTurnBtn.onclick = () => {
				socket.emit('endTurn', appRoomCode, appPlayerId);
			};
			if (keyboardUp) {
				endTurnBtn.style.display = "none";
			}

			document.getElementById('gameWrapper').appendChild(endTurnBtn);
		}

		if (!document.getElementById('myInfo')) {
			let myInfo = document.createElement('div');
			myInfo.id = 'myInfo';

			let myName = document.createElement('div');
			myName.id = 'myName';
			myName.innerHTML = `${gameState.players[appPlayerId].name}:`;

			let myScore = document.createElement("div");
      		myScore.id = "myScore";
      		if (gameState.players[appPlayerId].hasResigned) {
        		myScore.innerHTML = `X`;
      		} else {
        		myScore.innerHTML = `${gameState.players[appPlayerId].score}`;
      		}

			if (gameState.players[appPlayerId].name.length > 10) {
				myName.style.fontSize = '2.5vw';
			} else if (gameState.players[appPlayerId].name.length > 7) {
				myName.style.fontSize = '3vw';
			} else if (gameState.players[appPlayerId].name.length > 4) {
				myName.style.fontSize = '3.5vw';
			}

			if (keyboardUp) {
				myInfo.style.display = "none";
			}

			myInfo.appendChild(myName);
			myInfo.appendChild(myScore);
			document.getElementById('gameWrapper').appendChild(myInfo);
		} else {
			if (gameState.players[appPlayerId].hasResigned) {
        		document.getElementById('myScore').innerHTML = `X`;
      		} else {
        		document.getElementById('myScore').innerHTML = `${gameState.players[appPlayerId].score}`;
      		}
		}

		//Highlight player info if it's their turn
		if (isMyTurn) {
			document.getElementById('myInfo').style.boxShadow = '0 0 5px 3px #000000, 0 0 5px 3px #000000, 0 0 5px 3px #000000';
			document.getElementById('myInfo').style.borderRadius = '15px';
		} else {
			document.getElementById('myInfo').style.boxShadow = 'none';
		}

		//Show how many points to win game and resign button
		if (!document.getElementById("multiplayerMenu")) {
			let multiplayerMenu = document.createElement("div");
			multiplayerMenu.id = "multiplayerMenu";
	  
			let objectiveDisplay = document.createElement("div");
			objectiveDisplay.id = "objectiveDisplay";
			objectiveDisplay.innerHTML = `First to ${gameState.settings.winPoints}`;
	  
			let resignButton = document.createElement("div");
			resignButton.id = "resignButton";
			resignButton.innerHTML = `Resign`;
			resignButton.addEventListener("click", () => {
			  if (confirm("Are you sure you want to resign?")) {
				socket.emit("resignGame", appRoomCode, appPlayerId);
			  }
			});
	  
			multiplayerMenu.appendChild(objectiveDisplay);
			multiplayerMenu.appendChild(resignButton);
			document.getElementById("gameWrapper").appendChild(multiplayerMenu);
		}

		//Start timer
		if (gameState.game.turn != clientTurn) {
			clientTurn = gameState.game.turn;
			if (isMyTurn) {
				displayTimer(document.getElementById('myInfo'), gameState.settings.gameSpeed, gameState.game.turn);
			} else {
				displayTimer(document.getElementById(`${gameState.game.turn % gameState.players.length}player`), gameState.settings.gameSpeed, gameState.game.turn);
			}
		}

		//Create chatbox
		if (!document.getElementById('chatWrapper')) {
			let chatWrapper = document.createElement('div');
			chatWrapper.id = 'chatWrapper';

			let inputWrapper = document.createElement('div');
			inputWrapper.id = 'inputWrapper';

			let inputBox = document.createElement('input');
			inputBox.type = 'text';
			inputBox.name = 'inputBox';
			inputBox.id = 'inputBox';
			inputBox.addEventListener('keyup', ({key}) => {
				if (key === 'Enter') {
					socket.emit('sendChat', appRoomCode, appPlayerId, document.getElementById('inputBox').value);
					document.getElementById('inputBox').value = '';
				}
			});

			let inputBtn = document.createElement('div');
			inputBtn.id = 'inputBtn';
			inputBtn.innerHTML = 'Chat';
			inputBtn.onclick = () => {
				socket.emit('sendChat', appRoomCode, appPlayerId, document.getElementById('inputBox').value);
				document.getElementById('inputBox').value = '';
			};

			let messageWrapper = document.createElement('div');
			messageWrapper.id = 'messageWrapper';

			inputWrapper.appendChild(inputBox);
			inputWrapper.appendChild(inputBtn);
			chatWrapper.appendChild(inputWrapper);
			chatWrapper.appendChild(messageWrapper);
			document.getElementById('gameWrapper').appendChild(chatWrapper);
		}
	} else if (gameState.phase == 2) {
		removeAllChildNodes(document.getElementById('gameWrapper'));
		const allImgs = document.querySelectorAll('img');
		for (let i=0; i<allImgs.length; i++) {
			allImgs[i].remove();
		}
		const allCards = document.querySelectorAll('[class$="card"]');
		for (let i=0; i<allCards.length; i++) {
			allCards[i].remove();
		}

		if (!document.getElementById('chatWrapper')) {
			let chatWrapper = document.createElement('div');
			chatWrapper.id = 'chatWrapper';
			chatWrapper.style.width = '90vw';
			chatWrapper.style.right = '5vw';
			chatWrapper.style.bottom = '3vh';
			chatWrapper.style.fontSize = '2vw';
			chatWrapper.style.top = 'unset';
			chatWrapper.style.justifyContent = 'flex-end';

			let inputWrapper = document.createElement('div');
			inputWrapper.id = 'inputWrapper';
			inputWrapper.style.marginTop = '2vh';
			inputWrapper.style.marginBottom = '0';

			let inputBox = document.createElement('input');
			inputBox.type = 'text';
			inputBox.name = 'inputBox';
			inputBox.id = 'inputBox';
			inputBox.style.fontSize = '2vw';
			inputBox.addEventListener('keyup', ({key}) => {
				if (key === 'Enter') {
					socket.emit('sendChat', appRoomCode, appPlayerId, document.getElementById('inputBox').value);
					document.getElementById('inputBox').value = '';
				}
			});

			let inputBtn = document.createElement('div');
			inputBtn.id = 'inputBtn';
			inputBtn.innerHTML = 'Chat';
			inputBtn.onclick = () => {
				socket.emit('sendChat', appRoomCode, appPlayerId, document.getElementById('inputBox').value);
				document.getElementById('inputBox').value = '';
			};
			inputBtn.style.width = '10%';

			let leaveBtn = document.createElement('div');
			leaveBtn.id = 'leaveBtn';
			leaveBtn.innerHTML = 'Leave';
			leaveBtn.onclick = () => {
				removeAllChildNodes(document.getElementsByTagName('body')[0]);

				let homePage = document.createElement('div');
				homePage.id = 'wrapper';
				homePage.className = 'homepage';

				document.getElementsByTagName('body')[0].appendChild(homePage);
				interstitial();
				home();
			};
			leaveBtn.style.width = '10%';

			let messageWrapper = document.createElement('div');
			messageWrapper.id = 'messageWrapper';
			messageWrapper.style.flexDirection = 'column-reverse';

			inputWrapper.appendChild(inputBox);
			inputWrapper.appendChild(inputBtn);
			inputWrapper.appendChild(leaveBtn);
			chatWrapper.appendChild(messageWrapper);
			chatWrapper.appendChild(inputWrapper);
			document.getElementById('gameWrapper').appendChild(chatWrapper);
		}

		if (!document.getElementById('winDisplay')) {
			gameState.players.sort((player1, player2) => {
				return player2.score - player1.score;
			});
			let finishedPlayers = gameState.players.filter((player) => !player.hasResigned);

			let rankingsDisplay = ``;
			for (let i=0; i<finishedPlayers.length; i++) {
				rankingsDisplay += `
					<div class="ranking">
						<div class="rankingName">${finishedPlayers[i].name}</div>
						<div class="rankingScore">${finishedPlayers[i].score}</div>
					</div>
				`;
			}

			let winDisplay = document.createElement('div');
			winDisplay.id = 'winDisplay';
			winDisplay.innerHTML = `
				<div id="winner">${finishedPlayers[0].name} wins!</div>
				${rankingsDisplay}
			`;

			document.getElementById('gameWrapper').appendChild(winDisplay);
		}
	}
}

interstitial();
home();
