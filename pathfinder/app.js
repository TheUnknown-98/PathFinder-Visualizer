const ROWS = 20;
const COLS = 50;
 
const gridContainer = document.getElementById('grid-container');
const grid = [];
 
let startNode   = null;
let endNode     = null;
let isMouseDown = false;
let drawMode    = null;
 
// ─── Descriptions ─────────────────────────────────────────────────
const descriptions = {
  bfs:      'BFS — explores outward layer by layer · guarantees shortest path',
  dijkstra: 'Dijkstra — explores lowest cost first · guarantees shortest path',
  astar:    'A* — uses heuristic to aim toward end · fastest optimal algorithm',
  dfs:      'DFS — dives deep before backtracking · does NOT guarantee shortest path'
};
 
// ─── Build the grid ───────────────────────────────────────────────
function createGrid() {
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridContainer.appendChild(cell);
 
      grid[r][c] = {
        element: cell,
        type: 'empty',
        row: r,
        col: c
      };
 
      cell.addEventListener('mousedown',  (e) => onMouseDown(e, r, c));
      cell.addEventListener('mouseenter', (e) => onMouseEnter(e, r, c));
    }
  }
 
  document.addEventListener('mouseup', () => { isMouseDown = false; drawMode = null; });
  gridContainer.addEventListener('contextmenu', (e) => e.preventDefault());
}
 
// ─── Cell type helpers ────────────────────────────────────────────
function setCellType(node, type) {
  node.element.classList.remove(node.type);
  node.type = type;
  if (type !== 'empty') node.element.classList.add(type);
}
 
// ─── Mouse events ─────────────────────────────────────────────────
function onMouseDown(e, r, c) {
  const node = grid[r][c];
 
  if (e.button === 2) {
    if (!startNode) {
      setCellType(node, 'start');
      startNode = node;
    } else if (!endNode && node !== startNode) {
      setCellType(node, 'end');
      endNode = node;
    } else if (node === startNode) {
      setCellType(node, 'empty');
      startNode = null;
    } else if (node === endNode) {
      setCellType(node, 'empty');
      endNode = null;
    }
    return;
  }
 
  if (node.type === 'start' || node.type === 'end') return;
  isMouseDown = true;
  drawMode = node.type === 'wall' ? 'empty' : 'wall';
  setCellType(node, drawMode);
}
 
function onMouseEnter(e, r, c) {
  if (!isMouseDown) return;
  const node = grid[r][c];
  if (node.type === 'start' || node.type === 'end') return;
  setCellType(node, drawMode);
}
 
// ─── Utility ──────────────────────────────────────────────────────
function getNeighbors(node) {
  const { row, col } = node;
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  const neighbors = [];
  for (const [dr, dc] of dirs) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      neighbors.push(grid[nr][nc]);
    }
  }
  return neighbors;
}
 
function clearPath() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const node = grid[r][c];
      if (node.type === 'visited' || node.type === 'path') {
        setCellType(node, 'empty');
      }
    }
  }
  document.getElementById('message').textContent = '';
}
 
function resetGrid() {
  startNode = null;
  endNode   = null;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      setCellType(grid[r][c], 'empty');
    }
  }
  document.getElementById('message').textContent = '';
}
 
function setButtonsDisabled(val) {
  document.getElementById('btn-visualize').disabled  = val;
  document.getElementById('btn-clear-path').disabled = val;
  document.getElementById('btn-reset').disabled      = val;
  document.getElementById('btn-maze').disabled       = val;
}
 
// ─── Path reconstruction (shared by all algorithms) ───────────────
function reconstructPath(prev) {
  const path = [];
  let node = endNode;
  while (prev.has(node)) {
    node = prev.get(node);
    if (node !== startNode) path.unshift(node);
  }
  return path;
}
 
// ─── BFS ──────────────────────────────────────────────────────────
// Explores layer by layer — like ripples in water.
// Queue = FIFO. Always finds shortest path on unweighted grids.
function bfs() {
  const queue        = [startNode];
  const visited      = new Set([startNode]);
  const prev         = new Map();
  const visitedOrder = [];
 
  while (queue.length > 0) {
    const current = queue.shift();
 
    if (current !== startNode && current !== endNode)
      visitedOrder.push(current);
 
    if (current === endNode)
      return { visitedOrder, path: reconstructPath(prev), found: true };
 
    for (const neighbor of getNeighbors(current)) {
      if (!visited.has(neighbor) && neighbor.type !== 'wall') {
        visited.add(neighbor);
        prev.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }
 
  return { visitedOrder, path: [], found: false };
}
 
// ─── Dijkstra ─────────────────────────────────────────────────────
// Always processes the node with the lowest total cost so far.
// Identical result to BFS on unweighted grids, but handles
// weighted graphs if you ever add movement costs.
function dijkstra() {
  const dist = new Map();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      dist.set(grid[r][c], Infinity);
  dist.set(startNode, 0);
 
  const prev         = new Map();
  const visited      = new Set();
  const visitedOrder = [];
  const pq           = [startNode];
 
  while (pq.length > 0) {
    pq.sort((a, b) => dist.get(a) - dist.get(b));
    const current = pq.shift();
 
    if (visited.has(current)) continue;
    visited.add(current);
 
    if (current !== startNode && current !== endNode)
      visitedOrder.push(current);
 
    if (current === endNode)
      return { visitedOrder, path: reconstructPath(prev), found: true };
 
    for (const neighbor of getNeighbors(current)) {
      if (visited.has(neighbor) || neighbor.type === 'wall') continue;
      const newDist = dist.get(current) + 1;
      if (newDist < dist.get(neighbor)) {
        dist.set(neighbor, newDist);
        prev.set(neighbor, current);
        pq.push(neighbor);
      }
    }
  }
 
  return { visitedOrder, path: [], found: false };
}
 
// ─── A* ───────────────────────────────────────────────────────────
// Dijkstra + a heuristic guess toward the end.
// f(n) = g(n) + h(n)
//   g = actual cost from start
//   h = Manhattan distance to end (our educated guess)
// This focuses the search toward the end, making it much faster.
function heuristic(node) {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
}
 
function aStar() {
  const gCost = new Map();
  const fCost = new Map();
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      gCost.set(grid[r][c], Infinity);
      fCost.set(grid[r][c], Infinity);
    }
  gCost.set(startNode, 0);
  fCost.set(startNode, heuristic(startNode));
 
  const prev         = new Map();
  const visited      = new Set();
  const visitedOrder = [];
  const openSet      = [startNode];
 
  while (openSet.length > 0) {
    openSet.sort((a, b) => fCost.get(a) - fCost.get(b));
    const current = openSet.shift();
 
    if (visited.has(current)) continue;
    visited.add(current);
 
    if (current !== startNode && current !== endNode)
      visitedOrder.push(current);
 
    if (current === endNode)
      return { visitedOrder, path: reconstructPath(prev), found: true };
 
    for (const neighbor of getNeighbors(current)) {
      if (visited.has(neighbor) || neighbor.type === 'wall') continue;
      const tentativeG = gCost.get(current) + 1;
      if (tentativeG < gCost.get(neighbor)) {
        prev.set(neighbor, current);
        gCost.set(neighbor, tentativeG);
        fCost.set(neighbor, tentativeG + heuristic(neighbor));
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
 
  return { visitedOrder, path: [], found: false };
}
 
// ─── DFS ──────────────────────────────────────────────────────────
// Goes as DEEP as possible down one path before backtracking.
// Stack = LIFO. Does NOT guarantee shortest path.
function dfs() {
  const stack        = [startNode];
  const visited      = new Set([startNode]);
  const prev         = new Map();
  const visitedOrder = [];
 
  while (stack.length > 0) {
    const current = stack.pop();
 
    if (current !== startNode && current !== endNode)
      visitedOrder.push(current);
 
    if (current === endNode)
      return { visitedOrder, path: reconstructPath(prev), found: true };
 
    for (const neighbor of getNeighbors(current)) {
      if (!visited.has(neighbor) && neighbor.type !== 'wall') {
        visited.add(neighbor);
        prev.set(neighbor, current);
        stack.push(neighbor);
      }
    }
  }
 
  return { visitedOrder, path: [], found: false };
}
 
// ─── Maze Generation (Recursive Division) ─────────────────────────
// Recursively divides the grid with walls, leaving one gap each time.
// Tall regions get horizontal walls, wide regions get vertical walls.
// Produces clean corridor-style mazes great for pathfinding demos.
function generateMaze() {
  resetGrid();
 
  const wallsInOrder = [];
  divide(0, 0, ROWS, COLS, wallsInOrder);
 
  setButtonsDisabled(true);
 
  wallsInOrder.forEach((node, i) => {
    setTimeout(() => {
      if (node.type === 'empty') setCellType(node, 'wall');
    }, i * 8);
  });
 
  setTimeout(() => {
    setButtonsDisabled(false);
    const msg = document.getElementById('message');
    msg.style.color = '#888';
    msg.textContent = 'MAZE READY — RIGHT CLICK TO PLACE START AND END';
  }, wallsInOrder.length * 8 + 100);
}
 
function divide(rowStart, colStart, rowEnd, colEnd, walls) {
  const height = rowEnd - rowStart;
  const width  = colEnd - colStart;
 
  // Base case — region too small to divide
  if (height < 3 || width < 3) return;
 
  // Tall regions → horizontal wall, wide regions → vertical wall
  const horizontal = height > width
    ? true
    : width > height
    ? false
    : Math.random() < 0.5;
 
  if (horizontal) {
    // Pick a row for the wall (even offset so gaps line up neatly)
    const wallRow = rowStart + 1 + 2 * Math.floor(Math.random() * Math.floor((height - 1) / 2));
    // Pick a random column for the gap
    const gapCol  = colStart + Math.floor(Math.random() * width);
 
    for (let c = colStart; c < colEnd; c++) {
      if (c !== gapCol) walls.push(grid[wallRow][c]);
    }
 
    divide(rowStart, colStart, wallRow, colEnd, walls);
    divide(wallRow + 1, colStart, rowEnd, colEnd, walls);
 
  } else {
    // Pick a column for the wall
    const wallCol = colStart + 1 + 2 * Math.floor(Math.random() * Math.floor((width - 1) / 2));
    // Pick a random row for the gap
    const gapRow  = rowStart + Math.floor(Math.random() * height);
 
    for (let r = rowStart; r < rowEnd; r++) {
      if (r !== gapRow) walls.push(grid[r][wallCol]);
    }
 
    divide(rowStart, colStart, rowEnd, wallCol, walls);
    divide(rowStart, wallCol + 1, rowEnd, colEnd, walls);
  }
}
 
// ─── Animation ────────────────────────────────────────────────────
function animate(visitedOrder, path, found, elapsedMs) {
  const speedMap = {
    turbo:  { visit: 2,  path: 5  },
    fast:   { visit: 8,  path: 20 },
    normal: { visit: 18, path: 40 },
    slow:   { visit: 50, path: 80 }
  };
  const speed = speedMap[document.getElementById('speed-select').value] || speedMap.normal;

  setButtonsDisabled(true);

  visitedOrder.forEach((node, i) => {
    setTimeout(() => setCellType(node, 'visited'), i * speed.visit);
  });

  const pathStart = visitedOrder.length * speed.visit;
  path.forEach((node, i) => {
    setTimeout(() => setCellType(node, 'path'), pathStart + i * speed.path);
  });

  const totalTime = pathStart + path.length * speed.path + 100;
  setTimeout(() => {
    const msg = document.getElementById('message');

    // Update stats bar
    document.getElementById('stat-path').textContent  = `Path length: ${found ? path.length : '—'}`;
    document.getElementById('stat-nodes').textContent = `Nodes explored: ${visitedOrder.length}`;
    document.getElementById('stat-time').textContent  = `Time: ${elapsedMs}ms`;
    document.querySelectorAll('#stats-bar span').forEach(s => s.classList.add('active'));

    if (found) {
      msg.style.color = '#4ade80';
      msg.textContent = `PATH FOUND — ${path.length} steps · ${visitedOrder.length} nodes explored`;
    } else {
      msg.style.color = '#ef4444';
      msg.textContent = 'NO PATH EXISTS';
    }
    setButtonsDisabled(false);
  }, totalTime);
}
 
// ─── Button & dropdown events ─────────────────────────────────────
document.getElementById('algo-select').addEventListener('change', function () {
  document.getElementById('algo-description').textContent = descriptions[this.value];
});
 
document.getElementById('btn-visualize').addEventListener('click', () => {
  if (!startNode || !endNode) {
    const msg = document.getElementById('message');
    msg.style.color = '#f59e0b';
    msg.textContent = 'RIGHT CLICK TO PLACE START AND END NODES FIRST';
    return;
  }
  clearPath();
  const algo    = document.getElementById('algo-select').value;
  const runners = { bfs, dijkstra, astar: aStar, dfs };

  const t0 = performance.now();
  const { visitedOrder, path, found } = runners[algo]();
  const elapsed = Math.round(performance.now() - t0);

  animate(visitedOrder, path, found, elapsed);
});
 
document.getElementById('btn-clear-path').addEventListener('click', clearPath);
document.getElementById('btn-reset').addEventListener('click', resetGrid);
document.getElementById('btn-maze').addEventListener('click', generateMaze);
 
// ─── Initialize ───────────────────────────────────────────────────
createGrid();