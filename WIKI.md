# Project Summary

The **Destiny Corridor** is a 2D roguelike card game designed to engage players with a unique blend of strategic depth and dynamic gameplay mechanics. Players create custom decks and navigate procedurally generated environments, engaging in tactical battles against a variety of enemies. The game balances accessibility for casual gamers with the richness and complexity sought by more seasoned players, fostering a robust player-driven narrative that evolves through their decisions. By emphasizing replayability and community involvement, including modding potential, Destiny Corridor aims to cultivate a long-term player base and a vibrant fan community.

# Project Module Description

- **Game Manager**: Orchestrates various game systems, managing game state initialization, updates, and event dispatching.
- **Card System**: Handles card mechanics, including playing cards, state transitions, and effect applications. Supports dynamic interactions through a robust data structure.
- **Battle System**: Manages the flow of battle, determining the turn order of players and enemies, processing character actions, and handling combat interactions.
- **Hex Grid System**: Provides a dynamic hexagonal battle grid for movement and positioning while calculating paths and terrain effects.
- **Oracle System**: Manages oracle events that offer blessings, modify game mechanics, and present players with impactful choices throughout their gameplay.
- **Memory Corridor System**: Ensures the persistence of game states and player progress, enabling players to inherit cards and unlock additional content across runs.
- **Narrative System**: Tracks story progression through events and choices, enriching gameplay with immersive storytelling.
- **Mod System**: Enables community-driven content creation, allowing players to create and integrate custom content, enhancing game longevity and diversity.
- **Season System**: Oversees seasonal content updates and events, augmenting player engagement through evolving game dynamics.

# Directory Tree

```
/data/chats/5rpkdd/workspace
+-- destiny_corridor_class_diagram.mermaid
+-- destiny_corridor_prd.md
+-- destiny_corridor_prototype
|   +-- README.md
|   +-- eslint.config.js
|   +-- index.html
|   +-- package.json
|   +-- postcss.config.js
|   +-- public
|   |   +-- assets
|   |   |   +-- images
|   |   +-- data
|   |       +-- example.json
|   +-- src
|   |   +-- App.jsx
|   |   +-- components
|   |   |   +-- BattleGrid.jsx
|   |   |   +-- Card.jsx
|   |   |   +-- Character.jsx
|   |   |   +-- DestinyWheel.jsx
|   |   |   +-- GameUI.jsx
|   |   |   +-- HexCell.jsx
|   |   |   +-- OracleEvent.jsx
|   |   +-- contexts
|   |   |   +-- GameContext.jsx
|   |   +-- core
|   |   |   +-- BattleSystem.js
|   |   |   +-- CardSystem.js
|   |   |   +-- EventBus.js
|   |   |   +-- GameManager.js
|   |   |   +-- HexGridSystem.js
|   |   |   +-- OracleSystem.js
|   |   +-- data
|   |   |   +-- cards.js
|   |   |   +-- characters.js
|   |   |   +-- oracles.js
|   |   |   +-- terrains.js
|   |   +-- index.css
|   |   +-- main.jsx
|   |   +-- screens
|   |   |   +-- BattleScreen.jsx
|   |   |   +-- MainMenu.jsx
|   |   |   +-- OracleScreen.jsx
|   |   +-- utils
|   |       +-- hexUtils.js
|   +-- tailwind.config.js
|   +-- template_config.json
|   +-- vite.config.js
+-- destiny_corridor_sequence_diagram.mermaid
+-- destiny_corridor_system_design.md
+-- react_template
    +-- README.md
    +-- eslint.config.js
    +-- index.html
    +-- package.json
    +-- postcss.config.js
    +-- public
    |   +-- assets
    |   |   +-- images
    |   +-- data
    |       +-- example.json
    +-- src
    |   +-- App.jsx
    |   +-- index.css
    |   +-- main.jsx
    +-- tailwind.config.js
    +-- template_config.json
    +-- vite.config.js
```

# File Description Inventory

- **destiny_corridor_class_diagram.mermaid**: Contains the class diagram for the game's architecture, depicting the relationships between different components of the game.
- **destiny_corridor_prd.md**: The Product Requirements Document outlining the objectives, features, and overall design of the game.
- **destiny_corridor_prototype**: The prototype implementation folder that includes all source code, assets, and configuration files for the game.
- **destiny_corridor_sequence_diagram.mermaid**: Provides a sequence diagram illustrating key gameplay mechanics and system interactions.
- **destiny_corridor_system_design.md**: A detailed description of the system architecture design, covering components, data structures, and system interactions.
- **react_template**: Contains the template for React projects, including configurations and a sample application.

# Technology Stack

- **React**: JavaScript library for building user interfaces.
- **Vite**: A next-generation frontend tool for fast development.
- **TailwindCSS**: Utility-first CSS framework for rapid UI development.
- **JavaScript/TypeScript**: Programming languages for the game's logic and functionality.
- **Node.js/Express**: Backend technology for API services and data handling.
- **MongoDB**: Database for storing player progress and game data.
- **Socket.IO**: Enables real-time bi-directional communication between the client and server.

# Usage

## Installation

1. Clone the repository to your local machine.
2. Navigate to the `destiny_corridor_prototype` directory.
3. Run `pnpm install` to install all dependencies.

## Build

Run `pnpm run build` to compile the project for production.

## Run

Run `pnpm run dev` to start the development server and build the project for local testing.

## Lint

Use `pnpm run lint` to lint the source code for standard practices.


# INSTRUCTION
- Project Path:`/data/chats/5rpkdd/workspace/destiny_corridor_prototype`
- You can search for the file path in the 'Directory Tree';
- After modifying the project files, if this project can be previewed, then you need to reinstall dependencies, restart service and preview;
