// Состояние приложения
let currentMode = null;
let shuffledWords = [];
let currentIndex = 0;
let isFlipped = false;
let score = 0;
let answered = false;
let isReversed = false; // false = EN→UA, true = UA→EN

// Утилиты
function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function goHome() {
    currentMode = null;
    showPage('home-page');
}

// Работа с именем пользователя
function saveName() {
    const name = document.getElementById('user-name').value.trim();
    localStorage.setItem('userName', name);
}

function loadName() {
    const savedName = localStorage.getItem('userName') || '';
    document.getElementById('user-name').value = savedName;
}

function getUserName() {
    return document.getElementById('user-name').value.trim();
}

function checkName() {
    const name = getUserName();
    if (!name) {
        alert('Введи своє ім\'я, щоб почати!');
        document.getElementById('user-name').focus();
        return false;
    }
    return true;
}

// Переключение направления перевода
function toggleDirection() {
    isReversed = !isReversed;
    updateDirectionDisplay();
}

function updateDirectionDisplay() {
    document.getElementById('direction-from').textContent = isReversed ? 'UA' : 'EN';
    document.getElementById('direction-to').textContent = isReversed ? 'EN' : 'UA';
}

// Получение слова и перевода с учётом направления
function getQuestion(card) {
    return isReversed ? card.translation : card.word;
}

function getAnswer(card) {
    return isReversed ? card.word : card.translation;
}

// Режим карточек
function startFlashcards() {
    if (!checkName()) return;

    const words = getWords();
    if (words.length === 0) {
        alert('Додайте слова для вивчення!');
        return;
    }

    trackClick('flashcards');

    currentMode = 'flashcards';
    shuffledWords = shuffle(words);
    currentIndex = 0;
    isFlipped = false;

    showPage('flashcard-page');
    showCurrentCard();
}

function showCurrentCard() {
    const card = shuffledWords[currentIndex];
    const translationEl = document.getElementById('flashcard-translation');

    document.getElementById('flashcard-word').textContent = getQuestion(card);
    document.getElementById('flashcard-progress').textContent =
        `${currentIndex + 1} / ${shuffledWords.length}`;

    // Сброс состояния карточки
    document.getElementById('flashcard').classList.remove('flipped');
    translationEl.style.visibility = 'hidden';
    translationEl.textContent = getAnswer(card);
    isFlipped = false;
}

function flipCard() {
    const flashcard = document.getElementById('flashcard');
    const translationEl = document.getElementById('flashcard-translation');

    if (!isFlipped) {
        // Показываем перевод
        translationEl.style.visibility = 'visible';
        flashcard.classList.add('flipped');
        isFlipped = true;
    } else {
        // Переходим к следующей карточке
        currentIndex++;
        if (currentIndex >= shuffledWords.length) {
            currentIndex = 0;
            shuffledWords = shuffle(getWords());
        }
        showCurrentCard();
    }
}

// Режим теста
function startTest() {
    if (!checkName()) return;

    const words = getWords();
    if (words.length < 4) {
        alert('Потрібно мінімум 4 слова для тесту!');
        return;
    }

    trackClick('test');

    currentMode = 'test';
    shuffledWords = shuffle(words).slice(0, Math.min(10, words.length));
    currentIndex = 0;
    score = 0;
    answered = false;

    showPage('test-page');
    showCurrentQuestion();
}

function showCurrentQuestion() {
    const currentWord = shuffledWords[currentIndex];
    document.getElementById('test-word').textContent = getQuestion(currentWord);
    document.getElementById('test-progress').textContent =
        `${currentIndex + 1} / ${shuffledWords.length}`;
    document.getElementById('test-score').textContent = `Вірно: ${score}`;

    // Генерируем варианты ответов
    const options = generateOptions(currentWord);
    const optionsContainer = document.getElementById('test-options');
    optionsContainer.innerHTML = '';

    const correctAnswer = getAnswer(currentWord);

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        const optionAnswer = getAnswer(option);
        btn.textContent = optionAnswer;
        btn.onclick = () => selectAnswer(btn, optionAnswer === correctAnswer);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('next-btn').style.display = 'none';
    answered = false;
}

function generateOptions(correctWord) {
    const words = getWords();
    const options = [correctWord];
    const correctQuestion = getQuestion(correctWord);
    const otherWords = words.filter(w => getQuestion(w) !== correctQuestion);
    const shuffledOthers = shuffle(otherWords);

    // Добавляем 3 неправильных варианта
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
        options.push(shuffledOthers[i]);
    }

    return shuffle(options);
}

function selectAnswer(button, isCorrect) {
    if (answered) return;
    answered = true;

    // Отключаем все кнопки
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });

    if (isCorrect) {
        button.classList.add('correct');
        score++;
        document.getElementById('test-score').textContent = `Вірно: ${score}`;
    } else {
        button.classList.add('wrong');
        // Показываем правильный ответ
        const correctAnswer = getAnswer(shuffledWords[currentIndex]);
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    document.getElementById('next-btn').style.display = 'block';
}

function nextTestQuestion() {
    currentIndex++;

    if (currentIndex >= shuffledWords.length) {
        showResults();
    } else {
        showCurrentQuestion();
    }
}

function showResults() {
    document.getElementById('results-score').textContent =
        `${score} / ${shuffledWords.length}`;

    let message = '';
    const percentage = score / shuffledWords.length;

    if (percentage === 1) {
        message = 'Чудово! Ідеальний результат!';
    } else if (percentage >= 0.8) {
        message = 'Відмінний результат!';
    } else if (percentage >= 0.6) {
        message = 'Добре! Продовжуй практикуватися!';
    } else if (percentage >= 0.4) {
        message = 'Непогано, але є куди рости!';
    } else {
        message = 'Варто повторити слова ще раз!';
    }

    document.getElementById('results-message').textContent = message;
    showPage('results-page');
}

// Добавление слов
function showAddWord() {
    if (!checkName()) return;

    trackClick('add_words');

    showPage('add-word-page');
    renderWordList();
}

async function addWord(event) {
    event.preventDefault();

    const wordInput = document.getElementById('new-word');
    const translationInput = document.getElementById('new-translation');

    const word = wordInput.value.trim();
    const translation = translationInput.value.trim();

    if (!word || !translation) return;

    await saveWord(word, translation);

    // Очищаем форму
    wordInput.value = '';
    translationInput.value = '';
    wordInput.focus();
}

function renderWordList() {
    const words = getWords();
    const listEl = document.getElementById('word-list');
    const totalEl = document.getElementById('total-words');

    totalEl.textContent = words.length;

    if (words.length === 0) {
        listEl.innerHTML = '<p class="empty-list">Поки немає слів. Додайте перше!</p>';
        return;
    }

    listEl.innerHTML = words.map(item => `
        <div class="word-item">
            <div class="word-item-content">
                <span class="word-item-word">${item.word}</span>
                <span class="word-item-translation">${item.translation}</span>
            </div>
            <button class="delete-btn" onclick="confirmDelete('${item.id}', '${item.word}')">✕</button>
        </div>
    `).join('');
}

function confirmDelete(wordId, word) {
    if (confirm(`Видалити слово "${word}"?`)) {
        deleteWord(wordId);
    }
}

// Аналитика
function formatDateTime(date) {
    const pad = (n) => n.toString().padStart(2, '0');
    const dd = pad(date.getDate());
    const mm = pad(date.getMonth() + 1);
    const yy = date.getFullYear().toString().slice(-2);
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${dd}:${mm}:${yy} ${hh}:${min}:${ss}`;
}

function trackClick(button) {
    const data = {
        timestamp: formatDateTime(new Date()),
        name: getUserName(),
        button: button
    };
    saveAnalytics(data);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    loadName();
});
