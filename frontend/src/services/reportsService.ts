import { apiRequest } from './api'

export const fetchSalesReport = (month: number, year: number) =>
  apiRequest(`/reports/sales?month=${month}&year=${year}`)

export const fetchPurchaseReport = (month: number, year: number) =>
  apiRequest(`/reports/purchase?month=${month}&year=${year}`)