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
        setSelectActive(null);
    }, [remoteTurn])

    useEffect(() => {
        setAction(remoteAction);
    }, [remoteAction])

    async function handleSwap(active) {
        const selectedCard = playerHand[selectedCardKey];

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

    // When a card in the hand is clicked during the jack's action, reveal that card and pass turn
    async function handleJackReveal(cardKey) {
        if (turn === role || action.card !== 'jack' || action.phase !== 'accepted') return;
        if (playerHand[cardKey].isRevealed === true) return;

        await update(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), { isRevealed: true });
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
        await set(ref(db, `lobbies/${code}/turn`), role);
    }

    async function handleKingAccept(cardKey) {
        if (playerHand) {
            let replacementCard = playerHand[cardKey];
            await update(ref(db, `lobbies/${code}/${role}/${action.card}`), {
                card: { isRevealed: replacementCard.isRevealed, rank: replacementCard.rank },
                key: cardKey
            });
            await set(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), null);
        } else {
            await set(ref(db, `lobbies/${code}/${role}/${action.card}`), null);
        }
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
        await set(ref(db, `lobbies/${code}/turn`), role);
    }

    async function handleKingClick(active) {
        await set(ref(db, `lobbies/${code}/action/card`), active);
    }

    async function replaceActive(cardKey) {
        let active = active1 === null ? 'active1' : 'active2';
        let replacementCard = playerHand[cardKey];
        await update(ref(db, `lobbies/${code}/${role}/${active}`), {
            card: { isRevealed: replacementCard.isRevealed, rank: replacementCard.rank },
            key: cardKey
        });

        if (action.phase === 'replace active success') {
            await set(ref(db, `lobbies/${code}/turn`), opponentRole);
        } else {
            await set(ref(db, `lobbies/${code}/turn`), role);
        }
        await set(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), null);
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
    }
    // If your opponent makes a challenge:
    // 1. your challenged card is revealed
    // 2. if the challenge is successful your action doesn't go through
    // 3. the revealed card dies
    // 4. if possible, replace the active card with one from your hand
    // 5. turn passes to your opponent
    // Turn not properly changing, permissions not properly restricted
    async function handleChallengeSuccess(cardKey) {
        console.log('replacing active');
        if (playerHand) {
            let replacementCard = playerHand[cardKey];
            await update(ref(db, `lobbies/${code}/${role}/${action.active}`), {
                card: { isRevealed: replacementCard.isRevealed, rank: replacementCard.rank },
                key: cardKey
            });
            await set(ref(db, `lobbies/${code}/${role}/hand/${cardKey}`), null);
        } else {
            await set(ref(db, `lobbies/${code}/${role}/${action.active}`), null);
        }
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');
        await set(ref(db, `lobbies/${code}/turn`), opponentRole);
    }

    // If you make a challenge:
    // 1. challenged card is revealed
    // 2. if you fail, action goes through
    // 3. you pick an active card to die
    // 4. if able, you replace the active card with on from your hand
    // 5. revealed card may be replaced by opponent
    // 6. turn passes to you
    async function handleChallengeFail(active) {
        await set(ref(db, `lobbies/${code}/${role}/${active}`), null);
        if (playerHand.length === 0) {
            await set(ref(db, `lobbies/${code}/action/phase`), 'none');
            await set(ref(db, `lobbies/${code}/action/card`), 'none');
            await set(ref(db, `lobbies/${code}/turn`), role);
            return;
        } else {
            await set(ref(db, `lobbies/${code}/action/phase`), 'replace active fail');
        }
    }

    // Display the buttons to select active ability
    function handleSelectActive() {
        return (
            <ActionButton code={code} selectActive={selectActive} />
        )
    }

    // Handles hand click when action phase is none
    const handleHandClick = (cardKey) => {
        if (turn !== role || action.phase !== 'none') {
            return;
        }
        setSelectedCardKey(prevKey => prevKey === cardKey ? null : cardKey);
        setSelectActive(null);
    }

    // Handles active click when action phase is none
    const handleActiveClick = (active) => {
        // if it's not your turn or an action is already happening, do nothing
        if (turn !== role || action.phase !== 'none') {
            return;
        }
        // if a card in the hand is already selected, swap it with the active card
        if (selectedCardKey) {
            handleSwap(active);
        }
        else {
            setSelectActive(activeKey => activeKey === active ? null : active);
        }
    }

    // Displays player's hand, conditionally changes the click function depending on action phase
    function displayPlayerHand() {
        let handClick = null;
        if (turn === opponentRole && action.phase === 'accepted' && action.card === 'jack') {
            handClick = handleJackReveal
        } else if (action.phase === 'replace active success' || action.phase === 'replace active fail') {
            handClick = replaceActive
        } else if (turn === role && action.phase === 'challenge success') {
            handClick = handleChallengeSuccess
        } else if (action.phase === 'accepted' && (action.card === 'active1' || action.card === 'active2') && turn === opponentRole) {
            handClick = handleKingAccept
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

    // Displays opponent's hand, no click functionality
    function displayOpponentHand() {
        return (
            <Hand
                hand={opponentHand}
                playerRole={role}
                ownerRole={opponentRole}
            />
        )
    }

    // Display's player's active cards, conditionally changes click functionality depending on action phase

    function displayActiveCards() {

        let activeClick = null;
        if (turn === opponentRole && action.phase === 'challenge fail') {
            activeClick = handleChallengeFail;
        } else {
            activeClick = handleActiveClick;
        }
        return (
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', position: 'relative', paddingBottom: '10px' }}>
                    <Card
                        ownerRole={role}
                        playerRole={role}
                        card={active1?.card}
                        handleCardClick={() => activeClick('active1')}
                    />
                    <Card
                        ownerRole={role}
                        playerRole={role}
                        card={active2?.card}
                        handleCardClick={() => activeClick('active2')}
                    />
                    {selectActive === 'active1' && turn === role && action.phase === 'none' && (
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

                    {selectActive === 'active2' && turn === role && action.phase === 'none' && (
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

    // Display opponent's active cards, no click functionality
    function displayOpponentActiveCards() {
        let opponentActiveClick = null;
        if (turn === role && action.phase === 'action pushed' && action.card === 'king') {
            opponentActiveClick = handleKingClick;
        }
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', paddingBottom: '10px' }}>
                <Card
                    ownerRole={opponentRole}
                    playerRole={role}
                    card={opponentActive1?.card}
                    selected={action.phase === 'action pushed' && turn === opponentRole && selectActive === 'active1'}
                    handleCardClick={() => opponentActiveClick('active1')}
                />
                <Card
                    ownerRole={opponentRole}
                    playerRole={role}
                    card={opponentActive2?.card}
                    selected={action.phase === 'action pushed' && turn === opponentRole && selectActive === 'active2'}
                    handleCardClick={() => opponentActiveClick('active2')}
                />
            </div>
        )
    }

    function displayPrompt() {
        // When a non-king action is pushed, display non-king challenge prompt to opponent
        if (action.phase === 'action pushed' && turn === opponentRole && action.card !== 'king') {
            return displayChallengePrompt();
        }

        // When jack action is accepted, prompt opponent to reveal a card
        if (action.phase === 'accepted' && action.card === 'jack') {
            return displayJackPrompt();
        }

        //When challenge fails, display appropriate prompt depending on role
        if (action.phase === 'challenge fail') {
            return displayChallengeFail();
        }

        // During challenge fail, prompt opponent to replace active card
        if (action.phase === 'replace active fail' && turn === opponentRole) {
            return displayReplaceActiveFail();
        }

        // When a challenge succeeds, display appropriate prompt depending on role
        if (action.phase === 'challenge success') {
            return displayChallengeSuccess();
        }

        // During challenge success, prompt challenged player to replace active card
        if (action.phase === 'replace active success' && turn === role) {
            return displayReplaceActiveSuccess();
        }

        // When a king action is pushed, choose which active card to target
        if (action.phase === 'action pushed' && turn === role && action.card === 'king') {
            return displayKingTargetPrompt();
        }

        // When a king action is accepted, prompt the targeted player to replace the targeted active card
        if (action.phase === 'accepted' && turn === opponentRole && (action.card === 'active1' || action.card === 'active2')) {
            return displayKingAcceptedPrompt();
        }
    }

    function displayChallengePrompt() {
        return (
            <ChallengePrompt action={action} code={code} role={role} opponentHand={opponentHand} opponentActive1={opponentActive1} opponentActive2={opponentActive2} />
        )
    }

    function displayJackPrompt() {
        if (turn === opponentRole) {
            return (
                <div className='prompt'>
                    <b className='prompt-text'>Choose an unrevealed card from your hand to reveal</b>
                </div>
            )
        } else {
            return (
                <div className='prompt'>
                    <b className='prompt-text'>Waiting for opponent to reveal</b>
                </div>
            )
        }
    }

    function displayChallengeFail() {
        if (turn === role) {
            return (
                <div className='prompt'>
                    <b className='prompt-text'>Opponent challenged, waiting for them to destroy an active card</b>
                </div>
            )
        }
        else {
            return (
                <div className='prompt'>
                    <b className='prompt-text'>Challenge Failed, choose an active card to destroy</b>
                </div>
            )
        }
    }

    function displayReplaceActiveFail() {
        return (
            <div className='prompt'>
                <b className='prompt-text'>choose a card from your hand to replace the active card</b>
            </div>
        )
    }

    function displayChallengeSuccess() {
        if (turn === role) {
            return (
                <div className='prompt'>
                    <b className='prompt-text'>You were Challenged, choose a card from your hand to replace your challenged card</b>
                </div>
            )
        }
        else {
            return (
                <div className='prompt'>
                    <b className='prompt-text'>Challenge successful, waiting for opponent to replace active card</b>
                </div>
            )
        }
    }

    function displayReplaceActiveSuccess() {
        return (
            <div className='prompt'>
                <b className='prompt-text'>choose a card from your hand to replace the active card</b>
            </div>
        )
    }


    function displayKingTargetPrompt() {
        return (
            <div className='prompt'>
                <b className='prompt-text'>Choose one of your opponent's active cards to target</b>
            </div>
        )
    }

    function displayKingAcceptedPrompt() {
        return (
            <div className='prompt'>
                <b className='prompt-text'>choose a card from your hand to replace your targeted card</b>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <div className=' gameboard'>
                {displayOpponentHand()}
                {displayOpponentActiveCards()}
                {displayActiveCards()}
                {displayPlayerHand()}
            </div>
            <div style={{ position: 'absolute', top: '100%', transform: 'translateY(-120%)' }}>
                {displayPrompt()}
            </div>
        </div>
    )

};

export default GamePhase;