import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import SelectionPhase from './SelectionPhase';
import PlayingArea from './PlayingArea';

function GameBoard({ code, role, status }) {
    const opponentRole = role === 'host' ? 'guest' : 'host'
    const [playerHand, setPlayerHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [active1, setActive1] = useState(null)
    const [active2, setActive2] = useState(null)
    const [opponentActive1, setOpponentActive1] = useState(null)
    const [opponentActive2, setOpponentActive2] = useState(null)

    const [playerSelectionSubmitted, setPlayerSelectionSubmitted] = useState(false)
    const [opponentSelectionSubmitted, setOpponentSelectionSubmitted] = useState(false)

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
            const opponentHand = data?.[opponentRole]?.hand;
            if (opponentHand) {
                setOpponentHand(opponentHand);
            } else {
                handsLoaded = false;
            }
            setHandsLoaded(handsLoaded);
            setActive1(data?.[role]?.active1 || null);
            setActive2(data?.[role]?.active2 || null);
            setOpponentActive1(data?.[opponentRole]?.active1 || null);
            setOpponentActive2(data?.[opponentRole]?.active2 || null);

            setPlayerSelectionSubmitted(data?.[role]?.selectionSubmitted);
            setOpponentSelectionSubmitted(data?.[opponentRole]?.selectionSubmitted);
        });
        return () => unsubscrtibe();
    }, [role])

    if (playerSelectionSubmitted && opponentSelectionSubmitted) {
        status = 'started'
    }

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
                selectionSubmitted={playerSelectionSubmitted}
            />
        )
    }
    return (
        <div style={{ marginTop: 20 }}>
            <PlayingArea
                role={role}
                hand={playerHand}
                active1={active1.card}
                active2={active2.card}
                opponentHand={opponentHand}
                opponentActive1={opponentActive1.card}
                opponentActive2={opponentActive2.card}
            />
        </div>
    );
}

export default GameBoard;