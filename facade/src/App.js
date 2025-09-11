import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import Lobby from './GameComponents/Lobby';
import './index.css';

function Home({ user }) {
  const [codeInput, setCodeInput] = useState('');
  const navigate = useNavigate();

  // Generates a random 8-character lobby code
  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Handles creating a new lobby
  async function handleCreateLobby() {
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
  async function handleJoinLobby() {
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
    <div className='main-menu'>
      <title>Facade</title>
      <img
        src='/title.svg'
        alt='facade'
        style={{
          width: '50%',
          height: 'auto',
          padding: 50,
          paddingBottom: 100,
          filter: 'drop-shadow(10px 10px 0px #1c1c1cae)',
        }}
      />
      <button className='menu-button' onClick={handleCreateLobby}>Create Lobby</button>
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', position: 'relative' }}>
        <input className='lobby-input'
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value)}
          placeholder="  Enter Lobby Code"
        />
        <button className='menu-button' style={{
          width: '128px',
          padding: '10px 20px',
          position: 'absolute',
          left: '100%',
          marginLeft: '20px',
        }}
          onClick={handleJoinLobby}>
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
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <b className='prompt-text'>Loading...</b>;
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