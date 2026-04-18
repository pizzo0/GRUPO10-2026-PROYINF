import Container from "./Container";

/**
 * contenedor para meter formularios.
 * 
 * - retorna el contenedor
*/
const FormContainer = ({children, className = "", ...props}) => {
    return (
        <Container
            className={`gap-3 h-100 fit-flex ${className}`}
            style={{
                maxWidth: 992,
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
            }}
            {...props}
        >
            {children}
        </Container>
    )
}

export default FormContainer;