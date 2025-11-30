<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>UNO — Matchmaking + Multiplayer</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif; background:#f4f6f7; margin:0; padding:20px; display:flex; justify-content:center}
  .wrap{width:980px;background:#fff;border-radius:12px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,0.08)}
  h1{margin:0 0 12px}
  .lobby{display:flex;gap:20px;align-items:center}
  .btn{padding:10px 14px;border-radius:8px;border:none;cursor:pointer;background:#4a6556;color:white;font-weight:700}
  .btn.warn{background:#b52b27}
  .info{margin-top:12px;color:#2d3b3b}
  .playersList{margin-top:12px}
  .board{display:flex;gap:20px;margin-top:18px;align-items:flex-start}
  .hand{min-width:420px;background:#f7f7f7;padding:12px;border-radius:8px}
  .card{display:inline-block;padding:8px 10px;border-radius:6px;margin:6px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,0.08)}
  .red{background:#f76b6b;color:#fff} .green{background:#6ad08a;color:#fff} .blue{background:#6b9bd1;color:#fff} .yellow{background:#f2d86b;color:#222}
  .stack{display:flex;flex-direction:column;gap:6px}
  .center{display:flex;flex-direction:column;align-items:center;gap:8px}
  .topbar{display:flex;justify-content:space-between;align-items:center}
  .small{font-size:13px;color:#6b7f7a}
</style>
</head>
<body>

<div class="wrap">
  <div class="topbar">
    <h1>UNO — Matchmaking</h1>
    <div><strong id="roomLabel">Lobby</strong></div>
  </div>

  <div id="mainArea">

    <!-- Lobby UI (shown when no ?room=) -->
    <div id="lobbyUI">
      <div class="lobby">
        <button id="findBtn" class="btn">Find Match</button>
        <button id="cancelBtn" class="btn warn" style="display:none">Cancel</button>
        <div style="margin-left:10px">
          <div class="small">Players in queue: <span id="queueCount">0</span></div>
          <div class="small">Match size: <select id="matchSize"><option>2</option><option selected>4</option></select></div>
        </div>
      </div>

      <div class="info">Matchmaking is peer-driven using Supabase Realtime. Wait briefly while we find players.</div>
      <div class="playersList" id="queueList"></div>
    </div>

    <!-- Game UI (shown when ?room=) -->
    <div id="gameUI" style="display:none">
      <div class="center">
        <div class="small">Room: <span id="roomId">-</span> · You: <strong id="myLabel">-</strong></div>
        <div style="display:flex;align-items:center;gap:20px;margin-top:12px">
          <div>
            <div class="small">Discard</div>
            <div id="discard" style="width:96px;height:140px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,0.08)"></div>
          </div>

          <div>
            <div class="small">Deck</div>
            <div id="deckCount" style="width:96px;height:140px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#fff;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.06)">0</div>
          </div>

          <div style="margin-left:20px">
            <div class="small">Players</div>
            <div id="playersArea"></div>
          </div>
        </div>

        <div class="board" style="width:100%">
          <div class="hand">
            <div class="small">Your Hand</div>
            <div id="myHand" style="margin-top:10px"></div>
            <div style="margin-top:12px">
              <button id="drawBtn" class="btn">Draw</button>
              <button id="passBtn" class="btn warn">Pass</button>
            </div>
          </div>

          <div style="flex:1">
            <div class="small">Game Log</div>
            <div id="log" style="height:220px;overflow:auto;background:#f7f7f7;padding:8px;border-radius:8px;margin-top:8px"></div>
          </div>
        </div>
      </div>
    </div>

  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
/* ---------------- CONFIG ---------------- */
const SUPABASE_URL = "https://cxycyvactcsppkltvzyf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eWN5dmFjdGNzcHBrbHR2enlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NDY1MTUsImV4cCI6MjA4MDAyMjUxNX0.6H6Lr35L_HDWwplqiNxlHMyrr69fPK2f6AikPhcvMRg";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------------- DOM ---------------- */
const findBtn = document.getElementById('findBtn');
const cancelBtn = document.getElementById('cancelBtn');
const queueCount = document.getElementById('queueCount');
const queueList = document.getElementById('queueList');
const matchSizeEl = document.getElementById('matchSize');

const lobbyUI = document.getElementById('lobbyUI');
const gameUI = document.getElementById('gameUI');
const roomLabel = document.getElementById('roomLabel');
const roomIdSpan = document.getElementById('roomId');
const myLabel = document.getElementById('myLabel');

const myHandEl = document.getElementById('myHand');
const drawBtn = document.getElementById('drawBtn');
const passBtn = document.getElementById('passBtn');
const discardEl = document.getElementById('discard');
const deckCountEl = document.getElementById('deckCount');
const playersArea = document.getElementById('playersArea');
const logEl = document.getElementById('log');

/* ---------------- STATE ---------------- */
const myId = crypto.randomUUID().slice(0,8);
let myName = 'P-' + myId.slice(0,4);

let inQueue = false;
let queueLocal = {}; // id->timestamp local view
let queueChannel = supabase.channel('uno_queue_v1', { config:{ broadcast:{ self:false } } });

// If URL has ?room=ROOM, open game UI
const params = new URLSearchParams(location.search);
const ROOM = params.get('room');

/* ---------------- Utilities ---------------- */
function log(msg){
  const d = document.createElement('div'); d.innerText = msg;
  logEl.appendChild(d);
  logEl.scrollTop = logEl.scrollHeight;
}
function setText(el, txt){ el.innerText = txt; }

/* ---------------- Matchmaking (peer-driven) ----------------
  - All clients broadcast join_queue messages with timestamp
  - Everyone maintains a local view of queue (queueLocal)
  - If a client sees enough waiting players (>= matchSize) and is the oldest (smallest timestamp),
    it will create a room and broadcast create_room with selected players.
  - When create_room seen, clients redirect to room.
*/
queueChannel.on('broadcast', { event: 'join_queue' }, ({ payload })=>{
  if (!payload) return;
  queueLocal[payload.id] = payload.ts;
  renderQueue();
});
queueChannel.on('broadcast', { event: 'leave_queue' }, ({ payload })=>{
  if (!payload) return;
  delete queueLocal[payload.id];
  renderQueue();
});
queueChannel.on('broadcast', { event: 'create_room' }, ({ payload })=>{
  if (!payload) return;
  // payload: { roomId, players: [ids], creator }
  // if we are included, navigate to room
  if (payload.players.includes(myId)) {
    // redirect to room page (same file handles game UI)
    location.href = `${location.pathname}?room=${payload.roomId}&joined=1`;
  } else {
    // remove players used
    payload.players.forEach(id => delete queueLocal[id]);
    renderQueue();
  }
});

// Render queue UI
function renderQueue(){
  const ids = Object.keys(queueLocal).sort((a,b)=>queueLocal[a]-queueLocal[b]);
  queueCount.innerText = ids.length;
  queueList.innerHTML = 'Queue: ' + (ids.length ? ids.map(id=> (id===myId? '<strong>You</strong>':id)).join(', ') : 'empty');
  attemptAutoCreate();
}

// attemptAutoCreate: if enough players and this client is oldest, create room
let creatingRoom = false;
function attemptAutoCreate(){
  if (creatingRoom) return;
  const matchSize = Number(matchSizeEl.value);
  const ids = Object.keys(queueLocal).sort((a,b)=>queueLocal[a]-queueLocal[b]);
  if (ids.length >= matchSize){
    // are we the oldest?
    if (ids[0] === myId){
      // pick first matchSize players
      const selected = ids.slice(0, matchSize);
      creatingRoom = true;
      const roomId = Math.random().toString(36).slice(2,8);
      queueChannel.send({
        type:'broadcast', event:'create_room', payload: { roomId, players: selected, creator: myId }
      });
      // cleanup our own queue state
      selected.forEach(id => {
        queueChannel.send({ type:'broadcast', event:'leave_queue', payload: { id } });
      });
      // small delay then reset
      setTimeout(()=> { creatingRoom = false; }, 2000);
    }
  }
}

/* Find / Cancel button */
findBtn.addEventListener('click', async ()=>{
  inQueue = true;
  findBtn.style.display = 'none';
  cancelBtn.style.display = 'inline-block';
  // broadcast join
  const payload = { id: myId, ts: Date.now(), name: myName };
  queueChannel.send({ type:'broadcast', event:'join_queue', payload });
  // also add to local
  queueLocal[myId] = payload.ts;
  renderQueue();
});
cancelBtn.addEventListener('click', ()=>{
  inQueue = false;
  findBtn.style.display = 'inline-block';
  cancelBtn.style.display = 'none';
  queueChannel.send({ type:'broadcast', event:'leave_queue', payload:{ id: myId } });
  delete queueLocal[myId];
  renderQueue();
});

/* ---------------- If page opened with ?room= -> initialize game logic ---------------- */
if (ROOM) {
  // Switch UI
  lobbyUI.style.display = 'none';
  gameUI.style.display = 'block';
  roomLabel.innerText = 'Room';
  roomIdSpan.innerText = ROOM;
  myLabel.innerText = myName + ' ('+myId+')';
  initializeGame(ROOM);
} else {
  // subscribe queue channel
  queueChannel.subscribe((status, err)=>{
    if (status === 'SUBSCRIBED') {
      console.log('Queue channel subscribed');
      // advertise our presence (optional)
    }
    if (err) console.error('queue sub err', err);
  });
}

/* ---------------- UNO Game Implementation (authoritative leader logic) ----------------
 State schema:
 {
   roomId,
   players: [ { id, name, hand: [cards], out:false } ],
   deck: [...cards],
   discard: [card],
   turnIndex: 0,
   direction: 1,
   status: 'playing'|'finished'
 }
 Card format: { type:'number'|'skip'|'reverse'|'draw2'|'wild', color:'red'|'green'|'blue'|'yellow'|null, value:number|null }
*/

const unoChannelCache = {}; // per room channel

function initializeGame(roomId){
  const chName = 'uno_room_' + roomId;
  const ch = supabase.channel(chName, { config:{ broadcast:{ self:false } } });
  unoChannelCache[roomId] = ch;

  // handlers for room messages
  ch.on('broadcast', { event:'state' }, ({ payload })=>{
    if (!payload) return;
    // apply authoritative state
    window.UNO_state = payload;
    renderGameState();
  });

  ch.on('broadcast', { event:'action' }, ({ payload })=>{
    if (!payload) return;
    // if action is play/draw/pass, leader should apply and broadcast state. Non-leader can optimistically log.
    // For simplicity, non-leader just logs actions (leader authoritative).
    log('[action] '+ JSON.stringify(payload));
  });

  ch.on('broadcast', { event:'redirect_join' }, ({ payload })=>{
    // not used here
  });

  ch.subscribe((status, err)=>{
    if (status === 'SUBSCRIBED') {
      log('Connected to room channel');
      // request state - ask leader to send full state
      ch.send({ type:'broadcast', event:'state_request', payload:{ id: myId }});
    }
    if (err) console.error('room subscribe err', err);
  });

  // respond to state_request: if I'm creator of room (i.e. leader), send state
  // We detect leader when we are included in create_room payload as creator? Simpler: first player in players array will be leader.
  // Subscribe to state_request
  ch.on('broadcast', { event:'state_request' }, ({ payload })=>{
    if (!payload) return;
    if (window.UNO_state && window.UNO_state.leader === myId) {
      ch.send({ type:'broadcast', event:'state', payload: window.UNO_state });
    }
  });

  // When create_room is fired previously, initial creator set up players and pushed state
  // we'll now implement local UI actions: Play card, Draw, Pass
  // Wire up UI buttons
  drawBtn.onclick = ()=> {
    ch.send({ type:'broadcast', event:'player_action', payload:{ type:'draw_request', id: myId }});
  };
  passBtn.onclick = ()=> {
    ch.send({ type:'broadcast', event:'player_action', payload:{ type:'pass', id: myId }});
  };

  // Handle player_action on channel - leader will listen and apply changes
  ch.on('broadcast', { event:'player_action' }, ({ payload })=>{
    if (!payload) return;
    // if we are leader
    const state = window.UNO_state;
    if (!state) return;
    if (state.leader !== myId) {
      // not leader - ignore player_action (leader will broadcast final state)
      return;
    }
    applyPlayerActionAsLeader(state, payload);
  });
}

/* ---------- Helper: generate UNO deck ---------- */
function makeDeck(){
  const colors = ['red','green','blue','yellow'];
  const deck = [];
  // numbers: one 0, two each of 1-9
  for (const c of colors){
    deck.push({ type:'number', color:c, value:0 });
    for (let i=1;i<=9;i++){
      deck.push({ type:'number', color:c, value:i });
      deck.push({ type:'number', color:c, value:i });
    }
    // two skips, two reverse, two draw2
    for (let i=0;i<2;i++){
      deck.push({ type:'skip', color:c, value:null });
      deck.push({ type:'reverse', color:c, value:null });
      deck.push({ type:'draw2', color:c, value:null });
    }
  }
  // wilds (4 wild, 4 wild+draw4 omitted for simplicity)
  for (let i=0;i<4;i++) deck.push({ type:'wild', color:null, value:null });
  return shuffle(deck);
}
function shuffle(a){ for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

/* ---------- Leader applies actions and broadcasts authoritative state ---------- */
function applyPlayerActionAsLeader(state, action){
  const ch = unoChannelCache[state.roomId];
  if (!ch) return;
  const currentPlayerId = state.players[state.turnIndex].id;

  if (action.type === 'draw_request'){
    if (action.id !== currentPlayerId) return; // not your turn
    // draw one card
    if (state.deck.length === 0){
      // reshuffle discard (except top)
      const top = state.discard.pop();
      state.deck = shuffle(state.discard);
      state.discard = [top];
    }
    const card = state.deck.pop();
    const p = state.players.find(p=>p.id===action.id);
    if (!p) return;
    p.hand.push(card);
    log('Leader: Drew card for '+action.id);
    // end turn (simple rule: after draw you pass)
    state.turnIndex = (state.turnIndex + state.direction + state.players.length) % state.players.length;
    // broadcast new state
    ch.send({ type:'broadcast', event:'state', payload: state });
    return;
  }

  if (action.type === 'pass'){
    if (action.id !== currentPlayerId) return;
    state.turnIndex = (state.turnIndex + state.direction + state.players.length) % state.players.length;
    ch.send({ type:'broadcast', event:'state', payload: state });
    return;
  }

  if (action.type === 'play'){
    // payload: { id, cardIndex, chosenColor (for wild) }
    if (action.id !== currentPlayerId) return;
    const player = state.players.find(p=>p.id===action.id);
    if (!player) return;

    const card = player.hand[action.cardIndex];
    if (!card) return;

    // validate play: must match color or number/type or be wild
    const top = state.discard[state.discard.length-1];
    const valid = isValidPlay(card, top);
    if (!valid) {
      log('Invalid play attempt by ' + action.id);
      return;
    }

    // remove card from hand, push to discard
    player.hand.splice(action.cardIndex,1);
    const playedCard = Object.assign({}, card);
    // if wild and chosenColor set
    if (playedCard.type === 'wild' && action.chosenColor) {
      playedCard.color = action.chosenColor;
    }

    state.discard.push(playedCard);
    // apply effects
    if (playedCard.type === 'skip'){
      state.turnIndex = (state.turnIndex + 2*state.direction + state.players.length) % state.players.length;
    } else if (playedCard.type === 'reverse'){
      state.direction = -state.direction;
      // next turn after reversing
      state.turnIndex = (state.turnIndex + state.direction + state.players.length) % state.players.length;
    } else if (playedCard.type === 'draw2'){
      // next player draws two
      const nextIdx = (state.turnIndex + state.direction + state.players.length) % state.players.length;
      const nextPlayer = state.players[nextIdx];
      for (let i=0;i<2;i++){
        if (state.deck.length===0){ const top = state.discard.pop(); state.deck = shuffle(state.discard); state.discard = [top]; }
        nextPlayer.hand.push(state.deck.pop());
      }
      // skip the next player's turn
      state.turnIndex = (nextIdx + state.direction + state.players.length) % state.players.length;
    } else {
      // normal number or wild -> next player
      state.turnIndex = (state.turnIndex + state.direction + state.players.length) % state.players.length;
    }

    // check win
    if (player.hand.length === 0){
      state.status = 'finished';
      state.winner = player.id;
    }

    // broadcast new state
    ch.send({ type:'broadcast', event:'state', payload: state });
    return;
  }
}

/* ---------- Validate play ---------- */
function isValidPlay(card, top){
  if (!top) return true;
  if (card.type === 'wild') return true;
  if (card.color && top.color && card.color === top.color) return true;
  if (card.type === 'number' && top.type === 'number' && card.value === top.value) return true;
  if (card.type === top.type && ['skip','reverse','draw2'].includes(card.type)) return true;
  return false;
}

/* ---------- When a room is created (create_room event), the creator sets initial state and broadcasts ---------- */
/* Listen to create_room in queueChannel earlier (redirect handled). But the creator must also initialize room channel state.
   To handle that, we subscribe to queueChannel events for create_room and if we are the creator we initialize the UNO_state for the room.
*/
queueChannel.on('broadcast', { event: 'create_room' }, ({ payload })=>{
  if (!payload) return;
  const { roomId, players, creator } = payload;
  if (creator !== myId) return;
  // initialize room state as leader
  const chName = 'uno_room_' + roomId;
  const ch = supabase.channel(chName, { config:{ broadcast:{ self:false } } });
  unoChannelCache[roomId] = ch;

  // build deck and deal
  const deck = makeDeck();
  const state = {
    roomId,
    leader: creator,
    players: players.map((id, idx) => ({ id, name: (id===myId?myName:'P-'+id.slice(0,4)), hand: [], out:false })),
    deck,
    discard: [],
    turnIndex: 0,
    direction: 1,
    status: 'playing',
    winner: null
  };

  // deal 7 cards each
  for (let r=0;r<7;r++){
    for (const p of state.players){
      p.hand.push(state.deck.pop());
    }
  }
  // flip initial discard
  state.discard.push(state.deck.pop());

  // open room channel and broadcast initial state
  ch.subscribe((status,err)=>{
    if (status === 'SUBSCRIBED'){
      ch.send({ type:'broadcast', event:'state', payload: state });
      log('Room created by leader. Redirecting players...');
    }
  });

  // send state event so everyone that redirected will receive
  // no need to redirect here because create_room handler already redirected clients
});

/* ---------- Render game state UI ---------- */
function renderGameState(){
  const state = window.UNO_state;
  if (!state) return;
  roomLabel.innerText = 'Room';
  roomIdSpan.innerText = state.roomId;
  deckCountEl.innerText = state.deck.length;
  discardEl.innerText = state.discard.length ? cardToLabel(state.discard[state.discard.length-1]) : '-';
  // render players
  playersArea.innerHTML = '';
  state.players.forEach((p, idx)=>{
    const el = document.createElement('div');
    el.innerHTML = `${idx+1}. ${p.id === myId ? '<strong>You</strong>' : p.id } — ${p.hand.length} cards ${state.turnIndex===idx? ' ← turn':''}`;
    playersArea.appendChild(el);
  });
  // render my hand
  const me = state.players.find(p=>p.id===myId);
  myHandEl.innerHTML = '';
  if (me){
    me.hand.forEach((card, i)=>{
      const c = document.createElement('div');
      c.className = 'card ' + (card.color || '');
      c.innerText = cardToLabel(card);
      c.onclick = ()=> {
        // play card request to leader
        const action = { type:'play', id: myId, cardIndex: i, chosenColor: null };
        if (card.type === 'wild'){
          // prompt color choice
          const color = prompt('Choose color: red, green, blue, yellow','red');
          if (!color) return;
          action.chosenColor = color;
        }
        const ch = unoChannelCache[state.roomId];
        if (ch) ch.send({ type:'broadcast', event:'player_action', payload: action });
      };
      myHandEl.appendChild(c);
    });
  } else {
    myHandEl.innerHTML = 'Waiting...';
  }

  // update label
  if (state.status === 'finished'){
    if (state.winner) log('Game finished! Winner: ' + state.winner);
    else log('Game finished!');
  }
}

/* ---------- helper to label cards ---------- */
function cardToLabel(card){
  if (!card) return '';
  if (card.type === 'number') return String(card.value);
  if (card.type === 'skip') return 'SKIP';
  if (card.type === 'reverse') return 'REV';
  if (card.type === 'draw2') return '+2';
  if (card.type === 'wild') return 'WILD';
  return '';
}

/* ---------- small safety: when leaving page, remove from queue and notify room channel ---------- */
window.addEventListener('beforeunload', () => {
  try { queueChannel.send({ type:'broadcast', event:'leave_queue', payload:{ id: myId } }); } catch(e){}
  // also notify any room we were in
  if (ROOM){
    const ch = unoChannelCache[ROOM];
    if (ch) ch.send({ type:'broadcast', event:'leave', payload:{ id: myId }});
  }
});

</script>
</body>
</html>
