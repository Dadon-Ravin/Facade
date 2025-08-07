import { useState, useEffect, use } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, set, push, get } from 'firebase/database';
import Lobby from './GameComponents/Lobby';

function Home({ user }) {
  const [codeInput, setCodeInput] = useState('');
  const navigate = useNavigate();

  // Generates a random 8-character lobby code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Handles creating a new lobby
  const handleCreateLobby = async () => {
    let code;
    let attempts = 0;
    let maxAttempts = 10;

    // Try to generate a unique lobby code
    while (attempts < maxAttempts) {
      code = generateCode();
      const lobbyRef = ref(db, `lobbies/${code}`);
      const snapshot = await get(lobbyRef);
      if (!snapshot.exists()) {
        navigate(`/lobby/${code}`);
        return;
      }
      attempts++;
    }
    alert('Failed to create lobby. Try again.');
  }

  // Handles joining an existing lobby
  const handleJoinLobby = async () => {
    const cleaned = codeInput.trim().toUpperCase();
    const lobbyRef = ref(db, `lobbies/${cleaned}`);
    const snapshot = await get(lobbyRef);
    // Check if the lobby exists
    if (snapshot.exists()) {
      navigate(`/lobby/${cleaned}`);
    } else {
      alert('Lobby not found.');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Lobby System</h2>
      <button onClick={handleCreateLobby}>Create Lobby</button>
      <div style={{ marginTop: 20 }}>
        <input
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="Enter Lobby Code"
        />
        <button onClick={handleJoinLobby} style={{ marginLeft: 10 }}>
          Join Lobby
        </button>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
      else {
        signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="lobby/:code" element={<Lobby user={user} />} />
      </Routes>
    </Router>
  )
}

export default App;
