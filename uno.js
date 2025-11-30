/* ===========================================================
    UNO Multiplayer – Final Complete Engine
    Works with: uno.html (modern + beige UI)
    Features:
    - Lobby with players list
    - Ready + Start system
    - Turn rotation
    - UNO card rules: skip / reverse / +2 / Wild / +4
    - Draw card
    - Sync via Supabase realtime
=========================================================== */

/* ---------------- SUPABASE SETUP ---------------- */

const SUPABASE_URL = "https://vehaakunkgxwuzdrlfut.supabase.co";
const SUPABASE_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlaGFha3Vua2d4d3V6ZHJsZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjQ3NTUsImV4cCI6MjA4MDAwMDc1NX0.9ZIY7yMIk_eygIw-Q9YJStc8d9HTp_kswJ2Uuq2JQJo";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- ROOM ---------------- */

const params = new URLSearchParams(location.search);
const ROOM_ID = params.get("room") || Math.random().toString(36).slice(2, 8);
document.getElementById("roomId").textContent = ROOM_ID;

const PLAYER_ID = crypto.randomUUID().slice(0, 8);

let players = {};   // { id: { ready:false, hand:[] } }
let order = [];     // join order (leader = order[0])

/* ---------------- UI ---------------- */

const playersList = document.getElementById("playersList");
const lobbyStatus = document.getElementById("lobbyStatus");
const readyBtn = document.getElementById("readyBtn");
const startBtn = document.getElementById("startBtn");

const gameArea = document.getElementById("gameArea");
const topCardImg = document.getElementById("topCard");
const handDiv = document.getElementById("hand");
const turnBox = document.getElementById("turnBox");

/* ---------------- GAME STATE ---------------- */

let gameState = {
    started: false,
    deck: [],
    discard: [],
    topCard: null,
    turn: null,
    turnIndex: 0,
    order: 1, // 1 = clockwise, -1 = reverse
    pendingDraw: 0
};

/* ---------------- DECK ---------------- */

const colors = ["red", "blue", "green", "yellow"];
const numbers = ["0","1","2","3","4","5","6","7","8","9"];
const specials = ["skip","reverse","draw2"];
const wilds = ["wild","wild4"];

function buildDeck() {
  const deck = [];

  colors.forEach(color => {
    deck.push(`${color}_0`);

    numbers.slice(1).forEach(n => {
      deck.push(`${color}_${n}`);
      deck.push(`${color}_${n}`);
    });

    specials.forEach(s => {
      deck.push(`${color}_${s}`);
      deck.push(`${color}_${s}`);
    });
  });

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

/* ---------------- SUPABASE CHANNEL ---------------- */

const channel = supabase.channel("uno_" + ROOM_ID, {
  config: { broadcast: { self: false } }
});

// Player joins
channel.on("broadcast", { event: "join" }, ({ payload }) => {
  if (!payload || !payload.id) return;

  if (!players[payload.id]) {
    players[payload.id] = { ready:false, hand:[] };
    order.push(payload.id);
  }

  renderLobby();
});

// Player leaves
channel.on("broadcast", { event: "leave" }, ({ payload }) => {
  if (!payload || !payload.id) return;

  delete players[payload.id];
  order = order.filter(x => x !== payload.id);

  if (Object.keys(players).length < 2) {
    gameState.started = false;
    renderLobby();
    gameArea.style.display = "none";
  }
});

// Player ready
channel.on("broadcast", { event: "ready" }, ({ payload }) => {
  players[payload.id].ready = true;
  renderLobby();
});

// Receive full game state
channel.on("broadcast", { event: "state" }, ({ payload }) => {
  gameState = payload.state;
  players = payload.players;

  applyGameState();
});

/* Subscribe */
channel.subscribe(status => {
  if (status === "SUBSCRIBED") {
    channel.send({
      type:"broadcast",
      event:"join",
      payload:{ id: PLAYER_ID }
    });

    if (!players[PLAYER_ID]) {
      players[PLAYER_ID] = { ready:false, hand:[] };
      order.push(PLAYER_ID);
    }

    renderLobby();
  }
});

/* ---------------- LOBBY ---------------- */

function renderLobby() {
  const ids = Object.keys(players);
  playersList.innerHTML = "";

  ids.forEach(id => {
    const div = document.createElement("div");
    div.className = "player-item";
    div.innerHTML = `
      ${id === PLAYER_ID ? "⭐ You" : id}
      <span>${players[id].ready ? "Ready ✔" : "Not ready"}</span>
    `;
    playersList.appendChild(div);
  });

  if (ids.length < 2) {
    lobbyStatus.textContent = "Waiting for players…";
    readyBtn.style.display = "none";
    startBtn.style.display = "none";
    return;
  }

  const leader = order[0];

  if (PLAYER_ID === leader) {
    startBtn.style.display = "block";
    readyBtn.style.display = "none";
    lobbyStatus.textContent = "You are leader — press Start when ready.";
  } else {
    startBtn.style.display = "none";
    readyBtn.style.display = players[PLAYER_ID].ready ? "none" : "block";
    lobbyStatus.textContent = players[PLAYER_ID].ready
      ? "Waiting for leader…"
      : "Press Ready.";
  }
}

/* READY BUTTON */
readyBtn.onclick = () => {
  players[PLAYER_ID].ready = true;

  channel.send({
    type:"broadcast",
    event:"ready",
    payload:{ id: PLAYER_ID }
  });

  renderLobby();
};

/* START BUTTON */
startBtn.onclick = () => {
  const ids = Object.keys(players);
  if (ids.length < 2) return;

  // Everyone ready?
  const allReady = ids.every(x => players[x].ready);
  if (!allReady) {
    alert("Not everyone is ready.");
    return;
  }

  startGame();
};

/* ---------------- START GAME ---------------- */

function startGame() {
  let deck = shuffle(buildDeck());
  let ids = Object.keys(players);

  // deal 7 cards each
  ids.forEach(id => {
    players[id].hand = deck.splice(0,7);
  });

  // first top card must not be wild
  let top = deck.shift();
  while (top.startsWith("wild")) {
    deck.push(top);
    top = deck.shift();
  }

  gameState = {
    started: true,
    deck,
    discard: [],
    topCard: top,
    turnIndex: 0,
    turn: ids[0],
    order: 1,
    pendingDraw: 0
  };

  sendState();
  applyGameState();
}

/* ---------------- SEND GAME STATE ---------------- */

function sendState() {
  channel.send({
    type:"broadcast",
    event:"state",
    payload:{
      state: gameState,
      players: players
    }
  });
}

/* ---------------- APPLY GAME STATE TO UI ---------------- */

function applyGameState() {
  if (!gameState.started) return;

  // hide lobby, show game
  document.getElementById("lobby").style.display = "none";
  gameArea.style.display = "block";

  topCardImg.src = "img/" + gameState.topCard + ".png";

  renderHand();
  updateTurnUI();
}

function renderHand() {
  handDiv.innerHTML = "";
  const hand = players[PLAYER_ID].hand;

  hand.forEach(card => {
    const img = document.createElement("img");
    img.className = "card";
    img.src = "img/" + card + ".png";
    img.onclick = () => playCard(card);
    handDiv.appendChild(img);
  });
}

/* ---------------- UNO RULES ---------------- */

function isValidPlay(card, top) {
  if (card.startsWith("wild")) return true;
  if (card.split("_")[0] === top.split("_")[0]) return true;
  if (card.split("_")[1] === top.split("_")[1]) return true;
  return false;
}

/* ---------------- PLAY CARD ---------------- */

function playCard(card) {
  if (gameState.turn !== PLAYER_ID) return;

  let top = gameState.topCard;
  if (!isValidPlay(card, top)) return;

  // remove from hand
  players[PLAYER_ID].hand =
    players[PLAYER_ID].hand.filter(c => c !== card);

  gameState.topCard = card;

  // Handle special
  if (card.includes("reverse")) gameState.order *= -1;
  if (card.includes("skip")) nextPlayer();
  if (card.includes("draw2")) giveDrawToNext(2);
  if (card === "wild4") giveDrawToNext(4);

  nextPlayer();
  sendState();
}

/* ---------------- DRAW CARD ---------------- */

function drawCard() {
  if (gameState.turn !== PLAYER_ID) return;

  if (gameState.deck.length === 0) {
    gameState.deck = shuffle(buildDeck());
  }

  const drawn = gameState.deck.shift();
  players[PLAYER_ID].hand.push(drawn);

  nextPlayer();
  sendState();
}

/* ---------------- TURN ROTATION ---------------- */

function nextPlayer() {
  const ids = Object.keys(players);
  gameState.turnIndex =
    (gameState.turnIndex + gameState.order + ids.length) % ids.length;
  gameState.turn = ids[gameState.turnIndex];
}

function giveDrawToNext(n) {
  const ids = Object.keys(players);
  const nextIndex =
    (gameState.turnIndex + gameState.order + ids.length) % ids.length;

  const target = ids[nextIndex];

  for (let i=0;i<n;i++) {
    if (gameState.deck.length === 0) {
      gameState.deck = shuffle(buildDeck());
    }
    players[target].hand.push(gameState.deck.shift());
  }
}

/* ---------------- UI TURN UPDATE ---------------- */

function updateTurnUI() {
  turnBox.textContent =
    gameState.turn === PLAYER_ID ?
    "Your Turn" :
    "Opponent's Turn";
}

/* ---------------- LEAVE ROOM ON EXIT ---------------- */

window.addEventListener("beforeunload", () => {
  channel.send({
    type:"broadcast",
    event:"leave",
    payload:{ id: PLAYER_ID }
  });
});
