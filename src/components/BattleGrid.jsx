// src/components/BattleGrid.jsx
import React, { useState, useEffect } from 'react';
import HexCell from './HexCell';
import { useGame } from '../contexts/GameContext';
import { hexDistance } from '../utils/hexUtils';

// 添加网格样式
const gridStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  gap: '0.5rem',
};

const rowStyles = {
  display: 'flex',
  gap: '0.5rem',
};

const BattleGrid = ({ onCellClick, player, enemies, selectedCard, targetingMode, movementRange }) => {
  const { gameState } = useGame();
  const [selectedCell, setSelectedCell] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const rows = 5;
  const cols = 7;
  const currentTurn = gameState?.currentTurn || 'player';

  // 添加调试信息
  useEffect(() => {
    console.log('BattleGrid渲染 - 玩家位置:', player?.position);
    console.log('BattleGrid渲染 - 敌人列表:', enemies);
  }, [player, enemies]);

  // 处理单元格点击
  const handleCellClick = (x, y) => {
    console.log('单元格点击:', x, y);
    if (onCellClick) {
      onCellClick(x, y);
    }
  };

  // 获取六边形位置
  const getHexPosition = (row, col) => {
    // 偶数行向右偏移
    const x = col;
    const y = row;
    return { x, y };
  };

  // 检查是否在范围内
  const isInRange = (x, y, range) => {
    if (!player) return false;
    
    const distance = hexDistance(
      { x: player.position.x, y: player.position.y },
      { x, y }
    );
    
    return distance <= range;
  };

  // 检查是否在移动路径上
  const isInMovementPath = (x, y) => {
    if (!player || !player.movementPath) return false;
    
    return player.movementPath.some(pos => pos.x === x && pos.y === y);
  };

  // 检查是否形成阵型
  const checkFormation = (x, y) => {
    // 简化版阵型检测
    if (!player) return false;
    
    // 检查是否有敌人在周围形成直线
    const playerPos = player.position;
    const dx = x - playerPos.x;
    const dy = y - playerPos.y;
    
    // 如果玩家、当前位置和另一个敌人在一条直线上
    for (const enemy of enemies) {
      const enemyDx = enemy.position.x - playerPos.x;
      const enemyDy = enemy.position.y - playerPos.y;
      
      // 检查是否在同一直线上
      if (dx !== 0 && enemyDx !== 0 && dx / Math.abs(dx) === enemyDx / Math.abs(enemyDx)) {
        return true;
      }
      
      if (dy !== 0 && enemyDy !== 0 && dy / Math.abs(dy) === enemyDy / Math.abs(enemyDy)) {
        return true;
      }
    }

    return false;
  };

  // 检查是否可以被卡牌选中
  const isTargetable = (x, y) => {
    if (!selectedCard || !targetingMode || !player) return false;
    
    const distance = hexDistance(
      { x: player.position.x, y: player.position.y },
      { x, y }
    );
    
    // 根据卡牌类型和范围判断
    if (selectedCard.type === 'attack') {
      // 攻击卡需要有敌人在目标位置
      const hasEnemy = enemies.some(e => e.position.x === x && e.position.y === y);
      return hasEnemy && distance <= (selectedCard.range || 1);
    } else if (selectedCard.type === 'movement') {
      // 移动卡需要目标位置为空
      const isEmpty = !enemies.some(e => e.position.x === x && e.position.y === y);
      return isEmpty && distance <= (selectedCard.range || 1);
    } else if (selectedCard.type === 'support') {
      // 支援卡可以选择任何位置
      return distance <= (selectedCard.range || 1);
    }

    return false;
  };

  // 获取单元格内容
  const getCellContent = (x, y) => {
    // 检查玩家
    if (player && player.position.x === x && player.position.y === y) {
      return {
        occupant: {
          type: 'player',
          health: player.health,
          maxHealth: player.maxHealth,
          shield: player.shield,
          effects: player.statusEffects
        },
        terrain: gameState?.terrain?.[`${x},${y}`] || 'plain'
      };
    }

    // 检查敌人
    const enemy = enemies.find(e => e.position && e.position.x === x && e.position.y === y);
    if (enemy) {
      console.log(`找到敌人在位置(${x}, ${y}):`, enemy);
      return {
        occupant: {
          type: 'enemy',
          health: enemy.health,
          maxHealth: enemy.maxHealth,
          shield: enemy.shield,
          effects: enemy.statusEffects
        },
        terrain: gameState?.terrain?.[`${x},${y}`] || 'plain'
      };
    }

    // 返回只有地形的空单元格
    return {
      terrain: gameState?.terrain?.[`${x},${y}`] || 'plain'
    };
  };

  // 渲染网格
  const renderGrid = () => {
    const grid = [];
    for (let row = 0; row < rows; row++) {
      const rowCells = [];
      for (let col = 0; col < cols; col++) {
        const { x, y } = getHexPosition(row, col);
        const cell = getCellContent(x, y);
        const inRange = !selectedCard && currentTurn === 'player' && isInRange(x, y, movementRange || 2);
        const isSelected = player && player.position.x === x && player.position.y === y;
        const inPath = isInMovementPath(x, y);
        const inFormation = checkFormation(x, y);
        const isTargetableCell = isTargetable(x, y);
        
        rowCells.push(
          <HexCell
            key={`cell-${x}-${y}`}
            cell={cell}
            position={{ x, y }}
            onClick={() => handleCellClick(x, y)}
            inRange={inRange}
            isSelected={isSelected}
            isTargetable={isTargetableCell}
            inPath={inPath}
            inFormation={inFormation}
          />
        );
      }
      grid.push(
        <div key={`row-${row}`} style={rowStyles} className="flex">
          {rowCells}
        </div>
      );
    }
    return grid;
  };

  return (
    <div style={gridStyles} className="battle-grid">
      {renderGrid()}
    </div>
  );
};

export default BattleGrid;
