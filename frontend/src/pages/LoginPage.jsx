import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

// 1. Create the component function wrapper
const LoginPage = () => {
  // 2. Call hooks and logic *inside* the component
  const { user, loginWithRedirect } = useAuth0();

  console.log("Current User", user);

  // 3. The 'return' statement must also be inside the component
  return (
    <div className="min-h-screen flex items-center justify-center">
        <button 
            onClick={() => loginWithRedirect()}
            className="w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
            Login with Redirect
        </button>
    </div>
  );
};

// 4. Export the component so other files can use it
export default LoginPage;