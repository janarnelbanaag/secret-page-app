"use client";

import { useState } from "react";
import { createClient } from "../../../utils/supabase/client";
import { useAuth } from "../_context/AuthContext";

export default function Signup() {
    const {
        supabase,
        setAuthMode,
        setLoading,
        successMessage,
        setSuccessMessage,
        errorMessage,
        setErrorMessage,
    } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleSignup = async () => {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email,
                    password,
                });

            if (authError) {
                throw new Error(authError.message);
            }

            const { data: dbData, error: dbError } = await supabase
                .from("users")
                .insert({
                    id: authData.user.id,
                    email,
                    password,
                    name,
                });

            if (dbError) {
                throw new Error(dbError.message);
            }

            await supabase.auth.signOut();
            setSuccessMessage("Registered successfully! You can now login.");

            setTimeout(() => {
                setAuthMode("login");
                setLoading(false);
            }, 1000);
        } catch (err) {
            setErrorMessage(err.message);
            setTimeout(() => {
                setErrorMessage("");
            }, 3000);
        }
    };

    return (
        <div>
            <h1>Sign Up</h1>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
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
            <button onClick={handleSignup}>Sign Up</button>
            <span>Already have an account? </span>
            <button onClick={() => setAuthMode("login")}>Login</button>
        </div>
    );
}
