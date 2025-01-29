"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";

export default function Login({ onLoginSuccess, toggleAuthMode }) {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        } else {
            onLoginSuccess(data.user);
        }
    };

    return (
        <div>
            <h1>Login</h1>
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
            <button onClick={toggleAuthMode}>
                Don&quot;t have an account? Sign Up
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}
