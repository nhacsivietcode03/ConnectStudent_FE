
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserHomePage from "./components/user/userHomePage";
import LoginScreen from './components/login/login';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserHomePage />} />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
