// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyDWI0CvHTI37KBnweUBbysEA_FqbvRcKuA",
    authDomain: "wordlearner-63a0f.firebaseapp.com",
    databaseURL: "https://wordlearner-63a0f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "wordlearner-63a0f",
    storageBucket: "wordlearner-63a0f.firebasestorage.app",
    messagingSenderId: "920556139596",
    appId: "1:920556139596:web:c7bff8e60d595f9eb3b0e9"
};

// Инициализация Firebase
let db = null;
let wordsRef = null;
let allWords = [];

function initFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        wordsRef = db.ref('words');

        // Слушаем изменения в базе данных
        wordsRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                allWords = Object.entries(data).map(([id, word]) => ({
                    id,
                    ...word
                }));
            } else {
                allWords = [];
            }
            updateWordCount();
            if (document.getElementById('word-list')) {
                renderWordList();
            }
        });

        console.log('Firebase подключен');
        return true;
    } catch (error) {
        console.warn('Firebase ошибка:', error.message);
        allWords = [...WORDS];
        updateWordCount();
        return false;
    }
}

function updateWordCount() {
    const countEl = document.getElementById('word-count');
    if (countEl) {
        countEl.textContent = `Слов в словаре: ${allWords.length}`;
    }
}

function getWords() {
    return allWords.length > 0 ? allWords : WORDS;
}

async function saveWord(word, translation) {
    if (!wordsRef) {
        allWords.push({ word, translation });
        updateWordCount();
        return;
    }

    const newWordRef = wordsRef.push();
    await newWordRef.set({
        word: word.trim(),
        translation: translation.trim()
    });
}

async function deleteWord(wordId) {
    if (!wordsRef) {
        allWords = allWords.filter(w => w.id !== wordId);
        updateWordCount();
        renderWordList();
        return;
    }

    await wordsRef.child(wordId).remove();
}

document.addEventListener('DOMContentLoaded', () => {
    initFirebase();
});
