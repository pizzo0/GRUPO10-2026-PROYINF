import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'context/authContext';
import { Router as AppRoutes } from 'pages/Router';

import "flatpickr/dist/themes/material_blue.css";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes/>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;