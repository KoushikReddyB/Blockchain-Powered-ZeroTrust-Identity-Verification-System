import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';
import sha256 from 'js-sha256';

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fingerprintHash, setFingerprintHash] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAddress, setUserAddress] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);

    useEffect(() => {
        const getFingerprint = async () => {
            const fpPromise = FingerprintJS.load();
            const fp = await fpPromise;
            const result = await fp.get();
            const browser = navigator.userAgent;
            const fullFingerprint = result.visitorId + browser;
            const hashedFingerprint = sha256(fullFingerprint);
            setFingerprintHash(hashedFingerprint);
        };
        getFingerprint();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3001/login', { email, password, fingerprintHash });
            if (response.data.success) {
                setMessage('Login successful!');
                setIsLoggedIn(true);
                setUserAddress(response.data.userAddress);
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            setMessage('Invalid details');
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:3001/register', { email, password, fingerprintHash });
            if (response.data.success) {
                setMessage('Registration successful! Please login.');
                setShowRegisterForm(false);
            } else {
                setMessage('Registration failed.');
            }
        } catch (error) {
            setMessage('Registration failed.');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserAddress(null);
        setMessage('Logged out.');
    };

    return (
        <div>
            <h1>Zero Trust Identity Verification</h1>
            {!isLoggedIn ? (
                <div>
                    {!showRegisterForm && !showLoginForm && (
                        <div>
                            <button onClick={() => setShowLoginForm(true)}>Login</button>
                            <button onClick={() => setShowRegisterForm(true)}>Register</button>
                        </div>
                    )}

                    {showLoginForm && (
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={handleLogin}>Login</button>
                            <button onClick={() => setShowLoginForm(false)}>Cancel</button>
                        </div>
                    )}

                    {showRegisterForm && (
                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={handleRegister}>Register</button>
                            <button onClick={() => setShowRegisterForm(false)}>Cancel</button>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <p>Logged in as: {userAddress}</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
            <p>{message}</p>
        </div>
    );
}

export default App;