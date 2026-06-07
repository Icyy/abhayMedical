import type { Medicine } from "../types/inventory";
import type { Prescription } from "../types/prescription";

export const getStatusClass = (status: Medicine["status"]) => {
  if (status === "critical") return "bg-red-100 text-red-800";
  if (status === "low") return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
};


export const getPresStatusClass = (status: Prescription["status"]) => {
  if (status === "paid") return "bg-green-100 text-green-800"
  if (status === "rejected") return "bg-red-100 text-red-800"
  return "bg-yellow-100 text-yellow-800"
}