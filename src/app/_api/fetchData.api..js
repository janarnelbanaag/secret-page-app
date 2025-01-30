export const fetchPendingUser = async (
    supabase,
    userId,
    offset = 0,
    limit = 10
) => {
    const end = offset + limit - 1;

    const { data, error } = await supabase
        .from("friends")
        .select("user_id")
        .eq("friend_id", userId)
        .eq("status", "pending")
        .range(offset, end);

    return { data, error };
};

export const fetchPendingUserData = async (
    supabase,
    pendingArray,
    offset = 0,
    limit = 10
) => {
    const end = offset + limit - 1;

    const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .in(
            "id",
            pendingArray.map((user) => user.user_id)
        );

    return { data, error };
};
