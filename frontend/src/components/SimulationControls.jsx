import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Play, Pause, RotateCcw, StepForward, Zap, Turtle, Rabbit } from 'lucide-react';

const SimulationControls = ({ 
  isRunning, 
  speed, 
  onPlayPause, 
  onStep, 
  onReset, 
  onSpeedChange,
  enabledTransitions 
}) => {
  const getSpeedLabel = (speed) => {
    if (speed >= 2000) return { label: 'Lent', icon: <Turtle className="h-4 w-4" /> };
    if (speed >= 1000) return { label: 'Normal', icon: <Zap className="h-4 w-4" /> };
    return { label: 'Rapide', icon: <Rabbit className="h-4 w-4" /> };
  };

  const speedInfo = getSpeedLabel(speed);

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onPlayPause}
          size="lg"
          className={`flex-1 ${
            isRunning 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Démarrer
            </>
          )}
        </Button>
        
        <Button
          onClick={onStep}
          disabled={isRunning || enabledTransitions.length === 0}
          variant="outline"
          size="lg"
          className="flex-1"
        >
          <StepForward className="h-4 w-4 mr-2" />
          Étape
        </Button>
      </div>

      <Button
        onClick={onReset}
        variant="outline"
        size="lg"
        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Réinitialiser
      </Button>

      {/* Speed Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Vitesse de simulation</Label>
          <Badge variant="secondary" className="flex items-center gap-1">
            {speedInfo.icon}
            {speedInfo.label}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Slider
            value={[speed]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={200}
            max={3000}
            step={200}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Rapide (200ms)</span>
            <span>Lent (3s)</span>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
        <div className="flex items-center justify-between">
          <Label className="text-sm">État de la simulation</Label>
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? "En cours" : "Arrêtée"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <Label className="text-sm">Transitions disponibles</Label>
          <Badge variant={enabledTransitions.length > 0 ? "default" : "destructive"}>
            {enabledTransitions.length}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Actions rapides</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSpeedChange(500)}
            className="text-xs"
          >
            Vitesse Rapide
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSpeedChange(2000)}
            className="text-xs"
          >
            Vitesse Lente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;