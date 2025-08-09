import Card from './Card';

function Hand({ hand, playerRole, ownerRole, selectedCardKey = null, handleCardClick = null }) {
    const displayHand = () => {
        if (!hand) {
            return null;
        }
        return Object.entries(hand).map(([key, card]) => (
            <Card
                key={key}
                cardOwnerRole={ownerRole}
                playerRole={playerRole}
                card={card}
                selected={selectedCardKey === key}
                handleCardClick={() => handleCardClick(key)}
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