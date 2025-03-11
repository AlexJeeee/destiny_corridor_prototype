import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';

const DestinyWheel = ({ onSpinResult }) => {
  const { gameManager, gameState } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [rotationDegree, setRotationDegree] = useState(0);
  
  // Effect to generate options when component mounts
  useEffect(() => {
    if (gameManager) {
      const options = generateOptions();
      setResults(options);
    }
  }, [gameManager]);
  
  // Generate wheel options
  const generateOptions = () => {
    // If we have the oracle system, use it to generate options
    if (gameManager?.oracleSystem) {
      return gameManager.oracleSystem.generateDestinyOptions(6);
    }
    
    // Otherwise use fallback options
    return [
      { name: 'Energy Boost', description: 'Gain 2 energy', type: 'energy', value: 2 },
      { name: 'Card Draw', description: 'Draw 2 cards', type: 'draw', value: 2 },
      { name: 'Shield', description: 'Gain 5 shield', type: 'shield', value: 5 },
      { name: 'Healing', description: 'Restore 4 health', type: 'healing', value: 4 },
      { name: 'Damage Boost', description: 'Next attack +3 damage', type: 'damageBoost', value: 3 },
      { name: 'Movement', description: 'Gain 2 movement', type: 'movement', value: 2 }
    ];
  };
  
  // Handle wheel spin
  const handleSpin = () => {
    if (isSpinning || gameState.destinyCoins <= 0) return;
    
    setIsSpinning(true);
    
    // Random number of rotations (3-5 full rotations plus random segment)
    const rotations = 3 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / results.length;
    const randomSegment = Math.floor(Math.random() * results.length);
    const randomOffset = Math.random() * 0.8 + 0.1; // 0.1 to 0.9 of segment
    const targetDegree = 360 * rotations + randomSegment * segmentAngle + randomOffset * segmentAngle;
    
    // Calculate final position to determine result
    const selectedIndex = results.length - 1 - Math.floor(((targetDegree % 360) / 360) * results.length);
    const result = results[selectedIndex];
    
    // Set rotation with animation
    setRotationDegree(targetDegree);
    
    // Wait for animation to finish
    setTimeout(() => {
      setIsSpinning(false);
      setSelectedResult(result);
      
      // If we have game manager, apply effect
      if (gameManager?.oracleSystem) {
        gameManager.oracleSystem.spinDestinyWheel();
      } else if (onSpinResult) {
        onSpinResult(result);
      }
    }, 3000); // Match this with CSS animation duration
  };
  
  // Get color for wheel segment
  const getSegmentColor = (index, total) => {
    const colors = [
      'bg-amber-500',   // Gold
      'bg-purple-500',  // Purple
      'bg-emerald-500', // Emerald
      'bg-sky-500',     // Sky
      'bg-rose-500',    // Rose
      'bg-indigo-500'   // Indigo
    ];
    
    if (index < colors.length) {
      return colors[index];
    }
    
    // Fallback color scheme based on index
    return index % 2 === 0 ? 'bg-amber-500' : 'bg-purple-500';
  };
  
  return (
    <div className="relative flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-4 text-amber-400">Destiny Wheel</h3>
      
      {/* Coins indicator */}
      <div className="absolute top-0 right-0 bg-amber-900 rounded-lg px-3 py-1 flex items-center">
        <span className="text-amber-300 font-bold text-lg">⚜️</span>
        <span className="ml-1 text-white">{gameState.destinyCoins}</span>
      </div>
      
      {/* Wheel container */}
      <div className="relative w-64 h-64 mb-6">
        {/* Wheel */}
        <div 
          className="absolute w-full h-full rounded-full overflow-hidden border-4 border-amber-800 transition-transform duration-3000 ease-out"
          style={{ transform: `rotate(${rotationDegree}deg)` }}
        >
          {/* Wheel segments */}
          {results.map((result, index) => {
            const segmentAngle = 360 / results.length;
            const rotation = index * segmentAngle;
            const skew = 90 - segmentAngle;
            
            return (
              <div 
                key={index}
                className={`absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left ${getSegmentColor(index, results.length)}`}
                style={{
                  transform: `rotate(${rotation}deg) skew(${skew}deg)`
                }}
              >
                <div className="absolute bottom-6 left-3 origin-center text-xs text-white font-bold whitespace-nowrap transform -rotate-45">
                  {result.name}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center cap */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-amber-800 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600"></div>
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="w-5 h-8 bg-red-600 clip-triangle"></div>
        </div>
      </div>
      
      {/* Spin button */}
      <button
        className={`px-6 py-2 rounded-full font-semibold text-lg transition-all
          ${!isSpinning && gameState.destinyCoins > 0 
            ? 'bg-amber-600 hover:bg-amber-500 text-white' 
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        onClick={handleSpin}
        disabled={isSpinning || gameState.destinyCoins <= 0}
      >
        {isSpinning ? 'Spinning...' : 'Spin (1 ⚜️)'}
      </button>
      
      {/* Result display */}
      {selectedResult && !isSpinning && (
        <div className="mt-4 p-3 bg-amber-900/70 rounded-lg text-center">
          <h4 className="font-semibold text-lg text-amber-300">{selectedResult.name}</h4>
          <p className="text-white">{selectedResult.description}</p>
        </div>
      )}
      
      {/* Custom CSS for triangle shape */}
      <style jsx>{`
        .clip-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};

export default DestinyWheel;