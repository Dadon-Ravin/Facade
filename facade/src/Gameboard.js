import { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { db } from './firebase';
import Card from './Card';

function GameBoard({ code, role }) {
    const [turn, setTurn] = useState(null);
    const [hand, setHand] = useState([]);

    useEffect(() => {
        const gameRef = ref(db, `lobbies/${code}`);
        const unsubscrtibe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data?.turn) {
                setTurn(data.turn);
            }
            const playerHand = data?.[role]?.hand;
            if (playerHand) {
                setHand(playerHand);
            }
        });
        return () => unsubscrtibe();
    }, [code])

    const handleTurnChange = () => {
        if (role !== turn) return;

        const nextTurn = turn === 'host' ? 'guest' : 'host';
        const gameRef = ref(db, `lobbies/${code}`);
        update(gameRef, { turn: nextTurn })
    };

    const displayPlayerHand = () => {
        return (
            <div style={{ display: 'flex', gap: '10px' }}>
                {hand.map((card, idx) => (
                    <Card key={idx} card={card} role={role} side={role} />
                ))}
            </div>
        );
    };

    const displayOpponentHand = () => {
        return (
            <div style={{ display: 'flex', gap: '10px' }}>
                {hand.map((card, idx) => (
                    <Card key={idx} card={card} role={role} side={'otherRole'} />
                ))}
            </div>
        );
    };

    return (
        <div style={{ marginTop: 20 }}>
            <button onClick={handleTurnChange} disabled={role !== turn}>
                {turn}
            </button>
            {displayOpponentHand()}
            {displayPlayerHand()}
        </div>
    );
}

export default GameBoard;
