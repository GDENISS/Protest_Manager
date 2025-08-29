import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './components/contexts/DataContext';
import ProtestDashboard from './components/dashboard/ProtestDashboard';

function App() {
    return (
        <DataProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/" element={<ProtestDashboard />} />
                        {/* Add other routes as needed */}
                    </Routes>
                </div>
            </Router>
        </DataProvider>
    );
}

export default App;