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
            <h1>Secret Page 1</h1>
            {userData?.secret && (
                <>
                    <p>This is your secret message:</p>
                    <p>&quot;{userData?.secret}&quot;</p>
                </>
            )}
            <DelLogoutBtn
                handleLogout={handleLogout}
                handleDeleteAccount={handleDeleteAccount}
                id={user?.id}
            />
            <Link href="/">Go to Home Page</Link>
        </ProtectedRoute>
    );
};

export default SecretPage1;
