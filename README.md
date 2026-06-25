# Abhay Medical 💊

A modern pharmacy management dashboard built with React, TypeScript, and Zustand. Built to replace outdated pharmacy software with a clean, fast, and intuitive interface.

> Built for Abhay Medical, Ahilyanagar — a real family pharmacy.

---

## Features

- **Dashboard** — Live metrics for total medicines, low stock, critical items, and expiring soon. At-a-glance view of what needs attention today.
- **Inventory Management** — Add, search, and remove medicines. Track stock levels, batch numbers, expiry dates, and pricing with real-time status badges.
- **Prescription Tracking** — Log patient prescriptions with dynamic medicine lists, doctor info, and dispensing status.
- **Customer Management** — Maintain customer profiles with contact info, loyalty points, and total spend tracking.
- **Reorder Management** — Auto-generated list of critical and low stock medicines. Mark items as reordered with one click.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| State Management | Zustand |
| Routing | React Router v6 |
| Build Tool | Vite |

---

## Project Structure

```
AbhayMedical/
└── frontend/
    └── src/
        ├── components/        # Reusable UI components
        │   ├── AddMedicineForm.tsx
        │   ├── AddPrescriptionForm.tsx
        │   ├── AddCustomersForm.tsx
        │   └── InventoryTable.tsx
        ├── pages/             # Route-level page components
        │   ├── DashboardPage.tsx
        │   ├── InventoryPage.tsx
        │   ├── PrescriptionsPage.tsx
        │   ├── CustomersPage.tsx
        │   └── ReordersPage.tsx
        ├── store/             # Zustand global state
        │   ├── inventoryStore.ts
        │   ├── prescriptionStore.ts
        │   └── customerStore.ts
        ├── types/             # TypeScript interfaces
        │   ├── inventory.ts
        │   ├── prescription.ts
        │   └── customer.ts
        └── utils/             # Shared utility functions
            └── statusHelpers.ts
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Icyy/abhayMedical.git
cd abhayMedical/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Roadmap

- [x] Node.js + Express backend
- [x] PostgreSQL database integration
- [x] User authentication
- [x] React Hook Form validation
- [ ] Sales tracking and billing
- [ ] GST-compliant invoice generation
- [ ] WhatsApp notifications for customers
- [x] Loyalty points and discount system
- [x] Mobile responsive design
- [ ] Deployment on Vercel + Railway

---

## Screenshots

> Dashboard, Inventory, Prescriptions, Customers, and Reorders pages — coming soon.

---

## Author

Built by [@Icyy](https://github.com/Icyy) as a real-world pharmacy management solution and portfolio project.

---

## License

MIT
