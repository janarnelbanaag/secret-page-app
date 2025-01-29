"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { useAuth } from "./_context/AuthContext";

import Login from "./_auth/login";
import Signup from "./_auth/signup";
import Link from "next/link";
import DelLogoutBtn from "./_components/DelLogoutBtn";

export default function Home() {
    const {
        supabase,
        user,
        setUser,
        userData,
        authMode,
        setAuthMode,
        loading,
        handleLogout,
        handleDeleteAccount,
    } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {!user ? (
                authMode === "login" ? (
                    <Login />
                ) : (
                    <Signup />
                )
            ) : (
                <div>
                    <h1>Welcome, {userData?.name}</h1>
                    <p>Here are your secret pages:</p>
                    <Link href="/secret-page-1">Go to Secret Page 1</Link>
                    <Link href="/secret-page-2">Go to Secret Page 2</Link>
                    <Link href="/secret-page-3">Go to Secret Page 3</Link>
                    <DelLogoutBtn
                        handleLogout={handleLogout}
                        handleDeleteAccount={handleDeleteAccount}
                        id={user.id}
                    />
                </div>
            )}
        </div>
    );
}
