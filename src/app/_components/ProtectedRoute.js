import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../_config/supabaseClient";

export default function ProtectedRoute({ children }) {
    const router = useRouter();

    useEffect(() => {
        const session = supabase.auth.getSession();
        if (!session) router.push("/login");
    }, [router]);

    return <>{children}</>;
}
