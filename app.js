// Состояние приложения
let currentMode = null;
let shuffledWords = [];
let currentIndex = 0;
let isFlipped = false;
let score = 0;
let answered = false;

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

// Режим карточек
function startFlashcards() {
    currentMode = 'flashcards';
    shuffledWords = shuffle(WORDS);
    currentIndex = 0;
    isFlipped = false;

    showPage('flashcard-page');
    showCurrentCard();
}

function showCurrentCard() {
    const card = shuffledWords[currentIndex];
    const translationEl = document.getElementById('flashcard-translation');

    document.getElementById('flashcard-word').textContent = card.word;
    document.getElementById('flashcard-progress').textContent =
        `${currentIndex + 1} / ${shuffledWords.length}`;

    // Сброс состояния карточки
    document.getElementById('flashcard').classList.remove('flipped');
    translationEl.style.visibility = 'hidden';
    translationEl.textContent = card.translation;
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
            shuffledWords = shuffle(WORDS);
        }
        showCurrentCard();
    }
}

// Режим теста
function startTest() {
    currentMode = 'test';
    shuffledWords = shuffle(WORDS).slice(0, 10); // 10 вопросов
    currentIndex = 0;
    score = 0;
    answered = false;

    showPage('test-page');
    showCurrentQuestion();
}

function showCurrentQuestion() {
    const currentWord = shuffledWords[currentIndex];
    document.getElementById('test-word').textContent = currentWord.word;
    document.getElementById('test-progress').textContent =
        `${currentIndex + 1} / ${shuffledWords.length}`;
    document.getElementById('test-score').textContent = `Правильно: ${score}`;

    // Генерируем варианты ответов
    const options = generateOptions(currentWord);
    const optionsContainer = document.getElementById('test-options');
    optionsContainer.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.translation;
        btn.onclick = () => selectAnswer(btn, option.translation === currentWord.translation);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('next-btn').style.display = 'none';
    answered = false;
}

function generateOptions(correctWord) {
    const options = [correctWord];
    const otherWords = WORDS.filter(w => w.word !== correctWord.word);
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
        document.getElementById('test-score').textContent = `Правильно: ${score}`;
    } else {
        button.classList.add('wrong');
        // Показываем правильный ответ
        const correctTranslation = shuffledWords[currentIndex].translation;
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.textContent === correctTranslation) {
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
        message = 'Превосходно! Идеальный результат!';
    } else if (percentage >= 0.8) {
        message = 'Отличный результат!';
    } else if (percentage >= 0.6) {
        message = 'Хорошо! Продолжай практиковаться!';
    } else if (percentage >= 0.4) {
        message = 'Неплохо, но есть куда расти!';
    } else {
        message = 'Стоит повторить слова ещё раз!';
    }

    document.getElementById('results-message').textContent = message;
    showPage('results-page');
}
