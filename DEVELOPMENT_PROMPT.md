# 🚀 PROMPT DE DÉVELOPPEMENT - Réseau de Petri Aéroport

**Crée une application web interactive de simulation de réseau de Petri pour modéliser le flux d'avions dans un aéroport.**

---

## ⚡ QUICK START

### Stack Technique
- **Frontend:** React + Tailwind + shadcn/ui + lucide-react
- **Backend:** FastAPI + MongoDB + Motor (async)
- **Ports:** Frontend:3000, Backend:8001 (préfixe /api)

### Réseau de Petri à Modéliser
```
PLACES:
P1: Avions en Vol (3 jetons initiaux)
P2: Avions en Attente (0)
P3: Avions en Embarquement (0)  
P4: Passerelle Libre (1)
P5: Avions Prêts Décollage (0)

TRANSITIONS:
T1: Atterrissage (P1 → P2)
T2: Début Embarquement (P2+P4 → P3)
T3: Fin Embarquement (P3 → P5+P4)  
T4: Décollage (P5 → P1)
```

---

## 🎨 INTERFACE REQUISE

### Layout Principal
```
┌─────────────────────────────────────┐
│ HEADER: Titre + Description         │
├─────────────────────────────────────┤
│ ÉTAT: 5 cartes métriques (P1-P5)    │
├──────────────────┬──────────────────┤
│ DIAGRAMME PETRI  │ CONTRÔLES        │
│ - Places (cercles│ - Play/Pause     │
│ - Transitions    │ - Step/Reset     │
│ - Jetons jaunes  │ - Vitesse        │
│ - Flèches        │ - Statistiques   │
└──────────────────┴──────────────────┘
│ HISTORIQUE (si présent)             │
└─────────────────────────────────────┘
```

### Couleurs Obligatoires
- P1 (Vol): Bleu #2196F3
- P2 (Attente): Orange #FF9800  
- P3 (Embarquement): Vert #4CAF50
- P4 (Passerelle): Violet #9C27B0
- P5 (Décollage): Indigo #3F51B5
- Jetons: Dégradé jaune #FFD700→#FFA500

---

## 🔧 COMPOSANTS FRONTEND

### 1. PetriNetSimulator.jsx (Principal)
```jsx
const [petriNet, setPetriNet] = useState(mockData)
const [isRunning, setIsRunning] = useState(false)
const [speed, setSpeed] = useState(1000)
const [step, setStep] = useState(0)
const [history, setHistory] = useState([])

// Fonctions requises:
- isTransitionEnabled(transitionId)
- fireTransition(transitionId) 
- getEnabledTransitions()
- simulationStep() // auto
- handlePlayPause(), handleStep(), handleReset()
```

### 2. PetriNetDiagram.jsx (Visualisation)
```jsx
// Éléments à rendre:
- PlaceComponent: cercle + icône + compteur jetons
- TransitionComponent: rectangle coloré cliquable
- ArrowComponent: flèches entre éléments
- Légende explicative

// Jetons: max 8 affichés, "+X" si plus
// Transitions: activées=colorées, désactivées=grises
```

### 3. SimulationControls.jsx (Contrôles)
```jsx
// Boutons requis:
- Play/Pause (vert⇄rouge, icônes dynamiques)
- Step (manuel, désactivé si auto)
- Reset (rouge, remet état initial)
- Slider vitesse (200ms→3000ms)
- Actions rapides (vitesse prédéfinie)
```

### 4. StatisticsPanel.jsx (Métriques)
```jsx
// Calculs en temps réel:
- Total transitions exécutées
- Utilisation passerelle (%temps occupée)
- Détection goulot (tokensWaiting>2 && tokensBoarding=0)  
- Efficacité (transitions/étapes)
- Fréquence par type transition
```

---

## 💾 BACKEND API

### Structure FastAPI
```python
# server.py
from fastapi import FastAPI, APIRouter
from motor.motor_asyncio import AsyncIOMotorClient

app = FastAPI()
api_router = APIRouter(prefix="/api")  # OBLIGATOIRE
app.include_router(api_router)

# CORS requis
app.add_middleware(CORSMiddleware, allow_origins=["*"])

@api_router.get("/simulations")
async def get_simulations(): pass

@api_router.post("/simulations") 
async def create_simulation(): pass

@api_router.put("/simulations/{id}/step")
async def execute_step(): pass
```

### Modèles Pydantic
```python
class PlaceState(BaseModel):
    id: str
    label: str  
    tokens: int

class PetriNetState(BaseModel):
    places: Dict[str, PlaceState]
    current_step: int
    enabled_transitions: List[str]

class Simulation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    current_state: PetriNetState
```

---

## 🧪 DONNÉES MOCK

### mockData.js
```javascript
export const mockPetriNetData = {
  places: {
    P1: { id: 'P1', label: 'Avions en Vol', tokens: 3 },
    P2: { id: 'P2', label: 'Avions en Attente d\'Embarquement', tokens: 0 },
    P3: { id: 'P3', label: 'Avions en Cours d\'Embarquement', tokens: 0 },
    P4: { id: 'P4', label: 'Passerelle Libre', tokens: 1 },
    P5: { id: 'P5', label: 'Avions Prêts au Décollage', tokens: 0 }
  },
  transitions: {
    T1: { 
      id: 'T1', label: 'Atterrissage',
      inputs: [{ placeId: 'P1', weight: 1 }],
      outputs: [{ placeId: 'P2', weight: 1 }]
    },
    T2: { 
      id: 'T2', label: 'Début Embarquement',
      inputs: [{ placeId: 'P2', weight: 1 }, { placeId: 'P4', weight: 1 }],
      outputs: [{ placeId: 'P3', weight: 1 }]
    },
    T3: { 
      id: 'T3', label: 'Fin Embarquement',
      inputs: [{ placeId: 'P3', weight: 1 }],
      outputs: [{ placeId: 'P5', weight: 1 }, { placeId: 'P4', weight: 1 }]
    },
    T4: { 
      id: 'T4', label: 'Décollage',
      inputs: [{ placeId: 'P5', weight: 1 }],
      outputs: [{ placeId: 'P1', weight: 1 }]
    }
  }
}
```

---

## ⚙️ LOGIQUE SIMULATION

### Algorithme Core
```javascript
// 1. Vérifier si transition activée
const isEnabled = (transitionId) => {
  const t = transitions[transitionId]
  return t.inputs.every(input => 
    places[input.placeId].tokens >= input.weight
  )
}

// 2. Exécuter transition
const fireTransition = (transitionId) => {
  const t = transitions[transitionId]
  const newState = JSON.parse(JSON.stringify(currentState)) // Deep clone
  
  // Retirer jetons entrée
  t.inputs.forEach(input => {
    newState.places[input.placeId].tokens -= input.weight
  })
  
  // Ajouter jetons sortie  
  t.outputs.forEach(output => {
    newState.places[output.placeId].tokens += output.weight
  })
  
  return newState
}

// 3. Simulation auto
const autoStep = () => {
  const enabled = getEnabledTransitions()
  if (enabled.length === 0) {
    setIsRunning(false)
    return
  }
  
  const random = enabled[Math.floor(Math.random() * enabled.length)]
  fireTransition(random)
}
```

---

## 🎮 INTERACTIONS

### Contrôles Utilisateur
1. **Clic transition activée** → Exécution manuelle immédiate
2. **Play** → Simulation auto (intervalle selon speed)
3. **Pause** → Arrêt simulation auto
4. **Step** → Une transition manuelle (désactivé si auto)
5. **Reset** → État initial + historique vide
6. **Speed slider** → Ajuste délai entre transitions auto

### Toasts Notifications
```javascript
// Messages requis
success: "Transition T1 exécutée - Atterrissage"
info: "Simulation démarrée/en pause"  
warning: "Aucune transition activée - Simulation arrêtée"
error: "Goulot d'étranglement détecté"
```

---

## 🐛 BUGS À ÉVITER

### Frontend
```javascript
// ❌ ERREURS COURANTES
1. Mutations d'état directes → Utiliser deep clone
2. Clés React instables → Utiliser IDs uniques
3. Re-renders excessifs → useCallback/useMemo
4. Transitions simultanées → Gestion file d'attente

// ✅ SOLUTIONS
- setPetriNet(JSON.parse(JSON.stringify(prev)))
- key={`${id}-${step}-${index}`}
- const memoizedFn = useCallback(() => {}, [deps])
```

### Backend
```python
# ❌ ERREURS COURANTES  
1. Préfixe /api manquant → Erreurs routing
2. CORS non configuré → Blocage requêtes
3. Validation manquante → États incohérents
4. Erreurs MongoDB non gérées → Crashes

# ✅ SOLUTIONS
- APIRouter(prefix="/api")
- CORSMiddleware(allow_origins=["*"])  
- Modèles Pydantic stricts
- try/except avec HTTPException
```

---

## ✅ TESTS DE VALIDATION

### Tests Fonctionnels
```javascript
// 1. Cycle complet
TEST: P1(3)→T1→P2(1)→T2→P3(1)→T3→P5(1)→T4→P1(3)
VÉRIFIER: Retour état initial

// 2. Ressource partagée  
TEST: Deux avions en P2, un seul peut utiliser P4
VÉRIFIER: Un seul en P3 à la fois

// 3. Goulot d'étranglement
CONFIG: P2=3, P4=0  
VÉRIFIER: T2 désactivée, alerte affichée

// 4. Simulation auto
TEST: 100 transitions automatiques
VÉRIFIER: Aucune erreur, respect des règles
```

---

## 📦 CHECKLIST FINAL

### Frontend ✅
- [ ] Interface moderne responsive (Tailwind + shadcn/ui)
- [ ] 4 composants principaux créés
- [ ] Visualisation Petri interactive
- [ ] Contrôles simulation fonctionnels
- [ ] Statistiques temps réel  
- [ ] Gestion d'état stable (pas d'erreurs React)
- [ ] Toasts notifications appropriées

### Backend ✅  
- [ ] FastAPI avec préfixe /api
- [ ] CRUD simulations complet
- [ ] Modèles Pydantic validés
- [ ] MongoDB intégration
- [ ] Gestion erreurs HTTP
- [ ] CORS configuré

### Fonctionnel ✅
- [ ] Réseau Petri mathématiquement correct
- [ ] Cycle complet Vol→Atterrissage→Embarquement→Décollage
- [ ] Ressource passerelle partagée correctement
- [ ] Détection goulots d'étranglement
- [ ] Simulation auto + manuelle
- [ ] Persistance données

### UX ✅
- [ ] Interface intuitive et claire
- [ ] Feedback immédiat (animations, toasts)  
- [ ] Responsive mobile/desktop
- [ ] Performance fluide (>60fps)
- [ ] Accessibilité (contrastes, navigation)

---

**🎯 OBJECTIF:** Une application complète, stable et pédagogiquement efficace pour comprendre les réseaux de Petri appliqués à la gestion aéroportuaire.**

*Temps estimé de développement: 6-8h pour un développeur expérimenté*