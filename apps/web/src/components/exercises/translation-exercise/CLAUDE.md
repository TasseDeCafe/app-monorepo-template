# Translation Exercise: Selection Feature

## Overview

The selection feature allows users to select meaningful text segments (words, phrases, morphemes) during translation exercises. This helps users focus on specific parts of sentences they want to practice or remember.

## How It Works

### User Interface

1. **Selection Mode Toggle**: Users can enter "selection mode" by clicking the "Multi-Word Selection" button
2. **Word Selection**: In selection mode, users can click on individual words to select them (blue highlight)
3. **Multiple Selection**: Users can select multiple words, both adjacent and non-adjacent
4. **Save Selection**: Users click "Save Selection" to store their selection

### Selection Logic

The system automatically groups adjacent words into chunks while keeping non-adjacent chunks separate:

#### Adjacent Words → Single chunk

- User selects: "Ma", "sœur", "achète" (3 consecutive words)
- System groups them: `["Ma sœur achète"]` (single string)
- Character position: `[0]` (position of first word)

#### Non-Adjacent Words → Multiple Chunks in One Selection

- User selects: "elle", "a" (adjacent) + "et" (non-adjacent)
- System creates: `["elle a", "et"]` (two chunks in one selection)
- Character positions: `[0, 25]` (positions of each phrase)

## Data Structure

### Database Schema

**Table**: `translation_exercise_selections`

| Column                    | Type        | Description                                 |
| ------------------------- | ----------- | ------------------------------------------- |
| `id`                      | SERIAL      | Primary key                                 |
| `translation_exercise_id` | INTEGER     | Reference to the exercise                   |
| `selection_chunks`        | TEXT[]      | Array of selected text chunks               |
| `selection_positions`     | INTEGER[]   | Array of character positions for each chunk |
| `language`                | VARCHAR(3)  | Language code (e.g., "fr", "en")            |
| `created_at`              | TIMESTAMPTZ | Creation timestamp                          |

### Examples

#### Example 1: Single Chunk Selection

**Sentence**: "Ma sœur achète une nouvelle veste"
**User selects**: "Ma sœur achète"
**Stored as**:

```sql
selection_chunks = ["Ma sœur achète"]
selection_positions = [0]
language = "fr"
```

#### Example 2: Multiple Non-Adjacent Chunks

**Sentence**: "Elle a ouvert la porte et a vu un beau jardin"
**User selects**: "Elle a" + "et" + "beau jardin"
**Stored as**:

```sql
selection_chunks = ["Elle a", "et", "beau jardin"]
selection_positions = [0, 20, 35]
language = "fr"
```

#### Example 3: German Separable Verb

**Sentence**: "Ich stehe jeden Morgen früh auf"
**User selects**: "stehe" + "auf" (separable verb parts)
**Stored as**:

```sql
selection_chunks = ["stehe", "auf"]
selection_positions = [4, 25]
language = "de"
```

#### Example 4: Mixed Adjacent and Non-Adjacent

**Sentence**: "The beautiful red car that I bought yesterday is parked outside"
**User selects**: "beautiful red car" + "bought yesterday" + "parked outside"
**Stored as**:

```sql
selection_chunks = ["beautiful red car", "bought yesterday", "parked outside"]
selection_positions = [4, 32, 49]
language = "en"
```

## Technical Implementation

### Frontend Components

1. **SelectableText**: Handles word selection and visual feedback
2. **useSelection**: Hook for managing selection state
3. **TranslationExerciseView**: Main component that integrates chunk selection

### Backend Components

1. **Database Repository**: CRUD operations for selections
2. **Service Layer**: Business logic for processing selections
3. **API Contract**: Type-safe API for chunk selection data

### Key Features

- **Character-based positioning**: Uses character indices for reliable positioning
- **Language-agnostic**: Works with any language (including complex morphology)
- **Flexible grouping**: Automatically groups adjacent words into chunks
- **Multiple selections**: Supports multiple chunks selections in one action
- **Duplicate prevention**: Prevents saving the same selection multiple times

## Usage in Exercise Generation

Selections are used to:

1. Identify difficult words/phrases for users
2. Generate targeted practice exercises
3. Provide context for future exercise generation
4. Track learning progress over time

The system analyzes previous selections to create personalized exercises that focus on areas where users need more practice.
