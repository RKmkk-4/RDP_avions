// Mock data for Petri Net simulation
export const mockPetriNetData = {
  places: {
    P1: {
      id: 'P1',
      label: 'Avions en Vol',
      tokens: 3,
      position: { x: 100, y: 100 }
    },
    P2: {
      id: 'P2', 
      label: 'Avions en Attente d\'Embarquement',
      tokens: 0,
      position: { x: 300, y: 100 }
    },
    P3: {
      id: 'P3',
      label: 'Avions en Cours d\'Embarquement', 
      tokens: 0,
      position: { x: 500, y: 100 }
    },
    P4: {
      id: 'P4',
      label: 'Passerelle Libre',
      tokens: 1,
      position: { x: 400, y: 200 }
    },
    P5: {
      id: 'P5',
      label: 'Avions Prêts au Décollage',
      tokens: 0,
      position: { x: 700, y: 100 }
    }
  },
  
  transitions: {
    T1: {
      id: 'T1',
      label: 'Atterrissage',
      inputs: [
        { placeId: 'P1', weight: 1 }
      ],
      outputs: [
        { placeId: 'P2', weight: 1 }
      ],
      position: { x: 200, y: 100 }
    },
    T2: {
      id: 'T2', 
      label: 'Début Embarquement',
      inputs: [
        { placeId: 'P2', weight: 1 },
        { placeId: 'P4', weight: 1 }
      ],
      outputs: [
        { placeId: 'P3', weight: 1 }
      ],
      position: { x: 400, y: 100 }
    },
    T3: {
      id: 'T3',
      label: 'Fin Embarquement', 
      inputs: [
        { placeId: 'P3', weight: 1 }
      ],
      outputs: [
        { placeId: 'P5', weight: 1 },
        { placeId: 'P4', weight: 1 }
      ],
      position: { x: 600, y: 100 }
    },
    T4: {
      id: 'T4',
      label: 'Décollage',
      inputs: [
        { placeId: 'P5', weight: 1 }
      ],
      outputs: [
        { placeId: 'P1', weight: 1 }
      ],
      position: { x: 800, y: 100 }
    }
  },

  // Initial marking
  initialMarking: {
    P1: 3,
    P2: 0, 
    P3: 0,
    P4: 1,
    P5: 0
  },

  // Simulation settings
  settings: {
    maxTokensPerPlace: 10,
    simulationSpeed: 1000,
    enableConcurrency: true,
    enableConflictResolution: true
  },

  metadata: {
    name: 'Gestion d\'Aéroport',
    description: 'Modélisation du flux d\'avions dans un aéroport avec gestion des ressources partagées',
    author: 'Simulateur Petri Net',
    version: '1.0.0',
    created: new Date().toISOString()
  }
};

// Additional mock data for testing different scenarios
export const mockScenarios = {
  // Scenario with bottleneck - multiple planes waiting
  bottleneck: {
    ...mockPetriNetData,
    places: {
      ...mockPetriNetData.places,
      P1: { ...mockPetriNetData.places.P1, tokens: 1 },
      P2: { ...mockPetriNetData.places.P2, tokens: 3 },
      P4: { ...mockPetriNetData.places.P4, tokens: 0 }
    }
  },

  // Scenario with high traffic
  highTraffic: {
    ...mockPetriNetData,
    places: {
      ...mockPetriNetData.places,
      P1: { ...mockPetriNetData.places.P1, tokens: 5 },
      P2: { ...mockPetriNetData.places.P2, tokens: 2 },
      P3: { ...mockPetriNetData.places.P3, tokens: 1 }
    }
  },

  // Empty airport scenario
  empty: {
    ...mockPetriNetData,
    places: {
      ...mockPetriNetData.places,
      P1: { ...mockPetriNetData.places.P1, tokens: 0 },
      P2: { ...mockPetriNetData.places.P2, tokens: 0 },
      P3: { ...mockPetriNetData.places.P3, tokens: 0 },
      P4: { ...mockPetriNetData.places.P4, tokens: 1 },
      P5: { ...mockPetriNetData.places.P5, tokens: 0 }
    }
  }
};

// Mock data for historical simulation results
export const mockHistoryData = [
  { step: 1, transition: 'T1', timestamp: '2024-01-01T10:00:00Z', state: 'P1->P2' },
  { step: 2, transition: 'T2', timestamp: '2024-01-01T10:01:00Z', state: 'P2,P4->P3' },
  { step: 3, transition: 'T3', timestamp: '2024-01-01T10:02:00Z', state: 'P3->P5,P4' },
  { step: 4, transition: 'T4', timestamp: '2024-01-01T10:03:00Z', state: 'P5->P1' }
];

// Mock data for performance metrics
export const mockPerformanceData = {
  totalSimulationTime: 300, // seconds
  totalTransitions: 50,
  averageTransitionTime: 6, // seconds
  peakConcurrency: 3, // max simultaneous active transitions
  bottleneckDuration: 45, // seconds spent in bottleneck state
  throughput: 10, // planes processed per hour
  utilization: {
    gate: 85, // percentage
    runway: 60, // percentage
    airspace: 40 // percentage
  }
};

export default mockPetriNetData;