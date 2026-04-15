const SpinnerGrow = ({children, className, style}) => (
    <div className={`spinner-grow ${className}`} style={style} role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
)

export default SpinnerGrow;