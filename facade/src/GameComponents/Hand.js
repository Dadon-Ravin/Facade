import Card from './Card';

function Hand({ hand, playerRole, ownerRole }) {
    const displayHand = () => {
        return Object.entries(hand).map(([key, card]) => (
            <Card
                key={card}
                cardOwnerRole={ownerRole}
                playerRole={playerRole}
                card={card}
            />
        ));
    };

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            {displayHand()}
        </div>
    )
}

export default Hand;

