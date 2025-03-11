/**
 * OracleSystem.js
 * System for managing oracle events and blessings
 */
import { oracles, getOraclesByFloor, getRandomOracle } from '../data/oracles';

class OracleSystem {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.eventBus = gameManager.eventBus;
    
    // Oracle state
    this.availableOracles = [];
    this.selectedOracle = null;
    this.oracleHistory = [];
  }
  
  /**
   * Generate oracle blessing options for the current floor
   * @param {number} count - Number of options to generate
   * @returns {Array} Array of oracle options
   */
  generateOracleOptions(count = 3) {
    const floor = this.gameManager.state.currentFloor;
    const character = this.gameManager.state.playerCharacter;
    
    // Get oracles appropriate for this floor
    const floorOracles = getOraclesByFloor(floor);
    if (floorOracles.length === 0) return [];
    
    // Get oracles the player hasn't seen yet, or least recently seen
    const unseenOracles = floorOracles.filter(
      oracle => !this.oracleHistory.includes(oracle.name)
    );
    
    // Start with unseen oracles
    let selectedOracles = [...unseenOracles];
    
    // Fill remaining slots with random oracles
    while (selectedOracles.length < count) {
      const randomOracle = getRandomOracle(null, floor);
      
      // Avoid duplicates
      if (randomOracle && !selectedOracles.find(o => o.name === randomOracle.name)) {
        selectedOracles.push(randomOracle);
      }
      
      // If we can't find enough unique oracles, break to avoid infinite loop
      if (selectedOracles.length < count && floorOracles.length < count) {
        break;
      }
    }
    
    // Limit to requested count
    selectedOracles = selectedOracles.slice(0, count);
    
    // Store available options
    this.availableOracles = selectedOracles;
    
    // Emit event
    this.eventBus.emit('oracle:options', {
      oracles: selectedOracles,
      floor
    });
    
    return selectedOracles;
  }
  
  /**
   * Select an oracle blessing
   * @param {Object|string} oracle - Oracle object or name
   * @returns {Object} Selected oracle
   */
  selectOracle(oracle) {
    // If given a string (name), find the oracle object
    let selectedOracle = oracle;
    if (typeof oracle === 'string') {
      selectedOracle = this.availableOracles.find(o => o.name === oracle);
    }
    
    if (!selectedOracle) return null;
    
    // Store selection
    this.selectedOracle = selectedOracle;
    
    // Add to history
    this.oracleHistory.push(selectedOracle.name);
    
    // Keep history from growing too large
    if (this.oracleHistory.length > 10) {
      this.oracleHistory.shift();
    }
    
    // Apply blessing effects
    this.applyBlessingEffects(selectedOracle);
    
    // Emit event
    this.eventBus.emit('oracle:selected', {
      oracle: selectedOracle
    });
    
    return selectedOracle;
  }
  
  /**
   * Apply effects from oracle blessing
   * @param {Object} oracle - Oracle blessing data
   */
  applyBlessingEffects(oracle) {
    if (!oracle || !oracle.blessings) return;
    
    // Add blessing to player's active blessings
    if (!this.gameManager.state.blessings) {
      this.gameManager.state.blessings = [];
    }
    
    this.gameManager.state.blessings.push(oracle);
    
    // Apply each blessing effect
    oracle.blessings.forEach(blessing => {
      switch (blessing.effect) {
        case 'attackBoost':
          // Store attack boost percentage
          if (!this.gameManager.state.attackBoost) {
            this.gameManager.state.attackBoost = 0;
          }
          this.gameManager.state.attackBoost += blessing.value;
          break;
          
        case 'startingEnergy':
          // Increase starting energy for battles
          if (!this.gameManager.state.startingEnergyBonus) {
            this.gameManager.state.startingEnergyBonus = 0;
          }
          this.gameManager.state.startingEnergyBonus += blessing.value;
          break;
          
        case 'maxEnergy':
          // Increase max energy
          if (this.gameManager.state.playerCharacter) {
            this.gameManager.state.playerCharacter.maxEnergy += blessing.value;
            this.gameManager.state.playerCharacter.energy = this.gameManager.state.playerCharacter.maxEnergy;
          }
          break;
          
        case 'cardDraw':
          // Increase starting hand size
          if (!this.gameManager.state.cardDrawBonus) {
            this.gameManager.state.cardDrawBonus = 0;
          }
          this.gameManager.state.cardDrawBonus += blessing.value;
          break;
          
        case 'critChance':
          // Add critical hit chance
          if (!this.gameManager.state.critChance) {
            this.gameManager.state.critChance = 0;
          }
          this.gameManager.state.critChance += blessing.value;
          break;
      }
    });
    
    // Store card pool modifiers for later card rewards
    if (oracle.cardPoolModifiers) {
      if (!this.gameManager.state.cardPoolModifiers) {
        this.gameManager.state.cardPoolModifiers = {
          attack: 0,
          defense: 0,
          utility: 0
        };
      }
      
      // Apply modifiers
      Object.entries(oracle.cardPoolModifiers).forEach(([type, value]) => {
        this.gameManager.state.cardPoolModifiers[type] += value;
      });
    }
  }
  
  /**
   * Generate destiny coin outcomes
   * @param {number} count - Number of options
   * @returns {Array} Array of destiny coin outcomes
   */
  generateDestinyOptions(count = 4) {
    // Define possible outcomes (full implementation would have more variety)
    const outcomes = [
      {
        name: 'Energy Boost',
        description: 'Gain 2 energy for this turn',
        type: 'energy',
        value: 2
      },
      {
        name: 'Card Draw',
        description: 'Draw 2 cards',
        type: 'draw',
        value: 2
      },
      {
        name: 'Shield',
        description: 'Gain 5 shield',
        type: 'shield',
        value: 5
      },
      {
        name: 'Healing',
        description: 'Restore 4 health',
        type: 'healing',
        value: 4
      },
      {
        name: 'Damage Boost',
        description: 'Your next attack deals +3 damage',
        type: 'damageBoost',
        value: 3
      },
      {
        name: 'Movement',
        description: 'Gain 2 extra movement points',
        type: 'movement',
        value: 2
      }
    ];
    
    // Randomize and take requested number of options
    const shuffled = [...outcomes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  /**
   * Spin the destiny wheel
   * @returns {Object} Result of destiny wheel spin
   */
  spinDestinyWheel() {
    // Check if player has destiny coins
    if (this.gameManager.state.destinyCoins <= 0) {
      return null;
    }
    
    // Spend a destiny coin
    this.gameManager.state.destinyCoins--;
    
    // Generate options
    const options = this.generateDestinyOptions(4);
    
    // Select a random outcome
    const randomIndex = Math.floor(Math.random() * options.length);
    const result = options[randomIndex];
    
    // Apply outcome
    this.applyDestinyEffect(result);
    
    // Emit event
    this.eventBus.emit('destiny:spin', {
      result,
      remainingCoins: this.gameManager.state.destinyCoins
    });
    
    return result;
  }
  
  /**
   * Apply destiny wheel effect
   * @param {Object} effect - Effect to apply
   */
  applyDestinyEffect(effect) {
    if (!effect) return;
    
    switch (effect.type) {
      case 'energy':
        // Add energy
        this.gameManager.state.playerEnergy += effect.value;
        break;
        
      case 'draw':
        // Draw cards
        this.gameManager.cardSystem.drawCards(effect.value);
        break;
        
      case 'shield':
        // Add shield to player
        if (this.gameManager.state.playerCharacter) {
          this.gameManager.state.playerCharacter.shield = 
            (this.gameManager.state.playerCharacter.shield || 0) + effect.value;
        }
        break;
        
      case 'healing':
        // Heal player
        if (this.gameManager.state.playerCharacter) {
          const maxHealth = this.gameManager.state.playerCharacter.maxHealth || 30;
          this.gameManager.state.playerCharacter.health = Math.min(
            maxHealth,
            this.gameManager.state.playerCharacter.health + effect.value
          );
        }
        break;
        
      case 'damageBoost':
        // Add temporary damage boost
        if (!this.gameManager.state.tempDamageBoost) {
          this.gameManager.state.tempDamageBoost = 0;
        }
        this.gameManager.state.tempDamageBoost += effect.value;
        break;
        
      case 'movement':
        // Add movement points
        if (!this.gameManager.state.playerMovement) {
          this.gameManager.state.playerMovement = 0;
        }
        this.gameManager.state.playerMovement += effect.value;
        break;
    }
  }
}

export default OracleSystem;