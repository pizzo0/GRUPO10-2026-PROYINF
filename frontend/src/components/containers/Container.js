/**
 * contenedor generico, sin padding ni cosas extrañas,
 * solo display flex, en columna y un gap
 * 
 * - retorna el contenedor
*/
const Container = ({children, className = "", ...props}) => (
    <div className={`d-flex flex-column gap-2 ${className}`} {...props}>
        {children}
    </div>
)

export const ContainerRow = ({children, className = "", ...props}) => (
    <div className={`d-flex flex-row gap-2 ${className}`} {...props}>
        {children}
    </div>
)

export default Container;