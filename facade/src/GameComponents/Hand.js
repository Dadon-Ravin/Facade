import Card from './Card';

function Hand({ hand, playerRole, ownerRole, selectedCardKey = null, handleCardClick = null }) {
    if (!hand) return null;

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', paddingBottom: '10px' }}>
            {Object.entries(hand).map(([key, card]) => {
                if (!card) return null;
                return (
                    <Card
                        key={key}
                        ownerRole={ownerRole}
                        playerRole={playerRole}
                        card={card}
                        selected={selectedCardKey === key}
                        handleCardClick={() => handleCardClick?.(key)}
                    />
                );
            })}
        </div>
    );
}

export default Hand;