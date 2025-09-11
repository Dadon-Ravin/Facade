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

        async function setupGame() {
            const hostRef = ref(db, `lobbies/${code}/host`);
            const guestRef = ref(db, `lobbies/${code}/guest`);
            const initialHand = {
                card1: { rank: 'ace', isRevealed: false },
                card2: { rank: 'king', isRevealed: false },
                card3: { rank: 'queen', isRevealed: false },
                card4: { rank: 'jack', isRevealed: false },
                card6: { rank: 'joker', isRevealed: false },
                card7: { rank: 'joker', isRevealed: false },

            }

            await Promise.all([
                update(hostRef, {
                    hand: initialHand,
                    active1: null,
                    active2: null,
                    selectionSubmitted: false
                }),
                update(guestRef, {
                    hand: initialHand,
                    active1: null,
                    active2: null,
                    selectionSubmitted: false
                })
            ]);
        }

        async function initLobby() {
            const snap = await get(lobbyRef);
            const data = snap.val();

            if (!data) {
                // Create new lobby as a host
                await set(lobbyRef, {
                    host: { hostid: user.uid },
                    guest: { guestid: 'none' },
                    status: 'waiting',
                    turn: 'host',
                    action: {
                        card: 'none',
                        phase: 'none',
                        active: 'none'
                    }
                });
                setRole('host');
                setStatus('waiting');
                return;
            }

            if (data.host.hostid === user.uid) {
                // Rejoin as host
                setRole('host');
                setStatus(data.status);
                return;
            }

            if (data.guest.guestid === user.uid) {
                // Rejoin as guest
                setRole('guest');
                setStatus(data.status);
                return;
            }

            if (data.guest.guestid === 'none') {
                // Join as new guest
                await update(lobbyRef, {
                    guest: { guestid: user.uid },
                    status: 'selection'
                });
                setRole('guest');
                setStatus('selection');
                await setupGame();
                return;
            }

            // Lobby is full
            setStatus('full');
        }

        initLobby();

        const unsub = onValue(lobbyRef, (snap) => {
            const data = snap.val();
            if (data) {
                setStatus(data.status);
            }
        });
        return () => unsub();
    }, [code, user.uid]);

    if (status === 'full') {
        return <div>Lobby is full</div>;
    }
    if (status === 'joining') {
        return <b className='prompt-text'>Joining lobby...</b>;
    }

    return (
        <div className='container'>
            {status === 'waiting' && <div className='lobby'>
                <p className='lobby-info' style={{ padding: '20px 0px 30px 0px' }}>Lobby Code: <b><b>{code}</b></b></p>
                <div className='circle-wait'></div>
                {status === 'waiting' && role === 'host' && <p className='lobby-info'
                    style={{ fontSize: '1.5em', padding: '30px 0px 20px' }}
                >Waiting for opponent to join...</p>}
            </div>}
            {(status === 'selection' || status === 'started') && <GameBoard code={code} role={role} />}
        </div>
    );
}

export default Lobby;