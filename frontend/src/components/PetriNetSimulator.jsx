import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Play, Pause, RotateCcw, StepForward, Settings, BarChart3, Plane, MapPin } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PetriNetDiagram from './PetriNetDiagram';
import SimulationControls from './SimulationControls';
import StatisticsPanel from './StatisticsPanel';
import { mockPetriNetData } from '../mock/mockData';

const PetriNetSimulator = () => {
  const [petriNet, setPetriNet] = useState(mockPetriNetData);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSteps: 0,
    averageTokensInFlight: 0,
    averageWaitingTime: 0,
    gateUtilization: 0,
    throughput: 0
  });
  
  const { toast } = useToast();

  // Calculate current state statistics
  const calculateStats = useCallback(() => {
    const currentState = petriNet.places;
    const tokensInFlight = currentState.P1.tokens;
    const tokensWaiting = currentState.P2.tokens;
    const tokensBoarding = currentState.P3.tokens;
    const gateStatus = currentState.P4.tokens > 0 ? 'Libre' : 'Occupée';
    
    return {
      tokensInFlight,
      tokensWaiting,
      tokensBoarding,
      gateStatus,
      totalTokens: tokensInFlight + tokensWaiting + tokensBoarding + currentState.P5.tokens
    };
  }, [petriNet.places]);

  // Check if transition is enabled
  const isTransitionEnabled = useCallback((transitionId) => {
    const transition = petriNet.transitions[transitionId];
    if (!transition) return false;

    return transition.inputs.every(input => 
      petriNet.places[input.placeId].tokens >= input.weight
    );
  }, [petriNet]);

  // Fire a transition
  const fireTransition = useCallback((transitionId) => {
    if (!isTransitionEnabled(transitionId)) return false;

    let newStep;
    setPetriNet(prev => {
      const newState = JSON.parse(JSON.stringify(prev)); // Deep clone
      const transition = newState.transitions[transitionId];
      
      // Remove tokens from input places
      transition.inputs.forEach(input => {
        newState.places[input.placeId].tokens -= input.weight;
      });
      
      // Add tokens to output places
      transition.outputs.forEach(output => {
        newState.places[output.placeId].tokens += output.weight;
      });
      
      return newState;
    });

    setStep(prev => {
      newStep = prev + 1;
      return newStep;
    });
    
    // Add to history with the correct step number
    setHistory(prev => [...prev, {
      step: step + 1,
      transition: transitionId,
      timestamp: new Date().toISOString()
    }]);

    return true;
  }, [isTransitionEnabled, step]);

  // Get enabled transitions
  const getEnabledTransitions = useCallback(() => {
    return Object.keys(petriNet.transitions).filter(id => isTransitionEnabled(id));
  }, [petriNet.transitions, isTransitionEnabled]);

  // Auto simulation step
  const simulationStep = useCallback(() => {
    const enabledTransitions = getEnabledTransitions();
    
    if (enabledTransitions.length === 0) {
      setIsRunning(false);
      toast({
        title: "Simulation arrêtée",
        description: "Aucune transition activée disponible.",
        variant: "default"
      });
      return;
    }

    // Select random enabled transition
    const randomTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
    const success = fireTransition(randomTransition);
    
    if (success) {
      toast({
        title: `Transition ${randomTransition} exécutée`,
        description: petriNet.transitions[randomTransition].label,
        duration: 1500
      });
    }
  }, [getEnabledTransitions, fireTransition, toast, petriNet.transitions]);

  // Auto simulation effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(simulationStep, speed);
    return () => clearInterval(interval);
  }, [isRunning, speed, simulationStep]);

  // Manual step
  const handleStep = () => {
    simulationStep();
  };

  // Reset simulation
  const handleReset = () => {
    setIsRunning(false);
    setPetriNet(JSON.parse(JSON.stringify(mockPetriNetData))); // Deep clone
    setStep(0);
    setHistory([]);
    toast({
      title: "Simulation réinitialisée",
      description: "Retour à l'état initial",
    });
  };

  // Play/Pause
  const handlePlayPause = () => {
    setIsRunning(!isRunning);
    toast({
      title: isRunning ? "Simulation en pause" : "Simulation démarrée",
      description: isRunning ? "La simulation est maintenant en pause" : "La simulation automatique est activée",
    });
  };

  const currentStats = calculateStats();
  const enabledTransitions = getEnabledTransitions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <Plane className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Réseau de Petri - Gestion d'Aéroport
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simulation du flux d'avions dans un aéroport avec gestion des ressources partagées
          </p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              État Actuel du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm">Avions en Vol</Badge>
                <div className="text-2xl font-bold text-blue-600">{currentStats.tokensInFlight}</div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm">En Attente</Badge>  
                <div className="text-2xl font-bold text-orange-600">{currentStats.tokensWaiting}</div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm">Embarquement</Badge>
                <div className="text-2xl font-bold text-green-600">{currentStats.tokensBoarding}</div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm">Passerelle</Badge>
                <div className={`text-2xl font-bold ${currentStats.gateStatus === 'Libre' ? 'text-green-600' : 'text-red-600'}`}>
                  {currentStats.gateStatus}
                </div>
              </div>
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm">Étape</Badge>
                <div className="text-2xl font-bold text-purple-600">{step}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Petri Net Diagram */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Diagramme du Réseau de Petri</CardTitle>
              </CardHeader>
              <CardContent>
                <PetriNetDiagram 
                  petriNet={petriNet}
                  enabledTransitions={enabledTransitions}
                  onTransitionClick={fireTransition}
                />
              </CardContent>
            </Card>
          </div>

          {/* Controls and Info */}
          <div className="space-y-6">
            {/* Simulation Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Contrôles de Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimulationControls
                  isRunning={isRunning}
                  speed={speed}
                  onPlayPause={handlePlayPause}
                  onStep={handleStep}
                  onReset={handleReset}
                  onSpeedChange={setSpeed}
                  enabledTransitions={enabledTransitions}
                />
              </CardContent>
            </Card>

            {/* Statistics Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                  >
                    {showStats ? 'Masquer' : 'Afficher'}
                  </Button>
                </CardTitle>
              </CardHeader>
              {showStats && (
                <CardContent>
                  <StatisticsPanel
                    history={history}
                    currentState={currentStats}
                    step={step}
                  />
                </CardContent>
              )}
            </Card>

            {/* Enabled Transitions */}
            <Card>
              <CardHeader>
                <CardTitle>Transitions Activées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {enabledTransitions.length > 0 ? (
                    enabledTransitions.map(transitionId => (
                      <div key={transitionId} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="font-medium">{transitionId}</span>
                        <Badge variant="secondary">{petriNet.transitions[transitionId].label}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Aucune transition activée
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {history.slice(-10).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Étape {entry.step}</Badge>
                      <span className="font-medium">{entry.transition}</span>
                      <span className="text-sm text-muted-foreground">
                        {petriNet.transitions[entry.transition]?.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PetriNetSimulator;