# Product Requirements Document (PRD)

## Project

TinyTalk

Version: MVP 1.0

---

# 1. Product Goal

TinyTalk is a voice-first web application that helps one parent practice spoken English with their 2-year-old child through short, natural conversations.

The MVP focuses on one simple objective:

> Help the parent complete one short English conversation every day.

The product is intentionally simple and built for personal use (1–2 users only).

---

# 2. Product Scope

## Included

- Voice-first interaction
- 600 predefined conversation topics
- Topic search
- Speech recognition
- Text-to-speech responses
- Local progress saving
- Mobile support
- Desktop support

## Excluded

- User account
- Login
- Payment
- AI-generated conversations
- Admin dashboard
- Online content editing
- Analytics

---

# 3. User Flow

```
Open Website

↓

Search Topic
or
Browse Topics

↓

Select Topic

↓

Allow Microphone

↓

Conversation Starts

↓

Parent Speaks

↓

Speech Recognition

↓

If Accepted

↓

TinyTalk Replies

↓

Repeat Until Finished

↓

Lesson Completed
```

---

# 4. Lesson Flow

Every lesson follows the same structure.

```
Parent

↓

TinyTalk

↓

Parent

↓

TinyTalk

↓

...

↓

Complete
```

The parent always starts the conversation.

TinyTalk always responds according to the predefined dialogue.

---

# 5. Voice Rules

## Parent

- Speaks first.
- Uses microphone.
- May retry if needed.
- May press Pass.

## TinyTalk

- Speaks using Text-to-Speech.
- Never waits for user input during its own turn.
- Always follows the predefined dialogue.

---

# 6. Speech Recognition Rules

TinyTalk listens only during the parent's turn.

After recognition:

If the sentence is close enough to the expected meaning:

→ Continue.

Otherwise:

→ Ask the parent to try again.

The product prioritizes communication over perfect pronunciation.

---

# 7. Pass Rule

Every parent dialogue line supports a Pass button.

When Pass is pressed:

- Skip speech recognition.
- Continue the conversation.
- No penalty.

The objective is to keep the conversation flowing.

---

# 8. Search

Users can search by:

- Topic title
- Situation
- Tags
- Keywords

Example:

Searching

```
animal
```

may return

- Dog
- Cat
- Zoo Animals
- Farm Animals

Search is keyword-based.

No AI search is required.

---

# 9. Lesson Content

Each lesson contains:

- One daily situation
- 4–8 dialogue turns
- Short sentences
- Natural conversation
- Child-friendly vocabulary

---

# 10. Content Source

All lesson content is maintained in Excel.

Workflow:

```
Excel

↓

Convert Script

↓

topics.json

↓

Website
```

The website never edits lesson content directly.

---

# 11. Technology Stack

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

# 12. Project Structure

```
docs/
public/
public/data/
scripts/
src/
```

---

# 13. Success Criteria

The MVP is successful if the parent can:

- Open the website easily.
- Find a topic quickly.
- Complete one conversation naturally.
- Practice every day.
- Feel more confident speaking English.

---

# 14. Future Improvements

Possible future enhancements include:

- More conversation topics
- Better search
- Favorite topics
- Daily recommendation
- Pronunciation scoring
- AI-generated conversations

These features are intentionally excluded from the MVP.

---

# 15. MVP Principle

TinyTalk is intentionally designed to be small, simple, and maintainable.

Every feature should support one core purpose:

> Helping one parent speak English with their 2-year-old child through short, natural daily conversations.

If a feature does not directly support this purpose, it should not be included in the MVP.