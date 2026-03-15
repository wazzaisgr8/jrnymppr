# JRNYMPPR

**Professional Customer Journey Mapping**

JRNYMPPR is a web application for creating, editing, and presenting customer journey maps. It gives CX teams, service designers, and product managers a structured canvas to visualise how customers move through an experience — from first awareness to post-service — across every touchpoint, backstage process, and emotional state.

---

## Purpose

Customer journey maps are collaborative artefacts. They align teams around a shared understanding of the customer experience, expose gaps and pain points, and guide decisions about what to build, fix, or remove.

JRNYMPPR makes it fast to create a rigorous, well-structured journey map without starting from scratch. It ships with six templates covering the most common mapping scenarios, and lets you customise every phase, lane, card, and persona to fit your specific context.

---

## Core Concepts

### Journey Map
The primary workspace. A map is organised as a grid of **phases** (columns) and **lanes** (rows). Each cell in the grid can hold one or more **cards**.

### Phases
The stages of the customer journey, e.g. *Awareness → Consideration → Purchase → Post-Purchase*. Phases are ordered left-to-right and can be added, renamed, reordered, or deleted.

### Lanes
Horizontal rows that represent different dimensions of the experience. Lanes are grouped into three categories:

- **Front-Stage** — what the customer sees and does (Activities, Needs & Quotes, Emotion)
- **Channels** — touchpoints where the customer interacts with the product or service
- **Back-Stage** — internal processes, systems, and KPIs the customer never sees

Lanes support sub-lanes for additional granularity and can be collapsed to reduce visual noise.

### Cards
Cards sit at the intersection of a phase and a lane. Each card has a title, body, colour, status, tags, and links. Status options are:

| Status | Meaning |
|---|---|
| Current | This already exists |
| To Develop | Planned but not built |
| In Progress | Being worked on now |
| Done | Completed |
| Remove | Should be eliminated |

### Emotion Curve
A dedicated lane that plots customer sentiment across the journey. Each phase gets a draggable point on a smooth Bezier curve. Values map to colour (teal for positive, orange for neutral, red for negative), giving a fast visual read of where the experience peaks and dips.

### Persona
Every map can have a persona attached — a named representation of the customer. Personas include a name, role, key quote, photo, and custom attributes (e.g. Age, Device, Goals, Frustrations). The persona is displayed in a header band above the map grid.

### Presentation Mode
A full-screen view optimised for sharing the map in meetings or presentations. Zoom controls let you scale the canvas to fit any screen size.

---

## Templates

Six starting templates are included:

| Template | Use Case |
|---|---|
| E-Commerce Purchase Journey | Retail customer experience |
| SaaS Onboarding Journey | User activation and adoption |
| B2B Sales Journey | Buying committee and procurement |
| Service Blueprint | Front-stage / back-stage service design |
| Employee Journey Map | HR and talent experience |
| Blank Map | Start from scratch |

Templates pre-populate phases, lanes, and example cards so you can orient quickly and start editing rather than building from zero.

---

## How It Is Built

### Frontend
- **React 18** with TypeScript
- **Vite** for development and production builds
- **Tailwind CSS** for styling
- **Lucide React** for icons

State is managed with React Context and a reducer pattern (`MapContext`). There is no external state management library. All async operations talk directly to Supabase.

### Backend & Database
- **Supabase** (PostgreSQL) for all data persistence
- **Supabase Auth** for email/password authentication
- **Supabase Storage** for persona photo uploads (`persona-photos` bucket)
- **Row Level Security (RLS)** enforced on every table — users can only access their own data

### Database Schema

| Table | Purpose |
|---|---|
| `workspaces` | Top-level container per user |
| `collections` | Groups of related maps within a workspace |
| `journey_maps` | The map itself, linked to workspace, collection, and persona |
| `phases` | Ordered columns of a map |
| `lanes` | Ordered rows of a map, with optional parent for sub-lanes |
| `cards` | Content items at phase/lane intersections |
| `emotion_points` | Sentiment value per phase |
| `personas` | Customer persona attached to a map |
| `comments` | Card-level comments for collaboration |

### Project Structure

```
src/
  components/
    auth/          # Sign in / sign up screen
    dashboard/     # Map listing, map cards, new map modal
    editor/        # Map canvas, toolbar, persona band, card panel,
                   # emotion curve, floating toolbar, presentation mode
  contexts/
    AuthContext    # Supabase auth session management
    MapContext     # Journey map state and all DB operations
  lib/
    types.ts       # TypeScript interfaces and shared constants
    supabase.ts    # Supabase client singleton
    templates.ts   # Pre-built map templates
  App.tsx          # Root component and routing
```

Routing is hash-based (`#/map/:id`) with no external router dependency.

---

## Running Locally

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Add your Supabase credentials to `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Start the development server:
   ```
   npm run dev
   ```

---

## Design Principles

- **Canvas-first** — the map grid is the primary surface; all controls are secondary
- **Minimal chrome** — toolbars float or collapse out of the way during editing
- **Status as signal** — card status colours give an instant read of map health
- **Progressive disclosure** — detailed card editing happens in a side panel, not inline
- **Keyboard-friendly** — phase and lane names edit on double-click; Escape cancels
