import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set, update, get } from 'firebase/database';
import GameBoard from './Gameboard';

function Lobby({ user }) {
    const { code } = useParams();
    const [role, setRole] = useState(null);
    const [status, setStatus] = useState('joining');

    useEffect(() => {
        const lobbyRef = ref(db, `lobbies/${code}`);

        const unsub = onValue(lobbyRef, async (snap) => {
            const data = snap.val();

            if (!data) {
                // Create new lobby
                await set(lobbyRef, {
                    hostid: user.uid,
                    host: user.uid,
                    status: 'waiting'
                });
                setRole('host');
                setStatus('waiting');
            } else if (data.hostid === user.uid) {
                setRole('host');
                setStatus(data.status);
            } else if (data.guestid === user.uid) {
                setRole('guest');
                setStatus(data.status);
            } else if (!data.guest) {
                // Join as guest
                await update(lobbyRef, {
                    guestid: user.uid,
                    guest: user.uid,
                    status: 'started',
                    turn: 'host'
                });
                setRole('guest');
                setStatus('started');
                setHands();
            } else {
                setStatus('full');
            }
        });
        return () => unsub();
    }, [code, user.uid]);

    if (status === 'full') {
        return <div>Lobby is full</div>;
    }
    if (status === 'joining') {
        return <div>Joining lobby...</div>;
    }

    async function setHands() {
        const hostRef = ref(db, `lobbies/${code}/host`);
        const guestRef = ref(db, `lobbies/${code}/guest`);
        const initialHand = {
            card1: { rank: 'ace', isRevealed: false },
            card2: { rank: 'king', isRevealed: false },
            card3: { rank: 'queen', isRevealed: false },
            card4: { rank: 'jack', isRevealed: false },
            card5: { rank: 'joker', isRevealed: false },
            card6: { rank: 'joker', isRevealed: false },
        }
        await update(hostRef, {
            hand: initialHand,
            active1: null,
            active2: null
        });
        await update(guestRef, {
            hand: initialHand,
            active1: null,
            active2: null
        });
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Lobby Code: {code}</h2>
            <p>Status: {status}</p>
            <p>You are the {role}</p>
            {status === 'started' && <GameBoard code={code} role={role} />}
            {status === 'waiting' && role === 'host' && <p>Waiting for guest to join...</p>}
        </div>
    );
}

export default Lobby;