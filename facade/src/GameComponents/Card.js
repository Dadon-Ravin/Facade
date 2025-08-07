function Card({ cardOwnerRole, playerRole, card }) {
    let color = playerRole === 'host' ? 'red' : 'black';
    let rank = card.rank;
    let isRevealed = card.isRevealed;
    const ownsCard = cardOwnerRole === playerRole;

    let display = rank;
    if ((!ownsCard)) {
        color = playerRole === 'host' ? 'black' : 'red';
        if (!isRevealed) {
            display = 'back';
        }
    }

    return (
        <img
            style={{ width: '100px', height: 'auto' }}
            src={`/cards/${color}/${color}_${display}.svg`} alt={`${color} ${display}`}
        />

    )
}
export default Card;