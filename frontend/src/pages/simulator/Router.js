import { Route } from 'react-router-dom';

import Simulator from './Simulator';

export const Router = () => {
    return (
        <Route
            path={"simular-credito"}
        >
            {Simulator()}
        </Route>
    );
}