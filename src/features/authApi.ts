import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignupCredentials {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginResponse {
  token: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

interface SignupResponse {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  message: string;
  token: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
  resetLink?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
}

// Mock user storage for signup
const mockUsers: Record<string, any> = {};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://dummyjson.com/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginCredentials>({
      queryFn: async (credentials) => {
        // Check if user exists in mock storage (signup) - by username or email
        let user = mockUsers[credentials.username];
        
        // If not found by username, try to find by email
        if (!user) {
          user = Object.values(mockUsers).find(
            (u) => u.email === credentials.username || u.username === credentials.username
          );
        }

        if (user && user.password === credentials.password) {
          return {
            data: {
              token: `mock-token-${user.id}`,
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              gender: "other",
              image: "https://i.pravatar.cc/150?img=" + user.id,
            },
          };
        }

        // Try to login via API (demo credentials)
        try {
          const response = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            return {
              error: { status: response.status, data: "Invalid credentials" } as any,
            };
          }

          const data = await response.json();
          return { data };
        } catch (error) {
          return {
            error: { status: 500, data: "Login failed" } as any,
          };
        }
      },
    }),
    signup: builder.mutation<SignupResponse, SignupCredentials>({
      queryFn: async (credentials) => {
        // Check if user already exists
        if (mockUsers[credentials.username]) {
          return {
            error: { status: 400, data: "Username already exists" } as any,
          };
        }

        // Check if email already exists
        const emailExists = Object.values(mockUsers).some(
          (user) => user.email === credentials.email
        );
        if (emailExists) {
          return {
            error: { status: 400, data: "Email already exists" } as any,
          };
        }

        // Create new user
        const newUser = {
          id: Date.now(),
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
          firstName: credentials.firstName || "",
          lastName: credentials.lastName || "",
        };

        mockUsers[credentials.username] = newUser;

        return {
          data: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            message: "User created successfully",
            token: `mock-token-${newUser.id}`,
          },
        };
      },
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      queryFn: async (data) => {
        // Check if email exists in mock storage
        const user = Object.values(mockUsers).find((u) => u.email === data.email);

        if (user) {
          return {
            data: {
              message: "Password reset link sent to your email",
              resetLink: `https://example.com/reset?token=mock-token-${user.id}`,
            },
          };
        }

        // Return success anyway to not reveal if email exists
        return {
          data: {
            message: "If an account exists with this email, a reset link has been sent",
          },
        };
      },
    }),
    me: builder.query<User, void>({
      query: () => "auth/me",
    }),
  }),
});

export const { useLoginMutation, useSignupMutation, useForgotPasswordMutation, useMeQuery } = authApi;
