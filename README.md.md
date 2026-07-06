# TinyTalk

> Voice-first English speaking practice for parents and young children.

## Overview

TinyTalk is a simple web application that helps parents practice spoken English with their children through short, real-life conversations.

The product is designed around one core philosophy:

> Children learn languages through meaningful interaction, not through memorizing vocabulary or grammar.

Instead of generating conversations with AI, TinyTalk uses a carefully curated database of conversation topics. This approach makes the product completely free, predictable, safe for children, and easy to maintain.

This project is built as an MVP for personal use (1–2 users only).

---

# Goals

- Help parents speak English with their children every day.
- Make English practice feel like a natural conversation.
- Keep every lesson short, practical, and enjoyable.
- Build confidence instead of perfect pronunciation.
- Require zero technical setup for end users.

---

# Core Principles

- Voice-first experience.
- Conversation before vocabulary.
- Learn through repetition in context.
- Short, realistic dialogues.
- No AI-generated lessons.
- Completely free to run.
- Simple architecture.
- Easy to expand by adding new topics.

---

# MVP Scope

Included:

- 600 predefined conversation topics.
- Voice interaction.
- Speech recognition.
- Text-to-speech responses.
- Topic search.
- Learning progress stored locally.
- Mobile and desktop support.

Not included:

- User accounts.
- Login or registration.
- Payments.
- AI conversation generation.
- Admin dashboard.
- Online content editing.

---

# Technology

Frontend

- Next.js
- React
- TypeScript

Voice

- Web Speech API
- SpeechSynthesis API

Content

- Excel
- JSON

Hosting

- GitHub
- Vercel

---

# Content Workflow

Conversation content is created in Excel.

Excel

↓

Convert Script

↓

JSON

↓

Website

↓

Deploy to Vercel

This allows new lessons to be added quickly without editing the source code.

---

# Repository Structure

```
docs/
public/
public/data/
scripts/
src/
```

---

# Documentation

Project documentation is located inside the `/docs` directory.

Main documents include:

- PRODUCT_VISION.md
- LEARNING_PHILOSOPHY.md
- DATA_SCHEMA.md
- PRD.md

---

# Project Status

Current phase:

Planning & Product Design

Next phase:

Build MVP