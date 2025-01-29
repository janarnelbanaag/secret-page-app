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
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-4xl font-bold text-center mb-6">
                Secret Page App
            </h1>
            {!user ? (
                authMode === "login" ? (
                    <Login />
                ) : (
                    <Signup />
                )
            ) : (
                <div>
                    <h1 className="text-3xl font-bold text-center mb-4">
                        Welcome, {userData?.name}
                    </h1>
                    <p className="text-lg text-center mb-6">
                        Here are your secret pages:
                    </p>
                    <div className="space-y-4">
                        <Link
                            href="/secret-page-1"
                            className="block text-center text-blue-500 hover:text-blue-700 font-semibold"
                        >
                            Secret Page 1
                        </Link>
                        <Link
                            href="/secret-page-2"
                            className="block text-center text-blue-500 hover:text-blue-700 font-semibold"
                        >
                            Secret Page 2
                        </Link>
                        <Link
                            href="/secret-page-3"
                            className="block text-center text-blue-500 hover:text-blue-700 font-semibold"
                        >
                            Secret Page 3
                        </Link>
                    </div>
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
