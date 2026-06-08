import { create } from "zustand";

export interface UserInfo {
	sub: string;
	name?: string;
	given_name?: string;
	family_name?: string;
	email?: string;
	email_verified?: boolean;
	picture?: string;
}

interface AuthState {
	accessToken: string | null;
	userInfo: UserInfo | null;
	setAuth: (accessToken: string, userInfo: UserInfo) => void;
	reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: null,
	userInfo: null,
	setAuth: (accessToken, userInfo) => set({ accessToken, userInfo }),
	reset: () => set({ accessToken: null, userInfo: null }),
}));
