"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";

import Login from "../_auth/login";
import Signup from "../_auth/signup";

export default function Home() {
    const supabase = createClient();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authMode, setAuthMode] = useState("login");

    useEffect(() => {
        const checkUserSession = async () => {
            setLoading(true);
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
                setUser(data.session.user);
            }
            setLoading(false);
        };

        checkUserSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => {
            authListener?.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {!user ? (
                authMode === "login" ? (
                    <Login
                        onLoginSuccess={(user) => setUser(user)}
                        toggleAuthMode={() => setAuthMode("signup")}
                    />
                ) : (
                    <Signup
                        onSignupSuccess={(user) => setUser(user)}
                        toggleAuthMode={() => setAuthMode("login")}
                    />
                )
            ) : (
                <div>
                    <h1>Welcome, {user.email}</h1>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </div>
    );
}
