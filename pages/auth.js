import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function Auth() {
  // State for login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State for registration form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email: loginEmail,
      password: loginPassword,
    });

    if (result.error) {
      console.error(result.error);
    } else {
      // Redirect to the dashboard or home page
      window.location.href = '/dashboard';
    }
  };

  // Handle registration form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registerEmail,
        password: registerPassword,
        name: registerName,
      }),
    });

    if (response.ok) {
      // Redirect to login page after successful registration
      window.location.href = '/auth';
    } else {
      console.error('Registration failed');
    }
  };

  return (
    <div className="auth-container">
      {/* Login Form */}
      <div className="auth-form-container">
        <form onSubmit={handleLoginSubmit} className="auth-form">
          <h2>Login</h2>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="Email"
            required
            className="auth-input"
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Password"
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">Login</button>
        </form>
      </div>

      {/* Register Form */}
      <div className="auth-form-container">
        <form onSubmit={handleRegisterSubmit} className="auth-form">
          <h2>Register</h2>
          <input
            type="text"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            placeholder="Name"
            required
            className="auth-input"
          />
          <input
            type="email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            placeholder="Email"
            required
            className="auth-input"
          />
          <input
            type="password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            placeholder="Password"
            required
            className="auth-input"
          />
          <button type="submit" className="auth-button">Register</button>
        </form>
      </div>
    </div>
  );
}
