const Span = ({children, className}) => (
    <span className={`d-inline-flex align-items-center gap-1 ${className}`}>
        {children}
    </span>
)

export default Span;