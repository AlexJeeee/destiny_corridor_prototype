/**
 * HexGridSystem.js
 * System for managing the hex grid battle map and movement
 */
import { terrains, getTerrainById } from '../data/terrains';
import { hexDistance, hexNeighbors } from '../utils/hexUtils';

class HexGridSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.eventBus = gameManager.eventBus;
    this.gridSize = { width: 9, height: 5 };
    
    // Initialize grid with default terrain
    this.grid = this.generateGrid();
  }
  
  /**
   * Generate a new grid with terrain
   * @returns {Array} 2D array of grid cells
   */
  generateGrid() {
    const grid = [];
    
    // Create grid with proper terrain
    for (let y = 0; y < this.gridSize.height; y++) {
      const row = [];
      
      for (let x = 0; x < this.gridSize.width; x++) {
        // Default terrain is plain
        let terrainId = 'plain';
        
        // Randomly assign terrain types with weighting
        const rand = Math.random();
        if (rand < 0.6) {
          terrainId = 'plain';
        } else if (rand < 0.7) {
          terrainId = 'fire';
        } else if (rand < 0.8) {
          terrainId = 'ice';
        } else if (rand < 0.9) {
          terrainId = 'wind';
        } else {
          terrainId = 'energy';
        }
        
        // Create some obstacles
        if ((x === 2 && y === 1) || (x === 6 && y === 3) || (x === 4 && y === 4)) {
          terrainId = 'blocked';
        }
        
        row.push({
          x,
          y,
          terrainId,
          entity: null  // Will hold a reference to player or enemy
        });
      }
      
      grid.push(row);
    }
    
    return grid;
  }
  
  /**
   * Get a cell at the given coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Object|null} Cell data or null if out of bounds
   */
  getCell(x, y) {
    // Check bounds
    if (x < 0 || x >= this.gridSize.width || y < 0 || y >= this.gridSize.height) {
      return null;
    }
    
    return this.grid[y][x];
  }
  
  /**
   * Get terrain data by ID
   * @param {string} terrainId - ID of the terrain
   * @returns {Object|null} Terrain data
   */
  getTerrainById(terrainId) {
    return getTerrainById(terrainId);
  }
  
  /**
   * Check if a move is valid
   * @param {Object} from - Starting position {x, y}
   * @param {Object} to - Target position {x, y}
   * @param {number} movementPoints - Available movement points
   * @returns {boolean} Whether move is valid
   */
  isValidMove(from, to, movementPoints) {
    // Check if target cell exists
    const targetCell = this.getCell(to.x, to.y);
    if (!targetCell) return false;
    
    // Check if target cell is blocked
    const targetTerrain = this.getTerrainById(targetCell.terrainId);
    if (targetTerrain.movementCost === Infinity) return false;
    
    // Check if cell is already occupied
    if (targetCell.entity) return false;
    
    // Check if move is within movement range
    const distance = hexDistance(
      { q: from.x, r: from.y },
      { q: to.x, r: to.y }
    );
    
    // Calculate movement cost based on terrain
    let movementCost = 0;
    for (let i = 1; i <= distance; i++) {
      // Simplified - in a real implementation we'd trace the path
      movementCost += 1;
    }
    
    return movementCost <= movementPoints;
  }
  
  /**
   * Move an entity from one cell to another
   * @param {Object} from - Starting position {x, y}
   * @param {Object} to - Target position {x, y}
   * @returns {boolean} Whether move was successful
   */
  moveEntity(from, to) {
    // Get source and target cells
    const sourceCell = this.getCell(from.x, from.y);
    const targetCell = this.getCell(to.x, to.y);
    
    if (!sourceCell || !targetCell) return false;
    if (!sourceCell.entity) return false;
    if (targetCell.entity) return false;
    
    // Move the entity
    targetCell.entity = sourceCell.entity;
    sourceCell.entity = null;
    
    // Apply terrain effects on enter
    this.applyTerrainEffects(targetCell, 'enter');
    
    // Emit event for move
    this.eventBus.emit('entity:moved', {
      entity: targetCell.entity,
      from,
      to
    });
    
    return true;
  }
  
  /**
   * Apply terrain effects to an entity
   * @param {Object} cell - Cell where effects are applied
   * @param {string} trigger - Effect trigger (enter, startTurn, endTurn)
   */
  applyTerrainEffects(cell, trigger) {
    const terrain = this.getTerrainById(cell.terrainId);
    if (!terrain || !terrain.effects || !cell.entity) return;
    
    // Find effects for this trigger
    const effects = terrain.effects.filter(effect => effect.trigger === trigger);
    
    // Apply each effect
    effects.forEach(effect => {
      switch (effect.type) {
        case 'damage':
          // Apply damage to entity
          this.gameManager.battleSystem.applyDamage(
            cell.entity,
            effect.value
          );
          break;
        case 'status':
          // Apply status effect
          this.gameManager.battleSystem.applyStatusEffect(
            cell.entity,
            effect.status,
            effect.value,
            effect.duration
          );
          break;
        case 'energy':
          // Add energy (player only)
          if (cell.entity.isPlayer) {
            this.gameManager.state.playerEnergy += effect.value;
          }
          break;
        case 'movement':
          // Add movement points (player only)
          if (cell.entity.isPlayer) {
            this.gameManager.state.playerMovement += effect.value;
          }
          break;
      }
    });
  }
  
  /**
   * Get cells in range of a position
   * @param {Object} position - Center position {x, y}
   * @param {number} range - Range in hex distance
   * @returns {Array} Array of cells within range
   */
  getCellsInRange(position, range) {
    const inRange = [];
    
    for (let y = 0; y < this.gridSize.height; y++) {
      for (let x = 0; x < this.gridSize.width; x++) {
        const distance = hexDistance(
          { q: position.x, r: position.y },
          { q: x, r: y }
        );
        
        if (distance <= range) {
          inRange.push(this.getCell(x, y));
        }
      }
    }
    
    return inRange;
  }
}

export default HexGridSystem;