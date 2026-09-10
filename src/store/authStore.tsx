import useLoggedUserStore from "./useLoggedUserStore";

// Re-export useLoggedUserStore as default and named useAuthStore
// to unify authentication state and prevent store desynchronization
export default useLoggedUserStore;
export { useLoggedUserStore as useAuthStore };
