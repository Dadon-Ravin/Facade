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
        <img
            src={`/cards/${color}/${color}_${display}.svg`}
            alt={`${color} ${display}`}
            style={{
                width: '100px',
                height: 'auto',
                ...(selected && { boxShadow: '0 0 10px 1px gold' })
            }}
            onClick={() => handleCardClick?.()}
        />
    )
}
export default Card;