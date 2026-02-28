import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRoleName = (role: string): string => {
  if (!role) return "";
  return role
    .split("_")
    .slice(1)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export const formatUsername = (username: string): string => {
  if (!username) return "";
  
  // Extract username part if it's an email (before @)
  const usernamePart = username.split("@")[0];
  
  // Split by both underscore and dot, then filter out empty strings
  const parts = usernamePart.split(/[._]/).filter(part => part.length > 0);
  
  // Capitalize first letter of each part and join with space
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};