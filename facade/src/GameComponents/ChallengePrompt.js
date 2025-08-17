import { ref, set } from 'firebase/database'
import { db } from '../firebase'

function ChallengePrompt({ code, action, activeAbility }) {
    async function handleAccept() {
        await set(ref(db, `lobbies/${code}/action/phase`), 'accepted')
    }

    async function handleChallenge() {
        await set(ref(db, `lobbies/${code}/action/phase`), 'challenge')
    }

    return (
        <div style={{
            justifyContent: 'center', border: "2px solid black", height: '100px', width: '350px'
        }}>
            <p style={{ display: 'flex', justifyContent: 'center' }}>Your opponent is attempting to use {activeAbility} as a {action.card}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <button onClick={handleAccept}>Accept</button>
                <button onClick={handleChallenge}>Challenge</button>
            </div>
        </div>
    )
}

export default ChallengePrompt;