import React, { useMemo } from 'react';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { TrendingUp, Clock, Target, Activity } from 'lucide-react';

const StatisticsPanel = ({ history, currentState, step }) => {
  const statistics = useMemo(() => {
    if (history.length === 0) {
      return {
        totalTransitions: 0,
        transitionFrequency: {},
        averageTokensInFlight: currentState.tokensInFlight,
        gateUtilization: currentState.gateStatus === 'Occupée' ? 100 : 0,
        bottleneckDetected: false,
        efficiency: 0
      };
    }

    // Count transition frequencies
    const transitionFreq = history.reduce((acc, entry) => {
      acc[entry.transition] = (acc[entry.transition] || 0) + 1;
      return acc;
    }, {});

    // Calculate gate utilization (percentage of time gate was occupied)
    const gateOccupiedSteps = history.filter(entry => 
      entry.transition === 'T2' // Début embarquement = gate occupied
    ).length;
    const gateUtilization = history.length > 0 ? (gateOccupiedSteps / history.length) * 100 : 0;

    // Detect bottleneck (if many planes waiting vs boarding)
    const bottleneckDetected = currentState.tokensWaiting > 2 && currentState.tokensBoarding === 0;

    // Calculate efficiency (transitions per step)
    const efficiency = history.length > 0 ? (history.length / step) * 100 : 0;

    return {
      totalTransitions: history.length,
      transitionFrequency: transitionFreq,
      averageTokensInFlight: currentState.tokensInFlight,
      gateUtilization: Math.round(gateUtilization),
      bottleneckDetected,
      efficiency: Math.round(efficiency)
    };
  }, [history, currentState, step]);

  const transitionLabels = {
    T1: 'Atterrissages',
    T2: 'Débuts embarquement',
    T3: 'Fins embarquement', 
    T4: 'Décollages'
  };

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Transitions</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {statistics.totalTransitions}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Efficacité</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {statistics.efficiency}%
          </div>
        </div>
      </div>

      {/* Gate Utilization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Utilisation Passerelle</span>
          </div>
          <Badge variant="outline">{statistics.gateUtilization}%</Badge>
        </div>
        <Progress value={statistics.gateUtilization} className="h-2" />
      </div>

      {/* Bottleneck Detection */}
      {statistics.bottleneckDetected && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-700 dark:text-red-400">
              Goulot d'étranglement détecté
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            Plusieurs avions en attente, passerelle libre mais non utilisée
          </p>
        </div>
      )}

      {/* Transition Frequency */}
      {Object.keys(statistics.transitionFrequency).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Fréquence des Transitions</h4>
          <div className="space-y-2">
            {Object.entries(statistics.transitionFrequency).map(([transition, count]) => (
              <div key={transition} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {transitionLabels[transition] || transition}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(count / statistics.totalTransitions) * 100}%` 
                      }}
                    />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current State Summary */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2">
        <h4 className="text-sm font-medium">État Actuel</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Avions en vol: <span className="font-semibold">{currentState.tokensInFlight}</span></div>
          <div>En attente: <span className="font-semibold">{currentState.tokensWaiting}</span></div>
          <div>Embarquement: <span className="font-semibold">{currentState.tokensBoarding}</span></div>
          <div>Passerelle: <span className="font-semibold">{currentState.gateStatus}</span></div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;