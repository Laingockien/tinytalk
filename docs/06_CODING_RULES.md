# Coding Rules

## Purpose

This document defines the development rules for TinyTalk.

All code should prioritize simplicity, maintainability, and free deployment over scalability.

This project is an MVP built for personal use (1–2 users only).

---

# General Principles

- Keep the code simple.
- Avoid over-engineering.
- Prefer readability over cleverness.
- Build only what is required for the MVP.
- Do not add features that are not specified in the PRD.

---

# Technology Stack

Framework

- Next.js (App Router)
- React
- TypeScript

Styling

- Tailwind CSS

Voice

- Web Speech API (Speech Recognition)
- SpeechSynthesis API (Text-to-Speech)

Hosting

- GitHub
- Vercel

Content

- Excel
- JSON

---

# Architecture

TinyTalk is a frontend-only application.

Do NOT use:

- Backend server
- REST API
- GraphQL
- Database server
- Authentication service

All lesson content comes from a static JSON file.

---

# Data Source

Never hardcode lesson content.

Always load data from:

```text
/public/data/topics.json
```

The JSON file is generated from the Excel source.

---

# Component Design

Components should be:

- Small
- Reusable
- Easy to understand

Each component should have a single responsibility.

---

# Folder Structure

Recommended structure:

```text
app/
components/
hooks/
lib/
public/
public/data/
scripts/
docs/
```

---

# State Management

Use React built-in state only.

Prefer:

- useState
- useEffect
- useMemo

Do NOT introduce Redux, MobX, Zustand, or other state libraries unless absolutely necessary.

---

# Progress Storage

Store learning progress locally.

Use:

```text
LocalStorage
```

No cloud sync is required.

---

# Search

Search should work entirely on the frontend.

Search fields:

- title
- situation
- tags
- keywords

Do not use AI search.

Do not use external search services.

---

# Speech Recognition

Use the browser's Web Speech API.

During the parent's turn:

- Start listening.
- Convert speech to text.
- Compare with the expected sentence.
- Continue if accepted.

Do not use paid Speech-to-Text services.

---

# Text-to-Speech

Use the browser's SpeechSynthesis API.

TinyTalk speaks only during its own dialogue turns.

---

# Performance

Keep the application lightweight.

Avoid unnecessary packages.

Prefer native browser APIs whenever possible.

---

# Mobile First

Design and develop for mobile first.

Desktop should also work without additional features.

---

# Accessibility

Buttons should be:

- Large enough to tap comfortably.
- Clearly labeled.
- Easy to understand.

---

# Error Handling

For the MVP:

- Keep error handling simple.
- Show clear messages when microphone permission is denied.
- Allow the user to retry.

Do not implement complex recovery flows.

---

# Code Style

Use:

- TypeScript
- Functional components
- Async/await where appropriate

Keep functions short.

Use meaningful variable names.

Avoid deeply nested code.

---

# Dependencies

Only install packages that are necessary.

Prefer browser-native APIs before adding third-party libraries.

---

# Future Expansion

Write code that is easy to extend.

Future features such as additional lessons, favorites, or pronunciation scoring should be added without major refactoring.

However, do not implement future features in the MVP.

---

# Development Principle

Before implementing any feature, ask one question:

> Does this feature help the parent practice English conversations with their 2-year-old child?

If the answer is **No**, it should not be included in the MVP.