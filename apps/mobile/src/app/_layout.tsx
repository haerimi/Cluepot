import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        })

        return () => subscription.unsubscribe();
    }, []);

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
        </Stack>
    );

}