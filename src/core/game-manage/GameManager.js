import EventBus from '../EventBus';
import { cards, getCardsByDeckType } from '../../data/cards';
import { TERRAINS } from '../../data/terrains';
import { hexDistance } from '../../utils/hexUtils';
import CharacterSystem from './systems/CharacterSystem';
import TerrainSystem from './systems/TerrainSystem';
import CombatSystem from './systems/CombatSystem';
import CardSystem from './systems/CardSystem';
import EnemyAISystem from './systems/EnemyAISystem';
import StatusEffectSystem from './systems/StatusEffectSystem';

/**
 * 游戏管理器 - 核心类
 * 负责协调各个系统模块，管理游戏状态
 */
class GameManager {
  constructor() {
    this.eventBus = new EventBus();
    this.state = {
      player: {
        position: { x: 2, y: 2 },
        health: 100,
        maxHealth: 100,
        energy: 3,
        maxEnergy: 3,
        hand: [],
        deck: [],
        discardPile: [],
        maxHandSize: 7,
        statusEffects: [],
        shield: 0,
        movementPath: []
      },
      enemies: [
        {
          id: 'enemy-1',
          position: { x: 4, y: 2 },
          health: 30,
          maxHealth: 30,
          statusEffects: [],
          shield: 0
        }
      ],
      terrain: {},
      currentTurn: 'player',
      turnCount: 1,
      selectedCard: null,
      targetingMode: false
    };
    
    // 订阅者列表
    this.subscribers = [];
    
    // 初始化系统模块
    this.initializeSystems();
    
    // 初始化战场地形
    this.terrainSystem.initializeTerrain();
    
    // 初始化牌组
    this.cardSystem.initializeDeck();
    
    // 确保敌人位置正确
    this.characterSystem.validateEnemyPositions();
    
    console.log('GameManager初始化完成，初始状态:', JSON.stringify(this.state, null, 2));
  }

  // 初始化各个系统模块
  initializeSystems() {
    this.characterSystem = new CharacterSystem(this);
    this.terrainSystem = new TerrainSystem(this);
    this.combatSystem = new CombatSystem(this);
    this.cardSystem = new CardSystem(this);
    this.enemyAISystem = new EnemyAISystem(this);
    this.statusEffectSystem = new StatusEffectSystem(this);
  }

  // 获取游戏状态
  getState() {
    return this.state;
  }

  // 更新游戏状态
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  // 订阅状态变化
  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state); // 立即发送当前状态
  }

  // 取消订阅
  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
  }

  // 通知所有订阅者
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  // 触发游戏事件
  triggerGameEvent(event) {
    if (!event || !event.type) {
      console.error('无效的事件对象:', event);
      return;
    }
    
    console.log('触发游戏事件:', event);
    
    // 添加事件ID，避免重复处理
    const eventWithId = {
      ...event,
      id: event.id || `${event.type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    // 使用事件总线分发事件
    if (this.eventBus) {
      console.log('通过事件总线分发事件:', eventWithId);
      this.eventBus.emit('gameEvent', eventWithId);
    } else {
      console.error('事件总线未初始化');
    }
    
    // 兼容旧的事件处理方式
    const customEvent = new CustomEvent('game_event', { detail: eventWithId });
    window.dispatchEvent(customEvent);
    
    // 根据事件类型执行特定操作
    switch (event.type) {
      case 'all_enemies_defeated':
        console.log('所有敌人被击败，游戏胜利');
        this.setState({ battleEnded: true });
        break;
        
      case 'player_defeated':
        console.log('玩家被击败，游戏失败');
        this.setState({ battleEnded: true });
        break;
        
      default:
        // 其他事件类型不需要特殊处理
        break;
    }
  }

  // 开始回合
  startTurn(character) {
    if (character === this.state.player) {
      // 玩家回合
      this.setState({
        currentTurn: 'player',
        turnCount: this.state.turnCount + 1,
        player: {
          ...this.state.player,
          energy: this.state.player.maxEnergy,
          movementPath: [],
          hand: []
        }
      });

      // 抽新的手牌
      this.cardSystem.drawCards(this.state.player.maxHandSize);
      
      // 应用地形效果
      this.terrainSystem.applyTerrainEffect(this.state.player, 'onTurnStart');
    } else {
      // 敌人回合
      this.setState({ currentTurn: 'enemy' });
    }
  }

  // 结束回合
  endTurn() {
    console.log('结束回合，当前回合:', this.state.currentTurn);
    
    if (this.state.currentTurn === 'player') {
      // 结束玩家回合
      const updatedPlayer = {
        ...this.state.player,
        hand: [] // 清空手牌
      };

      // 触发回合结束事件
      this.triggerGameEvent({
        type: 'turn_end',
        turn: 'player'
      });

      // 更新状态为敌人回合
      this.setState({
        currentTurn: 'enemy',
        player: updatedPlayer
      });
      
      // 触发敌人回合开始事件
      this.triggerGameEvent({
        type: 'turn_start',
        turn: 'enemy'
      });
      
      // 执行敌人回合
      setTimeout(() => {
        this.enemyAISystem.performEnemyTurn();
      }, 500);
    }
  }

  // 结束敌人回合
  endEnemyTurn() {
    console.log('结束敌人回合');
    
    // 检查玩家是否死亡
    if (this.state.player.health <= 0) {
      console.log('玩家死亡，游戏结束');
      this.triggerGameEvent({
        type: 'player_defeated'
      });
      return;
    }
    
    // 触发敌人回合结束事件
    this.triggerGameEvent({
      type: 'turn_end',
      turn: 'enemy'
    });
    
    // 更新状态为玩家回合
    this.setState({
      currentTurn: 'player'
    });
    
    // 开始玩家回合
    this.startTurn(this.state.player);
    
    // 触发玩家回合开始事件
    this.triggerGameEvent({
      type: 'turn_start',
      turn: 'player'
    });
  }

  // 代理方法 - 移动角色
  moveCharacter(character, newPosition) {
    return this.characterSystem.moveCharacter(character, newPosition);
  }

  // 代理方法 - 应用卡牌效果
  applyCardEffect(card, source, target) {
    return this.cardSystem.applyCardEffect(card, source, target);
  }
}

export default GameManager;