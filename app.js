const boardEl = document.getElementById("board");
const turnBadge = document.getElementById("turnBadge");
const sxEl = document.getElementById("sx");
const soEl = document.getElementById("so");
const sdEl = document.getElementById("sd");
const resetRoundBtn = document.getElementById("resetRound");
const resetScoreBtn = document.getElementById("resetScore");
const installBtn = document.getElementById("installBtn");

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

const storeKey = "ttt-score-v1";

let state = {
  turn: "X",
  cells: Array(9).fill(""),
  over: false,
  score: { X: 0, O: 0, D: 0 }
};

function loadScore(){
  try{
    const raw = localStorage.getItem(storeKey);
    if(!raw) return;
    const parsed = JSON.parse(raw);
    if(parsed && parsed.X != null && parsed.O != null && parsed.D != null){
      state.score = { X: parsed.X, O: parsed.O, D: parsed.D };
    }
  }catch(_){}
}

function saveScore(){
  localStorage.setItem(storeKey, JSON.stringify(state.score));
}

function renderScore(){
  sxEl.textContent = state.score.X;
  soEl.textContent = state.score.O;
  sdEl.textContent = state.score.D;
}

function badge(text, turn){
  turnBadge.textContent = text;
  if(turn === "X"){
    turnBadge.style.color = "var(--x)";
  }else if(turn === "O"){
    turnBadge.style.color = "var(--o)";
  }else if(turn === "D"){
    turnBadge.style.color = "var(--draw)";
  }else{
    turnBadge.style.color = "var(--text)";
  }
}

function buildBoard(){
  boardEl.innerHTML = "";
  for(let i=0;i<9;i++){
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.setAttribute("aria-label", `Cell ${i+1}`);
    btn.addEventListener("click", () => onMove(i));
    boardEl.appendChild(btn);
  }
}

function renderBoard(winLine = null){
  const nodes = [...boardEl.children];
  nodes.forEach((btn, i) => {
    const v = state.cells[i];
    btn.textContent = v;
    btn.classList.toggle("x", v === "X");
    btn.classList.toggle("o", v === "O");
    btn.disabled = state.over || v !== "";
    btn.classList.remove("win");
  });

  if(winLine){
    winLine.forEach(i => nodes[i].classList.add("win"));
  }
}

function getWinner(){
  for(const [a,b,c] of WINS){
    const v = state.cells[a];
    if(v && v === state.cells[b] && v === state.cells[c]){
      return { winner: v, line: [a,b,c] };
    }
  }
  return null;
}

function onMove(i){
  if(state.over) return;
  if(state.cells[i]) return;

  state.cells[i] = state.turn;
  const res = getWinner();

  if(res){
    state.over = true;
    if(res.winner === "X") state.score.X++;
    else state.score.O++;
    saveScore();
    renderScore();
    renderBoard(res.line);
    badge("Winner 🎉", res.winner);
    setTimeout(() => alert(`Player ${res.winner} won! 🎉`), 30);
    return;
  }

  if(!state.cells.includes("")){
    state.over = true;
    state.score.D++;
    saveScore();
    renderScore();
    renderBoard();
    badge("Draw 🤝", "D");
    setTimeout(() => alert("It's a draw! 🤝"), 30);
    return;
  }

  state.turn = state.turn === "X" ? "O" : "X";
  badge(`Turn: ${state.turn}`, state.turn);
  renderBoard();
}

function resetRound(){
  state.turn = "X";
  state.cells = Array(9).fill("");
  state.over = false;
  badge("Turn: X", "X");
  renderBoard();
}

function resetScore(){
  resetRound();
  state.score = { X: 0, O: 0, D: 0 };
  saveScore();
  renderScore();
}

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});

installBtn.addEventListener("click", async () => {
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = "none";
});

if("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  });
}

loadScore();
buildBoard();
renderScore();
badge("Turn: X", "X");
renderBoard();

resetRoundBtn.addEventListener("click", resetRound);
resetScoreBtn.addEventListener("click", resetScore);
