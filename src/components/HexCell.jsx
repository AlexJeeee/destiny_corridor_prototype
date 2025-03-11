// src/components/HexCell.jsx
import React, { useEffect } from 'react';

// 添加CSS样式
const hexCellStyles = {
  width: '4rem',
  height: '4rem',
  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  margin: '0.2rem',
  display: 'inline-block',
  position: 'relative',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const HexCell = ({ cell, position, onClick, inRange, isSelected, isTargetable, inPath, inFormation }) => {
  // Get occupant stats if any
  const occupant = cell.occupant;
  const terrain = cell.terrain;

  // 添加调试信息
  useEffect(() => {
    if (occupant && occupant.type === 'enemy') {
      console.log(`HexCell渲染敌人在位置(${position.x}, ${position.y}):`, occupant);
    }
  }, [occupant, position]);

  // Helper function for terrain icons
  const getTerrainIcon = (terrain) => {
    switch (terrain) {
      case 'fire': return '🔥';
      case 'ice': return '❄️';
      case 'wind': return '💨';
      case 'energy': return '⚡';
      case 'poison': return '☠️';
      case 'water': return '💧';
      case 'earth': return '🌱';
      case 'blocked': return '🪨';
      default: return '';
    }
  };

  // Helper function for terrain effects description
  const getTerrainDescription = (terrain) => {
    switch (terrain) {
      case 'fire': return '火焰地形: 进入时受到2点伤害，火系卡牌伤害+20%';
      case 'ice': return '冰冻地形: 移动消耗+1，冰系卡牌冷却-1';
      case 'wind': return '风系地形: 移动距离+1，风系卡牌范围+1';
      case 'energy': return '能量地形: 每回合获得1点能量，能量卡牌效果+25%';
      case 'poison': return '毒雾地形: 每回合受到1点伤害，持续2回合';
      case 'water': return '水系地形: 雷系卡牌伤害+30%，火系卡牌伤害-20%';
      case 'earth': return '土系地形: 防御+2，移动消耗+1';
      case 'blocked': return '障碍物: 无法通行';
      default: return '普通地形';
    }
  };

  // 获取地形样式
  const getTerrainStyle = (terrain) => {
    switch (terrain) {
      case 'fire': return 'bg-gradient-to-br from-red-700/40 to-orange-500/40';
      case 'ice': return 'bg-gradient-to-br from-blue-700/40 to-cyan-500/40';
      case 'wind': return 'bg-gradient-to-br from-green-700/40 to-emerald-500/40';
      case 'energy': return 'bg-gradient-to-br from-purple-700/40 to-violet-500/40';
      case 'poison': return 'bg-gradient-to-br from-green-900/40 to-lime-700/40';
      case 'water': return 'bg-gradient-to-br from-blue-900/40 to-sky-500/40';
      case 'earth': return 'bg-gradient-to-br from-yellow-900/40 to-amber-700/40';
      case 'blocked': return 'bg-gray-800/80';
      default: return 'bg-gray-700/20';
    }
  };

  // 添加位置标记，方便调试
  const positionLabel = position ? `(${position.x},${position.y})` : '';

  return (
    <div
      style={hexCellStyles}
      className={`
        hex-cell
        ${inRange ? 'cursor-pointer ring-2 ring-blue-400/50' : ''}
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isTargetable ? 'ring-2 ring-red-400/50' : ''}
        ${inPath ? 'ring-1 ring-green-400/70' : ''}
        ${inFormation ? 'ring-1 ring-purple-400/70' : ''}
        ${getTerrainStyle(terrain)}
        transition-all duration-200
      `}
      onClick={() => onClick(position.x, position.y)}
      title={`${getTerrainDescription(terrain)} - 位置${positionLabel}`}
    >
      {/* 位置标记 */}
      <div className="absolute top-0 right-0 text-xs text-white/50 p-1">
        {positionLabel}
      </div>

      {/* Terrain effect */}
      {terrain && (
        <div className="absolute top-1 left-1 text-lg opacity-75">
          {getTerrainIcon(terrain)}
        </div>
      )}

      {/* 移动轨迹标记 */}
      {inPath && !occupant && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-green-400 rounded-full opacity-70"></div>
        </div>
      )}

      {/* 阵型标记 */}
      {inFormation && !occupant && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-purple-400 rounded-full opacity-70"></div>
        </div>
      )}

      {/* Occupant display */}
      {occupant && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Character icon or type indicator */}
          <div className="text-2xl mb-1">
            {occupant.type === 'player' ? '👤' : '👾'}
          </div>

          {/* Health bar */}
          <div className="w-4/5 h-2 bg-gray-700 rounded overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${occupant.health / occupant.maxHealth > 0.5 ? 'bg-green-500' : occupant.health / occupant.maxHealth > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${(occupant.health / occupant.maxHealth) * 100}%` }}
            />
          </div>

          {/* Shield indicator */}
          {occupant.shield > 0 && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-400/90 px-1.5 py-0.5 rounded text-xs font-bold">
              {occupant.shield}
            </div>
          )}

          {/* Status effects */}
          {occupant.effects && occupant.effects.length > 0 && (
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {occupant.effects.map((effect, index) => (
                <div
                  key={index}
                  className="bg-gray-800/80 rounded px-1"
                  title={`${effect.type} - ${effect.duration} 回合`}
                >
                  {effect.type === 'strength' && '💪'}
                  {effect.type === 'defense_up' && '🛡️'}
                  {effect.type === 'burn' && '🔥'}
                  {effect.type === 'freeze' && '❄️'}
                  {effect.type === 'poison' && '☠️'}
                  {effect.type === 'stun' && '💫'}
                  {effect.type === 'blind' && '👁️'}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HexCell;
