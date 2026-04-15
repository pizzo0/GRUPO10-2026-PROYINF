/**
 * contenedor para meter formularios.
 * 
 * - retorna el contenedor
*/
const FormContainer = ({children}) => {
    return (
        <div
            className="d-flex flex-column gap-3 h-100 fit-flex"
            style={{
                maxWidth: 992,
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
            }}
        >
            {children}
        </div>
    )
}

export default FormContainer;