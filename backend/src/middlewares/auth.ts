import { Request, Response, NextFunction } from "express";

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

    if (!role || !ALL_VALID_ROLES.includes(role)) {
      return res.status(401).json({ message: "Unauthorized: Invalid user role." });
    }

    if (allowedRoles.includes(role)) {
      next();
    } else {
      return res.status(403).json({
        message: "Access Forbidden: You do not have permission for this action.",
      });
    }
  };
};

export const isAdmin = checkRole([ROLES.A1]);

export const isUser = checkRole([
  ROLES.A1,
  ROLES.D1,
  ROLES.D2,
  ROLES.R1,
]);

export const canAnnotate = checkRole([
  ROLES.A1,
  ROLES.D1,
  ROLES.D2,
]);