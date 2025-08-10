import { useState } from 'react';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase';
import Hand from './Hand';

function Slot({ card, role, onClick }) {
    const color = role === 'host' ? 'red' : 'black'
    return (
        <div
            onClick={onClick}
            style={{
                width: "90px",
                height: "120px",
                border: "2px dashed gray",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: card ? "#eee" : "transparent",
                cursor: "pointer",
            }}
        >
            {card ? (
                <img
                    src={`/cards/${color}/${color}_${card.rank}.svg`}
                    alt={`${role === 'host' ? 'red' : 'black'} ${card.rank}`}
                    style={{ width: '100px', height: 'auto' }}
                />
            ) : (
                "+"
            )}
        </div>
    );
}

function SelectionPhase({ code, role, hand, active1 = null, active2 = null, selectionSubmitted }) {
    const [selectedCardKey, setSelectedCardKey] = useState(null);
    const handleCardClick = (cardKey) => {
        setSelectedCardKey(cardKey);
    }

    const handleSlotClick = async (slot) => {
        // If no card is selected, return
        // Else, get reference to the selected card
        if (!selectedCardKey) {
            return;
        }
        const selectedCard = hand[selectedCardKey];

        // If a card is already in the slot, return it to the hand
        const existingCard = slot === 'active1' ? active1 : active2;
        if (existingCard) {
            await update(ref(db, `lobbies/${code}/${role}/hand`), { [existingCard.key]: existingCard.card });
        }

        // Place selected card in the slot
        await update(ref(db, `lobbies/${code}/${role}/${slot}`), {
            key: selectedCardKey,
            card: selectedCard
        });

        // Remove the selected card from hand
        await set(ref(db, `lobbies/${code}/${role}/hand/${selectedCardKey}`), null);

        // Reset selected card
        setSelectedCardKey(null);
    };

    const handleSubmit = async () => {
        await update(ref(db, `lobbies/${code}/${role}`), {
            selectionSubmitted: true
        });
    }

    const bothSlotsFilled = active1 && active2;

    return (
        <div style={{ textAlign: 'center' }}>
            <h3>Selection Phase</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Slot card={active1?.card} role={role} onClick={() => handleSlotClick("active1")} />
                <Slot card={active2?.card} role={role} onClick={() => handleSlotClick("active2")} />
            </div>
            <br />
            <Hand
                hand={hand}
                playerRole={role}
                ownerRole={role}
                selectedCardKey={selectedCardKey}
                handleCardClick={handleCardClick}
            />
            <button
                onClick={handleSubmit}
                disabled={!bothSlotsFilled || selectionSubmitted}
            >
                {selectionSubmitted ? "Waiting for opponent..." : "Submit"}
            </button>
        </div>
    )
}

export default SelectionPhase;