import { useState } from 'react';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase';
import Hand from './Hand';
import Card from './Card';
import Slot from './Slot';

function SelectionPhase({ code, role, hand, active1 = null, active2 = null, selectionSubmitted }) {
    const [selectedCardKey, setSelectedCardKey] = useState(null);
    // selects card in hand when clicked
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
            await update(ref(db, `lobbies/${code}/${role}/hand`), {
                [existingCard.key]: existingCard.card
            });
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

    const displayActives = () => {
        console.log(active1)
        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {active1 ? (
                    <Card
                        ownerRole={role}
                        playerRole={role}
                        card={active1?.card}
                        onClick={() => handleSlotClick("active1")}
                    />
                ) : (
                    <Slot onClick={handleSlotClick("active1")} />
                )}
                {active2 ? (
                    <Card
                        ownerRole={role}
                        playerRole={role}
                        card={active2.card}
                        onClick={() => handleSlotClick("active2")}
                    />
                ) : (
                    <Slot onClick={handleSlotClick("active2")} />
                )}
            </div>
        )
    }

    const bothSlotsFilled = active1 && active2;
    return (
        <div style={{ textAlign: 'center' }}>
            <h3>Selection Phase</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {displayActives()}
            </div>
            <br />
            <Hand
                hand={hand}
                playerRole={role}
                ownerRole={role}
                selectedCardKey={selectedCardKey}
                onClick={handleCardClick}
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