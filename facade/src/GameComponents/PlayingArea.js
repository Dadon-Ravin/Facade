import Hand from './Hand';
import Card from './Card';
import { useState } from 'react';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase';

function PlayingArea({ code, role, hand, active1, active2, opponentHand, opponentActive1, opponentActive2, turn }) {
    const opponentRole = role === 'host' ? 'guest' : 'host';
    const isTurn = role === turn;

    const displayPlayerHand = () => {
        return (
            <Hand hand={hand} playerRole={role} ownerRole={role} selectedCardKey={selectedCardKey} handleCardClick={handleHandClick} />
        );
    };

    const displayOpponentHand = () => {
        return (
            <Hand hand={opponentHand} playerRole={role} ownerRole={opponentRole} />
        );
    }

    const [selectedCardKey, setSelectedCardKey] = useState(null);

    const handleHandClick = async (cardKey) => {
        if (!isTurn) {
            return;
        }
        setSelectedCardKey(cardKey);
    }

    const handleActiveClick = async (active) => {
        if (!isTurn) {
            return;
        }

        if (selectedCardKey) {
            const selectedCard = hand[selectedCardKey];
            const activeCard = active === 'active1' ? active1 : active2;
            // return current active card to hand
            await update(ref(db, `lobbies/${code}/${role}/hand`), { [activeCard.key]: activeCard.card })

            // replace active card with new card
            await update(ref(db, `lobbies/${code}/${role}/${active}`), {
                key: selectedCardKey,
                card: selectedCard
            });

            // remove new active card from hand
            await set(ref(db, `lobbies/${code}/${role}/hand/${selectedCardKey}`), null)

            // reset selected card
            setSelectedCardKey(null);

            // update turn
            await update(ref(db, `lobbies,${code}`), opponentRole)
        }
    }

    const displayPlayerActives = () => {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Card playerRole={role} ownerRole={role} card={active1} />
                <Card playerRole={role} ownerRole={role} card={active2} />
            </div>
        )
    }

    const displayOpponentActives = () => {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Card playerRole={role} ownerRole={opponentRole} card={opponentActive1} handleActiveClick={handleActiveClick} />
                <Card playerRole={role} ownerRole={opponentRole} card={opponentActive2} handleActiveClick={handleActiveClick} />
            </div>
        )
    }

    return (
        <div>
            <p>turn: {turn}</p>
            {displayOpponentHand()}
            {displayOpponentActives()}
            {displayPlayerActives()}
            {displayPlayerHand()}
        </div>
    )
};

export default PlayingArea;