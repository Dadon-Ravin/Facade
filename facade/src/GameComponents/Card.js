function Card({ cardOwnerRole, playerRole, card, selected = false, handleCardClick = null }) {
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

    const borderStyle =
        selected ?
            { boxShadow: '0 0 10px 1px gold' } :
            {};

    const onCardClick = () => {
        if (handleCardClick) {
            handleCardClick();
        }
    }
    return (
        <div>
            <img
                style={{ width: '100px', height: 'auto', ...borderStyle }}
                src={`/cards/${color}/${color}_${display}.svg`} alt={`${color} ${display}`}
                onClick={onCardClick}
            />
        </div>
    )
}
export default Card;