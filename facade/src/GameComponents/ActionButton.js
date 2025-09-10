import { db } from '../firebase';
import { ref, update } from 'firebase/database';

function ActionButton({ code, selectActive }) {
    async function handleJackClick() {
        await update(ref(db, `lobbies/${code}/action`), {
            card: 'jack',
            phase: 'action pushed',
            active: selectActive
        });
    }

    async function handleQueenClick() {
        await update(ref(db, `lobbies/${code}/action`), {
            card: 'queen',
            phase: 'action pushed',
            active: selectActive
        });
    }

    async function handleKingClick() {
        await update(ref(db, `lobbies/${code}/action`), {
            card: 'king',
            phase: 'action pushed',
            active: selectActive
        });
    }


    return (

        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <button className='action-button'
                onClick={handleJackClick}
            >
                J
            </button>
            <button className='action-button'
                onClick={handleQueenClick}
            >
                Q
            </button>
            <button className='action-button'
                onClick={handleKingClick}
            >
                K
            </button>
        </div>
    )
}

export default ActionButton;