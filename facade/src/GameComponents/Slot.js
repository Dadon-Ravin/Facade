function Slot({ onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                width: "90px",
                height: "120px",
                border: "2px dashed gray",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "light grey",
                cursor: "pointer",
            }}
        >
            +
        </div>
    )
}

export default Slot;
