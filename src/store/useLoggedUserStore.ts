import { ILoggedUser } from "@/types/IUser";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";



// Define the state and actions type
interface AuthState {
    isAuthenticated: boolean;
    user: ILoggedUser | null; // User object or null if not authenticated
    rememberMe: boolean;
    setRememberMe: (val: boolean) => void;
    login: (user: ILoggedUser) => void;
    logout: () => void;
}


// Create the Zustand store with typed state and actions
const useLoggedUserStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false, // Initial state
            user: null, // No user by default
            rememberMe: true, // Default to remembering user
            setRememberMe: (rememberMe) => set({ rememberMe }),
            login: (user) => set({ isAuthenticated: true, user }), // Set user details and mark authenticated
            logout: () => {
                set({ isAuthenticated: false, user: null });
                try {
                    sessionStorage.clear();
                } catch {
                    // Ignore storage access errors
                }
            }, // Clear user details and mark unauthenticated
        }), {
        name: "logged-user-store", // Key for localStorage
        partialize: (state) => ({
            isAuthenticated: state.isAuthenticated,
            user: state.user,
            rememberMe: state.rememberMe,
        }), // Specify what to persist
    }
    )
);

export default useLoggedUserStore;
