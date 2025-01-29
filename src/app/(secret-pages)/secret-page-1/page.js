"use client";

import React, { useEffect } from "react";
import Link from "next/link";

import { useAuth } from "@/app/_context/AuthContext";
import DelLogoutBtn from "@/app/_components/DelLogoutBtn";
import ProtectedRoute from "@/app/_components/ProtectedRoute";

const SecretPage1 = () => {
    const { user, userData, handleLogout, handleDeleteAccount } = useAuth();

    return (
        <ProtectedRoute user={user}>
            <h1 className="text-3xl font-bold text-center mb-6">
                Secret Page 1
            </h1>
            {userData?.secret && (
                <div className="mb-4">
                    <p className="text-lg">This is your secret message:</p>
                    <p className="text-xl font-semibold">
                        &quot;{userData?.secret}&quot;
                    </p>
                </div>
            )}
            <DelLogoutBtn
                handleLogout={handleLogout}
                handleDeleteAccount={handleDeleteAccount}
                id={user?.id}
            />
            <Link
                href="/"
                className="block mt-6 text-blue-500 hover:text-blue-700"
            >
                Go to Home Page
            </Link>
        </ProtectedRoute>
    );
};

export default SecretPage1;
