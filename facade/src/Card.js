function Card({ side, role, card }) {
    let color = role === 'host' ? 'red' : 'black';
    let rank = card[0];
    rank = rank.replace(/[12]/g, '');
    let isRevealed = card[1];

    let display = rank;
    if ((side !== role)) {
        color = role === 'host' ? 'black' : 'red';
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