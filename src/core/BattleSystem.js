/**
 * BattleSystem.js
 * System for managing battle flow and AI decisions
 */
import { hexDistance } from '../utils/hexUtils';

class BattleSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.eventBus = gameManager.eventBus;
    
    // Battle state
    this.currentBattle = null;
    this.turnOrder = [];
    this.activeEntityIndex = 0;
    this.phase = 'idle'; // idle, planning, action, end
  }
  
  /**
   * Start a new battle
   * @param {Object} battleData - Battle configuration data
   */
  startBattle(battleData) {
    this.currentBattle = {
      player: battleData.player,
      enemies: battleData.enemies || [],
      floor: this.gameManager.state.currentFloor,
      turnCount: 1,
      rewards: battleData.rewards || {
        destinyCoins: 2,
        cards: []
      }
    };
    
    // Update game state
    this.gameManager.state.currentBattle = this.currentBattle;
    
    // Set initial positions
    this.setupInitialPositions();
    
    // Determine turn order
    this.calculateTurnOrder();
    
    // Draw initial hand
    const handSize = 3 + Math.floor(this.currentBattle.floor / 3); // More cards on higher floors
    this.gameManager.cardSystem.drawCards(handSize);
    
    // Set phase
    this.phase = 'planning';
    
    // Emit event
    this.eventBus.emit('battle:started', this.currentBattle);
  }
  
  /**
   * Set up initial battle positions
   */
  setupInitialPositions() {
    // Reset grid
    const grid = this.gameManager.hexGridSystem.generateGrid();
    this.gameManager.hexGridSystem.grid = grid;
    
    // Position player in the left side
    const playerX = 2;
    const playerY = Math.floor(this.gameManager.hexGridSystem.gridSize.height / 2);
    
    const playerCell = this.gameManager.hexGridSystem.getCell(playerX, playerY);
    if (playerCell) {
      playerCell.entity = {
        ...this.currentBattle.player,
        type: 'player',
        isPlayer: true
      };
    }
    
    // Position enemies on right side
    this.currentBattle.enemies.forEach((enemy, index) => {
      const enemyX = Math.min(
        this.gameManager.hexGridSystem.gridSize.width - 2,
        6 + Math.floor(index / 2)
      );
      
      const enemyY = Math.max(
        0, 
        Math.min(
          this.gameManager.hexGridSystem.gridSize.height - 1,
          Math.floor(this.gameManager.hexGridSystem.gridSize.height / 2) + (index % 2 === 0 ? -1 : 1) * Math.ceil(index / 2)
        )
      );
      
      const enemyCell = this.gameManager.hexGridSystem.getCell(enemyX, enemyY);
      if (enemyCell) {
        enemyCell.entity = {
          ...enemy,
          type: 'enemy',
          isEnemy: true
        };
      }
    });
  }
  
  /**
   * Calculate turn order for battle
   */
  calculateTurnOrder() {
    // Simple turn order: player first, then enemies
    this.turnOrder = ['player'];
    
    // Add enemies in order
    this.currentBattle.enemies.forEach((enemy, index) => {
      this.turnOrder.push(`enemy-${index}`);
    });
    
    this.activeEntityIndex = 0;
  }
  
  /**
   * Start a new turn
   */
  startNewTurn() {
    // Increment turn counter if we're back to the first entity
    if (this.activeEntityIndex === 0) {
      this.currentBattle.turnCount++;
    }
    
    // Get current entity
    const entityId = this.turnOrder[this.activeEntityIndex];
    const isPlayer = entityId === 'player';
    
    // Set phase based on entity
    this.phase = isPlayer ? 'planning' : 'action';
    
    // Reset per-turn stats
    if (isPlayer) {
      // Restore player energy for new turn
      this.gameManager.state.playerEnergy = this.gameManager.state.playerCharacter.maxEnergy;
      
      // Draw cards if player doesn't have enough
      const minHandSize = 3;
      const currentHandSize = this.gameManager.state.hand.length;
      if (currentHandSize < minHandSize) {
        this.gameManager.cardSystem.drawCards(minHandSize - currentHandSize);
      }
    }
    
    // Apply start-of-turn effects
    this.applyTurnEffects(entityId, 'startTurn');
    
    // Emit turn start event
    this.eventBus.emit('turn:started', {
      entityId,
      isPlayer,
      turnCount: this.currentBattle.turnCount
    });
    
    // If AI turn, process it
    if (!isPlayer) {
      this.processEnemyTurn(entityId);
    }
  }
  
  /**
   * End the current turn
   */
  endTurn() {
    // Get current entity
    const entityId = this.turnOrder[this.activeEntityIndex];
    
    // Apply end-of-turn effects
    this.applyTurnEffects(entityId, 'endTurn');
    
    // Emit turn end event
    this.eventBus.emit('turn:ended', {
      entityId,
      isPlayer: entityId === 'player',
      turnCount: this.currentBattle.turnCount
    });
    
    // Move to next entity
    this.activeEntityIndex = (this.activeEntityIndex + 1) % this.turnOrder.length;
    
    // Start next turn
    this.startNewTurn();
  }
  
  /**
   * Apply turn-based effects
   * @param {string} entityId - ID of the entity
   * @param {string} timing - When effects are applied (startTurn, endTurn)
   */
  applyTurnEffects(entityId, timing) {
    // Find entity on grid
    let entityCell = null;
    
    const grid = this.gameManager.hexGridSystem.grid;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.entity && 
            (cell.entity.id === entityId || 
             (entityId === 'player' && cell.entity.isPlayer) || 
             (entityId.startsWith('enemy') && cell.entity.isEnemy))) {
          entityCell = cell;
          break;
        }
      }
      if (entityCell) break;
    }
    
    if (entityCell) {
      // Apply terrain effects
      this.gameManager.hexGridSystem.applyTerrainEffects(entityCell, timing);
      
      // Apply status effects
      if (entityCell.entity.statusEffects) {
        Object.entries(entityCell.entity.statusEffects).forEach(([statusId, status]) => {
          // Apply effect
          this.applyStatusEffect(entityCell.entity, statusId, timing);
          
          // Reduce duration
          if (timing === 'endTurn') {
            status.duration--;
            
            // Remove expired effects
            if (status.duration <= 0) {
              delete entityCell.entity.statusEffects[statusId];
            }
          }
        });
      }
    }
  }
  
  /**
   * Process an enemy's turn
   * @param {string} enemyId - ID of the enemy
   */
  processEnemyTurn(enemyId) {
    // Find enemy on grid
    let enemyCell = null;
    let enemyPosition = { x: 0, y: 0 };
    
    const grid = this.gameManager.hexGridSystem.grid;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.entity && cell.entity.isEnemy && 
            (cell.entity.id === enemyId.replace('enemy-', '') || 
             enemyId.includes(cell.entity.id))) {
          enemyCell = cell;
          enemyPosition = { x, y };
          break;
        }
      }
      if (enemyCell) break;
    }
    
    if (!enemyCell) {
      this.endTurn();
      return;
    }
    
    // Find player position
    let playerPosition = null;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const cell = grid[y][x];
        if (cell.entity && cell.entity.isPlayer) {
          playerPosition = { x, y };
          break;
        }
      }
      if (playerPosition) break;
    }
    
    if (!playerPosition) {
      this.endTurn();
      return;
    }
    
    // Calculate distance to player
    const distance = hexDistance(
      { q: enemyPosition.x, r: enemyPosition.y },
      { q: playerPosition.x, r: playerPosition.y }
    );
    
    // Simulate enemy decision making
    setTimeout(() => {
      if (distance <= 1) {
        // Enemy is adjacent to player - attack
        const damage = Math.floor(Math.random() * 3) + 1;
        
        this.applyDamage(
          { type: 'player', isPlayer: true },  // Target
          damage                               // Damage amount
        );
        
        this.eventBus.emit('enemy:attack', {
          enemyId,
          targetId: 'player',
          damage
        });
      } else {
        // Enemy is not adjacent - move closer
        const movementPoints = 2; // Default movement
        
        // Simple AI to move towards player
        // In a real implementation this would use pathfinding
        
        // For now, just compare x and y coords and move in that direction
        let moveToX = enemyPosition.x;
        let moveToY = enemyPosition.y;
        
        if (enemyPosition.x > playerPosition.x) {
          moveToX--;
        } else if (enemyPosition.x < playerPosition.x) {
          moveToX++;
        }
        
        if (enemyPosition.y > playerPosition.y) {
          moveToY--;
        } else if (enemyPosition.y < playerPosition.y) {
          moveToY++;
        }
        
        // Check if move is valid
        const targetCell = this.gameManager.hexGridSystem.getCell(moveToX, moveToY);
        if (targetCell && !targetCell.entity && targetCell.terrainId !== 'blocked') {
          this.gameManager.hexGridSystem.moveEntity(
            enemyPosition,
            { x: moveToX, y: moveToY }
          );
          
          this.eventBus.emit('enemy:move', {
            enemyId,
            from: enemyPosition,
            to: { x: moveToX, y: moveToY }
          });
        }
      }
      
      // End enemy turn
      setTimeout(() => this.endTurn(), 500);
    }, 1000);
  }
  
  /**
   * Resolve a card effect
   * @param {Object} effect - Effect data from card
   * @param {Object} target - Target data (position, entity)
   */
  resolveCardEffect(effect, target) {
    if (!effect || !target) return;
    
    switch (effect.type) {
      case 'damage':
        // Apply damage to target
        this.applyDamage(target.entity, effect.value);
        break;
        
      case 'area':
        // Apply effect to all entities in area
        const cellsInRange = this.gameManager.hexGridSystem.getCellsInRange(
          target.position,
          effect.area || 1
        );
        
        cellsInRange.forEach(cell => {
          if (cell && cell.entity && 
              ((effect.targetType === 'enemy' && cell.entity.isEnemy) || 
               (effect.targetType === 'ally' && cell.entity.isPlayer))) {
            // Apply effect to each entity in range
            if (effect.type === 'damage') {
              this.applyDamage(cell.entity, effect.value);
            } else if (effect.type === 'status') {
              this.applyStatusEffect(
                cell.entity,
                effect.statusType,
                effect.statusValue,
                effect.statusDuration
              );
            }
          }
        });
        break;
        
      case 'status':
        // Apply status effect to target
        this.applyStatusEffect(
          target.entity,
          effect.statusType,
          effect.statusValue,
          effect.statusDuration
        );
        break;
        
      case 'shield':
        // Apply shield to target
        if (target.entity) {
          target.entity.shield = (target.entity.shield || 0) + effect.value;
        }
        break;
        
      case 'healing':
        // Apply healing to target
        if (target.entity) {
          const maxHealth = target.entity.maxHealth || 30;
          target.entity.health = Math.min(
            maxHealth,
            target.entity.health + effect.value
          );
        }
        break;
        
      case 'draw':
        // Draw cards (player only)
        if (target.entity && target.entity.isPlayer) {
          this.gameManager.cardSystem.drawCards(effect.value);
        }
        break;
        
      case 'energy':
        // Add energy (player only)
        if (target.entity && target.entity.isPlayer) {
          this.gameManager.state.playerEnergy += effect.value;
        }
        break;
        
      case 'movement':
        // Add movement points (player only)
        if (target.entity && target.entity.isPlayer) {
          this.gameManager.state.playerMovement += effect.value;
        }
        break;
    }
    
    // Emit event
    this.eventBus.emit('effect:applied', {
      effect,
      target,
      value: effect.value
    });
  }
  
  /**
   * Apply damage to an entity
   * @param {Object} entity - Target entity
   * @param {number} amount - Amount of damage
   */
  applyDamage(entity, amount) {
    if (!entity) return;
    
    // Apply damage modifiers
    let finalDamage = amount;
    
    // Apply status effects that modify damage
    if (entity.statusEffects) {
      if (entity.statusEffects.vulnerable) {
        finalDamage = Math.floor(finalDamage * 1.5);
      }
    }
    
    // Apply shields first
    if (entity.shield > 0) {
      if (entity.shield >= finalDamage) {
        entity.shield -= finalDamage;
        finalDamage = 0;
      } else {
        finalDamage -= entity.shield;
        entity.shield = 0;
      }
    }
    
    // Apply remaining damage to health
    if (finalDamage > 0) {
      entity.health = Math.max(0, entity.health - finalDamage);
    }
    
    // Check if entity is defeated
    if (entity.health <= 0) {
      this.handleEntityDefeated(entity);
    }
    
    // Emit damage event
    this.eventBus.emit('entity:damaged', {
      entity,
      damage: amount,
      finalDamage,
      remainingHealth: entity.health
    });
  }
  
  /**
   * Apply a status effect to an entity
   * @param {Object} entity - Target entity
   * @param {string} statusType - Type of status effect
   * @param {number} value - Effect value/magnitude
   * @param {number} duration - Effect duration in turns
   */
  applyStatusEffect(entity, statusType, value, duration) {
    if (!entity) return;
    
    // Initialize status effects object if needed
    if (!entity.statusEffects) {
      entity.statusEffects = {};
    }
    
    // Apply effect
    entity.statusEffects[statusType] = {
      value,
      duration
    };
    
    // Apply immediate effects for some status types
    switch (statusType) {
      case 'burn':
        // Apply immediate damage
        this.applyDamage(entity, value);
        break;
        
      case 'regeneration':
        // Apply immediate healing
        if (entity.isPlayer) {
          entity.health = Math.min(
            entity.maxHealth || 30,
            entity.health + value
          );
        }
        break;
    }
    
    // Emit status effect event
    this.eventBus.emit('status:applied', {
      entity,
      statusType,
      value,
      duration
    });
  }
  
  /**
   * Handle an entity being defeated
   * @param {Object} entity - Defeated entity
   */
  handleEntityDefeated(entity) {
    if (!entity) return;
    
    if (entity.isEnemy) {
      // Remove enemy from battle
      this.currentBattle.enemies = this.currentBattle.enemies.filter(
        e => e.id !== entity.id
      );
      
      // Find the enemy on the grid and remove it
      const grid = this.gameManager.hexGridSystem.grid;
      for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
          if (grid[y][x].entity === entity) {
            grid[y][x].entity = null;
            break;
          }
        }
      }
      
      // Emit enemy defeated event
      this.eventBus.emit('enemy:defeated', { entity });
      
      // Check for battle end
      this.checkBattleEnd();
    } else if (entity.isPlayer) {
      // Player is defeated - battle lost
      this.endBattle(false);
    }
  }
  
  /**
   * Check if battle has ended
   */
  checkBattleEnd() {
    if (this.currentBattle.enemies.length === 0) {
      // All enemies defeated - victory
      this.endBattle(true);
      return true;
    }
    
    // Check if player is defeated
    const player = this.currentBattle.player;
    if (player && player.health <= 0) {
      // Player defeated - loss
      this.endBattle(false);
      return true;
    }
    
    return false;
  }
  
  /**
   * End the current battle
   * @param {boolean} victory - Whether player won
   */
  endBattle(victory) {
    // Set phase
    this.phase = 'end';
    
    // Emit battle end event with appropriate rewards
    const eventData = {
      victory,
      floor: this.currentBattle.floor,
      turnCount: this.currentBattle.turnCount
    };
    
    if (victory) {
      eventData.rewards = this.currentBattle.rewards;
    }
    
    this.eventBus.emit('battle:ended', eventData);
    
    // Clean up battle state
    this.currentBattle = null;
    this.turnOrder = [];
    this.activeEntityIndex = 0;
    
    // Update game state
    this.gameManager.handleBattleComplete(victory, eventData.rewards);
  }
}

export default BattleSystem;