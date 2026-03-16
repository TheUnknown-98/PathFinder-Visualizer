# Pathfinder Visualizer

An interactive pathfinding algorithm visualizer built with vanilla HTML, CSS, and JavaScript. Draw walls, place nodes, generate mazes, and watch four classic algorithms find their way through the grid in real time.

**[Live Demo →](#)** *(replace with your GitHub Pages link)*

---

## Algorithms

| Algorithm | Strategy | Shortest Path? |
|-----------|----------|---------------|
| **BFS** | Explores layer by layer (ripple outward) | ✅ Yes |
| **Dijkstra** | Explores lowest-cost node first | ✅ Yes |
| **A\*** | Dijkstra + Manhattan distance heuristic | ✅ Yes |
| **DFS** | Dives deep before backtracking | ❌ No |

---

## Features

- **4 pathfinding algorithms** — BFS, Dijkstra, A*, DFS with animated visualization
- **Maze generation** — Recursive division algorithm carves clean corridor mazes
- **Speed control** — Turbo / Fast / Normal / Slow animation modes
- **Live stats** — Path length, nodes explored, and compute time (via `performance.now()`)
- **Wall drawing** — Click and drag to draw or erase walls
- **Start / End placement** — Right click to place and remove nodes
- **Color legend** — Instant visual reference for all cell types

---

## Controls

| Action | How |
|--------|-----|
| Draw wall | Left click + drag |
| Erase wall | Left click a wall |
| Place start node | Right click (first) |
| Place end node | Right click (second) |
| Remove start / end | Right click the node |
| Generate maze | ⊞ Gen Maze button |
| Run algorithm | ▶ Visualize button |
| Clear visualization | ✕ Clear Path button |
| Full reset | ↺ Reset button |

---

## How It Works

### Grid
A 20 × 50 grid of `<div>` elements, each tracked in a 2D `grid[row][col]` array with `{ element, type, row, col }`. Cell types — `empty`, `wall`, `start`, `end`, `visited`, `path` — map directly to CSS classes for styling.

### Algorithms
All four algorithms share the same structure — `getNeighbors()`, a `prev` Map for path reconstruction, and a `visitedOrder` array for animation. The only difference is how the next node is selected:

```
BFS       →  queue.shift()         (FIFO — nearest first)
Dijkstra  →  sort by dist, shift   (lowest cost first)
A*        →  sort by g+h, shift    (lowest estimated total first)
DFS       →  stack.pop()           (LIFO — deepest first)
```

### Animation
Algorithms run instantly at full speed. `visitedOrder` stores the sequence cells were visited, then `setTimeout` chains replay them with configurable delays — decoupling computation from visualization.

### Maze Generation
Recursive division: pick an orientation based on region shape, draw a wall across the region with one random gap, then recurse on both sub-regions until they're too small to divide.

---

## Project Structure

```
pathfinder-visualizer/
├── index.html   — markup, controls, legend
├── style.css    — dark theme, cell states, animations
└── app.js       — grid, algorithms, maze, animation
```

---

## Getting Started

No build tools or dependencies required.

```bash
git clone https://github.com/your-username/pathfinder-visualizer
cd pathfinder-visualizer
# open index.html in your browser
```

Or just open `index.html` directly — it runs entirely in the browser.

---

## Deploying to GitHub Pages

1. Push the project to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your live URL will be `https://your-username.github.io/pathfinder-visualizer`

---

## What I Learned

- How BFS, Dijkstra, A*, and DFS differ at the data-structure level — one word (`shift` vs `pop`) changes the entire algorithm
- Why A* is faster than Dijkstra on grids — the Manhattan heuristic eliminates dead-end exploration
- How to decouple algorithm computation from animation using `setTimeout` chains
- Recursive maze generation via the division algorithm

---

## License

MIT
