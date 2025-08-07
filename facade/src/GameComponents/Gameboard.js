import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';
import Hand from './Hand';

function GameBoard({ code, role }) {



    const [turn, setTurn] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);

    useEffect(() => {
        const gameRef = ref(db, `lobbies/${code}`);
        const unsubscrtibe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data?.turn) {
                setTurn(data.turn);
            }
            const playerHand = data?.[role]?.hand;
            if (playerHand) {
                setPlayerHand(playerHand);
            }
            const opponentHand = data?.[role === 'host' ? 'guest' : 'host']?.hand;
            if (opponentHand) {
                setOpponentHand(opponentHand);
            }
        });
        return () => unsubscrtibe();
    }, [code])

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

    return (
        <div style={{ marginTop: 20 }}>
            {displayOpponentHand()}
            {displayPlayerHand()}
        </div>
    );
}

export default GameBoard;
