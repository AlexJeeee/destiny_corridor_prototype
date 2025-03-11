// src/contexts/GameContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Game state
  const [gameState, setGameState] = useState({
    player: {
      health: 100,
      maxHealth: 100,
      shield: 0,
      energy: 3,
      maxEnergy: 3,
      hand: [],
      deck: [],
      discardPile: [],
      statusEffects: [],
      position: { x: 0, y: 0 },
      movementPath: []
    },
    enemies: [],
    currentTurn: 'player',
    selectedCard: null,
    targetingMode: false,
    blessings: [],
    turnCount: 1,
    terrain: {}
  });

  // 安全地更新游戏状态
  const updateGameState = useCallback((newState) => {
    // 检查状态是否有效
    if (!newState || typeof newState !== 'object') {
      console.error('尝试更新无效的游戏状态');
      return;
    }
    
    // 确保player对象存在
    if (newState.player && typeof newState.player === 'object') {
      // 确保hand是数组
      if (!Array.isArray(newState.player.hand)) {
        newState.player.hand = [];
      }
      
      // 确保deck是数组
      if (!Array.isArray(newState.player.deck)) {
        newState.player.deck = [];
      }
      
      // 确保statusEffects是数组
      if (!Array.isArray(newState.player.statusEffects)) {
        newState.player.statusEffects = [];
      }
    }
    
    // 更新状态
    setGameState(prev => ({
      ...prev,
      ...newState
    }));
  }, []);

  // Helper functions
  const calculateDamage = useCallback((card, source, target) => {
    let damage = card.baseDamage;
    
    // Apply attack multiplier
    if (source.attack) {
      damage *= source.attack;
    }
    
    // Apply defense reduction
    if (target.defense) {
      damage = Math.max(0, damage - target.defense);
    }
    
    return Math.floor(damage);
  }, []);

  // State update functions
  const updateHealth = useCallback((targetId, amount) => {
    setGameState(prev => {
      if (targetId === 'player') {
        return {
          ...prev,
          player: {
            ...prev.player,
            health: Math.max(0, Math.min(prev.player.health + amount, prev.player.maxHealth))
          }
        };
      } else {
        const updatedEnemies = prev.enemies.map(enemy => {
          if (enemy.id === targetId) {
            return {
              ...enemy,
              health: Math.max(0, Math.min(enemy.health + amount, enemy.maxHealth))
            };
          }
          return enemy;
        });
        return { ...prev, enemies: updatedEnemies };
      }
    });
  }, []);

  const updateShield = useCallback((targetId, amount) => {
    setGameState(prev => {
      if (targetId === 'player') {
        return {
          ...prev,
          player: {
            ...prev.player,
            shield: Math.max(0, prev.player.shield + amount)
          }
        };
      } else {
        const updatedEnemies = prev.enemies.map(enemy => {
          if (enemy.id === targetId) {
            return {
              ...enemy,
              shield: Math.max(0, enemy.shield + amount)
            };
          }
          return enemy;
        });
        return { ...prev, enemies: updatedEnemies };
      }
    });
  }, []);

  const updateDefense = useCallback((targetId, amount) => {
    setGameState(prev => {
      if (targetId === 'player') {
        return {
          ...prev,
          player: {
            ...prev.player,
            defense: Math.max(0, prev.player.defense + amount)
          }
        };
      } else {
        const updatedEnemies = prev.enemies.map(enemy => {
          if (enemy.id === targetId) {
            return {
              ...enemy,
              defense: Math.max(0, enemy.defense + amount)
            };
          }
          return enemy;
        });
        return { ...prev, enemies: updatedEnemies };
      }
    });
  }, []);

  // Card effect application
  const applyCardEffect = useCallback((card, sourceId, targetId) => {
    const source = sourceId === 'player' ? gameState.player : 
      gameState.enemies.find(e => e.id === sourceId);
    const target = targetId === 'player' ? gameState.player :
      gameState.enemies.find(e => e.id === targetId);

    if (!source || !target || !card) {
      return { success: false, error: 'Invalid source, target, or card' };
    }

    const effects = [];

    // Handle attack cards
    if (card.type === 'attack') {
      let damage = calculateDamage(card, source, target);
      
      // Handle shield first
      if (target.shield > 0) {
        const shieldDamage = Math.min(target.shield, damage);
        updateShield(targetId, -shieldDamage);
        damage -= shieldDamage;
        effects.push({ type: 'shield_break', value: shieldDamage });
      }
      
      // Apply remaining damage
      if (damage > 0) {
        updateHealth(targetId, -damage);
        effects.push({ type: 'damage', value: damage });
      }
    }

    // Handle defense cards
    if (card.type === 'defense') {
      if (card.shield) {
        updateShield(targetId, card.shield);
        effects.push({ type: 'shield', value: card.shield });
      }
      if (card.defense) {
        updateDefense(targetId, card.defense);
        effects.push({ type: 'defense', value: card.defense });
      }
    }

    // Handle special effects
    if (card.effects) {
      card.effects.forEach(effect => {
        switch (effect.type) {
          case 'heal':
            updateHealth(targetId, effect.value);
            effects.push({ type: 'heal', value: effect.value });
            break;
          case 'strength':
            setGameState(prev => ({
              ...prev,
              [targetId === 'player' ? 'player' : 'enemies']: targetId === 'player' ? 
                { ...prev.player, attack: prev.player.attack * (1 + effect.value) } :
                prev.enemies.map(e => e.id === targetId ? 
                  { ...e, attack: e.attack * (1 + effect.value) } : e)
            }));
            effects.push({ type: 'buff', stat: 'attack', value: effect.value });
            break;
          default:
            effects.push({ type: effect.type, value: effect.value });
        }
      });
    }

    return { success: true, effects };
  }, [gameState, calculateDamage, updateHealth, updateShield, updateDefense]);

  // Turn management
  const endTurn = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentTurn: prev.currentTurn === 'player' ? 'enemy' : 'player',
      turnCount: prev.currentTurn === 'enemy' ? prev.turnCount + 1 : prev.turnCount,
      player: {
        ...prev.player,
        defense: prev.currentTurn === 'enemy' ? 0 : prev.player.defense, // Reset defense on player's turn start
        energy: prev.currentTurn === 'enemy' ? prev.player.maxEnergy : prev.player.energy
      }
    }));
  }, []);

  // Card management
  const drawCards = useCallback((count) => {
    setGameState(prev => {
      const newDeck = [...prev.player.deck];
      const newHand = [...prev.player.hand];
      
      for (let i = 0; i < count && newDeck.length > 0; i++) {
        const cardIndex = Math.floor(Math.random() * newDeck.length);
        newHand.push(newDeck.splice(cardIndex, 1)[0]);
      }
      
      return {
        ...prev,
        player: {
          ...prev.player,
          deck: newDeck,
          hand: newHand
        }
      };
    });
  }, []);

  // Movement and positioning
  const movePlayer = useCallback((newPosition) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        position: newPosition
      }
    }));
  }, []);

  const value = {
    gameState,
    setGameState: updateGameState,
    updateHealth,
    updateShield,
    updateDefense,
    applyCardEffect,
    endTurn,
    drawCards,
    movePlayer
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameProvider;