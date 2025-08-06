import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue, set, update, get } from 'firebase/database';
import GameBoard, { gameBoard } from './Gameboard';

function Lobby({ user }) {
    const { code } = useParams();
    const [role, setRole] = useState(null);
    const [status, setStatus] = useState('joining');

    useEffect(() => {
        const lobbyRef = ref(db, `lobbies/${code}`);
        const hostRef = ref(db, `lobbies/${code}/host`);
        const guestRef = ref(db, `lobbies/${code}/guest`);

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
                await update(hostRef, {
                    hand: [['ace', false], ['king', false], ['queen', false], ['jack', false], ['joker1', false], ['joker2', false]],
                    active1: [],
                    active2: []
                });
                await update(guestRef, {
                    hand: [['ace', false], ['king', false], ['queen', false], ['jack', false], ['joker1', false], ['joker2', false]],
                    active1: [],
                    active2: []
                });
                setRole('guest');
                setStatus('started');
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