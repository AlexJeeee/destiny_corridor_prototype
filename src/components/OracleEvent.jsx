import React from 'react';
import { useGame } from '../contexts/GameContext';

const OracleEvent = ({ event, onSelect, isSelected = false }) => {
  const { state } = useGame();
  
  // Oracle deity colors
  const deityColors = {
    'wargod': 'from-red-800 to-red-950 border-red-500',
    'wisdomgod': 'from-blue-800 to-blue-950 border-blue-500',
    'luckgod': 'from-yellow-800 to-yellow-950 border-yellow-500',
    'deathgod': 'from-purple-800 to-purple-950 border-purple-500'
  };
  
  const colorClass = deityColors[event.deity] || 'from-gray-800 to-gray-950 border-gray-500';
  
  // Format blessing effects for display
  const formatBlessings = (blessings) => {
    return blessings.map((blessing, index) => (
      <div key={`blessing-${index}`} className="text-sm mb-1">
        <span className="font-bold text-emerald-400">{blessing.name}:</span> {blessing.description}
      </div>
    ));
  };
  
  // Format card pool modifiers for display
  const formatCardPoolModifiers = (modifiers) => {
    return Object.entries(modifiers).map(([cardType, value]) => {
      const sign = value >= 0 ? '+' : '';
      const valueClass = value >= 0 ? 'text-green-400' : 'text-red-400';
      
      return (
        <div key={`mod-${cardType}`} className="text-sm">
          {cardType}: <span className={valueClass}>{sign}{value}%</span>
        </div>
      );
    });
  };

  return (
    <div 
      className={`oracle-event rounded-lg border-2 bg-gradient-to-b ${colorClass} p-4 mx-2
        transition-all duration-300 transform
        ${isSelected ? 'ring-4 ring-white scale-105' : ''}
        ${onSelect ? 'cursor-pointer hover:brightness-125' : 'cursor-default opacity-75'}`}
      onClick={() => onSelect && onSelect(event)}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold">{event.name}</h3>
        <div className="text-sm italic">{event.deity} blessing</div>
      </div>
      
      {/* Blessings */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Blessings</h4>
        {formatBlessings(event.blessings)}
      </div>
      
      {/* Card Pool Modifiers */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Card Pool Effects</h4>
        <div className="grid grid-cols-2 gap-1">
          {formatCardPoolModifiers(event.cardPoolModifiers)}
        </div>
      </div>
      
      {/* Special Rules */}
      {event.specialRules && event.specialRules.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold border-b border-gray-600 pb-1 mb-2">Special Rules</h4>
          {event.specialRules.map((rule, index) => (
            <div key={`rule-${index}`} className="text-sm text-yellow-300">
              {rule}
            </div>
          ))}
        </div>
      )}
      
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center font-bold">
          ✓
        </div>
      )}
    </div>
  );
};

export default OracleEvent;