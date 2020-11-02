import createCanvasClicker from './createCanvasClicker';
import pathfinding from 'pathfinding';
import gameMaps from './gameMaps';

function GenericTile(init) {
  const { ctx, tileWidth, value, col, row, sprite, isWalkable, type } = init;
  this.ctx = ctx;
  this.col = col;
  this.row = row;
  this.value = value;
  this.x = 0;
  this.y = 0;
  this.sprite = sprite;
  this.isWalkable = isWalkable;
  this.type = type;
  this.tileWidth = tileWidth;
  this.frame = 0;

  this.render = (col, row, matrixOffsetXY) => {
    this.col = col;
    this.row = row;
    const positionInPx = {
      x: col * tileWidth + matrixOffsetXY.x,
      y: row * tileWidth + matrixOffsetXY.y,
    };
    this.x = positionInPx.x;
    this.y = positionInPx.y;

    ctx.beginPath();
    if (this.type === 'floor') {
      ctx.fillStyle = '#ccc';
    }
    if (this.type === 'wall') {
      ctx.fillStyle = '#444';
    }
    ctx.strokeStyle = '#666';
    ctx.rect(this.x, this.y, tileWidth, tileWidth);
    ctx.stroke();
    ctx.fill();
  };
}

function Player(init, isSelected) {
  GenericTile.call(this, init);
  this.isSelected = isSelected;
  this.actionPoints = 5;
  this.isMoving = false;
  this.prevPosition = { col: this.col, row: this.row };
  this.render = (col, row, matrixOffsetXY) => {
    this.col = col;
    this.row = row;
    const positionInPx = {
      x: col * this.tileWidth + matrixOffsetXY.x,
      y: row * this.tileWidth + matrixOffsetXY.y,
    };
    this.x = positionInPx.x;
    this.y = positionInPx.y;
    this.ctx.beginPath();
    this.ctx.fillStyle = this.isSelected ? '#cdaaff' : '#fafaee';
    this.ctx.rect(this.x, this.y, this.tileWidth, this.tileWidth);
    this.ctx.fill();
    this.ctx.font = '18px Courier';
    this.ctx.fillStyle = this.isSelected ? '#fff' : '#000';
    this.ctx.fillText('P', this.x + this.tileWidth / 2 - 5, this.y + 24);
    this.ctx.font = '14px Courier';
    this.ctx.fillStyle = this.isSelected ? '#fff' : '#000';
    this.ctx.fillText(`AP:${this.actionPoints}`, this.x + 15, this.y + 42);
  };
}

function Floor(init) {
  GenericTile.call(this, init);
}

function Wall(init) {
  GenericTile.call(this, init);
}

export default function createGame(ctx, canvas) {
  const click = createCanvasClicker(canvas, {
    onClick,
    onDoubleClick,
    onDrag,
    onRelease,
  });
  let frame = 0;
  let startTime = null;
  let interactions = true;
  const matrixOffsetXY = { x: 0, y: 0 };
  const oldOffsetXY = { ...matrixOffsetXY };
  const tileWidth = 64;
  const gameMap = gameMaps[0];
  //generate navmesh
  const navMesh = gameMaps[1];
  const players1 = [];
  const players2 = [];
  const rows = gameMap.length;
  const cols = gameMap[0].length;
  const grid = new Array(rows);
  let selected = null;

  for (let i = 0; i < rows; i += 1) {
    grid[i] = new Array(cols);
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (gameMap[r][c] === 0) {
        grid[r][c] = new Floor({
          ctx,
          tileWidth,
          value: gameMap[r][c],
          col: c,
          row: r,
          sprite: 'floor',
          type: 'floor',
          isWalkable: true,
        });
      }
      if (gameMap[r][c] === 9) {
        grid[r][c] = new Wall({
          ctx,
          tileWidth,
          value: gameMap[r][c],
          col: c,
          row: r,
          sprite: 'wall',
          type: 'wall',
          isWalkable: false,
        });
      }
      if (gameMap[r][c] === 1) {
        grid[r][c] = new Floor({
          ctx,
          tileWidth,
          value: gameMap[r][c],
          col: c,
          row: r,
          sprite: 'floor',
          type: 'floor',
          isWalkable: true,
        });
        players1.push(
          new Player({
            ctx,
            tileWidth,
            value: gameMap[r][c],
            col: c,
            row: r,
            sprite: 'player1',
            type: 'player1',
            isWalkable: false,
          })
        );
      }
      if (gameMap[r][c] === 2) {
        grid[r][c] = new Floor({
          ctx,
          tileWidth,
          value: gameMap[r][c],
          col: c,
          row: r,
          sprite: 'floor',
          type: 'floor',
          isWalkable: true,
        });
        players2.push(
          new Player({
            ctx,
            tileWidth,
            value: gameMap[r][c],
            col: c,
            row: r,
            sprite: 'player1',
            type: 'player1',
            isWalkable: false,
          })
        );
      }
    }
  }

  let tilesInReach = [];

  function renderTilesInReach() {
    tilesInReach.forEach((tile, index) => {
      const { col, row } = tile.tile;
      const { cost } = tile;
      const positionInPx = {
        x: col * tileWidth + matrixOffsetXY.x,
        y: row * tileWidth + matrixOffsetXY.y,
      };
      if (cost > 0) {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(200,0,50, 0.2)';
        ctx.strokeStyle = '#666';
        ctx.rect(positionInPx.x, positionInPx.y, tileWidth, tileWidth);
        ctx.stroke();
        ctx.fill();
        ctx.font = '18px Courier';
        ctx.fillStyle = selected.isSelected ? '#fff' : '#000';
        ctx.fillText(
          cost,
          positionInPx.x + tileWidth / 2 - 5,
          positionInPx.y + tileWidth / 2 + 7
        );
      }
    });
  }

  function getTilesInReach(player) {
    const length = player.actionPoints;
    let topX = player.col - length;
    let topY = player.row - length;
    const sLen = length * 2 + 1;

    const allTiles = [];
    let row = topY;
    for (let r = 0; r < sLen; r += 1) {
      let col = topX;
      for (let c = 0; c < sLen; c += 1) {
        allTiles.push({ row, col });
        col += 1;
      }
      row += 1;
    }

    const validTiles = [];
    allTiles.forEach((tile) => {
      if (
        tile.col >= 0 &&
        tile.col < grid[0].length &&
        tile.row >= 0 &&
        tile.row < grid.length
      ) {
        if (grid[tile.row][tile.col].isWalkable) {
          validTiles.push({ row: tile.row, col: tile.col });
        }
      }
    });

    validTiles.forEach((tile) => {
      const walkable = getWalkable(player.col, player.row, tile.col, tile.row);
      if (walkable.length <= player.actionPoints + 1) {
        const cost = walkable.length - 1;
        tilesInReach.push({ tile, cost });
      }
    });
    tilesInReach.forEach((tile, index) => {
      const t = tile.tile;
      players1.forEach((p) => {
        if (p.col === t.col && p.row === t.row) {
          tilesInReach.splice(index, 1);
        }
      });
    });
  }

  function getWalkable(sCol, sRow, eCol, eRow) {
    const gridPathfinding = new pathfinding.Grid(navMesh);
    const finder = new pathfinding.AStarFinder({ allowDiagonal: true });
    const path = finder.findPath(sCol, sRow, eCol, eRow, gridPathfinding);
    return path;
  }

  function mouseToTiles(cXY) {
    const x = Math.floor((cXY.x - matrixOffsetXY.x) / tileWidth);
    const y = Math.floor((cXY.y - matrixOffsetXY.y) / tileWidth);
    return { x, y };
  }

  function checkIfSelected(clickedTileXY) {
    tilesInReach = [];
    selected = null;
    players1.forEach((p1) => {
      if (clickedTileXY.x === p1.col && clickedTileXY.y === p1.row) {
        p1.isSelected = true;
        selected = p1;
        console.log(selected);
        getTilesInReach(p1);
        // tilesInReach.push(getTilesInReach(p1));
      } else {
        p1.isSelected = false;
      }
    });
  }

  let stepper = 0;
  function executeMovement() {
    const step = Math.floor(stepper);
    const totalSteps = selected.path.length;
    if (step < totalSteps && selected.isMoving) {
      selected.col = selected.path[step][0];
      selected.row = selected.path[step][1];
    } else {
      selected.isMoving = false;
      selected.path = null;
      interactions = true;
      stepper = 0;
      selected = null;
    }
    stepper += 0.05;
  }

  function movement(clickedTileXY) {
    tilesInReach.forEach((t) => {
      const { tile, cost } = t;
      if (tile.col === clickedTileXY.x && tile.row === clickedTileXY.y) {
        selected.isSelected = false;
        selected.actionPoints -= cost;
        tilesInReach = [];
        interactions = false;
        const path = getWalkable(
          selected.col,
          selected.row,
          clickedTileXY.x,
          clickedTileXY.y
        );
        path.splice(0, 1);
        selected.prevPosition = { col: selected.col, row: selected.row };
        selected.isMoving = true;
        selected.path = path;
      }
    });
  }

  function onDrag(offsetXY) {
    matrixOffsetXY.x = oldOffsetXY.x + offsetXY.x;
    matrixOffsetXY.y = oldOffsetXY.y + offsetXY.y;
  }
  function onClick(cXY) {
    if (interactions) {
      checkIfSelected(mouseToTiles(cXY));
    }
  }
  function onDoubleClick(cXY) {
    if (selected && interactions) {
      console.log('movement');
      movement(mouseToTiles(cXY));
    }
  }
  function onRelease() {
    oldOffsetXY.x = matrixOffsetXY.x;
    oldOffsetXY.y = matrixOffsetXY.y;
  }

  function renderGrid() {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        if (grid[r][c].type !== 'player1' && grid[r][c].type !== 'player2') {
          grid[r][c].render(c, r, matrixOffsetXY);
        }
      }
    }
  }

  function renderPlayers() {
    players1.forEach((p1) => {
      p1.render(p1.col, p1.row, matrixOffsetXY);
    });
    players2.forEach((p2) => {
      p2.render(p2.col, p2.row, matrixOffsetXY);
    });
  }

  function update(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!startTime) startTime = timestamp;
    const elapsedTime = timestamp - startTime;
    renderGrid();
    renderPlayers();
    // renderPath();
    renderTilesInReach();

    if (elapsedTime >= 1000 / 30) {
      startTime = timestamp;
      if (frame < 24) {
        frame += 1;
      } else {
        frame = 0;
      }
    }
    if (selected && selected.isMoving) {
      executeMovement();
    }
    requestAnimationFrame(update);
  }

  function start() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    requestAnimationFrame(update);
  }

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  return { start, resize, click };
}
