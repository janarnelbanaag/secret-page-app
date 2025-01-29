"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "../../../utils/supabase/client";
import { deleteUser } from "../_helper/deleteUser";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const supabase = createClient();

    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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
        console.log("checking user session");
    }, []); // eslint-disable-line

    useEffect(() => {
        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                setError(error.message);
            } else {
                setUserData(data);
            }
        };

        if (user) fetchUserData();
    }, [user, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setErrorMessage("");
        setSuccessMessage("");
        setUser(null);
        setAuthMode("login");
    };

    const handleDeleteAccount = async (id) => {
        setLoading(true);

        const response = await deleteUser(id);

        if (!response.success) {
            setErrorMessage(response.error);
        }

        setLoading(false);
        setUser(null);
        setAuthMode("login");
    };

    return (
        <AuthContext.Provider
            value={{
                supabase,
                user,
                setUser,
                userData,
                setUserData,
                authMode,
                setAuthMode,
                loading,
                setLoading,
                successMessage,
                setSuccessMessage,
                errorMessage,
                setErrorMessage,
                handleLogout,
                handleDeleteAccount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
