import React, { useState, useEffect, useRef } from 'react';
import BattleGrid from '../components/BattleGrid';
import Card from '../components/Card';
import CharacterStats from '../components/CharacterStats';
import BlessingSelector from '../components/BlessingSelector';
import GameManager from '../core/GameManager';
import { hexDistance } from '../utils/hexUtils';

const BattleScreen = ({ character, onBattleComplete }) => {
  const gameManager = useRef(new GameManager()).current;
  const [gameState, setGameState] = useState(gameManager.getState());
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [message, setMessage] = useState("选择一张卡牌使用");
  const [targetingMode, setTargetingMode] = useState(false);
  const [isBlessingSelectorOpen, setIsBlessingSelectorOpen] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const logEndRef = useRef(null);

  // 添加游戏日志
  const addToBattleLog = (text) => {
    // 检查是否已经有相同的日志（避免重复）
    const isDuplicate = gameLog.some(log => 
      log.text === text && 
      Date.now() - new Date(log.timestamp).getTime() < 1000
    );
    
    if (!isDuplicate) {
      setGameLog(prev => [...prev, { 
        text, 
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now() + Math.random().toString(36).substring(2, 9)
      }]);
    }
  };

  // 滚动日志到底部
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [gameLog]);

  // 初始化战斗和订阅状态更新
  useEffect(() => {
    const handleStateUpdate = (newState) => {
      console.log('状态更新:', newState);
      
      // 检查状态是否有效
      if (!newState || !newState.player) {
        console.error('收到无效的游戏状态');
        return;
      }
      
      // 检查手牌是否存在
      if (!Array.isArray(newState.player.hand)) {
        console.error('手牌不是数组');
        // 修复手牌
        newState.player.hand = [];
      }
      
      // 检查敌人是否存在
      if (!Array.isArray(newState.enemies)) {
        console.error('敌人不是数组');
        // 修复敌人
        newState.enemies = [];
      }
      
      // 检查敌人位置
      if (newState.enemies && newState.enemies.length > 0) {
        console.log('敌人位置检查:');
        newState.enemies.forEach((enemy, index) => {
          console.log(`敌人${index}:`, enemy);
          if (!enemy.position) {
            console.error(`敌人${index}没有位置信息`);
          }
        });
      }
      
      // 检查玩家生命值变化
      const prevHealth = gameState.player?.health;
      if (prevHealth !== undefined && newState.player && prevHealth > newState.player.health) {
        const damage = prevHealth - newState.player.health;
        addToBattleLog(`玩家受到了${damage}点伤害！`);
      }
      
      // 检查敌人数量变化
      const prevEnemiesCount = gameState.enemies?.length || 0;
      if (prevEnemiesCount > 0 && newState.enemies && prevEnemiesCount > newState.enemies.length) {
        addToBattleLog(`一个敌人被击败了！`);
      }
      
      // 检查回合变化
      if (gameState.currentTurn !== newState.currentTurn) {
        if (newState.currentTurn === 'player') {
          addToBattleLog(`玩家回合开始`);
        } else {
          addToBattleLog(`敌人回合开始`);
        }
      }
      
      setGameState(newState);
    };
    
    // 订阅游戏状态更新
    gameManager.subscribe(handleStateUpdate);
    
    // 订阅游戏事件 - 通过事件总线
    const handleGameEventCallback = (event) => {
      console.log('BattleScreen收到游戏事件(事件总线):', event);
      handleGameEvent(event);
    };
    
    // 使用事件总线订阅游戏事件
    gameManager.eventBus.on('gameEvent', handleGameEventCallback);
    
    // 订阅游戏事件 - 通过window事件
    const handleWindowGameEvent = (e) => {
      console.log('BattleScreen收到游戏事件(window):', e.detail);
      handleGameEvent(e.detail);
    };
    
    // 添加window事件监听
    window.addEventListener('game_event', handleWindowGameEvent);
    
    // 初始化战斗
    if (!gameState.battleInitialized) {
      console.log('初始化战斗');
      
      // 设置战斗初始化标志
      gameManager.setState({
        ...gameState,
        battleInitialized: true
      });
      
      addToBattleLog('战斗开始！');
    }
    
    // 清理函数
    return () => {
      // 取消订阅状态更新
      gameManager.unsubscribe(handleStateUpdate);
      
      // 取消订阅游戏事件
      gameManager.eventBus.off('gameEvent', handleGameEventCallback);
      
      // 移除window事件监听
      window.removeEventListener('game_event', handleWindowGameEvent);
    };
  }, []);

  // 处理游戏事件
  const handleGameEvent = (event) => {
    console.log('处理游戏事件:', event);
    
    if (!event || !event.type) {
      console.error('无效的游戏事件:', event);
      return;
    }
    
    // 根据事件类型处理
    switch (event.type) {
      case 'player_turn_start':
      case 'turn_start':
        if (event.turn === 'player') {
          addToBattleLog('你的回合开始了');
        }
        break;
        
      case 'enemy_turn_start':
      case 'turn_start':
        if (event.turn === 'enemy') {
          addToBattleLog('敌人的回合开始了');
        }
        break;
        
      case 'player_turn_end':
      case 'turn_end':
        if (event.turn === 'player') {
          addToBattleLog('你的回合结束了');
        }
        break;
        
      case 'enemy_turn_end':
      case 'turn_end':
        if (event.turn === 'enemy') {
          addToBattleLog('敌人的回合结束了');
        }
        break;
        
      case 'card_played':
        if (event.card) {
          addToBattleLog(`你使用了卡牌: ${event.card.name}`);
        }
        break;
        
      case 'enemy_damaged':
        if (event.enemy && event.damage) {
          const positionText = event.enemy.position ? `在位置(${event.enemy.position.x}, ${event.enemy.position.y})的` : '';
          addToBattleLog(`${positionText}敌人受到了 ${event.damage} 点伤害，剩余生命: ${event.enemy.health}`);
        }
        break;
        
      case 'player_damaged':
        if (event.damage) {
          addToBattleLog(`你受到了 ${event.damage} 点伤害，剩余生命: ${gameState.player.health}`);
        }
        break;
        
      case 'enemy_defeated':
        if (event.enemy && event.enemy.position) {
          addToBattleLog(`位置(${event.enemy.position.x}, ${event.enemy.position.y})的敌人被击败了！`);
        } else if (event.count) {
          addToBattleLog(`${event.count}个敌人被击败了！`);
        } else {
          addToBattleLog('一个敌人被击败了！');
        }
        break;
        
      case 'all_enemies_defeated':
        addToBattleLog('所有敌人都被击败了！你赢了！');
        // 延迟调用胜利处理，避免状态更新冲突
        setTimeout(() => {
          handleVictory();
        }, 500);
        break;
        
      case 'enemy_move':
        if (event.position && event.oldPosition) {
          addToBattleLog(`敌人从(${event.oldPosition.x}, ${event.oldPosition.y})移动到了(${event.position.x}, ${event.position.y})`);
        }
        break;
        
      case 'enemy_attack':
        if (event.damage) {
          addToBattleLog(`敌人攻击了你，造成 ${event.damage} 点伤害`);
        }
        break;
        
      default:
        console.log('未处理的游戏事件类型:', event.type);
    }
  };

  // 处理格子点击
  const handleCellClick = (x, y) => {
    console.log('格子点击:', { x, y });
    
    // 获取目标位置的单位（如果有）
    const targetEnemy = gameState.enemies.find(enemy => 
      enemy.position.x === x && enemy.position.y === y
    );
    
    // 检查是否是玩家位置
    const isPlayerPosition = 
      gameState.player.position.x === x && 
      gameState.player.position.y === y;
    
    // 处理移动（当没有选中卡牌时）
    if (!targetingMode && !selectedCard) {
      // 如果点击的是空格子，尝试移动
      if (!targetEnemy && !isPlayerPosition) {
        const distance = hexDistance(
          gameState.player.position,
          { x, y }
        );
        
        if (distance <= 2) { // 默认移动范围为2
          gameManager.moveCharacter(gameState.player, { x, y });
          setMessage('移动到新位置');
          setTimeout(() => setMessage(''), 1500);
        } else {
          setMessage('移动距离过远');
          setTimeout(() => setMessage(''), 1500);
        }
      }
      return;
    }

    // 处理卡牌目标选择
    if (targetingMode && selectedCard) {
      console.log('选择卡牌目标:', selectedCard, x, y);
      
      // 确定目标
      let target;
      
      if (selectedCard.type === 'attack') {
        // 攻击卡需要敌人目标
        if (!targetEnemy) {
          setMessage('请选择一个敌人作为目标');
          return;
        }
        target = targetEnemy;
      } else if (selectedCard.type === 'defense' || selectedCard.type === 'shield' || selectedCard.type === 'heal') {
        // 防御和治疗卡通常以自己为目标
        if (!isPlayerPosition) {
          setMessage('请选择自己作为目标');
          return;
        }
        target = gameState.player;
      } else if (selectedCard.normalEffect) {
        // 根据效果类型确定目标
        if (selectedCard.normalEffect.type === 'damage') {
          if (!targetEnemy) {
            setMessage('请选择一个敌人作为目标');
            return;
          }
          target = targetEnemy;
        } else {
          // 默认以自己为目标
          target = gameState.player;
        }
      }
      
      // 应用卡牌效果
      const result = gameManager.applyCardEffect(selectedCard, gameState.player, target);
      console.log('卡牌效果结果:', result);
      
      if (result.success) {
        // 清除选中状态
        setSelectedCard(null);
        setTargetingMode(false);
        
        // 显示效果消息
        if (result.effects && result.effects.length > 0) {
          const effectMessages = result.effects.map(effect => {
            switch (effect.type) {
              case 'damage':
                return `造成了 ${effect.value} 点伤害！`;
              case 'shield':
                return `获得了 ${effect.value} 点护盾！`;
              case 'heal':
                return `恢复了 ${effect.value} 点生命！`;
              default:
                return `应用了 ${effect.type} 效果`;
            }
          });
          
          setMessage(effectMessages.join(' '));
          
          // 检查是否击败敌人
          if (target !== gameState.player && target.health <= 0) {
            setTimeout(() => handleVictory(), 1000);
          }
        } else {
          setMessage('卡牌使用成功');
        }
        
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(result.error || '使用卡牌失败');
        setTimeout(() => setMessage(''), 2000);
      }
    }
  };

  // 处理卡牌选择
  const handleCardSelect = (card) => {
    console.log('选择卡牌:', card);
    
    // 如果已经选中了这张卡牌，取消选择
    if (selectedCard && selectedCard.id === card.id) {
      setSelectedCard(null);
      setTargetingMode(false);
      setMessage('取消选择卡牌');
      return;
    }
    
    if (!card) {
      setMessage('无效的卡牌');
      return;
    }
    
    // 检查能量是否足够
    if (gameState.player.energy < card.energyCost) {
      setMessage(`能量不足！需要${card.energyCost}点能量`);
      return;
    }
    
    // 清除之前的选择
    setSelectedCard(null);
    setTargetingMode(false);
    
    // 设置新的选择
    setTimeout(() => {
      setSelectedCard(card);
      setTargetingMode(true);
      
      // 根据卡牌类型设置提示信息
      if (card.type === 'attack') {
        setMessage(`选择一个敌人作为${card.name}的目标`);
      } else if (card.type === 'defense' || card.type === 'shield' || card.type === 'heal') {
        setMessage(`选择自己作为${card.name}的目标`);
      } else {
        setMessage(`选择${card.name}的目标`);
      }
    }, 10);
  };

  // 处理卡牌翻转
  const handleCardFlip = (card) => {
    setIsCardFlipped(!isCardFlipped);
    setMessage(`翻转了 ${card.name}`);
  };

  // 处理胜利
  const handleVictory = () => {
    console.log('处理胜利');
    
    // 标记战斗已结束
    gameManager.setState({
      ...gameState,
      battleEnded: true
    });
    
    setMessage('战斗胜利！');
    
    // 显示祝福选择器
    setTimeout(() => {
      setIsBlessingSelectorOpen(true);
    }, 1500);
  };

  // 检查战斗是否结束
  const checkBattleEnd = () => {
    // 使用局部变量记录战斗是否已经结束，避免重复处理
    if (gameState.battleEnded) {
      console.log('战斗已经结束，跳过检查');
      return false;
    }
    
    console.log('检查战斗是否结束，敌人数量:', gameState.enemies.length);
    console.log('敌人状态:', gameState.enemies);
    
    // 检查所有敌人是否已经死亡
    if (gameState.enemies.length === 0 || gameState.enemies.every(enemy => !enemy || enemy.health <= 0)) {
      console.log('所有敌人已经死亡，战斗结束');
      
      // 清理敌人数组，移除所有死亡的敌人
      const aliveEnemies = gameState.enemies.filter(enemy => enemy && enemy.health > 0);
      
      // 如果还有敌人数组但都是死亡状态，更新状态
      if (gameState.enemies.length > 0 && aliveEnemies.length === 0) {
        gameManager.setState({
          ...gameState,
          enemies: []
        });
      }
      
      // 触发所有敌人被击败事件
      gameManager.triggerGameEvent({
        type: 'all_enemies_defeated'
      });
      
      return true;
    }
    
    // 检查玩家是否死亡
    if (gameState.player.health <= 0) {
      console.log('玩家已经死亡，战斗结束');
      
      // 标记战斗已结束
      gameManager.setState({
        ...gameState,
        battleEnded: true
      });
      
      setMessage('你已经死亡，游戏结束');
      // 可以添加游戏结束的处理
      return true;
    }
    
    return false;
  };

  // 在状态更新后检查战斗结束
  useEffect(() => {
    // 只在玩家生命值为0或敌人全部死亡时检查战斗结束
    if (gameState.player?.health <= 0 || 
        (gameState.enemies && gameState.enemies.length === 0) ||
        (gameState.enemies && gameState.enemies.every(enemy => enemy.health <= 0))) {
      checkBattleEnd();
    }
  }, [gameState.player?.health, gameState.enemies?.length]);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部区域 - 角色状态和信息 */}
      <div className="flex justify-between items-start mb-4">
        {/* 玩家状态 */}
        <CharacterStats
          name={character?.name || '英雄'}
          health={gameState.player.health}
          maxHealth={gameState.player.maxHealth}
          shield={gameState.player.shield}
          energy={gameState.player.energy}
          maxEnergy={gameState.player.maxEnergy}
          effects={gameState.player.statusEffects}
          className="w-64"
        />
        
        {/* 战斗信息 */}
        <div className="text-center">
          <div className="text-amber-400 mb-2">
            <span className="font-bold text-xl">回合 {gameState.turnCount}</span>
          </div>
          <div className="px-4 py-2 bg-amber-900/60 rounded-lg">
            第1层
          </div>
        </div>
        
        {/* 敌人状态 */}
        {gameState.enemies.map(enemy => (
          <CharacterStats
            key={enemy.id}
            name="暗影兽"
            health={enemy.health}
            maxHealth={enemy.maxHealth}
            effects={enemy.effects}
            className="w-64"
          />
        ))}
      </div>
      
      {/* 战场网格 */}
      <div className="flex-1 mb-4">
        <BattleGrid 
          onCellClick={handleCellClick}
          player={gameState.player}
          enemies={gameState.enemies}
          selectedCard={selectedCard}
          targetingMode={targetingMode}
          movementRange={2}
        />
      </div>
      
      {/* 游戏消息 */}
      {message && (
        <div className="bg-gray-800 text-center py-2 mb-4 rounded-lg">
          <p className="text-lg">{message}</p>
        </div>
      )}
      
      {/* 游戏日志 */}
      <div className="bg-gray-800/50 rounded-lg p-2 mb-4 max-h-32 overflow-y-auto">
        <h3 className="text-sm font-bold mb-1 text-gray-400">战斗日志</h3>
        <div className="text-sm">
          {gameLog.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500 text-xs">[{log.timestamp}]</span> {log.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
      
      {/* 手牌区域 */}
      <div className="flex justify-center gap-4 mb-4">
        {gameState.player.hand && gameState.player.hand.length > 0 ? (
          gameState.player.hand.map((card, index) => (
            <Card
              key={`card-${index}-${card.id}`}
              cardId={card.id}
              isReversed={selectedCard?.id === card.id && isCardFlipped}
              isSelected={selectedCard?.id === card.id}
              onPlay={() => handleCardSelect(card)}
              onFlip={() => handleCardFlip(card)}
              size="medium"
            />
          ))
        ) : (
          <div className="text-white bg-gray-800 p-4 rounded-lg">
            没有手牌，请等待抽牌或结束回合
          </div>
        )}
      </div>
      
      {/* 显示手牌数量和上限 */}
      <div className="text-center mb-2 text-sm text-gray-400">
        手牌: {gameState.player.hand ? gameState.player.hand.length : 0}/{gameState.player.maxHandSize}
      </div>
      
      {/* 操作按钮 */}
      <div className="flex justify-center gap-4 mt-2">
        <button
          className={`
            px-4 py-2 rounded-lg font-semibold
            ${selectedCard ? 'bg-amber-600 hover:bg-amber-500' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
          onClick={() => selectedCard && handleCardFlip(selectedCard)}
          disabled={!selectedCard}
        >
          翻转卡牌
        </button>
        <button
          className={`
            px-4 py-2 rounded-lg font-semibold
            ${selectedCard ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
          onClick={() => {
            if (selectedCard && !targetingMode) {
              const result = gameManager.applyCardEffect(selectedCard, gameState.player, gameState.player);
              if (result.success) {
                setMessage(`使用了 ${selectedCard.name}!`);
                setSelectedCard(null);
                setIsCardFlipped(false);
              } else {
                setMessage(result.error || '使用卡牌失败');
              }
            }
          }}
          disabled={!selectedCard || targetingMode}
        >
          使用卡牌
        </button>
        <button
          className="px-4 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-500"
          onClick={() => {
            setSelectedCard(null);
            setTargetingMode(false);
            setIsCardFlipped(false);
            setMessage('回合结束');
            gameManager.endTurn();
          }}
        >
          结束回合
        </button>
      </div>
    </div>
  );
};

export default BattleScreen;