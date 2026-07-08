const fallbackTopics = [];

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

const COMPLETED_STORAGE_KEY = "tinytalk.completed.batch01.lessons01-30";
const VOICE_PERFORMANCE_MAP = {
  neutral: {
    pitch: 1.2,
    rate: 0.82,
    volume: 1,
    variants: [
      { id: "neutral_1", weight: 50, style: "base", buildSpokenText: (text) => normalizeSpokenText(text) },
      { id: "neutral_2", weight: 30, style: "base", buildSpokenText: (text) => normalizeSpokenText(text) },
      { id: "neutral_3", weight: 20, style: "gentle", buildSpokenText: (text) => normalizeSpokenText(text) }
    ]
  },
  happy: {
    pitch: 1.35,
    rate: 0.86,
    volume: 1,
    variants: [
      { id: "happy_1", weight: 40, style: "base", buildSpokenText: (text) => ensureEnding(text, "!") },
      { id: "happy_2", weight: 30, style: "leadIn", buildSpokenText: (text) => `Yay! ${ensureEnding(text, "!")}` },
      { id: "happy_3", weight: 20, style: "leadIn", buildSpokenText: (text) => `Hehe! ${ensureEnding(text, "!")}` },
      { id: "happy_4", weight: 10, style: "leadIn", buildSpokenText: (text) => `${ensureEnding(text, "!")} Hehe!` }
    ]
  },
  excited: {
    pitch: 1.48,
    rate: 0.94,
    volume: 1,
    variants: [
      { id: "excited_1", weight: 30, style: "strong", buildSpokenText: (text) => `Yay! ${ensureEnding(text, "!!")}` },
      { id: "excited_2", weight: 25, style: "strong", buildSpokenText: (text) => `Woohoo! ${ensureEnding(text, "!!")}` },
      { id: "excited_3", weight: 25, style: "base", buildSpokenText: (text) => ensureEnding(text, "!!") },
      { id: "excited_4", weight: 10, style: "strong", buildSpokenText: (text) => `${ensureEnding(text, "!")} ${ensureEnding(text, "!!")}` },
      { id: "excited_5", weight: 10, style: "strong", buildSpokenText: (text) => `Let's go! ${ensureEnding(text, "!!")}` }
    ]
  },
  curious: {
    pitch: 1.32,
    rate: 0.8,
    volume: 0.95,
    variants: [
      { id: "curious_1", weight: 45, style: "base", buildSpokenText: (text) => ensureEnding(text, "?") },
      { id: "curious_2", weight: 30, style: "thinking", buildSpokenText: (text) => `Hmm... ${ensureEnding(text, "?")}` },
      { id: "curious_3", weight: 15, style: "thinking", buildSpokenText: (text) => `Oh? ${ensureEnding(text, "?")}` },
      { id: "curious_4", weight: 10, style: "thinking", buildSpokenText: (text) => `Wait... ${ensureEnding(text, "?")}` }
    ]
  },
  proud: {
    pitch: 1.38,
    rate: 0.86,
    volume: 1,
    variants: [
      { id: "proud_1", weight: 45, style: "base", buildSpokenText: (text) => ensureEnding(text, "!") },
      { id: "proud_2", weight: 30, style: "leadIn", buildSpokenText: (text) => `Yes! ${ensureEnding(text, "!")}` },
      { id: "proud_3", weight: 15, style: "leadIn", buildSpokenText: (text) => `Look! ${ensureEnding(text, "!")}` },
      { id: "proud_4", weight: 10, style: "leadIn", buildSpokenText: (text) => `${ensureEnding(text, "!")} I did it!` }
    ]
  },
  sleepy: {
    pitch: 1.05,
    rate: 0.65,
    volume: 0.8,
    variants: [
      { id: "sleepy_1", weight: 45, style: "base", buildSpokenText: (text) => ensureEnding(text, "...") },
      { id: "sleepy_2", weight: 30, style: "soft", buildSpokenText: (text) => `Hmm... ${ensureEnding(text, "...")}` },
      { id: "sleepy_3", weight: 15, style: "soft", buildSpokenText: (text) => `Ahh... ${ensureEnding(text, "...")}` },
      { id: "sleepy_4", weight: 10, style: "soft", buildSpokenText: (text) => ensureEnding(text, "...") }
    ]
  },
  shy: {
    pitch: 1.12,
    rate: 0.72,
    volume: 0.75,
    variants: [
      { id: "shy_1", weight: 45, style: "base", buildSpokenText: (text) => normalizeSpokenText(text) },
      { id: "shy_2", weight: 30, style: "soft", buildSpokenText: (text) => `Um... ${normalizeSpokenText(text)}` },
      { id: "shy_3", weight: 15, style: "soft", buildSpokenText: (text) => `Uh... ${normalizeSpokenText(text)}` },
      { id: "shy_4", weight: 10, style: "soft", buildSpokenText: (text) => `Maybe... ${normalizeSpokenText(text)}` }
    ]
  },
  surprised: {
    pitch: 1.45,
    rate: 0.9,
    volume: 1,
    variants: [
      { id: "surprised_1", weight: 35, style: "strong", buildSpokenText: (text) => `Wow! ${ensureEnding(text, "?!")}` },
      { id: "surprised_2", weight: 25, style: "strong", buildSpokenText: (text) => `Oh! ${ensureEnding(text, "?!")}` },
      { id: "surprised_3", weight: 20, style: "strong", buildSpokenText: (text) => `Wait! ${ensureEnding(text, "?!")}` },
      { id: "surprised_4", weight: 20, style: "base", buildSpokenText: (text) => ensureEnding(text, "?!") }
    ]
  }
};

const VOICE_INTENSITY_MAP = {
  low: { pitch: -0.04, rate: -0.03, volume: -0.05 },
  medium: { pitch: 0, rate: 0, volume: 0 },
  high: { pitch: 0.05, rate: 0.04, volume: 0.03 }
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
    speakTurn(turn.text, turn.emotion, turn.intensity);
  }
}

function speakTurn(text, emotion = "neutral", intensity = "medium") {
  if (!("speechSynthesis" in window)) {
    elements.statusMessage.textContent =
      "Text-to-speech is not supported in this browser.";
    setTimeout(nextTurn, 900);
    return;
  }

  primeSpeechSynthesis();
  setTimeout(() => playTinyTalkSpeech(text, emotion, intensity), 120);
}

function playTinyTalkSpeech(text, emotion = "neutral", intensity = "medium", attempt = 1) {
  const voicesReady = window.speechSynthesis.getVoices().length > 0;

  if (!voicesReady && attempt <= 6) {
    setTimeout(() => playTinyTalkSpeech(text, emotion, intensity, attempt + 1), 180);
    return;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const performance = buildVoicePerformance(text, emotion, intensity);
  const utterance = new SpeechSynthesisUtterance(performance.spokenText);
  utterance.lang = "en-US";
  utterance.voice = getTinyTalkVoice();
  utterance.pitch = performance.settings.pitch;
  utterance.rate = performance.settings.rate;
  utterance.volume = performance.settings.volume;

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
      setTimeout(() => playTinyTalkSpeech(text, emotion, intensity, attempt + 1), 250);
      return;
    }

    finishSpeaking();
  };

  window.speechSynthesis.speak(utterance);

  setTimeout(() => {
    if (!finished && !window.speechSynthesis.speaking) {
      window.speechSynthesis.resume();
      if (attempt <= 2) {
        playTinyTalkSpeech(text, emotion, intensity, attempt + 1);
      }
    }
  }, 900);
}

function buildVoicePerformance(displayText, emotion, intensity) {
  const normalizedEmotion = normalizeEmotion(emotion);
  const normalizedIntensity = normalizeIntensity(intensity);
  const recipe = VOICE_PERFORMANCE_MAP[normalizedEmotion] || VOICE_PERFORMANCE_MAP.neutral;
  const variant = pickVoiceVariant(recipe.variants, normalizedIntensity);
  const settings = applyRandomVariation(recipe, normalizedIntensity);

  return {
    spokenText: variant.buildSpokenText(displayText),
    settings
  };
}

function normalizeEmotion(emotion) {
  const normalizedEmotion = String(emotion || "neutral").toLowerCase();
  return VOICE_PERFORMANCE_MAP[normalizedEmotion] ? normalizedEmotion : "neutral";
}

function normalizeIntensity(intensity) {
  const normalizedIntensity = String(intensity || "medium").toLowerCase();
  return VOICE_INTENSITY_MAP[normalizedIntensity] ? normalizedIntensity : "medium";
}

function pickVoiceVariant(variants, intensity) {
  if (!Array.isArray(variants) || variants.length === 0) {
    return {
      buildSpokenText: (text) => normalizeSpokenText(text)
    };
  }

  let pool = variants;

  if (intensity === "low") {
    pool = variants.filter((variant) => variant.style === "base" || variant.style === "soft");
    if (pool.length === 0) {
      pool = variants;
    }
  }

  if (intensity === "high") {
    pool = variants.map((variant) => ({
      ...variant,
      weight: variant.weight * (variant.style === "strong" || variant.style === "leadIn" ? 1.4 : 1)
    }));
  }

  return pickWeightedVariant(pool);
}

function pickWeightedVariant(variants) {
  const totalWeight = variants.reduce((sum, variant) => sum + (variant.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight || 1;
    if (random <= 0) {
      return variant;
    }
  }

  return variants[0];
}

function applyRandomVariation(recipe, intensity) {
  const base = VOICE_INTENSITY_MAP[intensity] || VOICE_INTENSITY_MAP.medium;
  return {
    pitch: clamp(recipe.pitch + base.pitch + randomBetween(-0.04, 0.04), 0.8, 1.6),
    rate: clamp(recipe.rate + base.rate + randomBetween(-0.03, 0.03), 0.6, 1),
    volume: clamp(recipe.volume + base.volume + randomBetween(-0.05, 0.05), 0.6, 1)
  };
}

function normalizeSpokenText(text) {
  return String(text || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(\.\.\.|[.?!])+$/g, "");
}

function ensureEnding(text, ending) {
  const cleanText = normalizeSpokenText(text);
  return `${cleanText}${ending}`;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
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
  const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);

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

    localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

function saveCompletedRecords(records) {
  localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(records));
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
