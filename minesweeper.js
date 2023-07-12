export const TILE_STATUSES = {
  HIDDEN: 'hidden',
  MINE: 'mine',
  NUMBER: 'number',
  MARKED: 'marked',
};

// Create a board of given size with mines at the provided positions.
export function createBoard(boardSize, minePositions) {
  return Array(boardSize)
    .fill()
    .map((_, x) =>
      Array(boardSize)
        .fill()
        .map((_, y) => ({
          x,
          y,
          mine: minePositions.some(positionMatch.bind(null, { x, y })),
          status: TILE_STATUSES.HIDDEN,
        }))
    );
}

// Get the count of marked tiles on the board.
export function markedTilesCount(board) {
  return board.reduce(
    (count, row) =>
      count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length,
    0
  );
}

// Mark a tile on the board at the given position.
export function markTile(board, { x, y }, totalMines) {
  const tile = board[x][y];

  if (
    tile.status !== TILE_STATUSES.HIDDEN &&
    tile.status !== TILE_STATUSES.MARKED
  ) {
    return board;
  }

  const markedTiles = markedTilesCount(board);

  if (markedTiles < totalMines || tile.status === TILE_STATUSES.MARKED) {
    const newStatus =
      tile.status === TILE_STATUSES.MARKED
        ? TILE_STATUSES.HIDDEN
        : TILE_STATUSES.MARKED;

    return replaceTile(board, { x, y }, { ...tile, status: newStatus });
  } else {
    return board;
  }
}

// Replace a tile on the board at the given position with a new tile.
function replaceTile(board, position, newTile) {
  return board.map((row, x) => {
    return row.map((tile, y) => {
      if (positionMatch(position, { x, y })) {
        return newTile;
      }
      return tile;
    });
  });
}

// Reveal a tile on the board at the given position.
export function revealTile(board, { x, y }) {
  const tile = board[x][y];
  if (tile.status !== TILE_STATUSES.HIDDEN) {
    return board;
  }

  let newBoard = board;
  if (tile.mine) {
    newBoard = replaceTile(
      board,
      { x, y },
      { ...tile, status: TILE_STATUSES.MINE }
    );
  } else {
    const adjacentTiles = nearbyTiles(board, tile);
    const mines = adjacentTiles.filter(t => t.mine);
    newBoard = replaceTile(
      board,
      { x, y },
      {
        ...tile,
        status: TILE_STATUSES.NUMBER,
        adjacentMinesCount: mines.length,
      }
    );
    if (mines.length === 0) {
      newBoard = adjacentTiles.reduce((b, t) => {
        return revealTile(b, t);
      }, newBoard);
    }
  }

  return newBoard;
}

// Check if the game is won.
export function checkWin(board) {
  return board.every(row => {
    return row.every(tile => {
      return (
        tile.status === TILE_STATUSES.NUMBER ||
        (tile.mine &&
          (tile.status === TILE_STATUSES.HIDDEN ||
            tile.status === TILE_STATUSES.MARKED))
      );
    });
  });
}

// Check if the game is lost.
export function checkLose(board) {
  return board.some(row => {
    return row.some(tile => {
      return tile.status === TILE_STATUSES.MINE;
    });
  });
}

// Check if two positions are equal.
export function positionMatch(a, b) {
  return a.x === b.x && a.y === b.y;
}

// Get all tiles that are adjacent to the given position.
function nearbyTiles(board, { x, y }) {
  const offsets = [-1, 0, 1];

  return offsets
    .flatMap(xOffset => {
      return offsets.map(yOffset => {
        return board[x + xOffset]?.[y + yOffset];
      });
    })
    .filter(Boolean);
}
