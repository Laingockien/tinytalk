const fallbackTopics = [
  {
    id: 1,
    order: 1,
    title: "Good Morning",
    level: "starter",
    situation: "Waking up in the morning",
    tags: ["morning", "family", "home"],
    keywords: ["wake up", "good morning", "mommy"],
    isActive: true,
    turns: [
      {
        order: 1,
        speaker: "parent",
        text: "Good morning, baby.",
        translation: "Chao buoi sang, con yeu.",
        acceptableVariants: ["Morning, baby.", "Good morning."],
        allowPass: true
      },
      {
        order: 2,
        speaker: "app",
        text: "Good morning, mommy.",
        translation: "Chao buoi sang, me.",
        acceptableVariants: [],
        allowPass: false
      },
      {
        order: 3,
        speaker: "parent",
        text: "Did you sleep well?",
        translation: "Con ngu ngon khong?",
        acceptableVariants: ["Sleep well?", "Did you sleep good?"],
        allowPass: true
      },
      {
        order: 4,
        speaker: "app",
        text: "Yes, I did.",
        translation: "Co a.",
        acceptableVariants: [],
        allowPass: false
      }
    ]
  },
  {
    id: 2,
    order: 2,
    title: "Drink Water",
    level: "starter",
    situation: "Asking the child to drink water",
    tags: ["drink", "water", "home"],
    keywords: ["water", "thirsty", "cup"],
    isActive: true,
    turns: [
      {
        order: 1,
        speaker: "parent",
        text: "Drink some water.",
        translation: "Uong nuoc nao con.",
        acceptableVariants: ["Drink water.", "Have some water."],
        allowPass: true
      },
      {
        order: 2,
        speaker: "app",
        text: "Okay, mommy.",
        translation: "Vang a.",
        acceptableVariants: [],
        allowPass: false
      },
      {
        order: 3,
        speaker: "parent",
        text: "Hold your cup.",
        translation: "Cam coc cua con nao.",
        acceptableVariants: ["Take your cup.", "Hold the cup."],
        allowPass: true
      },
      {
        order: 4,
        speaker: "app",
        text: "Thank you.",
        translation: "Con cam on.",
        acceptableVariants: [],
        allowPass: false
      }
    ]
  },
  {
    id: 3,
    order: 3,
    title: "Toy Time",
    level: "easy",
    situation: "Playing with toys together",
    tags: ["toy", "play", "home"],
    keywords: ["toys", "play", "blocks"],
    isActive: true,
    turns: [
      {
        order: 1,
        speaker: "parent",
        text: "Let's play with toys.",
        translation: "Minh choi do choi nhe.",
        acceptableVariants: ["Let's play.", "Play with toys."],
        allowPass: true
      },
      {
        order: 2,
        speaker: "app",
        text: "Yes, let's play!",
        translation: "Vang, minh choi nao!",
        acceptableVariants: [],
        allowPass: false
      },
      {
        order: 3,
        speaker: "parent",
        text: "Where is the red block?",
        translation: "Khoi mau do o dau?",
        acceptableVariants: ["Where is red block?", "Find the red block."],
        allowPass: true
      },
      {
        order: 4,
        speaker: "app",
        text: "Here it is.",
        translation: "No day a.",
        acceptableVariants: [],
        allowPass: false
      }
    ]
  }
];

const screens = {
  home: document.querySelector("#homeScreen"),
  lesson: document.querySelector("#lessonScreen"),
  conversation: document.querySelector("#conversationScreen"),
  complete: document.querySelector("#completeScreen")
};

const elements = {
  searchInput: document.querySelector("#searchInput"),
  nextTab: document.querySelector("#nextTab"),
  completedTab: document.querySelector("#completedTab"),
  topicList: document.querySelector("#topicList"),
  lessonLevel: document.querySelector("#lessonLevel"),
  lessonTitle: document.querySelector("#lessonTitle"),
  lessonSituation: document.querySelector("#lessonSituation"),
  lessonTurns: document.querySelector("#lessonTurns"),
  startLesson: document.querySelector("#startLesson"),
  progressText: document.querySelector("#progressText"),
  speakerLabel: document.querySelector("#speakerLabel"),
  turnText: document.querySelector("#turnText"),
  turnTranslation: document.querySelector("#turnTranslation"),
  statusMessage: document.querySelector("#statusMessage"),
  listenButton: document.querySelector("#listenButton"),
  passButton: document.querySelector("#passButton"),
  completeSummary: document.querySelector("#completeSummary")
};

let topics = [];
let selectedTopic = null;
let turnIndex = 0;
let recognition = null;
let preferredTinyTalkVoice = null;
let listeningTimeout = null;
let speechPrimed = false;
let activeTopicTab = "next";

async function loadTopics() {
  try {
    const response = await fetch("./data/topics.json").catch(() =>
      fetch("./public/data/topics.json")
    );
    if (!response.ok) {
      throw new Error("Could not load topics.json");
    }
    topics = await response.json();
  } catch {
    topics = fallbackTopics;
  }

  topics = topics.filter((topic) => topic.isActive);
  renderCurrentTopicList();
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.add("is-hidden"));
  screens[name].classList.remove("is-hidden");
}

function goHome() {
  window.speechSynthesis?.cancel();
  renderCurrentTopicList();
  showScreen("home");
}

function renderCurrentTopicList() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const completed = getCompletedRecords();
  const completedIds = new Set(completed.map((record) => record.id));
  let list =
    activeTopicTab === "completed"
      ? completed
          .map((record) => ({
            topic: topics.find((topic) => topic.id === record.id),
            completedAt: record.completedAt
          }))
          .filter((item) => item.topic)
          .sort((left, right) => right.completedAt - left.completedAt)
          .map((item) => item.topic)
      : topics.filter((topic) => !completedIds.has(topic.id));

  if (query) {
    list = list.filter((topic) => matchesSearch(topic, query));
  }

  updateTabs();
  renderTopics(list);
}

function renderTopics(list) {
  elements.topicList.innerHTML = "";

  if (list.length === 0) {
    const message =
      activeTopicTab === "completed"
        ? "No completed conversations yet."
        : "No conversations to learn next.";
    elements.topicList.innerHTML = `<p class="empty-state">${message}</p>`;
    return;
  }

  list.forEach((topic) => {
    const card = document.createElement("article");
    card.className = "topic-card";
    card.tabIndex = 0;
    card.innerHTML = `
      <h2>${escapeHtml(topic.title)}</h2>
      <p>${escapeHtml(topic.situation)}</p>
      <div class="topic-meta">
        <span class="pill">${escapeHtml(topic.level)}</span>
        <span class="pill">${topic.turns.length} turns</span>
      </div>
    `;

    card.addEventListener("click", () => openLesson(topic));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLesson(topic);
      }
    });

    if (activeTopicTab === "completed") {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "practice-again-button";
      action.textContent = "Practice again";
      action.addEventListener("click", (event) => {
        event.stopPropagation();
        markTopicIncomplete(topic.id);
        openLesson(topic);
      });
      card.appendChild(action);
    }

    elements.topicList.appendChild(card);
  });
}

function filterTopics() {
  renderCurrentTopicList();
}

function matchesSearch(topic, query) {
  const haystack = [
    topic.title,
    topic.situation,
    ...(topic.tags || []),
    ...(topic.keywords || [])
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function setTopicTab(tab) {
  activeTopicTab = tab;
  renderCurrentTopicList();
}

function updateTabs() {
  const isNext = activeTopicTab === "next";
  elements.nextTab.classList.toggle("is-active", isNext);
  elements.completedTab.classList.toggle("is-active", !isNext);
  elements.nextTab.setAttribute("aria-selected", String(isNext));
  elements.completedTab.setAttribute("aria-selected", String(!isNext));
}

function openLesson(topic) {
  selectedTopic = topic;
  elements.lessonLevel.textContent = topic.level;
  elements.lessonTitle.textContent = topic.title;
  elements.lessonSituation.textContent = topic.situation;
  elements.lessonTurns.textContent = String(topic.turns.length);
  showScreen("lesson");
}

function startLesson() {
  turnIndex = 0;
  primeSpeechSynthesis();
  showScreen("conversation");
  renderTurn();
}

function renderTurn() {
  const turn = selectedTopic.turns[turnIndex];
  const isParent = turn.speaker === "parent";

  elements.progressText.textContent = `${turnIndex + 1} / ${selectedTopic.turns.length}`;
  elements.speakerLabel.textContent = isParent ? "Your turn" : "TinyTalk";
  elements.turnText.textContent = turn.text;
  elements.turnTranslation.textContent = turn.translation || "";
  elements.statusMessage.textContent = isParent
    ? "Tap to talk, then say the sentence. Pass is okay for practice."
    : "TinyTalk is speaking.";
  elements.listenButton.disabled = !isParent;
  elements.passButton.disabled = !isParent || !turn.allowPass;
  resetTalkButton();

  if (!isParent) {
    speakTurn(turn.text);
  }
}

function speakTurn(text) {
  if (!("speechSynthesis" in window)) {
    elements.statusMessage.textContent =
      "Text-to-speech is not supported in this browser.";
    setTimeout(nextTurn, 900);
    return;
  }

  primeSpeechSynthesis();
  setTimeout(() => playTinyTalkSpeech(text), 120);
}

function playTinyTalkSpeech(text, attempt = 1) {
  const voicesReady = window.speechSynthesis.getVoices().length > 0;

  if (!voicesReady && attempt <= 6) {
    setTimeout(() => playTinyTalkSpeech(text, attempt + 1), 180);
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.voice = getTinyTalkVoice();
  utterance.pitch = 1.35;
  utterance.rate = 0.78;
  utterance.volume = 1;

  let finished = false;
  const finishSpeaking = () => {
    if (finished) {
      return;
    }

    finished = true;
    setTimeout(nextTurn, 350);
  };

  utterance.onend = finishSpeaking;
  utterance.onerror = () => {
    if (attempt <= 2) {
      setTimeout(() => playTinyTalkSpeech(text, attempt + 1), 250);
      return;
    }

    finishSpeaking();
  };

  window.speechSynthesis.speak(utterance);

  setTimeout(() => {
    if (!finished && !window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
      if (attempt <= 2) {
        playTinyTalkSpeech(text, attempt + 1);
      }
    }
  }, 900);
}

function getTinyTalkVoice() {
  if (preferredTinyTalkVoice) {
    return preferredTinyTalkVoice;
  }

  const voices = window.speechSynthesis.getVoices();
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en")
  );

  const friendlyVoiceNames = [
    "google us english",
    "google uk english female",
    "microsoft aria",
    "microsoft jenny",
    "samantha",
    "karen",
    "zira"
  ];

  preferredTinyTalkVoice =
    friendlyVoiceNames
      .map((name) =>
        englishVoices.find((voice) =>
          voice.name.toLowerCase().includes(name)
        )
      )
      .find(Boolean) ||
    englishVoices.find((voice) => /female|woman|girl/i.test(voice.name)) ||
    englishVoices[0] ||
    null;

  return preferredTinyTalkVoice;
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    preferredTinyTalkVoice = null;
    getTinyTalkVoice();
  };
}

function startListening() {
  if (recognition) {
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    elements.statusMessage.textContent =
      "Speech recognition is not supported here. Use Pass to continue.";
    return;
  }

  primeSpeechSynthesis();
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  elements.statusMessage.textContent = "Listening...";
  elements.listenButton.textContent = "...";
  elements.listenButton.disabled = true;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    stopListeningTimer();
    checkAnswer(transcript);
  };

  recognition.onerror = () => {
    elements.statusMessage.textContent =
      "Microphone was blocked or could not hear you. Tap to talk again.";
    resetRecognitionState();
  };

  recognition.onend = () => {
    resetRecognitionState();
  };

  recognition.start();
  listeningTimeout = setTimeout(() => {
    if (recognition) {
      recognition.abort();
      elements.statusMessage.textContent =
        "I did not hear anything. Tap to talk again.";
      resetRecognitionState();
    }
  }, 6500);
}

function checkAnswer(transcript) {
  const turn = selectedTopic.turns[turnIndex];
  const result = scoreAnswer(
    transcript,
    [turn.text, ...(turn.acceptableVariants || [])]
  );

  if (result.accepted) {
    elements.statusMessage.textContent = `Accepted (${Math.round(
      result.score * 100
    )}%): "${transcript}"`;
    setTimeout(nextTurn, 500);
    return;
  }

  elements.statusMessage.textContent = `I heard: "${transcript}" (${Math.round(
    result.score * 100
  )}%). Tap to talk again or press Pass.`;
}

function primeSpeechSynthesis() {
  if (!("speechSynthesis" in window) || speechPrimed) {
    return;
  }

  window.speechSynthesis.getVoices();
  const utterance = new SpeechSynthesisUtterance(" ");
  utterance.volume = 0;
  utterance.rate = 1;
  utterance.onend = () => {
    speechPrimed = true;
  };
  window.speechSynthesis.speak(utterance);
}

function stopListeningTimer() {
  if (listeningTimeout) {
    clearTimeout(listeningTimeout);
    listeningTimeout = null;
  }
}

function resetRecognitionState() {
  stopListeningTimer();
  recognition = null;
  resetTalkButton();
}

function resetTalkButton() {
  elements.listenButton.textContent = "Tap to talk";
  elements.listenButton.disabled =
    !selectedTopic || selectedTopic.turns[turnIndex].speaker !== "parent";
}

function nextTurn() {
  if (turnIndex + 1 >= selectedTopic.turns.length) {
    completeLesson();
    return;
  }

  turnIndex += 1;
  renderTurn();
}

function completeLesson() {
  markTopicComplete(selectedTopic.id);

  elements.completeSummary.textContent = `You completed "${selectedTopic.title}".`;
  showScreen("complete");
}

function getCompletedRecords() {
  const raw = localStorage.getItem("tinytalk.completed");

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    const migrated = parsed
      .map((item, index) => {
        if (typeof item === "number") {
          return {
            id: item,
            completedAt: Date.now() - (parsed.length - index) * 1000
          };
        }

        if (item && typeof item === "object" && Number.isFinite(item.id)) {
          return {
            id: item.id,
            completedAt: Number.isFinite(item.completedAt)
              ? item.completedAt
              : Date.now()
          };
        }

        return null;
      })
      .filter(Boolean);

    localStorage.setItem("tinytalk.completed", JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

function saveCompletedRecords(records) {
  localStorage.setItem("tinytalk.completed", JSON.stringify(records));
}

function markTopicComplete(topicId) {
  const records = getCompletedRecords().filter((record) => record.id !== topicId);
  records.push({
    id: topicId,
    completedAt: Date.now()
  });
  saveCompletedRecords(records);
}

function markTopicIncomplete(topicId) {
  const records = getCompletedRecords().filter((record) => record.id !== topicId);
  saveCompletedRecords(records);
  activeTopicTab = "next";
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreAnswer(transcript, acceptedPhrases) {
  const heard = normalizeText(transcript);
  const scores = acceptedPhrases
    .map((phrase) => scorePhrase(heard, normalizeText(phrase)))
    .filter((score) => Number.isFinite(score));
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

  return {
    accepted: bestScore >= 0.58,
    score: bestScore
  };
}

function scorePhrase(heard, expected) {
  if (!heard || !expected) {
    return 0;
  }

  if (heard.includes(expected) || expected.includes(heard)) {
    return 1;
  }

  const heardWords = getImportantWords(heard);
  const expectedWords = getImportantWords(expected);

  if (expectedWords.length === 0) {
    return similarity(heard, expected);
  }

  const matchedWords = expectedWords.filter((word) =>
    heardWords.some((heardWord) => wordsAreClose(heardWord, word))
  );
  const wordScore = matchedWords.length / expectedWords.length;
  const characterScore = similarity(heard, expected);

  return wordScore * 0.72 + characterScore * 0.28;
}

function getImportantWords(value) {
  const lightWords = new Set([
    "a",
    "an",
    "the",
    "to",
    "is",
    "are",
    "am",
    "do",
    "did",
    "you",
    "your",
    "i",
    "it"
  ]);

  return normalizeText(value)
    .split(" ")
    .filter((word) => word.length > 1 && !lightWords.has(word));
}

function wordsAreClose(heardWord, expectedWord) {
  if (heardWord === expectedWord) {
    return true;
  }

  if (heardWord.length <= 3 || expectedWord.length <= 3) {
    return false;
  }

  return similarity(heardWord, expectedWord) >= 0.72;
}

function similarity(left, right) {
  const distance = levenshteinDistance(left, right);
  const longest = Math.max(left.length, right.length, 1);
  return 1 - distance / longest;
}

function levenshteinDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array(right.length + 1);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + cost
      );
    }

    for (let index = 0; index < previous.length; index += 1) {
      previous[index] = current[index];
    }
  }

  return previous[right.length];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

elements.searchInput.addEventListener("input", filterTopics);
elements.nextTab.addEventListener("click", () => setTopicTab("next"));
elements.completedTab.addEventListener("click", () => setTopicTab("completed"));
elements.startLesson.addEventListener("click", startLesson);
elements.listenButton.addEventListener("click", startListening);
elements.passButton.addEventListener("click", nextTurn);
document.querySelector("#backToHomeFromIntro").addEventListener("click", goHome);
document
  .querySelector("#backToHomeFromConversation")
  .addEventListener("click", goHome);
document.querySelector("#practiceAgain").addEventListener("click", startLesson);
document
  .querySelector("#backToHomeFromComplete")
  .addEventListener("click", goHome);

loadTopics();
