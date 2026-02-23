import { ILoggedUser } from "@/types/IUser";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import { persist } from "zustand/middleware";



// Define the state and actions type
interface AuthState {
    isAuthenticated: boolean;
    user: ILoggedUser | null; // User object or null if not authenticated
    login: (user: ILoggedUser) => void;
    logout: () => void;
}


// Create the Zustand store with typed state and actions
const useLoggedUserStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false, // Initial state
            user: null, // No user by default
            login: (user) => set({ isAuthenticated: true, user }), // Set user details and mark authenticated
            logout: () => {
                set({ isAuthenticated: false, user: null })

            }, // Clear user details and mark unauthenticated
        }), {
        name: "logged-user-store", // Key for localStorage
        partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }), // Specify what to persist
    }
    )
);

export default useLoggedUserStore;
