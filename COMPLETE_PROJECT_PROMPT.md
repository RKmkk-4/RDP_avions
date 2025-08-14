# 🛩️ PROMPT COMPLET - Réseau de Petri Gestion d'Aéroport

## 🎯 OBJECTIF DU PROJET

Créer une application web full-stack interactive pour simuler et analyser un réseau de Petri modélisant le flux d'avions dans un aéroport. L'application doit permettre la visualisation, la simulation manuelle/automatique, l'analyse statistique et la persistance des données.

---

## 📋 SPÉCIFICATIONS TECHNIQUES

### Stack Technologique Obligatoire
- **Frontend:** React 19+ avec hooks, Tailwind CSS, shadcn/ui
- **Backend:** FastAPI (Python), motor (MongoDB async)
- **Base de données:** MongoDB
- **Conteneurisation:** Docker avec hot-reload
- **Architecture:** REST API avec séparation frontend/backend

### Ports et Configuration
- **Frontend:** Port 3000 (hot-reload activé)
- **Backend:** Port 8001 (préfixe /api obligatoire)
- **MongoDB:** Port 27017 (local)
- **Variables d'environnement:** Pré-configurées, ne pas modifier

---

## 🔬 MODÉLISATION DU RÉSEAU DE PETRI

### Places (États du Système)
```javascript
P1: "Avions en Vol" (initial: 3 jetons)
P2: "Avions en Attente d'Embarquement" (initial: 0 jetons)  
P3: "Avions en Cours d'Embarquement" (initial: 0 jetons)
P4: "Passerelle Libre" (initial: 1 jeton)
P5: "Avions Prêts au Décollage" (initial: 0 jetons)
```

### Transitions (Actions)
```javascript
T1: "Atterrissage" (P1 → P2)
T2: "Début Embarquement" (P2 + P4 → P3)  
T3: "Fin Embarquement" (P3 → P5 + P4)
T4: "Décollage" (P5 → P1)
```

### Règles Métier
1. Une transition est **activée** si toutes ses places d'entrée ont suffisamment de jetons
2. Exécuter une transition **retire** les jetons des places d'entrée et **ajoute** aux places de sortie
3. La passerelle (P4) est une **ressource partagée** - un seul avion peut l'utiliser
4. Le système doit être **vivace** - le cycle complet doit pouvoir se répéter indéfiniment

---

## 🎨 DESIGN SYSTEM ET UI/UX

### Palette de Couleurs
```css
/* Couleurs par état */
P1 (Vol): Bleu (#2196F3)
P2 (Attente): Orange (#FF9800)  
P3 (Embarquement): Vert (#4CAF50)
P4 (Passerelle): Violet (#9C27B0)
P5 (Décollage): Indigo (#3F51B5)

/* Couleurs fonctionnelles */
Transitions activées: Vert avec hover
Transitions désactivées: Gris
Jetons: Dégradé jaune-doré (#FFD700 → #FFA500)
Background: Dégradé bleu subtil (slate-50 → blue-50)
```

### Composants UI Obligatoires
- **shadcn/ui uniquement:** Button, Card, Badge, Slider, Progress, Toast, Separator
- **Icônes:** lucide-react (Plane, Users, Clock, CheckCircle, ArrowRight, etc.)
- **Animations:** Transitions CSS fluides, pas d'emojis IA (🤖💡🔮 interdits)
- **Responsivité:** Grid adaptive, mobile-first

### Layout Requis
```
Header: Titre + description centré
État du système: 5 cartes métriques horizontales  
Corps: 2 colonnes (Diagramme Petri + Contrôles)
Historique: Accordéon en bas si présent
```

---

## 🚀 FONCTIONNALITÉS FRONTEND

### 1. Composant Principal (PetriNetSimulator)
```javascript
// États React obligatoires
const [petriNet, setPetriNet] = useState(mockData)
const [isRunning, setIsRunning] = useState(false)
const [speed, setSpeed] = useState(1000) // ms entre transitions
const [step, setStep] = useState(0)
const [history, setHistory] = useState([])
const [statistics, setStatistics] = useState({})
```

### 2. Diagramme Interactif (PetriNetDiagram)
- **Places:** Cercles avec icônes et compteur de jetons
- **Transitions:** Rectangles colorés cliquables si activées
- **Jetons:** Cercles jaunes, max 8 affichés (+X si plus)
- **Flèches:** Indicateurs de flux entre éléments
- **Légende:** Explication des symboles

### 3. Contrôles de Simulation (SimulationControls)
```javascript
// Boutons requis
- Play/Pause (vert/rouge, icône dynamique)
- Step (manuel, désactivé si simulation auto)
- Reset (remet à l'état initial)
- Speed slider (200ms à 3000ms)
- Actions rapides (vitesse prédéfinie)
```

### 4. Statistiques Temps Réel (StatisticsPanel)
```javascript
// Métriques calculées
- Total transitions exécutées
- Utilisation passerelle (%time occupée)  
- Détection goulot d'étranglement
- Efficacité globale
- Fréquence par type de transition
```

### 5. Gestion d'État Avancée
- **Deep cloning** obligatoire pour éviter mutations
- **Clés React stables** pour éviter erreurs DOM
- **useCallback** pour fonctions coûteuses
- **useMemo** pour calculs statistiques

---

## 🔧 BACKEND API

### Structure FastAPI
```python
# server.py - Configuration obligatoire
app = FastAPI()
api_router = APIRouter(prefix="/api")  # Préfixe OBLIGATOIRE
app.include_router(api_router)

# CORS middleware requis
app.add_middleware(CORSMiddleware, allow_origins=["*"])
```

### Endpoints Requis

#### 1. Gestion des Simulations
```python
GET /api/simulations - Liste toutes les simulations
POST /api/simulations - Crée nouvelle simulation  
GET /api/simulations/{id} - Récupère simulation spécifique
DELETE /api/simulations/{id} - Supprime simulation
PUT /api/simulations/{id}/step - Exécute une étape
POST /api/simulations/{id}/reset - Remet à zéro
```

#### 2. État du Réseau
```python
GET /api/petri-net/state/{sim_id} - État actuel
GET /api/simulations/{id}/history - Historique transitions
GET /api/simulations/{id}/statistics - Métriques calculées
```

#### 3. Scénarios Prédéfinis
```python
GET /api/scenarios - Liste scénarios de test
POST /api/scenarios/{id}/load - Charge un scénario
```

### Modèles Pydantic
```python
class PetriNetState(BaseModel):
    places: Dict[str, PlaceState]
    transitions: Dict[str, TransitionState] 
    current_step: int
    enabled_transitions: List[str]

class Simulation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    current_state: PetriNetState
    settings: SimulationSettings
```

---

## 💾 STRUCTURE MONGODB

### Collections
```javascript
// simulations collection
{
  _id: ObjectId,
  name: String,
  created_at: Date,
  current_step: Number,
  current_state: {
    P1: Number, P2: Number, P3: Number, P4: Number, P5: Number
  },
  settings: { max_steps: Number, auto_mode: Boolean, speed: Number }
}

// simulation_steps collection  
{
  _id: ObjectId,
  simulation_id: ObjectId,
  step_number: Number,
  transition_fired: String,
  timestamp: Date,
  before_state: Object,
  after_state: Object
}
```

---

## 🧪 DONNÉES MOCK REQUISES

### mockData.js Structure
```javascript
export const mockPetriNetData = {
  places: {
    P1: { id: 'P1', label: 'Avions en Vol', tokens: 3 },
    P2: { id: 'P2', label: 'Avions en Attente', tokens: 0 },
    P3: { id: 'P3', label: 'Avions en Embarquement', tokens: 0 },
    P4: { id: 'P4', label: 'Passerelle Libre', tokens: 1 },
    P5: { id: 'P5', label: 'Avions Prêts Décollage', tokens: 0 }
  },
  transitions: {
    T1: { 
      id: 'T1', label: 'Atterrissage',
      inputs: [{ placeId: 'P1', weight: 1 }],
      outputs: [{ placeId: 'P2', weight: 1 }]
    },
    // ... autres transitions
  }
}
```

### Scénarios de Test
```javascript
// Scénarios obligatoires à implémenter
1. Normal: État initial par défaut
2. Goulot: P2=3, P4=0 (passerelle occupée, avions en attente)
3. Intense: P1=5, P2=2, P3=1 (trafic élevé)  
4. Vide: Tous à 0 sauf P4=1 (redémarrage)
```

---

## ⚙️ LOGIQUE DE SIMULATION

### Algorithme d'Exécution
```javascript
// 1. Calcul des transitions activées
function getEnabledTransitions(state) {
  return transitions.filter(t => 
    t.inputs.every(input => 
      state.places[input.placeId].tokens >= input.weight
    )
  )
}

// 2. Exécution d'une transition  
function fireTransition(transitionId, state) {
  const transition = transitions[transitionId]
  const newState = deepClone(state)
  
  // Retirer jetons des places d'entrée
  transition.inputs.forEach(input => {
    newState.places[input.placeId].tokens -= input.weight
  })
  
  // Ajouter jetons aux places de sortie
  transition.outputs.forEach(output => {
    newState.places[output.placeId].tokens += output.weight  
  })
  
  return newState
}

// 3. Simulation automatique
function autoSimulationStep() {
  const enabled = getEnabledTransitions(currentState)
  if (enabled.length === 0) {
    stopSimulation()
    return
  }
  
  // Sélection aléatoire pour résoudre conflits
  const randomTransition = enabled[Math.floor(Math.random() * enabled.length)]
  fireTransition(randomTransition)
}
```

---

## 📊 MÉTRIQUES ET ANALYTICS

### Calculs Temps Réel Obligatoires
```javascript
// 1. Utilisation passerelle (% temps occupée)
const gateUtilization = (stepsWithGateOccupied / totalSteps) * 100

// 2. Détection goulot d'étranglement
const bottleneckDetected = (tokensWaiting > 2 && tokensBoarding === 0)

// 3. Efficacité globale  
const efficiency = (completedCycles / totalSteps) * 100

// 4. Débit (avions traités par unité temps)
const throughput = completedCycles / simulationDuration

// 5. Fréquence des transitions
const transitionFreq = history.reduce((acc, entry) => {
  acc[entry.transition] = (acc[entry.transition] || 0) + 1
  return acc
}, {})
```

---

## 🎮 INTERACTIONS UTILISATEUR

### Contrôles Requis
1. **Clic sur transition activée** → Exécution manuelle
2. **Bouton Play** → Démarre simulation auto (vitesse réglable) 
3. **Bouton Pause** → Arrête simulation auto
4. **Bouton Step** → Une transition manuelle (désactivé si auto)
5. **Bouton Reset** → Retour état initial + RAZ historique
6. **Slider vitesse** → 200ms à 3000ms entre transitions
7. **Affichage stats** → Toggle pour masquer/afficher

### Notifications Toast
```javascript
// Messages requis
- "Transition XX exécutée" (succès)
- "Simulation démarrée/arrêtée" (info)
- "Aucune transition activée" (warning)  
- "Goulot d'étranglement détecté" (alert)
- "Simulation réinitialisée" (info)
```

---

## 🐛 GESTION D'ERREURS

### Frontend
```javascript
// Erreurs à gérer
1. Transition non activée → Ignorer silencieusement
2. Erreur réseau API → Toast d'erreur + retry
3. État incohérent → Reset automatique
4. Simulation bloquée → Arrêt auto + notification
```

### Backend  
```python
# Exceptions à gérer
1. Simulation non trouvée → 404 Not Found
2. État invalide → 400 Bad Request  
3. Erreur MongoDB → 500 Internal Server Error
4. Validation Pydantic → 422 Unprocessable Entity
```

---

## 🧪 TESTS ET VALIDATION

### Tests Frontend Obligatoires
```javascript
// 1. Test cycle complet
Vérifier: P1→T1→P2→T2→P3→T3→P5→T4→P1

// 2. Test goulot d'étranglement  
Config: P2=3, P4=0 → Vérifier T2 désactivée

// 3. Test ressource partagée
Vérifier: Un seul avion en P3 à la fois

// 4. Test simulation auto
Vérifier: Transitions aléatoires respectent les règles
```

### Tests Backend
```python
# 1. Test endpoints CRUD
- Créer/lire/modifier/supprimer simulations
- Validation des modèles Pydantic

# 2. Test logique métier
- Calcul transitions activées
- Exécution correcte des transitions  
- Persistance états et historique
```

---

## 📦 LIVRABLES ATTENDUS

### Structure de Fichiers
```
/app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PetriNetSimulator.jsx (composant principal) 
│   │   │   ├── PetriNetDiagram.jsx (visualisation)
│   │   │   ├── SimulationControls.jsx (contrôles)
│   │   │   ├── StatisticsPanel.jsx (métriques)
│   │   │   └── ui/ (shadcn components)
│   │   ├── mock/
│   │   │   └── mockData.js (données de test)
│   │   ├── hooks/
│   │   │   └── use-toast.js (notifications)
│   │   └── App.js (point d'entrée)
│   └── package.json
├── backend/  
│   ├── server.py (FastAPI app)
│   ├── models.py (Pydantic models)
│   ├── database.py (MongoDB connection)
│   └── requirements.txt
└── contracts.md (documentation API)
```

### Fonctionnalités Validées
- ✅ Interface moderne responsive  
- ✅ Simulation manuelle/automatique
- ✅ Visualisation temps réel
- ✅ Statistiques et métriques
- ✅ Persistance MongoDB
- ✅ Gestion d'erreurs complète
- ✅ Tests de vivacité/concurrence

---

## 🎯 CRITÈRES DE RÉUSSITE

### Technique
1. **Architecture:** Séparation claire frontend/backend
2. **Performance:** Simulation fluide avec 100+ transitions
3. **Fiabilité:** Aucune erreur React/DOM
4. **Persistance:** Sauvegarde automatique des états
5. **Responsivité:** Adaptation mobile/desktop

### Fonctionnel  
1. **Modélisation:** Réseau de Petri mathématiquement correct
2. **Vivacité:** Cycle complet possible indéfiniment
3. **Concurrence:** Gestion correcte des ressources partagées
4. **Analytics:** Métriques pertinentes et précises
5. **UX:** Interface intuitive et réactive

### Pédagogique
1. **Clarté:** Concepts de Petri visibles et compréhensibles
2. **Interactivité:** Expérimentation libre encouragée  
3. **Feedback:** Résultats immédiats et explicites
4. **Progression:** Du simple au complexe

---

## ⚡ OPTIMISATIONS AVANCÉES

### Performance
- Virtualisation des longues listes (historique)
- Memoization des calculs coûteux
- Lazy loading des statistiques
- Debouncing des animations

### UX Avancée  
- Raccourcis clavier (Espace=Step, Enter=Play/Pause)
- Drag & drop pour réorganiser (optionnel)
- Export données en CSV/JSON
- Thème sombre/clair automatique

### Monitoring
- Logs détaillés des erreurs
- Métriques d'usage (temps de session)
- Performance tracking (FCP, LCP)
- Health checks API

---

## 🚀 EXTENSIONS FUTURES

### Fonctionnalités Avancées
1. **Multi-passerelles:** Plusieurs ressources partagées
2. **Priorités:** Avions urgents, VIP, commerciaux
3. **Pannes:** Simulation de dysfonctionnements  
4. **IA:** Ordonnancement intelligent
5. **Temps réel:** WebSocket pour multi-utilisateurs

### Intégrations
1. **APIs externes:** Données météo/trafic
2. **Dashboard:** Monitoring opérationnel
3. **Formation:** Modules pédagogiques
4. **Export:** Rapports automatisés

---

*Ce prompt garantit la création d'une application complète, robuste et pédagogiquement efficace pour l'apprentissage des réseaux de Petri appliqués à la gestion aéroportuaire.*