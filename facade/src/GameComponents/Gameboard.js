import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db } from '../firebase';
import SelectionPhase from './SelectionPhase';
import GamePhase from './GamePhase';

function GameBoard({ code, role }) {
    const opponentRole = role === 'host' ? 'guest' : 'host'

    const [playerHand, setPlayerHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [active1, setActive1] = useState(null);
    const [active2, setActive2] = useState(null);
    const [opponentActive1, setOpponentActive1] = useState(null);
    const [opponentActive2, setOpponentActive2] = useState(null);
    const [turn, setTurn] = useState(null);

    const [playerSelectionSubmitted, setPlayerSelectionSubmitted] = useState(false)
    const [opponentSelectionSubmitted, setOpponentSelectionSubmitted] = useState(false)
    const [status, setStatus] = useState('selection');

    // Subscribe to player state
    useEffect(() => {
        const playerRef = ref(db, `lobbies/${code}/${role}`);
        const unsub = onValue(playerRef, snap => {
            const val = snap.val();
            if (!val) return;
            setPlayerHand(val.hand || []);
            setActive1(val.active1 || null);
            setActive2(val.active2 || null);
            setPlayerSelectionSubmitted(Boolean(val.selectionSubmitted));
        });
        return () => unsub();
    }, [code, role]);

    // Subscribe to opponent state
    useEffect(() => {
        const opponentRef = ref(db, `lobbies/${code}/${opponentRole}`);
        const unsub = onValue(opponentRef, snap => {
            const val = snap.val();
            if (!val) return;
            setOpponentHand(val.hand || []);
            setOpponentActive1(val.active1 || null);
            setOpponentActive2(val.active2 || null);
            setOpponentSelectionSubmitted(Boolean(val.selectionSubmitted));
        });
        return () => unsub();
    }, [code, opponentRole]);

    // Subscribe to turn
    useEffect(() => {
        const turnRef = ref(db, `lobbies/${code}/turn`);
        const unsub = onValue(turnRef, snap => {
            setTurn(snap.val());
        });
        return () => unsub();
    }, [code]);

    // Subscribe to status
    useEffect(() => {
        const statusRef = ref(db, `lobbies/${code}/status`);
        const unsub = onValue(statusRef, snap => {
            setStatus(snap.val());
        });
        return () => unsub();
    }, [code])

    // Update status in Firebase once both selections are submitted
    useEffect(() => {
        if (playerSelectionSubmitted && opponentSelectionSubmitted && status === 'selection') {
            const statusRef = ref(db, `lobbies/${code}/status`);
            set(statusRef, 'started');
        }
    }, [playerSelectionSubmitted, opponentSelectionSubmitted, code, status]);

    if (status === 'selection') {
        return (
            <SelectionPhase
                code={code}
                role={role}
                hand={playerHand}
                active1={active1}
                active2={active2}
                selectionSubmitted={playerSelectionSubmitted}
            />
        )
    }
    return (
        <div style={{ marginTop: 20 }}>
            <GamePhase
                code={code}
                role={role}
                opponentRole={opponentRole}
                playerHand={playerHand}
                active1={active1}
                active2={active2}
                opponentHand={opponentHand}
                opponentActive1={opponentActive1}
                opponentActive2={opponentActive2}
                turn={turn}
            />
        </div>
    );
}

export default GameBoard;