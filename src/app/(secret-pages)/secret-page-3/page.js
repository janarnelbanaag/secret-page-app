"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/app/_context/AuthContext";
import DelLogoutBtn from "@/app/_components/DelLogoutBtn";
import ProtectedRoute from "@/app/_components/ProtectedRoute";
import SecretComponent from "@/app/_components/SecretComponent";
import {
    fetchPendingUser,
    fetchPendingUserData,
} from "@/app/_api/fetchData.api.";

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
    const [friendsList, setFriendsList] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [pendingListCount, setPendingListCount] = useState(0);
    const [friendsListCount, setFriendsListCount] = useState(0);
    const [visibleSecrets, setVisibleSecrets] = useState({});
    const [offset, setOffset] = useState(0);
    const [pendingOffset, setPendingOffset] = useState(0);
    const [friendsDataOffset, setFriendsDataOffset] = useState(0);
    const [triggerFetch, setTriggerFetch] = useState(false);
    const [loading, setLoading] = useState(false);

    const limit = 3;
    const end = offset + limit - 1;

    useEffect(() => {
        if (userData?.secret) {
            setSecret(userData.secret);
        }
    }, []); // eslint-disable-line

    useEffect(() => {
        const fetchCount = async () => {
            const { count: pendingCount, error: pendingCountError } =
                await supabase
                    .from("friends")
                    .select("user_id", { count: "exact" })
                    .eq("friend_id", user.id)
                    .eq("status", "pending");

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
        const fetchData = async () => {
            const { data: pending, error: pendingError } =
                await fetchPendingUser(supabase, user.id, pendingOffset, limit);

            if (pendingError) {
                setErrorMessage(`Error: ${pendingError.message}`);
                console.error("Error fetching pending list:", pendingError);
                return;
            }

            const { data, error } = await fetchPendingUserData(
                supabase,
                pending,
                pendingOffset,
                limit
            );

            if (error) {
                setErrorMessage(`Error: ${error.message}`);
                console.error("Error fetching pending user data :", error);
            } else {
                setPendingList((prevPendingList) => {
                    const newData = data.filter(
                        (newUser) =>
                            !prevPendingList.some(
                                (existingUser) => existingUser.id === newUser.id
                            )
                    );
                    return [...prevPendingList, ...newData];
                });
            }
        };

        const fetchUsers = async () => {
            const { data: friends, error: friendsError } = await supabase
                .from("friends")
                .select("friend_id, user_id, status")
                .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

            if (friendsError) {
                console.error("Error fetching friends:", friendsError);
                return;
            }

            const confirmedFriendIds = [
                ...new Set(
                    friends
                        .filter((friend) => friend.status == "accepted")
                        .flatMap((friend) => [friend.user_id, friend.friend_id])
                ),
            ];

            const friendIds = [
                ...new Set(
                    friends.flatMap((friend) => [
                        friend.user_id,
                        friend.friend_id,
                    ])
                ),
            ];

            setFriendsListCount(confirmedFriendIds.length);

            const { data: friendsData, error: friendsDataError } =
                await supabase
                    .from("users")
                    .select("id, name, secret")
                    .in(
                        "id",
                        confirmedFriendIds.filter((id) => id !== user.id)
                    )
                    .range(friendsDataOffset, end);

            if (friendsDataError) {
                console.error("Error fetching friends:", friendsError);
                return;
            } else {
                setFriendsList((prevFriendsData) => {
                    const newData = friendsData.filter(
                        (newUser) =>
                            !prevFriendsData.some(
                                (existingUser) => existingUser.id === newUser.id
                            )
                    );
                    return [...prevFriendsData, ...newData];
                });
            }

            let countQuery = supabase
                .from("users")
                .select("*", { count: "exact" })
                .not("id", "eq", user.id);

            if (friendIds.length > 0) {
                countQuery = countQuery.not(
                    "id",
                    "in",
                    `(${friendIds.join(",")})`
                );
            }

            const { count: uCount, error: uError } = await countQuery;

            if (uError) {
                setErrorMessage(`Error: ${uError.message}`);
                return;
            } else {
                setUsersCount(uCount);
            }

            let query = supabase
                .from("users")
                .select("id, name")
                .not("id", "eq", user.id);

            if (friendIds.length > 0) {
                query = query.not("id", "in", `(${friendIds.join(",")})`);
            }

            query = query.range(0, end);

            const { data: users, error: usersError } = await query;

            if (usersError) {
                setErrorMessage(`Error: ${usersError.message}`);
            } else {
                setUsers((prevUsers) => {
                    const newData = users.filter(
                        (newUser) =>
                            !prevUsers.some(
                                (existingUser) => existingUser.id === newUser.id
                            )
                    );
                    return [...prevUsers, ...newData];
                });
            }
        };

        fetchData();
        fetchUsers();
    }, [offset, pendingOffset, friendsDataOffset, triggerFetch, supabase]); // eslint-disable-line

    const addFriend = async (friendId) => {
        const { error } = await supabase
            .from("friends")
            .insert([{ user_id: user.id, friend_id: friendId }]);

        if (error) {
            setErrorMessage(`Error: ${error.message}`);
        } else {
            setSuccessMessage("Friend added successfully!");
            await setUsers((prevUsers) => {
                console.log(prevUsers);
                return prevUsers.filter((user) => user.id !== friendId);
            });
            setOffset(offset - 1);
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

    const toggleSecretVisibility = (friendId) => {
        setVisibleSecrets((prev) => ({
            ...prev,
            [friendId]: !prev[friendId],
        }));
    };

    return (
        <ProtectedRoute user={user}>
            <h1 className="text-3xl font-bold text-center mb-6">
                Secret Page 3
            </h1>
            {userData?.secret && (
                <div className="mb-4">
                    <p className="text-lg">This is your secret message:</p>
                    <p className="text-xl font-semibold">
                        &quot;{userData?.secret}&quot;
                    </p>
                </div>
            )}
            {friendsListCount > 0 && (
                <div className="mb-4">
                    <p className="text-lg font-semibold">Friends:</p>
                    <ul className="list-disc pl-5">
                        {friendsList.map((friend) => (
                            <li
                                key={friend.id + friend.name + friend.secret}
                                className="flex justify-between items-center mb-2"
                            >
                                {friend.name}{" "}
                                {visibleSecrets[friend.id] && friend.secret && (
                                    <span className="text-sm text-gray-600">
                                        - Secret Message: &quot;{friend.secret}
                                        &quot;
                                    </span>
                                )}
                                <button
                                    onClick={() =>
                                        toggleSecretVisibility(friend.id)
                                    }
                                    className="ml-2 text-blue-500 hover:underline"
                                >
                                    {visibleSecrets[friend.id]
                                        ? "Hide Secret"
                                        : "Show Secret"}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {friendsListCount > limit &&
                friendsListCount > friendsList.length && (
                    <button
                        onClick={() =>
                            setFriendsDataOffset((prev) => prev + limit)
                        }
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Load More
                    </button>
                )}
            {usersCount > 0 && (
                <div className="mt-6 w-60">
                    <p className="text-lg font-semibold">Add Friends:</p>
                    <ul className="list-disc pl-5">
                        {users.map((u) => (
                            <li
                                key={u.id}
                                className="flex justify-between items-center mb-2"
                            >
                                {u.name}{" "}
                                <button
                                    onClick={() => addFriend(u.id)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Add
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {usersCount > limit && usersCount > users.length && (
                <button
                    onClick={() => setOffset((prev) => prev + limit)}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Load More
                </button>
            )}
            {pendingListCount > 0 && (
                <div className="mt-6  w-60">
                    <p className="text-lg font-semibold">Friend Request:</p>
                    <ul className="list-disc pl-5">
                        {pendingList.map((user) => (
                            <li
                                key={user.id + user.name}
                                className="flex justify-between items-center mb-2"
                            >
                                {user.name}{" "}
                                <button
                                    onClick={() => acceptFriend(user.id)}
                                    className="text-green-500 hover:underline"
                                >
                                    Accept
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {pendingListCount > limit &&
                pendingListCount > pendingList.length && (
                    <button
                        onClick={() =>
                            setOffsetPendlingList((prev) => prev + limit)
                        }
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
            <Link
                href="/"
                className="block mt-6 text-blue-500 hover:text-blue-700"
            >
                Go to Home Page
            </Link>
        </ProtectedRoute>
    );
};

export default SecretPage3;
