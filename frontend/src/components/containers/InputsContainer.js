import Surface from "./Surface";

/**
 * contenedor para meter inputs.
 * 
 * - retorna el contenedor
*/
const InputsContainer = ({children, className = "", ...props}) => (
    <Surface
        className={"p-4 rounded-4 " + className}
        {...props}>
        {children}
    </Surface>
);

export default InputsContainer;