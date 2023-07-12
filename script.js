import {
  TILE_STATUSES,
  createBoard,
  markTile,
  revealTile,
  checkWin,
  checkLose,
  positionMatch,
  markedTilesCount,
} from './minesweeper.js';

// Initialize game parameters
const BOARD_SIZE = 10;
const NUMBER_OF_MINES = 10;

// Create game board
let board = createBoard(
  BOARD_SIZE,
  getMinePositions(BOARD_SIZE, NUMBER_OF_MINES)
);

// Access DOM elements
const boardElement = document.querySelector('.board');
const flagsLeftText = document.querySelector('[data-flag-count]');
const messageText = document.querySelector('.subtext');

// Main game rendering function
function render() {
  // Clear existing board on each render
  boardElement.innerHTML = '';

  // Check if the game is ended
  checkGameEnd();

  // Add all tiles to the board
  getTileElements(board).forEach(element => {
    boardElement.append(element);
  });

  // Update flags left counter
  listFlagsLeft();
}

// Convert each tile on board to a DOM element
function getTileElements() {
  return board.flatMap(row => {
    return row.map(tileToElement);
  });
}

// Convert single tile to DOM element
function tileToElement(tile) {
  const element = document.createElement('div');
  element.dataset.status = tile.status;
  element.dataset.x = tile.x;
  element.dataset.y = tile.y;

  // Update tile's visual based on its status
  switch (tile.status) {
    case TILE_STATUSES.MARKED:
      element.textContent = '🚩';
      break;
    case TILE_STATUSES.MINE:
      element.textContent = '💣';
      break;
    case TILE_STATUSES.NUMBER:
      element.textContent = tile.adjacentMinesCount || '';
      break;
    default:
      element.textContent = '';
  }

  return element;
}

// Handle left click on board to reveal a tile
boardElement.addEventListener('click', e => {
  if (!e.target.matches('[data-status]')) return;

  // Reveal clicked tile
  board = revealTile(board, {
    x: parseInt(e.target.dataset.x),
    y: parseInt(e.target.dataset.y),
  });

  // Re-render board after each interaction
  render();
});

// Handle right click on board to mark a tile
boardElement.addEventListener('contextmenu', e => {
  if (!e.target.matches('[data-status]')) return;

  e.preventDefault();

  // Mark clicked tile
  board = markTile(
    board,
    {
      x: parseInt(e.target.dataset.x),
      y: parseInt(e.target.dataset.y),
    },
    NUMBER_OF_MINES
  );

  // Re-render board after each interaction
  render();
});

// Set board size for CSS
boardElement.style.setProperty('--size', BOARD_SIZE);
render();

// Update flags left text
function listFlagsLeft() {
  const markedCount = markedTilesCount(board);
  flagsLeftText.textContent =
    markedCount > NUMBER_OF_MINES ? 0 : NUMBER_OF_MINES - markedCount;
}

// Check for game end conditions and handle end game scenarios
function checkGameEnd() {
  const win = checkWin(board);
  const lose = checkLose(board);

  // Stop further interactions with the board if game is ended
  if (win || lose) {
    boardElement.addEventListener('click', stopProp, { capture: true });
    boardElement.addEventListener('contextmenu', stopProp, { capture: true });
  }

  // Display winning message
  if (win) {
    messageText.textContent = 'You Win';
  }
  // Display losing message and reveal all mines
  if (lose) {
    messageText.textContent = 'You Lose';
    board.forEach(row => {
      row.forEach(tile => {
        if (tile.status === TILE_STATUSES.MARKED) board = markTile(board, tile);
        if (tile.mine) board = revealTile(board, tile);
      });
    });
  }
}

// Stop event propagation
function stopProp(e) {
  e.stopImmediatePropagation();
  e.preventDefault();
}

// Generate positions for mines on the board
function getMinePositions(boardSize, numberOfMines) {
  const positions = [];

  while (positions.length < numberOfMines) {
    const position = {
      x: randomNumber(boardSize),
      y: randomNumber(boardSize),
    };

    // Push position only if it is not already in positions
    if (
      !positions.some(existingPosition =>
        positionMatch(position, existingPosition)
      )
    ) {
      positions.push(position);
    }
  }

  return positions;
}

// Generate random number within the range [0, size)
function randomNumber(size) {
  return Math.floor(Math.random() * size);
}

// Reset the game when the reset button is clicked
document.querySelector('.reset').addEventListener('click', () => {
  location.reload();
});
