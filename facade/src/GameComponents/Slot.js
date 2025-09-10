function Slot({ card, role, onClick }) {
    const color = role === 'host' ? 'red' : 'black'
    return (
        <div
            onClick={onClick}
            style={{
                width: "90px",
                height: "120px",
                border: "2px white dashed",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
                cursor: "pointer",
            }}
        >
            {card ? (
                <img
                    src={`/cards/${color}/${color}_${card.rank}.svg`}
                    alt={`${role === 'host' ? 'red' : 'black'} ${card.rank}`}
                    style={{ width: '100px', height: 'auto' }}
                />
            ) : (
                <p style={{ fontSize: '2em', color: 'white' }}>+</p>
            )}
        </div>
    );
}

export default Slot;