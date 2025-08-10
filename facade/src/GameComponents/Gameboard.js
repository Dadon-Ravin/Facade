import { useEffect, useState } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { db } from '../firebase';
import SelectionPhase from './SelectionPhase';
import GamePhase from './GamePhase';

function GameBoard({ code, role, status }) {
    const opponentRole = role === 'host' ? 'guest' : 'host';

    const [playerHand, setPlayerHand] = useState([]);
    const [opponentHand, setOpponentHand] = useState([]);
    const [active1, setActive1] = useState(null);
    const [active2, setActive2] = useState(null);
    const [opponentActive1, setOpponentActive1] = useState(null);
    const [opponentActive2, setOpponentActive2] = useState(null);
    const [turn, setTurn] = useState(null);
    const [playerSelectionSubmitted, setPlayerSelectionSubmitted] = useState(false)
    const [opponentSelectionSubmitted, setOpponentSelectionSubmitted] = useState(false)

    useEffect(() => {
        const gameRef = ref(db, `lobbies/${code}`);
        const unsubscrtibe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            // update game state
            setGameState(data);

            // try to start game only while status is selection
            if (status === 'selection') {
                startGame();
            }
        });
        return () => unsubscrtibe();
    }, [role])

    // sets 
    function setGameState(data) {
        // fetch and save values from database
        const playerHand = data?.[role]?.hand;
        const opponentHand = data?.[opponentRole]?.hand;
        const active1 = data?.[role]?.active1;
        const active2 = data?.[role]?.active2;
        const opponentActive1 = data?.[opponentRole]?.active1;
        const opponentActive2 = data?.[opponentRole]?.active2;

        const turn = data?.turn;

        // update states if they exist
        updateState(playerHand, setPlayerHand);
        updateState(opponentHand, setOpponentHand);
        updateState(active1, setActive1);
        updateState(active2, setActive2);
        updateState(opponentActive1, setOpponentActive1);
        updateState(opponentActive2, setOpponentActive2);
        updateState(turn, setTurn);

        // only tries to update selectionSubmitted if the status is selection
        if (status === 'selection') {
            const playerSelectionSubmitted = data?.[role]?.selectionSubmitted;
            const opponentSelectionSubmitted = data?.[opponentRole]?.selectionSubmitted;
            updateState(playerSelectionSubmitted, setPlayerSelectionSubmitted);
            updateState(opponentSelectionSubmitted, setOpponentSelectionSubmitted);
        }
    }

    // helper to check if data exists before setting state
    function updateState(value, setter) {
        if (value) {
            setter(value);
        }
    }

    // starts game if both players have submitted
    async function startGame() {
        if (playerSelectionSubmitted && opponentSelectionSubmitted) {
            // update status
            await set(ref(db, `lobbies/${code}/'status`), 'started');
            // create turn and set to host
            await update(ref(db, `lobbies/${code}`), {
                turn: 'host'
            });
        }
    }

    // display SelectionPhase while status is selection
    if (status === 'selection') {
        return (
            <SelectionPhase
                code={code}
                role={role}
                hand={playerHand}
                active1={active1}
                active2={active2}
                selectionSubmitted={playerSelectionSubmitted}
            />
        )
    }

    // display GamePhase when status changes to started
    return (
        <div style={{ marginTop: 20 }}>
            <GamePhase
                code={code}
                role={role}
                hand={playerHand}
                active1={active1.card}
                active2={active2.card}
                opponentHand={opponentHand}
                opponentActive1={opponentActive1.card}
                opponentActive2={opponentActive2.card}
                turn={turn}
            />
        </div>
    );
}

export default GameBoard;