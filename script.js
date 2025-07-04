
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAix_L4iWPFqZ7AO9eE0AD2N5FgzhpUZPs",
  authDomain: "trust-issues-leaderboard.firebaseapp.com",
  databaseURL: "https://trust-issues-leaderboard-default-rtdb.firebaseio.com",
  projectId: "trust-issues-leaderboard",
  storageBucket: "trust-issues-leaderboard.firebasestorage.app",
  messagingSenderId: "552256377197",
  appId: "1:552256377197:web:a59cf388ba37e5b8e5ca64"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const gameContainer = document.querySelector(".game-container");
const scoreBoard = document.querySelector("#score");
const hearts = document.querySelector(".lives").children;
const gameTitle = document.querySelector(".game-title");
const saveBtn = document.querySelector(".user-btn");

saveBtn.addEventListener("click", submitScore);

let popUPInterval = 1500;
let score = 0;
let missCount = 0;
let redHeart = 2;
let player;
const maxMisses = 3;

const objectPool = [
    {label: "cat", src: "images/cat.jpg", key: false},
    {label: "Dog", src: "images/cat.jpg", key: true},
    {label: "chair", src: "images/chair.jpg", key: false},
    {label: "Table", src: "images/chair.jpg", key: true},
    {label: "Dog", src: "images/dog.jpg", key: false},
    {label: "Lion", src: "images/dog.jpg", key: true},
    {label: "Fox", src: "images/dog.jpg", key: true},
    {label: "Red Apple", src: "images/green apple.jpg", key: true},
    {label: "Apple", src: "images/green apple.jpg", key: false},
    {label: "Apple", src: "images/red apple.jpg", key: false},
    {label: "Red Apple", src: "images/red apple.jpg", key: false},
    {label: "Triangle", src: "images/red triangle.jpg", key: false},
    {label: "Red Square", src: "images/red triangle.jpg", key: true},
    {label: "Apple", src: "images/mac.jpg", key: true},
    {label: "Mac", src: "images/mac.jpg", key: false},
    {label: "Pink Apple", src: "images/mac.jpg", key: true},
    {label: "Banana", src: "images/banana.jpg", key: false},
    {label: "Donkey", src: "images/donkey.jpg", key: false},
    {label: "Happy", src: "images/happy emoji.png", key: false},
    {label: "Sad", src: "images/happy emoji.png", key: true},
    {label: "Sad", src: "images/sad sticker.png", key: false},
    {label: "Click Me!", src: "images/happy OR sad.png", key: false},
    {label: "Happy", src: "images/sad sticker.png", key: true},
    {label: "Horse", src: "images/donkey.jpg", key: true},
    {label: "Mirror", src: "images/mirror.jpg", key: false},
    {label: "Window", src: "images/mirror.jpg", key: false},
    {label: "PM", src: "images/narendramodi.jpg", key: false},
    {label: "Modi", src: "images/narendramodi.jpg", key: false},
    {label: "BJP", src: "images/narendramodi.jpg", key: true},
    {label: "SmartPhone", src: "images/pubJi.png", key: false},
    {label: "PUBG", src: "images/pubJi.png", key: true},
    {label: "Watermelon", src: "images/watermelon.jpg", key: false},
    {label: "Banana", src: "images/watermelon.jpg", key: true},
    {label: "Circle", src: "images/yellow circle.jpg", key: false},
    {label: "Yellow Circle", src: "images/yellow circle.jpg", key: false}
];

function getRandomObject(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}

function updateHeart(){
    hearts[redHeart].textContent = ((maxMisses - missCount) == redHeart) ? "🖤" : "❤️";
    redHeart--;
}

function gameOver(){
    clearInterval(gameInterval);
    document.querySelector(".game-area").style.opacity = 0.9;
    document.querySelector("#final-score").textContent = score;
    document.querySelector(".game-over").style.display = "flex";
    getDataFromDatabase();
}

function createPopUp(){
    let object = getRandomObject(objectPool);
    let popUp = document.createElement("div");
    let img = document.createElement("img");
    let p = document.createElement("p");
    img.src = object.src;
    console.log(img.src);
    p.textContent = object.label;
    console.log(p.textContent);

    popUp.classList.add("popUp");
    popUp.appendChild(img);
    popUp.appendChild(p);

    let clicked = false;

    popUp.onclick = ()=>{
        clicked = true;
        if(object.key){
            score++;
            if(score<20){
                popUPInterval = 1500;
            }else if(score<25){
                popUPInterval = 1400;
            }else if(score<30){
                popUPInterval = 1300;
            }else if(score<35){
                popUPInterval = 1200;
            }else{
                popUPInterval = 1000;
            }
            scoreBoard.textContent = score;
            popUp.remove();
        }else{
           gameOver();
        }
    };

    const top = Math.random()*70 + 10;
    const left = Math.random()*65 + 10;

    popUp.style.top = top + "%";
    popUp.style.left = left + "%";
    popUp.style.position = "absolute";

    gameContainer.appendChild(popUp);
    
    setTimeout(()=>{
        popUp.remove();
        if(!clicked && object.key){
            missCount++;
            updateHeart();
            if(missCount >= maxMisses){
                setTimeout(()=>{gameOver()},1000);
            }
        }
    }, popUPInterval);
}

let gameInterval = setInterval(createPopUp, popUPInterval);
// ---------------------------------------------------         GAME OVER           -------------------------------------------

function submitScore(){
    player = document.querySelector("#username").value.trim();
    if(!player){
        alert("Please Enter Player Name");
    }else{
        saveScoreToFirebase(player, score);
    }
    
}

function saveScoreToFirebase(playerName, score) {
    const scoreRef = ref(db, "leaderboard");
    const newEntry = push(scoreRef);
    set(newEntry, {
      name: playerName,
      score: score,
      timestamp: Date.now()
    });
    getDataFromDatabase();
}

function getDataFromDatabase() {
        const scoreRef = ref(db, "leaderboard");
        onValue(scoreRef, (dataFromBase)=>{
            const player_data = [];
            dataFromBase.forEach((uid)=>{
                const data = uid.val();
                player_data.push({name: data.name, score: data.score});
            })
            return leaderBoard(player_data);
        });     
}

function leaderBoard(player_data){
    let topPlayer = player_data.sort((a, b)=> b.score - a.score);
    let finalScore = document.querySelector(".final-score");
    let rank = `Hii ${player}! Your Rank is : ${topPlayer.findIndex((i)=>i.name === player) +1}`;
    if(player){
        finalScore.innerHTML = rank;
    }
    const ol = document.querySelector("ol");
    ol.innerHTML = "";
    // console.log(player_score);
    for(let i=0; i<7; i++){
        const li = document.createElement("li");
        // console.log(all_player_score[i].Name);
        // console.log(player_score[i].Score);
        let list = `#${topPlayer[i].name} - ${topPlayer[i].score} pts`;
        li.textContent = list;
        ol.appendChild(li);
    }
}