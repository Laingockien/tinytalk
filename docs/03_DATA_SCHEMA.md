# Data Schema

## Overview

TinyTalk uses a static content database.

The content is created in Excel, then converted into a JSON file used by the website.

The MVP does not use a live database such as Supabase, Firebase, MySQL, or PostgreSQL.

---

# Content Workflow

```text
Excel file
↓
Convert script
↓
topics.json
↓
Vercel public folder
↓
Website reads JSON
```

The Excel file is the source of truth for content editing.

The JSON file is generated from Excel and used by the website.

---

# Database Type

TinyTalk MVP uses:

```text
Static JSON database
```

The JSON file is stored at:

```text
/public/data/topics.json
```

After deployment, the website can access it from:

```text
/data/topics.json
```

This allows the same content to be accessed from both mobile and desktop devices.

---

# Excel File

The source Excel file should be named:

```text
tinytalk-content.xlsx
```

Recommended location:

```text
/data/tinytalk-content.xlsx
```

---

# Excel Sheets

The Excel file contains two required sheets:

```text
topics
dialogue_turns
```

---

# Sheet 1: topics

This sheet stores the basic information for each conversation topic.

## Columns

| Column | Required | Description |
|---|---:|---|
| id | Yes | Unique topic ID |
| order | Yes | Lesson order from 1 to 600 |
| title | Yes | Topic title |
| level | Yes | Lesson difficulty level |
| situation | Yes | Short description of the real-life situation |
| tags | Yes | Search tags, separated by commas |
| keywords | Yes | Search keywords, separated by commas |
| is_active | Yes | TRUE or FALSE |

## Example

| id | order | title | level | situation | tags | keywords | is_active |
|---:|---:|---|---|---|---|---|---|
| 1 | 1 | Good Morning | starter | Waking up in the morning | morning, family, home | wake up, good morning, mommy | TRUE |
| 2 | 2 | Drink Water | starter | Asking the child to drink water | drink, water, home | water, thirsty, cup | TRUE |

---

# Sheet 2: dialogue_turns

This sheet stores the conversation lines for each topic.

## Columns

| Column | Required | Description |
|---|---:|---|
| topic_id | Yes | ID of the related topic |
| turn_order | Yes | Order of the line inside the conversation |
| speaker | Yes | `parent` or `app` |
| text | Yes | English sentence |
| translation | No | Vietnamese meaning |
| acceptable_variants | No | Alternative accepted parent phrases, separated by `\|` |
| allow_pass | Yes | TRUE or FALSE |

## Speaker Rules

There are only two speaker values:

```text
parent
app
```

The parent always starts the conversation.

TinyTalk responds after each parent line.

## Example

| topic_id | turn_order | speaker | text | translation | acceptable_variants | allow_pass |
|---:|---:|---|---|---|---|---|
| 1 | 1 | parent | Good morning, baby. | Chào buổi sáng, con yêu. | Morning, baby.\|Good morning. | TRUE |
| 1 | 2 | app | Good morning, mommy. | Chào buổi sáng, mẹ. |  | FALSE |
| 1 | 3 | parent | Did you sleep well? | Con ngủ ngon không? | Sleep well?\|Did you sleep good? | TRUE |
| 1 | 4 | app | Yes, I did. | Có ạ. |  | FALSE |

---

# JSON Output

The convert script generates:

```text
/public/data/topics.json
```

---

# JSON Structure

```json
[
  {
    "id": 1,
    "order": 1,
    "title": "Good Morning",
    "level": "starter",
    "situation": "Waking up in the morning",
    "tags": ["morning", "family", "home"],
    "keywords": ["wake up", "good morning", "mommy"],
    "isActive": true,
    "turns": [
      {
        "order": 1,
        "speaker": "parent",
        "text": "Good morning, baby.",
        "translation": "Chào buổi sáng, con yêu.",
        "acceptableVariants": [
          "Morning, baby.",
          "Good morning."
        ],
        "allowPass": true
      },
      {
        "order": 2,
        "speaker": "app",
        "text": "Good morning, mommy.",
        "translation": "Chào buổi sáng, mẹ.",
        "acceptableVariants": [],
        "allowPass": false
      }
    ]
  }
]
```

---

# Level Values

For MVP, TinyTalk uses three simple levels:

```text
starter
easy
daily
```

## starter

Very short and simple sentences.

Example:

```text
Good morning.
Drink water.
Come here.
```

## easy

Short daily conversations.

Example:

```text
Do you want milk?
Yes, please.
```

## daily

More natural daily conversations with slightly longer sentences.

Example:

```text
Let's put your toys back in the box.
```

---

# Search Fields

Search should use:

```text
title
situation
tags
keywords
```

Example:

If the parent searches:

```text
animal
```

TinyTalk may return topics such as:

```text
Dog
Cat
Zoo Animals
Farm Animals
My Puppy
```

This is handled by adding related words in `tags` and `keywords`.

---

# Content Rules

Each topic should follow these rules:

- One topic = one small daily situation.
- Each topic should have 4–8 dialogue turns.
- Parent lines should be short and easy to pronounce.
- App lines should sound like a child or friendly conversation partner.
- Avoid difficult grammar.
- Avoid long sentences.
- Avoid abstract topics.
- Use familiar daily-life vocabulary.

---

# Update Process

To update content:

```text
1. Edit tinytalk-content.xlsx
2. Run the convert script
3. Generate new topics.json
4. Commit changes to GitHub
5. Vercel deploys the updated website
```

---

# MVP Notes

TinyTalk does not need a complex database for the MVP.

A static JSON file is enough because:

- The product is for 1–2 users.
- The content is read-only.
- Lessons are prepared in advance.
- Updates are occasional.
- Vercel can host the JSON file for free.