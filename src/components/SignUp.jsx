// src/components/SignUp.jsx
import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth(); // Get the signUp function from our context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await signUp({ email, password });
      if (error) throw error;
      alert('Success! Please check your email for a verification link.');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUp;