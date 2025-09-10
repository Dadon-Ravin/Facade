import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import Hand from './Hand';
import Slot from './Slot';

function SelectionPhase({ code, role, hand: remoteHand, active1: remoteActive1 = null, active2: remoteActive2 = null, selectionSubmitted }) {
    // Locate state for slots and hand
    const [hand, setHand] = useState(remoteHand);
    const [active1, setActive1] = useState(remoteActive1);
    const [active2, setActive2] = useState(remoteActive2);
    const [selectedCardKey, setSelectedCardKey] = useState(null);

    // Sync local state when remote changes (Firebase updates)
    useEffect(() => {
        setHand(remoteHand);
    }, [remoteHand]);

    useEffect(() => {
        setActive1(remoteActive1);
    }, [remoteActive1]);

    useEffect(() => {
        setActive2(remoteActive2)
    }, [remoteActive2]);

    const handleCardClick = (cardKey) => {
        setSelectedCardKey(prevKey => prevKey === cardKey ? null : cardKey);
    };

    const handleSlotClick = async (slot) => {
        if (!selectedCardKey) return;

        const selectedCard = hand[selectedCardKey];
        if (!selectedCard) return;


        // Determine card in selected slot
        const currentSlot = slot === 'active1' ? active1 : active2;

        // Update local state with new active card
        if (slot === 'active1') {
            setActive1({ key: selectedCardKey, card: selectedCard });
        } else {
            setActive2({ key: selectedCardKey, card: selectedCard });
        }

        // Remove new active card from local hand
        setHand(prev => {
            const updated = { ...prev };
            delete updated[selectedCardKey];
            return updated;
        });

        // Push updates to Firebase
        const updates = {
            [`${role}/${slot}`]: { key: selectedCardKey, card: selectedCard },
            [`${role}/hand/${selectedCardKey}`]: null
        };

        // If slot already had a card, return it to hand
        if (currentSlot) {
            updates[`${role}/hand/${currentSlot.key}`] = currentSlot.card;
        }

        await update(ref(db, `lobbies/${code}`), updates);

        // Clear selection
        setSelectedCardKey(null);
    }

    const handleSubmit = async () => {
        await update(ref(db, `lobbies/${code}/${role}`), { selectionSubmitted: true });
    }

    const bothSlotsFilled = active1 && active2;

    return (
        <div style={{ textAlign: 'center' }}>
            <h2 className='lobby-info' style={{ paddingBottom: '20px' }}>Selection Phase</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', paddingBottom: '20px' }}>
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
            <button className='submit-button'
                onClick={handleSubmit}
                disabled={!bothSlotsFilled || selectionSubmitted}
            >
                {selectionSubmitted ? "Waiting for opponent..." : "Submit"}
            </button>
        </div>
    )
}

export default SelectionPhase;