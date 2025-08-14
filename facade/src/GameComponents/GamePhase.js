import Hand from './Hand';
import Card from './Card';
import { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';


function GamePhase({ code, role, opponentRole, playerHand: remotePlayerHand, active1: remoteActive1, active2: remoteActive2, opponentHand: remoteOpponentHand, opponentActive1: remoteOpponentActive1, opponentActive2: remoteOpponentActive2, turn: remoteTurn }) {
    // Local state for slots and hands
    const [playerHand, setPlayerHand] = useState(remotePlayerHand);
    const [active1, setActive1] = useState(remoteActive1);
    const [active2, setActive2] = useState(remoteActive2);
    const [opponentHand, setOpponentHand] = useState(remoteOpponentHand);
    const [opponentActive1, setOpponentActive1] = useState(remoteOpponentActive1);
    const [opponentActive2, setOpponentActive2] = useState(remoteOpponentActive2);
    const [turn, setTurn] = useState(remoteTurn);

    const [activeAbility, setActiveAbility] = useState(null);
    const [selectedCardKey, setSelectedCardKey] = useState(null);

    // Sync local state when remote changes
    useEffect(() => {
        setPlayerHand(remotePlayerHand);
    }, [remotePlayerHand])

    useEffect(() => {
        setActive1(remoteActive1);
    }, [remoteActive1])

    useEffect(() => {
        setActive2(remoteActive2);
    }, [remoteActive2])

    useEffect(() => {
        setOpponentHand(remoteOpponentHand);
    }, [remoteOpponentHand])

    useEffect(() => {
        setOpponentActive1(remoteOpponentActive1);
    }, [remoteOpponentActive1])

    useEffect(() => {
        setOpponentActive2(remoteOpponentActive2);
    }, [remoteOpponentActive2])

    useEffect(() => {
        setTurn(remoteTurn);
    }, [remoteTurn])

    async function handleSwap(active) {
        console.log('attempting swap');
        console.log()
        const selectedCard = playerHand[selectedCardKey];

        console.log('active1 global is', active1);
        const currentActive = (active === 'active1' ? active1 : active2);
        // Update local state with new active card
        if (currentActive === 'active1') {
            setActive1({ key: selectedCardKey, card: selectedCard });
        } else {
            setActive2({ key: selectedCardKey, card: selectedCard });
        }

        // Remove new card card from local hand
        setPlayerHand(prev => {
            const updated = { ...prev };
            delete updated[selectedCardKey];
            return updated;
        });

        // Push updates to Firebase
        const updates = {
            // move active card to active slot
            [`${role}/${active}`]: { key: selectedCardKey, card: selectedCard },
            // remove active card from hand
            [`${role}/hand/${selectedCardKey}`]: null,
            // return old active card to hand
            [`${role}/hand/${currentActive.key}`]: currentActive.card,
            [`turn`]: opponentRole
        }

        await update(ref(db, `lobbies/${code}`), updates);

        // Clear selections
        setSelectedCardKey(null);
    }

    const handleJackClick = () => {
        return;
    }

    const handleQueenClick = () => {
        return;
    }

    const handleKingClick = () => {
        return;
    }

    function handleActiveAbility() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <button style={{ height: '25px', width: '30px' }}
                    onClick={handleJackClick}>
                    J
                </button>
                <button style={{ height: '25px', width: '30px' }}
                    onClick={handleQueenClick}>
                    Q
                </button>
                <button style={{ height: '25px', width: '30px' }}
                    onClick={handleKingClick}>
                    K
                </button>
            </div>
        )
    }

    const handleHandClick = (cardKey) => {
        if (turn !== role) {
            return;
        }
        setSelectedCardKey(prevKey => prevKey === cardKey ? null : cardKey);
    }

    const handleActiveClick = (active) => {
        if (turn !== role) {
            return;
        }
        if (selectedCardKey) {
            handleSwap(active);
        } else {
            setActiveAbility(active);
        }
    }

    function displayPlayerHand() {
        return (
            <Hand
                hand={playerHand}
                playerRole={role}
                ownerRole={role}
                selectedCardKey={selectedCardKey}
                handleCardClick={handleHandClick}
            />
        )
    }

    function displayOpponentHand() {
        return (
            <Hand
                hand={opponentHand}
                playerRole={role}
                ownerRole={opponentRole}
            />
        )
    }

    function displayActiveCards() {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', paddingBottom: '10px' }}>
                {activeAbility === 'active1' && handleActiveAbility()}
                <Card
                    ownerRole={role}
                    playerRole={role}
                    card={active1?.card}
                    handleCardClick={() => handleActiveClick('active1')}
                />
                <Card
                    ownerRole={role}
                    playerRole={role}
                    card={active2?.card}
                    handleCardClick={() => handleActiveClick('active2')}
                />
                {activeAbility === 'active2' && handleActiveAbility()}
            </div>
        )
    }

    function displayOpponentActiveCards() {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', paddingBottom: '10px' }}>
                <Card
                    ownerRole={opponentRole}
                    playerRole={role}
                    card={active1?.card}
                />
                <Card
                    ownerRole={opponentRole}
                    playerRole={role}
                    card={active2?.card}
                />
            </div>
        )
    }

    return (
        <div>
            <p>Turn: {turn}</p>
            {displayOpponentHand()}
            {displayOpponentActiveCards()}
            {displayActiveCards()}
            {displayPlayerHand()}
        </div>
    )

};

export default GamePhase;