import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function ProtectedRoute({ user, children }) {
    if (!user) {
        redirect("/");
    }

    return <>{children}</>;
}
