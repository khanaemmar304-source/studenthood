/* ===========================================================
   UNO Multiplayer — PART 2 (Multiplayer Engine + Syncing)
   Requires PART 1 (uno.html) and PART 3 (Card Logic)
=========================================================== */

/* ---------------------- SUPABASE INIT ---------------------- */

const SUPABASE_URL = "https://vehaakunkgxwuzdrlfut.supabase.co";
const SUPABASE_ANON =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlaGFha3Vua2d4d3V6ZHJsZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQ3NTUsImV4cCI6MjA4MDAwMDc1NX0.9ZIY7yMIk_eygIw-Q9YJStc8d9HTp_kswJ2Uuq2JQJo";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ---------------------- ROOM & PLAYER ---------------------- */

// Room from URL or new one
const params = new URLSearchParams(location.search);
let ROOM_ID = params.get("room");

if (!ROOM_ID) {
    ROOM_ID = Math.random().toString(36).substring(2, 8);
    window.location.href = `?room=${ROOM_ID}`;
}

// UI room text
document.getElementById("roomId").textContent = "Room: " + ROOM_ID;

// Copy room link
document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(window.location.href);
    document.getElementById("copyBtn").textContent = "Copied!";
    setTimeout(() => {
        document.getElementById("copyBtn").textContent = "Copy Link";
    }, 1000);
};

// Unique player ID
const PLAYER_ID = crypto.randomUUID().slice(0, 8);

// Player store
let players = {};   // { id: { hand: [], name, ready } }
let gameState = {}; // full synced state

/* ---------------------- REALTIME CHANNEL ---------------------- */

const channel = supabase.channel("UNO_" + ROOM_ID, {
    config: {
        broadcast: { self: false }
    }
});

// Receive state updates
channel.on("broadcast", { event: "state" }, ({ payload }) => {
    applyState(payload);
});

// Receive player join
channel.on("broadcast", { event: "join" }, ({ payload }) => {
    players[payload.id] = payload.player;
    updateTurnText("Player joined: " + payload.id);
});

// Receive card played
channel.on("broadcast", { event: "play" }, ({ payload }) => {
    handleCardPlayed(payload);
});

// Start listening
channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
        announceJoin();
        requestLatestState();
    }
});

/* ---------------------- SEND EVENTS ---------------------- */

// When joining room
function announceJoin() {
    channel.send({
        type: "broadcast",
        event: "join",
        payload: {
            id: PLAYER_ID,
            player: {
                name: PLAYER_ID,
                hand: [],
                ready: false
            }
        }
    });
}

// Ask host for latest state (if any)
function requestLatestState() {
    channel.send({
        type: "broadcast",
        event: "state_request",
        payload: { id: PLAYER_ID }
    });
}

// Send updated game state
function sendState() {
    channel.send({
        type: "broadcast",
        event: "state",
        payload: gameState
    });
}

// Send when playing a card
function sendCardPlay(card, newTopCard) {
    channel.send({
        type: "broadcast",
        event: "play",
        payload: {
            player: PLAYER_ID,
            card,
            newTopCard
        }
    });
}

/* ---------------------- STATE HANDLING ---------------------- */

function applyState(state) {
    if (!state) return;

    gameState = state;

    players = state.players;

    renderHand();
    updatePile();
    updateTurnText();
}

// Called when another player plays a card
function handleCardPlayed(data) {
    const { player, card, newTopCard } = data;

    // update local hand if it's mine
    if (player === PLAYER_ID) {
        gameState.players[PLAYER_ID].hand =
            gameState.players[PLAYER_ID].hand.filter(c => c !== card);
    }

    gameState.topCard = newTopCard;

    updatePile();
    updateTurnText();
    renderHand();
}

/* ---------------------- ELEMENTS ---------------------- */

const handDiv = document.getElementById("hand");
const pileCard = document.getElementById("pileCard");
const turnIndicator = document.getElementById("turnIndicator");

/* ---------------------- UI UPDATE HELPERS ---------------------- */

function updatePile() {
    if (!gameState.topCard) return;
    pileCard.src = "img/" + gameState.topCard + ".png";
}

function updateTurnText(textOverride) {
    if (textOverride) {
        turnIndicator.textContent = textOverride;
        return;
    }

    if (!gameState.turn) {
        turnIndicator.textContent = "Waiting for game to start…";
        return;
    }

    if (gameState.turn === PLAYER_ID) {
        turnIndicator.textContent = "Your turn!";
    } else {
        turnIndicator.textContent = gameState.turn + "'s turn";
    }
}

/* ---------------------- RENDER HAND ---------------------- */

function renderHand() {
    handDiv.innerHTML = "";

    if (!players[PLAYER_ID]) return;
    const hand = players[PLAYER_ID].hand;

    hand.forEach(card => {
        const img = document.createElement("img");
        img.src = "img/" + card + ".png";
        img.className = "card";
        img.onclick = () => attemptPlay(card);
        handDiv.appendChild(img);
    });
}

/* -----------------------------------------------------------
   PART 3 WILL ADD:
   - Deck building
   - Dealing cards
   - Turn rotation logic
   - Valid move checking
   - Skip / Reverse / Draw Two
   - Wild and Wild Draw Four
   - Drawing a card
   - Game start button
   - UNO call
----------------------------------------------------------- */

console.log("UNO Multiplayer Engine (PART 2) loaded.");
/* ===========================================================
   UNO Multiplayer — PART 3 (Game Logic + Deck + Turns + Rules)
=========================================================== */

/* ---------------------- UNO DECK ---------------------- */

const colors = ["red", "blue", "green", "yellow"];
const numbers = ["0","1","2","3","4","5","6","7","8","9"];
const specials = ["skip","reverse","draw2"];
const wilds = ["wild","wild4"];

function buildDeck() {
    const deck = [];

    // Colored cards
    colors.forEach(color => {
        // one zero
        deck.push(`${color}_0`);

        // two of 1-9 and specials
        numbers.slice(1).forEach(n => {
            deck.push(`${color}_${n}`);
            deck.push(`${color}_${n}`);
        });
        specials.forEach(s => {
            deck.push(`${color}_${s}`);
            deck.push(`${color}_${s}`);
        });
    });

    // Wild cards
    wilds.forEach(w => {
        deck.push(w);
        deck.push(w);
        deck.push(w);
        deck.push(w);
    });

    return deck;
}

function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

/* ---------------------- GAME START ---------------------- */

function startGame() {
    let deck = shuffle(buildDeck());

    let playersObj = players;
    let playerIds = Object.keys(playersObj);

    // deal 7 cards each
    playerIds.forEach(id => {
        playersObj[id].hand = deck.splice(0, 7);
    });

    // first card must be non-wild
    let top = deck.shift();
    while (top.startsWith("wild")) {
        deck.push(top);
        top = deck.shift();
    }

    gameState = {
        players: playersObj,
        deck,
        topCard: top,
        turnIndex: 0,
        order: 1, // 1 = clockwise, -1 = reverse
        turn: playerIds[0],
        pendingDraw: 0
    };

    sendState();
    applyState(gameState);
}

window.startGame = startGame; // if you want a button later

/* ---------------------- VALID MOVE CHECK ---------------------- */

function isValidPlay(card, topCard) {
    if (!topCard) return true;

    const [cColor, cVal] = card.split("_");
    const [tColor, tVal] = topCard.split("_");

    // Wild always valid
    if (card.startsWith("wild")) return true;

    // Match color
    if (cColor === tColor) return true;

    // Match number/special
    if (cVal === tVal) return true;

    return false;
}

/* ---------------------- PLAY LOGIC ---------------------- */

function attemptPlay(card) {
    // Not your turn?
    if (gameState.turn !== PLAYER_ID) return;

    let top = gameState.topCard;

    if (!isValidPlay(card, top)) {
        turnIndicator.textContent = "Invalid move!";
        return;
    }

    // Remove card locally
    gameState.players[PLAYER_ID].hand =
        gameState.players[PLAYER_ID].hand.filter(c => c !== card);

    // Set new top
    gameState.topCard = card;

    // Special effects
    if (card.includes("reverse")) {
        gameState.order *= -1;
    }
    if (card.includes("skip")) {
        nextPlayer(); // skip effect: move ahead again
    }
    if (card.includes("draw2")) {
        applyDrawToNext(2);
    }
    if (card === "wild4") {
        applyDrawToNext(4);
    }

    // Next turn
    nextPlayer();

    sendState();
}

/* ---------------------- DRAW CARDS ---------------------- */

function applyDrawToNext(amount) {
    let pid = getNextPlayerId();

    for (let i = 0; i < amount; i++) {
        if (gameState.deck.length === 0) {
            // rebuild deck from discard
            gameState.deck = shuffle(buildDeck());
        }
        const card = gameState.deck.shift();
        gameState.players[pid].hand.push(card);
    }
}

/* ---------------------- TURN ROTATION ---------------------- */

function getPlayerOrder() {
    return Object.keys(gameState.players);
}

function getNextPlayerId() {
    let ids = getPlayerOrder();
    let nextIndex =
        (gameState.turnIndex + gameState.order + ids.length) % ids.length;
    return ids[nextIndex];
}

function nextPlayer() {
    let ids = getPlayerOrder();
    gameState.turnIndex =
        (gameState.turnIndex + gameState.order + ids.length) % ids.length;

    gameState.turn = ids[gameState.turnIndex];
}

/* ---------------------- DRAW BUTTON LOGIC ---------------------- */

function drawCard() {
    if (gameState.turn !== PLAYER_ID) return;

    if (gameState.deck.length === 0) {
        gameState.deck = shuffle(buildDeck());
    }

    const card = gameState.deck.shift();
    gameState.players[PLAYER_ID].hand.push(card);

    // After drawing, your turn ends
    nextPlayer();

    sendState();
}

window.drawCard = drawCard; // if you want a button

/* ---------------------- AUTO WIN CHECK ---------------------- */

function checkWin() {
    const hand = gameState.players[PLAYER_ID].hand;
    if (hand.length === 0) {
        alert("🎉 You won!");
    }
}
