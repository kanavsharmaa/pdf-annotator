import { Request, Response, NextFunction } from "express";

// Define your roles in one place. This avoids "magic strings" like "A1".
export const ROLES = {
  A1: "A1",
  D1: "D1",
  D2: "D2",
  R1: "R1",
};

const ALL_VALID_ROLES = Object.values(ROLES);


export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.header("X-User-Role");

    // 1. Check if role header even exists or is a valid role
    if (!role || !ALL_VALID_ROLES.includes(role)) {
      return res.status(401).json({ message: "Unauthorized: Invalid user role." });
    }

    // 2. Check if this valid role is allowed for this specific route
    if (allowedRoles.includes(role)) {
      next(); // Role is allowed, continue
    } else {
      return res.status(403).json({
        message: "Access Forbidden: You do not have permission for this action.",
      });
    }
  };
};


// Checks if the user is an Admin
export const isAdmin = checkRole([ROLES.A1]);

// Checks if the user is any valid user
export const isUser = checkRole([
  ROLES.A1,
  ROLES.D1,
  ROLES.D2,
  ROLES.R1,
]);