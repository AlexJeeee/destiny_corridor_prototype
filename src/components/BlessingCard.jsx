// src/components/BlessingCard.jsx
import React from 'react';

const BlessingCard = ({
  blessing,
  isSelected = false,
  isActive = false,
  onClick,
  className = ''
}) => {
  return (
    <div
      className={`
        relative w-48 h-64 rounded-lg p-4 cursor-pointer
        transition-all duration-300 transform hover:scale-105
        ${isSelected ? 'ring-2 ring-yellow-400 scale-105' : ''}
        ${isActive ? 'bg-indigo-900/80' : 'bg-gray-800/80'}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Blessing Icon */}
      <div className="text-4xl mb-2">{blessing.icon}</div>

      {/* Blessing Name */}
      <h3 className="text-lg font-bold mb-2">{blessing.name}</h3>

      {/* Blessing Description */}
      <p className="text-sm text-gray-300 mb-4">{blessing.description}</p>

      {/* Duration */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Duration:</span>
          <span className="font-bold text-yellow-400">{blessing.duration} turns</span>
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <span className="text-yellow-400">✨</span>
        </div>
      )}
    </div>
  );
};

export default BlessingCard;