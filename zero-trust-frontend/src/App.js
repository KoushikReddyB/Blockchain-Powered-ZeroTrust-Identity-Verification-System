import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as FingerprintJS from '@fingerprintjs/fingerprintjs';

function App() {
    const [fingerprint, setFingerprint] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAddress, setUserAddress] = useState(null);

    useEffect(() => {
        const getFingerprint = async () => {
            const fpPromise = FingerprintJS.load();
            const fp = await fpPromise;
            const result = await fp.get();
            setFingerprint(result.visitorId);
        };
        getFingerprint();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3001/verify', { fingerprint });
            if (response.data.isValid) {
                setMessage('Login successful!');
                setIsLoggedIn(true);
                setUserAddress(response.data.userAddress);
            } else {
                setMessage('Login failed.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
        }
    };

    const handleRegister = async () => {
        try {
            const response = await axios.post('http://localhost:3001/register', { fingerprint });
            if (response.data.success) {
                setMessage('Registration successful! Please login.');
                setUserAddress(response.data.userAddress);
            } else {
                setMessage('Registration failed.');
            }
        } catch (error) {
            setMessage('Error: ' + error.message);
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
                    <button onClick={handleLogin}>Login</button>
                    <button onClick={handleRegister}>Register</button>
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