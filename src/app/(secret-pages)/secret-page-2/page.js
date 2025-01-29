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
            <h1>Secret Page 2</h1>
            {userData?.secret && (
                <>
                    <p>This is your secret message:</p>
                    <p>&quot;{userData?.secret}&quot;</p>
                </>
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
            <Link href="/">Go to Home Page</Link>
        </ProtectedRoute>
    );
};

export default SecretPage2;
