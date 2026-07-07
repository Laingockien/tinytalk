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
  retryButton: document.querySelector("#retryButton"),
  passButton: document.querySelector("#passButton"),
  completeSummary: document.querySelector("#completeSummary")
};

let topics = [];
let selectedTopic = null;
let turnIndex = 0;
let recognition = null;

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
  renderTopics(topics);
}

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.add("is-hidden"));
  screens[name].classList.remove("is-hidden");
}

function renderTopics(list) {
  elements.topicList.innerHTML = "";

  if (list.length === 0) {
    elements.topicList.innerHTML = '<p class="intro">No topics found.</p>';
    return;
  }

  list.forEach((topic) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "topic-card";
    button.innerHTML = `
      <h2>${escapeHtml(topic.title)}</h2>
      <p>${escapeHtml(topic.situation)}</p>
      <div class="topic-meta">
        <span class="pill">${escapeHtml(topic.level)}</span>
        <span class="pill">${topic.turns.length} turns</span>
      </div>
    `;
    button.addEventListener("click", () => openLesson(topic));
    elements.topicList.appendChild(button);
  });
}

function filterTopics() {
  const query = elements.searchInput.value.trim().toLowerCase();

  if (!query) {
    renderTopics(topics);
    return;
  }

  const filtered = topics.filter((topic) => {
    const haystack = [
      topic.title,
      topic.situation,
      ...(topic.tags || []),
      ...(topic.keywords || [])
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });

  renderTopics(filtered);
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
    ? "Press Speak and say the sentence. Pass is okay for practice."
    : "TinyTalk is speaking.";
  elements.listenButton.disabled = !isParent;
  elements.retryButton.disabled = !isParent;
  elements.passButton.disabled = !isParent || !turn.allowPass;

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

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.onend = () => setTimeout(nextTurn, 350);
  window.speechSynthesis.speak(utterance);
}

function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    elements.statusMessage.textContent =
      "Speech recognition is not supported here. Use Pass to continue.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  elements.statusMessage.textContent = "Listening...";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    checkAnswer(transcript);
  };

  recognition.onerror = () => {
    elements.statusMessage.textContent =
      "Microphone was blocked or could not hear you. Please retry.";
  };

  recognition.start();
}

function checkAnswer(transcript) {
  const turn = selectedTopic.turns[turnIndex];
  const accepted = [turn.text, ...(turn.acceptableVariants || [])].some((phrase) =>
    normalizeText(transcript).includes(normalizeText(phrase))
  );

  if (accepted) {
    elements.statusMessage.textContent = `Accepted: "${transcript}"`;
    setTimeout(nextTurn, 500);
    return;
  }

  elements.statusMessage.textContent = `I heard: "${transcript}". Try again or press Pass.`;
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
  const completed = JSON.parse(localStorage.getItem("tinytalk.completed") || "[]");
  if (!completed.includes(selectedTopic.id)) {
    completed.push(selectedTopic.id);
    localStorage.setItem("tinytalk.completed", JSON.stringify(completed));
  }

  elements.completeSummary.textContent = `You completed "${selectedTopic.title}".`;
  showScreen("complete");
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
elements.startLesson.addEventListener("click", startLesson);
elements.listenButton.addEventListener("click", startListening);
elements.retryButton.addEventListener("click", renderTurn);
elements.passButton.addEventListener("click", nextTurn);
document.querySelector("#backToHomeFromIntro").addEventListener("click", () => showScreen("home"));
document
  .querySelector("#backToHomeFromConversation")
  .addEventListener("click", () => showScreen("home"));
document.querySelector("#practiceAgain").addEventListener("click", startLesson);
document
  .querySelector("#backToHomeFromComplete")
  .addEventListener("click", () => showScreen("home"));

loadTopics();
