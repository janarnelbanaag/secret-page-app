"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../_context/AuthContext";

export default function Login() {
    const {
        supabase,
        setUser,
        setAuthMode,
        setLoading,
        successMessage,
        setSuccessMessage,
        errorMessage,
        setErrorMessage,
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setErrorMessage(error.message);
        } else {
            setUser(data.user);
        }

        setLoading(false);
    };

    const toggleRegister = () => {
        setAuthMode("signup");
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
            <span>Don&apos;t have an account? </span>
            <button onClick={toggleRegister}>Register</button>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
            )}
        </div>
    );
}
