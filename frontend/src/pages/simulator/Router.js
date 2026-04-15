import { Route } from 'react-router-dom';

import Simulator from './Simulator';
import Result from 'pages/simulator/Result';

export const Router = () => {
    return (
        <Route
            path={"simular-credito"}
        >
            {Simulator()}
            <Route path={"resultado"} element={<Result />} />
        </Route>
    );
}