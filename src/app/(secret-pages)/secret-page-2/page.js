"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/app/_context/AuthContext";
import DelLogoutBtn from "@/app/_components/DelLogoutBtn";
import ProtectedRoute from "@/app/_components/ProtectedRoute";
import SecretComponent from "@/app/_components/SecretComponent";

const SecretPage2 = () => {
    const {
        supabase,
        user,
        userData,
        setUserData,
        setSuccessMessage,
        setErrorMessage,
        handleLogout,
        handleDeleteAccount,
    } = useAuth();

    const [secret, setSecret] = useState("");

    useEffect(() => {
        if (userData?.secret) {
            setSecret(userData.secret);
        }
    }, []); // eslint-disable-line

    const handleUpdateSecret = async () => {
        if (!user) {
            return;
        }

        const { error } = await supabase
            .from("users")
            .update({ secret })
            .eq("id", user.id);

        if (error) {
            setErrorMessage(`Error: ${error.message}`);
        } else {
            setSuccessMessage("Secret updated successfully!");

            const { data, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (fetchError) {
                setErrorMessage(
                    `Error fetching updated data: ${fetchError.message}`
                );
            } else {
                setUserData(data);
            }
        }
    };

    return (
        <ProtectedRoute user={user}>
            <h1 className="text-3xl font-bold text-center mb-6">
                Secret Page 2
            </h1>
            {userData?.secret && (
                <div className="mb-4">
                    <p className="text-lg">This is your secret message:</p>
                    <p className="text-xl font-semibold">
                        &quot;{userData?.secret}&quot;
                    </p>
                </div>
            )}
            <SecretComponent
                handleUpdateSecret={handleUpdateSecret}
                secret={secret}
                setSecret={setSecret}
            />
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

export default SecretPage2;
