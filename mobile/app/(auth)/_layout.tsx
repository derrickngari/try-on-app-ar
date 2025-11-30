import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: "modal" }}>
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: false,
          title: "Sign In",
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: false,
          title: "Sign Up",
        }}
      />
    </Stack>
  );
}