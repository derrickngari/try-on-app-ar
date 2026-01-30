import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type User = {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  profilePic: string;
};

const USER_STORAGE_KEY = "elegant-ar-user";

// load user
const loadUser = async (): Promise<User | null> => {
  const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

// save user
const saveUser = async (user: User | null): Promise<User | null> => {
  if (user) {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  }

  return user;
};

export const authTokenRef = { current: "" as string | null };

export const setAuthToken = (token: string | null) => {
  authTokenRef.current = token;
};


// auth provide
export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();

  // load user on mount
  const userQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: loadUser,
    staleTime: Infinity,
  });
  const [user, setUser] = useState<User | null>(userQuery.data || null);

  // sync local state
  useEffect(() => {
    if (userQuery.data !== undefined) {
      setUser(userQuery.data);
      if (userQuery.data) {
        setAuthToken(userQuery.data.accessToken);
      }
    }
  }, [userQuery.data]);

  // sign in mutation
  const loginMutation = useMutation({
    mutationFn: async (newUser: User) => {
      await saveUser(newUser);
      return newUser;
    },

    onSuccess: (newUser) => {
      setUser(newUser);
      setAuthToken(newUser?.accessToken);
      console.log("Saving user credentials: ");
      queryClient.setQueryData(["auth-user"], newUser);
    },
  });

  // sign out
  const logoutMutation = useMutation({
    mutationFn: () => saveUser(null),
    onSuccess: () => {
      setUser(null);
      setAuthToken(null);
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
    },
  });

  const login = useCallback(
    (userData: User) => loginMutation.mutate(userData),
    [loginMutation]
  );

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  const isAuthenticated = !!user;

  // auto logout  on token expiry
  useEffect(() => {
    if (user?.accessToken) {
      const payload = JSON.parse(atob(user.accessToken.split(".")[1]));
      const exp = payload.exp * 1000;
      const timeout = exp - Date.now();

      if (timeout > 0) {
        const timer = setTimeout(() => logout(), timeout);
        return () => clearTimeout(timer);
      } else {
        logout();
      }
    }
  }, [user, logout]);

  return {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading: userQuery.isLoading,
    isLoggingIn: loginMutation.isPending,
    isLogginOut: logoutMutation.isPending,
    authTokenRef,
  };
});


