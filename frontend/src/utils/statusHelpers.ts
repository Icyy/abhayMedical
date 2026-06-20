import type { Medicine } from "../types/inventory";
import type { Prescription } from "../types/prescription";

export const getStatusClass = (status: Medicine["status"]) => {
  if (status === "CRITICAL") return "bg-red-100 text-red-800";
  if (status === "LOW") return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};

export const getPresStatusClass = (status: Prescription["status"]) => {
  if (status === "PAID") return "bg-green-100 text-green-800";
  if (status === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
};