import React, { useState, useEffect } from 'react';
import { oracles, getRandomOracle } from '../data/oracles';
import Card from '../components/Card';

const OracleScreen = ({ character, onOracleSelect }) => {
  const [availableOracles, setAvailableOracles] = useState([]);
  const [selectedOracle, setSelectedOracle] = useState(null);
  const [floorNumber, setFloorNumber] = useState(1);
  
  // Load available oracles when component mounts
  useEffect(() => {
    // Get one random oracle from each deity
    const deities = ['wargod', 'wisdomgod', 'luckgod', 'deathgod'];
    const oracleChoices = deities.map(deity => {
      return getRandomOracle(deity, floorNumber);
    }).filter(Boolean);
    
    setAvailableOracles(oracleChoices);
  }, [floorNumber]);
  
  // Handle oracle selection
  const handleOracleSelect = (oracle) => {
    setSelectedOracle(oracle);
  };
  
  // Handle confirmation of oracle selection
  const handleConfirm = () => {
    if (selectedOracle) {
      onOracleSelect(selectedOracle);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center text-amber-400">
        神谕大厅
      </h1>
      
      <p className="text-lg mb-8 text-center max-w-2xl text-gray-300">
        古老的先知在挑战之前给予你祝福。
        选择你的神谕，获得他们的祝福，战胜越来越强大的敌人，到达终点。
      </p>
      
      <div className="flex items-center justify-between w-full max-w-4xl mb-8">
        <div className="bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-400">角色</span>
          <div className="flex items-center">
            <span className="text-xl font-semibold">{character?.name || "英雄"}</span>
          </div>
        </div>
        
        <div className="bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-400">层数</span>
          <div className="text-xl font-semibold text-center">{floorNumber}</div>
        </div>
        
        <div className="bg-gray-800 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-400">下一层</span>
          <div className="text-xl font-semibold text-center text-red-400">挑战</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 w-full max-w-4xl">
        {availableOracles.map((oracle) => (
          <div
            key={oracle.name}
            className={`
              p-6 rounded-lg cursor-pointer transition-all
              ${selectedOracle === oracle
                ? 'bg-amber-900/60 ring-2 ring-amber-400'
                : 'bg-gray-800/60 hover:bg-gray-700/60'}
            `}
            onClick={() => handleOracleSelect(oracle)}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">{oracle.name}</h3>
                <span className="capitalize px-2 py-1 bg-gray-700 rounded text-sm">
                  {oracle.deity.replace('god', ' God')}
                </span>
              </div>
              
              <div className="mb-4">
                {oracle.blessings.map((blessing, index) => (
                  <div key={index} className="mb-3 last:mb-0">
                    <div className="font-medium text-amber-300 mb-1">{blessing.name}</div>
                    <p className="text-sm text-gray-300">{blessing.description}</p>
                  </div>
                ))}
              </div>
              
              {oracle.specialRules && (
                <div className="mt-2">
                  <div className="text-sm font-semibold text-red-300 mb-1">特殊规则</div>
                  <ul className="text-sm text-gray-300">
                    {oracle.specialRules.map((rule, index) => (
                      <li key={index} className="mb-1">• {rule}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-4 pt-3 border-t border-gray-700">
                <div className="text-sm font-semibold text-gray-400 mb-1">卡池修改器</div>
                <div className="flex gap-3">
                  {Object.entries(oracle.cardPoolModifiers).map(([type, mod]) => (
                    <div
                      key={type}
                      className={`text-sm px-2 py-1 rounded ${
                        mod > 0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}
                    >
                      {type} {mod > 0 ? '+' : ''}{mod}%
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        className={`
          px-8 py-3 rounded-full font-semibold text-lg transition-all
          ${selectedOracle
            ? 'bg-amber-600 hover:bg-amber-500 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
        `}
        onClick={handleConfirm}
        disabled={!selectedOracle}
      >
        接受祝福
      </button>
    </div>
  );
};

export default OracleScreen;