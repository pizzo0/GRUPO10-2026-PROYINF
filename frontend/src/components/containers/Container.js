/**
 * contenedor generico, sin padding ni cosas extrañas,
 * solo display flex, en columna y un gap
 * 
 * - retorna el contenedor
*/
const Container = ({children, className, style}) => (
    <div className={`d-flex flex-column gap-2 ${className}`} style={style}>
        {children}
    </div>
)

export default Container;