import { create } from "zustand";

export interface UserInfo {
	sub: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	email?: string;
	email_verified?: boolean;
	picture?: string;
	role: string;
}

interface AuthState {
	userInfo: UserInfo | null;
	setUserInfo: (userInfo: UserInfo) => void;
	reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	userInfo: null,
	setUserInfo: (userInfo) => set({ userInfo }),
	reset: () => set({ userInfo: null }),
}));
