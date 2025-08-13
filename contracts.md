# Contrats API - Réseau de Petri Aéroport

## Vue d'ensemble
Ce document définit les contrats API pour l'application de simulation de réseau de Petri pour la gestion d'aéroport.

## Données Mock à Remplacer
Actuellement, l'application utilise des données mock dans `/app/frontend/src/mock/mockData.js` :
- État initial du réseau de Petri (places et transitions)
- Historique des simulations
- Statistiques de performance
- Scénarios de test prédéfinis

## Endpoints API à Implémenter

### 1. Gestion des Simulations

#### GET /api/simulations
- **Description** : Récupérer toutes les simulations sauvegardées
- **Response** : Array de simulations avec métadonnées
```json
{
  "simulations": [
    {
      "id": "uuid",
      "name": "Simulation 1",
      "created_at": "2024-01-01T10:00:00Z",
      "steps": 50,
      "duration": 300,
      "status": "completed"
    }
  ]
}
```

#### POST /api/simulations
- **Description** : Créer une nouvelle simulation
- **Body** :
```json
{
  "name": "Nouvelle Simulation",
  "initial_state": {
    "P1": 3,
    "P2": 0,
    "P3": 0,
    "P4": 1,
    "P5": 0
  },
  "settings": {
    "max_steps": 100,
    "auto_mode": false
  }
}
```

#### GET /api/simulations/{id}
- **Description** : Récupérer une simulation spécifique avec son historique
- **Response** : Simulation complète avec état actuel et historique

#### PUT /api/simulations/{id}/step
- **Description** : Exécuter une étape de simulation
- **Body** :
```json
{
  "transition_id": "T1", // Optionnel pour simulation automatique
  "manual": true
}
```
- **Response** : Nouvel état du réseau de Petri

#### DELETE /api/simulations/{id}
- **Description** : Supprimer une simulation

### 2. État du Réseau de Petri

#### GET /api/petri-net/state/{simulation_id}
- **Description** : Récupérer l'état actuel du réseau
- **Response** :
```json
{
  "simulation_id": "uuid",
  "current_step": 15,
  "places": {
    "P1": {"id": "P1", "label": "Avions en Vol", "tokens": 2},
    "P2": {"id": "P2", "label": "Avions en Attente", "tokens": 1},
    // ...autres places
  },
  "transitions": {
    "T1": {"id": "T1", "label": "Atterrissage", "enabled": true},
    // ...autres transitions
  },
  "enabled_transitions": ["T1", "T2"]
}
```

#### POST /api/petri-net/reset/{simulation_id}
- **Description** : Réinitialiser le réseau à l'état initial
- **Response** : État initial du réseau

### 3. Historique et Statistiques

#### GET /api/simulations/{id}/history
- **Description** : Récupérer l'historique des transitions
- **Query Parameters** :
  - `limit`: nombre maximum d'entrées (défaut: 100)
  - `offset`: décalage pour pagination
- **Response** :
```json
{
  "history": [
    {
      "step": 1,
      "transition": "T1",
      "timestamp": "2024-01-01T10:00:00Z",
      "before_state": {"P1": 3, "P2": 0, ...},
      "after_state": {"P1": 2, "P2": 1, ...}
    }
  ],
  "total": 50
}
```

#### GET /api/simulations/{id}/statistics
- **Description** : Calculer les statistiques de performance
- **Response** :
```json
{
  "total_steps": 50,
  "duration": 300,
  "transition_frequency": {
    "T1": 15,
    "T2": 12,
    "T3": 12,
    "T4": 11
  },
  "average_tokens_per_place": {
    "P1": 2.5,
    "P2": 0.8,
    // ...
  },
  "gate_utilization": 75.5,
  "bottleneck_detected": false,
  "throughput": 10.2
}
```

### 4. Scénarios Prédéfinis

#### GET /api/scenarios
- **Description** : Récupérer les scénarios de test prédéfinis
- **Response** :
```json
{
  "scenarios": [
    {
      "id": "bottleneck",
      "name": "Goulot d'étranglement",
      "description": "Plusieurs avions en attente, passerelle occupée",
      "initial_state": {"P1": 1, "P2": 3, "P3": 0, "P4": 0, "P5": 0}
    },
    {
      "id": "high_traffic",
      "name": "Trafic intense",
      "description": "Beaucoup d'avions en circulation",
      "initial_state": {"P1": 5, "P2": 2, "P3": 1, "P4": 1, "P5": 0}
    }
  ]
}
```

## Modèles de Données MongoDB

### Simulation
```javascript
{
  _id: ObjectId,
  name: String,
  created_at: Date,
  updated_at: Date,
  current_step: Number,
  status: String, // 'running', 'paused', 'completed'
  initial_state: {
    P1: Number,
    P2: Number,
    P3: Number,
    P4: Number,
    P5: Number
  },
  current_state: {
    P1: Number,
    P2: Number,
    P3: Number,
    P4: Number,
    P5: Number
  },
  settings: {
    max_steps: Number,
    auto_mode: Boolean,
    speed: Number
  }
}
```

### SimulationStep
```javascript
{
  _id: ObjectId,
  simulation_id: ObjectId,
  step_number: Number,
  transition_fired: String,
  timestamp: Date,
  before_state: Object,
  after_state: Object,
  enabled_transitions: [String]
}
```

## Intégration Frontend-Backend

### Remplacement des Données Mock
1. **Remplacer `mockPetriNetData`** dans `PetriNetSimulator.jsx` par des appels API
2. **Utiliser axios** pour les requêtes HTTP vers les endpoints backend
3. **Gérer les états de chargement** avec des spinners appropriés
4. **Implémenter la gestion des erreurs** avec des toasts d'information

### Modifications Frontend Requises
- Ajouter `useState` pour les états de chargement
- Implémenter des fonctions API dans un service séparé (`services/petriNetService.js`)
- Ajouter la gestion des erreurs réseau
- Implémenter la persistence des simulations
- Ajouter la possibilité de charger des simulations existantes

### Flux de Données
1. **Initialisation** : Charger une simulation existante ou créer une nouvelle
2. **Étapes manuelles** : Envoyer POST vers `/api/simulations/{id}/step`
3. **Simulation automatique** : Polling pour récupérer l'état mis à jour
4. **Sauvegarde** : Auto-sauvegarde des états à chaque étape
5. **Statistiques** : Calculées en temps réel côté backend

## Tests à Implémenter
- Tests unitaires pour les endpoints API
- Tests d'intégration pour les simulations complètes
- Tests de performance pour les simulations longues
- Tests de concurrence pour les simulations multiples

## Considérations de Performance
- Indexation MongoDB sur `simulation_id` et `step_number`
- Pagination pour l'historique des grandes simulations  
- Cache Redis pour les statistiques fréquemment consultées
- WebSocket pour les mises à jour en temps réel (optionnel)