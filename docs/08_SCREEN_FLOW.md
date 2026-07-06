# Screen Flow

## Overview

This document defines the screens and user navigation for TinyTalk MVP.

The application should be simple, intuitive, and require as few interactions as possible.

The parent should be able to start a lesson within a few seconds.

---

# Overall Flow

```text
Home
    ↓
Search or Browse Topics
    ↓
Select Topic
    ↓
Lesson Introduction
    ↓
Request Microphone Permission
    ↓
Conversation
    ↓
Lesson Completed
    ↓
Back to Home
```

---

# Screen 1 — Home

## Purpose

Entry point of the application.

## Components

- App logo
- Welcome message
- Search box
- Topic categories
- Continue Learning (optional)
- Topic list

## Actions

User can:

- Search a topic
- Browse topics
- Open a lesson

---

# Screen 2 — Search Results

## Purpose

Display topics matching the search keyword.

## Components

- Search box
- Search results
- Topic card

Each topic card displays:

- Topic title
- Situation
- Difficulty level

## Actions

User selects one topic.

---

# Screen 3 — Lesson Introduction

## Purpose

Provide a brief overview before starting.

## Components

- Topic title
- Situation
- Estimated duration
- Number of dialogue turns
- Start button

## Actions

Press **Start Conversation**.

---

# Screen 4 — Microphone Permission

## Purpose

Request microphone access.

## Components

- Explanation message
- Allow Microphone button

If permission is granted:

→ Continue.

If permission is denied:

→ Show a simple instruction asking the user to enable microphone access.

---

# Screen 5 — Conversation

## Purpose

This is the core learning screen.

## Layout

Top

- Topic title
- Progress indicator

Center

- Current dialogue

Bottom

- Microphone button
- Retry button
- Pass button

---

# Conversation Flow

```
Parent Turn

↓

Start Listening

↓

Speech Recognition

↓

Sentence Accepted

↓

TinyTalk Speaks

↓

Next Parent Turn

↓

Repeat
```

---

# Parent Turn

Display:

- Parent sentence
- Vietnamese translation (optional)

User presses the microphone button.

TinyTalk listens.

If accepted:

→ Continue.

Otherwise:

→ Retry.

The parent may also press **Pass**.

---

# TinyTalk Turn

TinyTalk automatically speaks the predefined dialogue using Text-to-Speech.

No user action is required.

After speaking:

Move to the next parent turn.

---

# Screen 6 — Lesson Completed

## Purpose

Celebrate lesson completion.

## Components

- Congratulations message
- Lesson summary
- Practice Again button
- Back to Home button

---

# Navigation Rules

Home

↓

Search

↓

Lesson

↓

Conversation

↓

Completed

↓

Home

Users should never become lost inside the application.

Every screen should always provide a clear path forward.

---

# MVP Navigation Principles

- Maximum 3 taps to start a lesson.
- No unnecessary popups.
- No complex menus.
- No hidden navigation.
- Keep every interaction simple.
- Mobile-first navigation.

---

# Screen List

| Screen | Purpose |
|---------|---------|
| Home | Browse and search topics |
| Search Results | Display matching topics |
| Lesson Introduction | Show lesson information |
| Microphone Permission | Request microphone access |
| Conversation | Voice interaction |
| Lesson Completed | Finish lesson and continue learning |

---

# Future Screens (Out of MVP)

The following screens are intentionally excluded from the MVP:

- Login
- User Profile
- Settings
- Favorites
- Learning Statistics
- Admin Dashboard
- Content Management
- AI Chat

These may be added in future versions if needed.