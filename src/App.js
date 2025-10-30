
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import UserHomePage from "./components/user/userHomePage";
import LoginScreen from './components/login/login';
import RegisterScreen from './components/login/register';
import OTP from './components/login/OTP';
import SendEmailScreen from './components/login/sendEmail';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<UserHomePage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path='/sendemail' element={<SendEmailScreen />} />
          <Route path='/register' element={<RegisterScreen />} />
          <Route path='/otp' element={<OTP />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
