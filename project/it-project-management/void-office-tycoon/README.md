# Void Office Tycoon

Void Office Tycoon is a local browser-based implementation of `it_project_management_2300005633.json`. 
It was originally designed as a client/server application but has been fully converted to a client-side JavaScript application running locally in the browser.

- `client/` contains the Vite frontend and the local logic API (`localApi.js` and `local_game_rules.js`).
- `client/src/assets/sprites/` contains editable power-of-two SVG sprites.

The game features a persistent 32x32 isometric world grid. Students build a path from the black void toward the nebula gate, avoid randomly generated mini blackholes, and place irregular office departments into the map. Each normal cell has a 4x4 subcell layer for department sprite stacks and generated north/west perimeter walls.

## How to Run

Since the game now runs entirely on the client side, you only need Node.js installed. Python is no longer required.

1. Navigate to the `client` directory:
   ```bash
   cd project/it-project-management/void-office-tycoon/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173/`. 
All game sessions, choices, and state are saved locally in your browser's `localStorage`.

## Data and Logs
- Session states are kept in browser `localStorage`.
- To get your GPAF log JSONL file for your portfolio submission, finish the game and click "Download Log" on the final report screen.

## Habbo SWF Assets

The Habbo asset pack is kept outside the game code. Emitted embedded SWF PNG assets are stored in `client/src/assets/sprites/habbo_raw/`. They are not resized, cropped, padded, or recolored.
