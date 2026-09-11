import React from "react";
import LoginPage from "@/pages/v2/LoginPage";

export interface UserLoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export const UserLoginForm: React.FC<UserLoginFormProps> = () => {
  return <LoginPage />;
};

export default UserLoginForm;
