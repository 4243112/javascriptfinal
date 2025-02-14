let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let timer;
let startTime;
let elapsedPausedTime = 0;  // 追加: 一時停止中の経過時間を追跡
let shuffledCards;
let isPaused = false;
let leaderboard = loadLeaderboard();  // ローカルストレージからランキングを読み込む

function startGame() {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        alert('名前を入力してください。');
        return;
    }

    resetGameState();  // ゲーム開始前に状態をリセット
    const difficulty = document.getElementById('difficulty').value;
    let cardCount;

    switch (difficulty) {
        case 'easy':
            cardCount = 4;
            break;
        case 'medium':
            cardCount = 45;
            break;
        case 'hard':
            cardCount = 54;
            break;
    }

    cards = generateCards(cardCount);
    shuffledCards = shuffle(cards);
    createGameBoard(shuffledCards);
    startTimer();
}

function generateCards(cardCount) {
    const cardValues = [];
    for (let i = 1; i <= cardCount / 2; i++) {
        cardValues.push(i);
        cardValues.push(i);
    }
    return cardValues;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createGameBoard(cards) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';  // ゲームボードの内容のみをクリア

    // 追加: カードの数に応じて列数を設定
    gameBoard.style.gridTemplateColumns = `repeat(9, 1fr)`;

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.value = card;
        cardElement.addEventListener('click', () => flipCard(cardElement));
        gameBoard.appendChild(cardElement);
    });
}

function flipCard(cardElement) {
    if (cardElement.classList.contains('flipped') || flippedCards.length === 2 || isPaused) return;

    cardElement.classList.add('flipped');
    cardElement.textContent = cardElement.dataset.value;
    flippedCards.push(cardElement);

    if (flippedCards.length === 2) {
        if (flippedCards[0].dataset.value === flippedCards[1].dataset.value) {
            matchedPairs++;
            flippedCards = [];
            if (matchedPairs === cards.length / 2) {
                clearInterval(timer);
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                displayClearMessage(document.getElementById('player-name').value.trim(), elapsedTime);
            }
        } else {
            setTimeout(() => {
                flippedCards.forEach(card => {
                    card.classList.remove('flipped');
                    card.textContent = '';
                });
                flippedCards = [];
            }, 1000);
        }
    }
}

function startTimer() {
    startTime = Date.now() - elapsedPausedTime;  // 一時停止中の経過時間を考慮
    timer = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (isPaused) return;
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `タイマー: ${minutes}:${seconds}`;
}

function resetGame() {
    clearInterval(timer);  // タイマーを停止
    elapsedPausedTime = 0;  // 一時停止時間をリセット
    document.getElementById('timer').textContent = `タイマー: 00:00`;  // タイマー表示をリセット
    resetGameState();
}

function resetGameState() {
    matchedPairs = 0;
    flippedCards = [];
    isPaused = false;  // 一時停止状態をリセット
    document.getElementById('pause-button').textContent = '一時停止';  // ボタンのテキストをリセット
    document.getElementById('clear-message').textContent = '';  // クリアメッセージをリセット

    // ゲームボードのカードを消去
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
}

function pauseTimer() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pause-button');
    if (isPaused) {
        clearInterval(timer);
        elapsedPausedTime = Date.now() - startTime;  // 一時停止中の経過時間を記録
        pauseButton.textContent = '再開';  // ボタンのテキストを再開に変更
    } else {
        startTimer();  // 再開時に新たにタイマーを開始
        pauseButton.textContent = '一時停止';  // ボタンのテキストを一時停止に変更
    }
}

function displayClearMessage(playerName, elapsedTime) {
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
    const seconds = String(elapsedTime % 60).padStart(2, '0');
    const clearMessage = `おめでとうございます！${playerName}さん、ゲームクリアです！経過時間: ${minutes}:${seconds}`;
    document.getElementById('clear-message').textContent = clearMessage;

    // ランキングに追加
    leaderboard.push({ name: playerName, time: elapsedTime });
    leaderboard.sort((a, b) => a.time - b.time);  // 経過時間でソート
    saveLeaderboard();  // ローカルストレージに保存
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '<h2>ランキング</h2>';

    leaderboard.slice(0, 3).forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.textContent = `${index + 1}. ${entry.name} - ${String(Math.floor(entry.time / 60)).padStart(2, '0')}:${String(entry.time % 60).padStart(2, '0')}`;
        leaderboardDiv.appendChild(entryDiv);
    });
}

function saveLeaderboard() {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function loadLeaderboard() {
    const storedLeaderboard = localStorage.getItem('leaderboard');
    return storedLeaderboard ? JSON.parse(storedLeaderboard) : [];
}

document.getElementById('reset-button').addEventListener('click', resetGame);
document.getElementById('pause-button').addEventListener('click', pauseTimer);
document.getElementById('start-button').addEventListener('click', startGame);
