import Hand from './Hand';
import Card from './Card';

function PlayingArea({ role, hand, active1, active2, opponentHand, opponentActive1, opponentActive2 }) {
    const opponentRole = role === 'host' ? 'guest' : 'host'

    const displayPlayerHand = () => {
        return (
            <Hand hand={hand} playerRole={role} ownerRole={role} />
        );
    };

    const displayOpponentHand = () => {
        return (
            <Hand hand={opponentHand} playerRole={role} ownerRole={opponentRole} />
        );
    }

    const displayPlayerActives = () => {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Card playerRole={role} ownerRole={role} card={active1} />
                <Card playerRole={role} ownerRole={role} card={active2} />
            </div>
        )
    }

    const displayOpponentActives = () => {
        return (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Card playerRole={role} ownerRole={opponentRole} card={opponentActive1} />
                <Card playerRole={role} ownerRole={opponentRole} card={opponentActive2} />
            </div>
        )
    }

    return (
        <div>
            {displayOpponentHand()}
            {displayOpponentActives()}
            {displayPlayerActives()}
            {displayPlayerHand()}
        </div>
    )
};

export default PlayingArea;