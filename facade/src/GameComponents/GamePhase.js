import Hand from './Hand';
import Card from './Card';
import { useState, useEffect } from 'react';
import { ref, update, set } from 'firebase/database';
import { db } from '../firebase';
import ChallengePrompt from './ChallengePrompt';
import ActionButton from './ActionButton';


function GamePhase({ code, role, opponentRole, playerHand: remotePlayerHand, active1: remoteActive1, active2: remoteActive2, opponentHand: remoteOpponentHand, opponentActive1: remoteOpponentActive1, opponentActive2: remoteOpponentActive2, turn: remoteTurn, action: remoteAction }) {
    // Local state for slots and hands
    const [playerHand, setPlayerHand] = useState(remotePlayerHand);
    const [active1, setActive1] = useState(remoteActive1);
    const [active2, setActive2] = useState(remoteActive2);
    const [opponentHand, setOpponentHand] = useState(remoteOpponentHand);
    const [opponentActive1, setOpponentActive1] = useState(remoteOpponentActive1);
    const [opponentActive2, setOpponentActive2] = useState(remoteOpponentActive2);
    const [turn, setTurn] = useState(remoteTurn);
    const [action, setAction] = useState(remoteTurn);

    const [selectActive, setSelectActive] = useState(null);
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

    useEffect(() => {
        setAction(remoteAction);
    }, [remoteAction])

    async function handleSwap(active) {
        console.log('attempting swap');
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

    async function handleJackReveal(cardKey) {
        console.log(cardKey);
        if (turn === role || action.card !== 'jack' || action.phase !== 'accepted') return;
        if (playerHand[cardKey].isRevealed === true) return;

        await update(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), { isRevealed: true });
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
        await set(ref(db, `lobbies/${code}/turn`), role);
    }
    async function handleChallengeSuccess(cardKey) {
        await set(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), null);
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
        await set(ref(db, `lobbies/${code}/turn`), opponentRole);
    }
    async function handleChallengeFail(cardKey) {
        await set(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), null);
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
        await set(ref(db, `lobbies/${code}/turn`), role);
    }

    function handleSelectActive() {
        return (
            <ActionButton code={code} selectActive={selectActive} />
        )
    }

    const handleHandClick = (cardKey) => {
        if (turn !== role || action.phase !== 'none') {
            return;
        }
        setSelectedCardKey(prevKey => prevKey === cardKey ? null : cardKey);
        setSelectActive(null);
    }

    const handleActiveClick = (active) => {
        if (turn !== role || action.phase !== 'none') {
            return;
        }
        if (selectedCardKey) {
            handleSwap(active);
        }
        else {
            setSelectActive(activeKey => activeKey === active ? null : active);
        }
    }

    function displayPlayerHand() {
        let handClick = null;
        if (turn === opponentRole && action.phase === 'accepted' && action.card === 'jack') {
            handClick = handleJackReveal
        }
        else if (turn === role && action.phase === 'challenge success') {
            handClick = handleChallengeSuccess
        }
        else if (turn === opponentRole && action.phase === 'challenge fail') {
            handClick = handleChallengeFail
        }
        else {
            handClick = handleHandClick
        }
        return (
            <Hand
                hand={playerHand}
                playerRole={role}
                ownerRole={role}
                selectedCardKey={selectedCardKey}
                handleCardClick={handClick}
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
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', position: 'relative', paddingBottom: '10px' }}>
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
                    {selectActive === 'active1' && turn === role && (
                        <div style={{
                            position: 'absolute',
                            right: '100%',
                            marginRight: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}>
                            {handleSelectActive()}
                        </div>
                    )}

                    {selectActive === 'active2' && turn === role && (
                        <div style={{
                            position: 'absolute',
                            left: '100%',
                            marginLeft: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }}>
                            {handleSelectActive()}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    function displayOpponentActiveCards() {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', paddingBottom: '10px' }}>
                <Card
                    ownerRole={opponentRole}
                    playerRole={role}
                    card={opponentActive1?.card}
                    selected={action.phase === 'action pushed' && turn === opponentRole && selectActive === 'active1'}
                />
                <Card
                    ownerRole={opponentRole}
                    playerRole={role}
                    card={opponentActive2?.card}
                    selected={action.phase === 'action pushed' && turn === opponentRole && selectActive === 'active2'}
                />
            </div>
        )
    }

    function displayChallengePrompt() {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {(action.phase === 'action pushed' && turn === opponentRole) && <ChallengePrompt action={action} code={code} role={role} opponentHand={opponentHand} opponentActive1={opponentActive1} opponentActive2={opponentActive2} />}
                {(action.phase === 'accepted' && action.card === 'jack' && turn === opponentRole) && <p>Choose an unrevealed card from your hand to reveal</p>}
            </div>
        )
    }

    function displayChallengeFail() {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {(action.phase === 'challenge fail' && turn === opponentRole) && <p>Challenge Failed, choose card to kill</p>}
                {(action.phase === 'challenge fail' && turn === role) && <p>Opponent challenged, waiting for them to kill a card</p>}
            </div>
        )
    }

    function displayChallengeSuccess() {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {(action.phase === 'challenge success' && turn === role) && <p>You were Challenged, choose card to kill</p>}
                {(action.phase === 'challenge success' && turn === opponentRole) && <p>Challenge successful, waiting for opponent to kill a card</p>}
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
            {displayChallengePrompt()}
            {displayChallengeFail()}
            {displayChallengeSuccess()}
        </div>
    )

};

export default GamePhase;