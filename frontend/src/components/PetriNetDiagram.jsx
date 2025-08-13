import React from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Plane, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const PetriNetDiagram = ({ petriNet, enabledTransitions, onTransitionClick }) => {
  const placeIcons = {
    P1: <Plane className="h-6 w-6 text-blue-500" />,
    P2: <Clock className="h-6 w-6 text-orange-500" />,
    P3: <Users className="h-6 w-6 text-green-500" />,
    P4: <CheckCircle className="h-6 w-6 text-purple-500" />,
    P5: <Plane className="h-6 w-6 text-indigo-500" />
  };

  const transitionColors = {
    T1: 'bg-blue-500 hover:bg-blue-600',
    T2: 'bg-orange-500 hover:bg-orange-600', 
    T3: 'bg-green-500 hover:bg-green-600',
    T4: 'bg-indigo-500 hover:bg-indigo-600'
  };

  const PlaceComponent = ({ place, placeId }) => (
    <div className="flex flex-col items-center space-y-2 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-600 min-w-[140px]">
      <div className="flex items-center gap-2">
        {placeIcons[placeId]}
        <span className="font-semibold text-sm">{placeId}</span>
      </div>
      <h3 className="text-center text-sm font-medium text-slate-700 dark:text-slate-300 leading-tight">
        {place.label}
      </h3>
      <div className="flex flex-wrap gap-1 justify-center min-h-[40px] items-center">
        {place.tokens > 0 ? (
          Array.from({ length: Math.min(place.tokens, 8) }, (_, i) => (
            <div
              key={i}
              className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-md flex items-center justify-center text-xs font-bold text-white"
            >
              {place.tokens > 8 && i === 7 ? `+${place.tokens - 7}` : '●'}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">0 jetons</div>
        )}
      </div>
    </div>
  );

  const TransitionComponent = ({ transition, transitionId }) => {
    const isEnabled = enabledTransitions.includes(transitionId);
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={() => onTransitionClick(transitionId)}
          disabled={!isEnabled}
          className={`
            px-6 py-8 rounded-lg font-semibold text-white transition-all duration-200 min-w-[120px]
            ${isEnabled 
              ? `${transitionColors[transitionId]} transform hover:scale-105 shadow-lg` 
              : 'bg-gray-400 cursor-not-allowed opacity-50'
            }
          `}
        >
          <div className="text-center">
            <div className="text-lg font-bold">{transitionId}</div>
            <div className="text-xs opacity-90 mt-1">{transition.label}</div>
          </div>
        </Button>
        {isEnabled && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Activée
          </Badge>
        )}
      </div>
    );
  };

  const ArrowComponent = ({ className = "" }) => (
    <div className={`flex items-center justify-center ${className}`}>
      <ArrowRight className="h-6 w-6 text-slate-400 dark:text-slate-500" />
    </div>
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl">
      <div className="space-y-8">
        {/* First Row: P1 -> T1 -> P2 */}
        <div className="flex items-center justify-center gap-6">
          <PlaceComponent place={petriNet.places.P1} placeId="P1" />
          <ArrowComponent />
          <TransitionComponent transition={petriNet.transitions.T1} transitionId="T1" />
          <ArrowComponent />
          <PlaceComponent place={petriNet.places.P2} placeId="P2" />
        </div>

        {/* Second Row: P4 connects to T2 */}
        <div className="flex items-center justify-center gap-6">
          <div className="w-[140px]"></div>
          <div className="w-6"></div>
          <div className="flex flex-col items-center gap-4">
            <PlaceComponent place={petriNet.places.P4} placeId="P4" />
            <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
            <TransitionComponent transition={petriNet.transitions.T2} transitionId="T2" />
          </div>
          <ArrowComponent />
          <PlaceComponent place={petriNet.places.P3} placeId="P3" />
        </div>

        {/* Third Row: P3 -> T3 -> P5 and back to P4 */}
        <div className="flex items-center justify-center gap-6">
          <div className="w-[140px]"></div>
          <div className="w-6"></div>
          <div className="w-[120px]"></div>
          <ArrowComponent />
          <div className="flex flex-col items-center gap-4">
            <TransitionComponent transition={petriNet.transitions.T3} transitionId="T3" />
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-600"></div>
                <ArrowComponent className="transform -rotate-90" />
              </div>
              <ArrowComponent />
            </div>
          </div>
          <PlaceComponent place={petriNet.places.P5} placeId="P5" />
        </div>

        {/* Fourth Row: P5 -> T4 -> back to P1 */}
        <div className="flex items-center justify-center gap-6">
          <div className="w-[140px]"></div>
          <div className="w-6"></div>
          <div className="w-[120px]"></div>
          <div className="w-6"></div>
          <div className="w-[120px]"></div>
          <ArrowComponent />
          <TransitionComponent transition={petriNet.transitions.T4} transitionId="T4" />
        </div>

        {/* Connection back to P1 (visual indication) */}
        <div className="flex justify-center">
          <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <ArrowComponent className="mb-2" />
            <span className="text-sm text-muted-foreground">Retour à P1 (Vol)</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg border">
        <h4 className="font-semibold mb-3">Légende</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"></div>
              <span>Jeton (Avion)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-300 rounded-full"></div>
              <span>Place (État)</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-4 bg-blue-500 rounded"></div>
              <span>Transition (Action)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-slate-400" />
              <span>Flux de jetons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetriNetDiagram;