import Container from "components/containers/Container";

/**
 * contenedor para meter inputs.
 * 
 * - retorna el contenedor
*/
const InputsContainer = ({children, className}) => (
    <Container className={"bg-light p-3 px-4 rounded-4 " + className}>
        {children}
    </Container>
);

export default InputsContainer;