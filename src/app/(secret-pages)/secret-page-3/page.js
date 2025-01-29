"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/app/_context/AuthContext";
import DelLogoutBtn from "@/app/_components/DelLogoutBtn";
import ProtectedRoute from "@/app/_components/ProtectedRoute";
import SecretComponent from "@/app/_components/SecretComponent";

const SecretPage3 = () => {
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
    const [users, setUsers] = useState([]);
    const [pendingList, setPendingList] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [pendingListCount, setPendingListCount] = useState(0);
    const [offset, setOffset] = useState(0);
    const [pendingOffset, setPendingOffset] = useState(0);
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [loading, setLoading] = useState(false);
    const limit = 10;

    useEffect(() => {
        if (userData?.secret) {
            setSecret(userData.secret);
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        const fetchCount = async () => {
            const { count, error } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true });

            if (error) {
                setErrorMessage(`Error: ${error.message}`);
                return;
            } else {
                setUsersCount(count - 1);
            }

            const { count: pendingCount, error: pendingCountError } =
                await supabase
                    .from("friends")
                    .select("user_id", { count: "exact" })
                    .eq("friend_id", user.id);

            if (pendingCountError) {
                setErrorMessage(`Error: ${pendingCountError.message}`);
                return;
            } else {
                setPendingListCount(pendingCount);
            }
        };

        fetchCount();
    }, [supabase]); // eslint-disable-line

    useEffect(() => {
        const fetchPendingList = async () => {
            const { data: pending, error: pendingError } = await supabase
                .from("friends")
                .select("user_id")
                .eq("friend_id", user.id)
                .eq("status", "pending");

            if (pendingError) {
                console.error("Error fetching pending list:", pendingError);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("id, name")
                .in(
                    "id",
                    pending.map((user) => user.user_id)
                );

            if (error) {
                setErrorMessage(`Error: ${error.message}`);
            } else {
                setPendingList(data);
            }
        };

        const fetchUsers = async () => {
            const { data: friends, error: friendsError } = await supabase
                .from("friends")
                .select("friend_id, user_id")
                .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

            if (friendsError) {
                console.error("Error fetching friends:", friendsError);
                return;
            }

            const friendIds = [
                ...new Set(
                    friends.flatMap((friend) => [
                        friend.user_id,
                        friend.friend_id,
                    ])
                ),
            ];

            let query = supabase
                .from("users")
                .select("id, name")
                .not("id", "eq", user.id);

            if (friendIds.length > 0) {
                query = query.not("id", "in", `(${friendIds.join(",")})`);
            }

            const { data: users, error: usersError } = await query;

            if (usersError) {
                setErrorMessage(`Error: ${usersError.message}`);
            } else {
                setUsers(users);
            }
        };

        fetchPendingList();
        fetchUsers();
    }, [offset, triggerFetch, supabase]); // eslint-disable-line

    const addFriend = async (friendId) => {
        const { error } = await supabase
            .from("friends")
            .insert([{ user_id: user.id, friend_id: friendId }]);

        if (error) {
            setErrorMessage(`Error: ${error.message}`);
        } else {
            setSuccessMessage("Friend added successfully!");
            setTriggerFetch(!triggerFetch);
        }
    };

    const acceptFriend = async (friendId) => {
        const { error } = await supabase
            .from("friends")
            .update({ status: "accepted" })
            .eq("friend_id", user.id)
            .eq("user_id", friendId);

        if (error) {
            setErrorMessage(`Error: ${error.message}`);
        } else {
            setSuccessMessage("Friend added successfully!");
            setTriggerFetch(!triggerFetch);
        }
    };

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

    // console.log(pendingList);
    // console.log(pendingListCount);

    return (
        <ProtectedRoute user={user}>
            <h1>Secret Page 3</h1>
            {userData?.secret && (
                <>
                    <p>This is your secret message:</p>
                    <p>&quot;{userData?.secret}&quot;</p>
                </>
            )}
            {usersCount > 0 && (
                <>
                    <p>Add Friends:</p>
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                {user.name}{" "}
                                <button onClick={() => addFriend(user.id)}>
                                    Add
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {usersCount > 10 && (
                <button onClick={() => setOffset((prev) => prev + limit)}>
                    Load More
                </button>
            )}
            {pendingListCount > 0 && (
                <>
                    <p>Friend Request:</p>
                    <ul>
                        {pendingList.map((user) => (
                            <li key={user.id + user.name}>
                                {user.name}{" "}
                                <button onClick={() => acceptFriend(user.id)}>
                                    Accept
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {pendingListCount > 10 && (
                <button
                    onClick={() =>
                        setOffsetPendlingList((prev) => prev + limit)
                    }
                >
                    Load More
                </button>
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

export default SecretPage3;
