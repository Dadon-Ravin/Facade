import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import Hand from './Hand';
import SelectionPhase from './SelectionPhase';

function GameBoard({ code, role, status }) {
    const [playerHand, setPlayerHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [active1, setActive1] = useState(null)
    const [active2, setActive2] = useState(null)
    const [selectionSubmitted, setSelectionSubmitted] = useState(false)

    const [handsLoaded, setHandsLoaded] = useState(true);

    useEffect(() => {
        const gameRef = ref(db, `lobbies/${code}`);
        const unsubscrtibe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            let handsLoaded = true;

            const playerHand = data?.[role]?.hand;
            if (playerHand) {
                setPlayerHand(playerHand);
            } else {
                handsLoaded = false;
            }
            const opponentHand = data?.[role === 'host' ? 'guest' : 'host']?.hand;
            if (opponentHand) {
                setOpponentHand(opponentHand);
            } else {
                handsLoaded = false;
            }
            setHandsLoaded(handsLoaded);

            setActive1(data?.[role]?.active1 || null);
            setActive2(data?.[role]?.active2 || null);
            setSelectionSubmitted(data?.[role]?.selectionSubmitted);
        });
        return () => unsubscrtibe();
    }, [code, role])

    const displayPlayerHand = () => {
        return (
            <Hand hand={playerHand} playerRole={role} ownerRole={role} />
        );
    };

    const displayOpponentHand = () => {
        return (
            <Hand hand={opponentHand} playerRole={role} ownerRole={role === 'host' ? 'guest' : 'host'} />
        );
    };
    if (!handsLoaded) {
        return <div>Loading Cards...</div>;
    }
    if (status === 'selection') {
        return (
            <SelectionPhase
                code={code}
                role={role}
                hand={playerHand}
                active1={active1}
                active2={active2}
                selectionSubmitted={selectionSubmitted}
            />
        )
    }
    return (
        <div style={{ marginTop: 20 }}>
            {displayOpponentHand()}
            {displayPlayerHand()}
        </div>
    );
}

export default GameBoard;