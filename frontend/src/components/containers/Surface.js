import Container, { ContainerRow } from "./Container"

const Surface = ({className = "", ...props}) => (
    <Container
        className={`bg-primary bg-opacity-8 ${className}`}
        {...props}
    />
);

export const SurfaceRow = ({className = "", ...props}) => (
    <ContainerRow
        className={`bg-primary bg-opacity-8 ${className}`}
        {...props}
    />
);


export default Surface;