import Card from './Card';

function Hand({ hand, playerRole, ownerRole, selectedCardKey = null, onClick = null }) {
    const displayHand = () => {
        if (!hand) {
            return null;
        }
        if (onClick) {
            return Object.entries(hand).map(([key, card]) => (
                <Card
                    key={key}
                    ownerRole={ownerRole}
                    playerRole={playerRole}
                    card={card}
                    selected={selectedCardKey === key}
                    onClick={() => onClick(key)}
                />
            ));
        } else {
            return Object.entries(hand).map(([key, card]) => (
                <Card
                    key={key}
                    ownerRole={ownerRole}
                    playerRole={playerRole}
                    card={card}
                />
            ));
        }
    };

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {displayHand()}
        </div>
    )
}

export default Hand;