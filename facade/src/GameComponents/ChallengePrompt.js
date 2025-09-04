import { ref, set } from 'firebase/database'
import { db } from '../firebase'

function ChallengePrompt({ code, action, role, opponentHand, opponentActive1, opponentActive2 }) {
    // If you accept the action, the phase moves to accepted
    async function handleAccept() {
        await set(ref(db, `lobbies/${code}/action/phase`), 'accepted')
    }

    // If you accept the queen's action, the queen's action occurs and the turn is passed
    async function handleQueenAccept() {
        // Loop through your opponent's hand and unreveal any revealed cards
        for (var key of Object.keys(opponentHand)) {
            if (opponentHand[key].isRevealed) {
                opponentHand[key].isRevealed = false;
            }

        }
        if (opponentActive1.card.isRevealed) {
            opponentActive1.card.isRevealed = false;
        }
        if (opponentActive2.card.isRevealed) {
            opponentActive2.card.isRevealed = false;
        }

        // Update database to reflect the unrevealed cards
        await set(ref(db, `lobbies/${code}/${role === 'host' ? 'guest' : 'host'}/hand`), opponentHand);
        await set(ref(db, `lobbies/${code}/${role === 'host' ? 'guest' : 'host'}/active1`), opponentActive1);
        await set(ref(db, `lobbies/${code}/${role === 'host' ? 'guest' : 'host'}/active2`), opponentActive2);

        // Reset action and pass turn
        await set(ref(db, `lobbies/${code}/turn`), role);
        await set(ref(db, `lobbies/${code}/action/phase`), 'none');
        await set(ref(db, `lobbies/${code}/action/card`), 'none');

    }

    // If you challenge the action, the phase is set to 'challenge fail' or 'challenge success' depnding on the result
    async function handleChallenge() {
        let opponentCard = (action.active === 'active1' ? opponentActive1 : opponentActive2);
        console.log(opponentCard.card.rank, " posing as ", action.card);
        if (action.card === opponentCard.card.rank) {
            await set(ref(db, `lobbies/${code}/action/phase`), 'challenge fail')
        } else {
            await set(ref(db, `lobbies/${code}/action/phase`), 'challenge success')
        }
    }

    // Return button prompt for accepting or challenging an opponent action
    return (
        <div style={{
            justifyContent: 'center', border: "2px solid black", height: '100px', width: '350px'
        }}>
            {(action.card === 'jack' || action.card === 'queen') && <p style={{ display: 'flex', justifyContent: 'center' }}>Your opponent is attempting to use {action.active} as a {action.card}</p>}
            {(action.card === 'active1' || action.card === 'active2') && <p style={{ display: 'flex', justifyContent: 'center' }}>Your opponent is attempting to use {action.active} as a king on your {action.card}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={action.card === 'queen' ? handleQueenAccept : handleAccept}>Accept</button>
                <button onClick={handleChallenge}>Challenge</button>
            </div>
        </div>
    )
}

export default ChallengePrompt;