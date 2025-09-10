function Card({ ownerRole, playerRole, card, selected = false, handleCardClick = null }) {
    if (!card) return null;

    const ownsCard = ownerRole === playerRole;
    let color = playerRole === 'host' ? 'red' : 'black'

    let display = card.rank;
    if ((!ownsCard)) {
        color = playerRole === 'host' ? 'black' : 'red';
        if (!card.isRevealed) {
            display = 'back';
        }
    }

    return (
        <div style={{ position: 'relative', width: '100px' }}>
            <img
                src={`/cards/${color}/${color}_${display}.svg`}
                alt={`${color} ${display}`}
                style={{
                    width: '100px',
                    height: 'auto',
                    ...(selected && { filter: 'drop-shadow(0 0 12px gold)' })
                }}
                onClick={() => handleCardClick?.()}
            />
            {ownsCard && card.isRevealed && (
                <img
                    src='/revealed_symbol.svg'
                    alt='revealed'
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '50%',
                        height: 'auto'
                    }}
                />
            )}
        </div>
    )
}
export default Card;