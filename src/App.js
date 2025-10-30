
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserHomePage from "./components/user/userHomePage";
import LoginScreen from './components/login/login';
import ResetPassWordScreen from './components/login/resetPassword';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserHomePage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path='/resetpassword' element={<ResetPassWordScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
