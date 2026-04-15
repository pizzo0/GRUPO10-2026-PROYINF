import { Route } from 'react-router-dom';
import Apply from 'pages/apply/Apply';

export const Router = () => {
    return (
        <Route
            path={"solicitar-credito"}
        >
            {Apply()}
        </Route>
    )
}