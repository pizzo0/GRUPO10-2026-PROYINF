import Container from "./Container";

/**
 * contenedor para meter titulos, texto, o nada.
 * 
 * Es para rellenar mas que nada, pero se puede usar para
 * lo ya mencionado.
 * 
 * - retorna el contenedor
*/
const FillContainer = ({children, className = "", ...props}) => {
    return (
        <Container
            className={`h-100 fit-flex justify-content-center align-items-center ${className}`}
            {...props}
        >
            {children ?? <div></div>}
        </Container>
    )
}

export default FillContainer;