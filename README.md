<div align="center">
  <br />
  <h1>Nexora 💸</h1>
  <p><strong>A Modern, Intelligent Expense Splitter & Bill Manager</strong></p>
  <p>Track group expenses, upload receipts for AI-driven parsing, and settle debts instantly with UPI integrations.</p>
</div>

---

## 📌 About Nexora
Nexora is a production-grade, highly responsive SaaS application designed to take the friction out of managing group expenses. 
Whether you're splitting the cost of a road trip, managing monthly roommate utilities, or dividing a restaurant bill item-by-item, Nexora handles it beautifully. It comes equipped with advanced AI features like voice-to-expense and image receipt parsing to make logging expenses effortless.

---

## ✨ Features
- **Smart Group Management:** Create, join, and manage expense groups with unique invite codes.
- **AI Receipt Scanning:** Upload a bill image and let Nexora automatically extract items, prices, merchants, and calculate individual splits.
- **Voice / NLP Expense Entry:** Hold the mic and say *"I paid 1200 for dinner, split equally with John"* and Nexora will instantly parse and structure the expense.
- **Advanced Splitting Logic:** Split equally, by percentage, by custom exact amounts, or granularly item-by-item.
- **Optimized Settlement Engine:** Nexora uses a simplified debt algorithm to minimize the number of transactions required to settle up.
- **UPI Integration:** Scan QR codes and settle debts seamlessly using UPI on supported devices.
- **Modern UI/UX:** Built with a clean, fully responsive, mobile-first design using Shadcn/ui components, Radix Primitives, and Tailwind CSS.

---

## 🚀 App Usage (How it works)

### Step 1: Create or Join a Group
- Sign in securely using **Google OAuth**.
- Create a new group (e.g., "Goa Trip") or join an existing one using an invite code.

### Step 2: Add Expenses
- Click **Add Expense**.
- Choose your input method: 
  - **Manual:** Enter description, amount, category, and paid-by manually.
  - **Voice:** Speak your expense details for auto-fill.
  - **Receipt Image:** Upload a receipt to automatically parse items and split them granularly.

### Step 3: Split the Bill
- Select who was involved in the expense.
- Choose a split method (Equal, Percentage, Custom Amount, or Item-wise).
- Submit the expense. Nexora will update balances in real time.

### Step 4: Settle Up
- Go to the **Balances** tab to see who owes whom.
- Nexora calculates the most efficient way to settle all debts.
- Click **Settle Up** and scan the generated UPI QR code to make your payment directly from your banking app.

---

## 🛠 Tech Stack

### Frontend Core
- **Framework:** [React 18](https://reactjs.org/)
- **Build Tool:** [Vite](https://vitejs.dev/) (Lightning fast HMR and optimized production builds)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/) (Headless, accessible UI primitives)
- **Icons:** [Lucide React](https://lucide.dev/) (Beautiful SVG iconography)

### Authentication & API
- **Auth:** `@react-oauth/google` for seamless Google Sign-In.
- **API Communication:** Custom Fetch wrapper with interceptors for JWT token attachment and error handling.

---

## 🏗 System Design & Architecture

### Component Hierarchy
The UI is strictly isolated into modular layout components for reusability:
- **`AppShell`**: The core layout wrapper. It intelligently renders a persistent `<aside>` Sidebar on Desktop, and an animated Shadcn `<Sheet>` drawer on Mobile/Tablet screens.
- **Modals**: Complex interactions (Add Expense, Settle Up, Create Group) are housed in reusable, portal-rendered Modals to prevent layout shifts and Z-index issues.

### State Management
- **Local/Component State**: React hooks (`useState`, `useEffect`, `useMemo`) are used to manage complex form states, like the heavily dynamic splits in the `AddExpenseModal`.
- **Global Data**: Data like active user, group lists, and JWT tokens are managed at the top level and cascaded securely to child components.

### API Integration
- A dedicated `apiClient.js` abstracts all `fetch` logic. It automatically attaches Bearer tokens, handles JSON parsing, and manages binary data specifically for the Receipt Image Upload API (`apiUploadBinary`).

### Responsive Strategy
- **Mobile First:** Uses Tailwind's default mobile-first breakpoint system (`md:`, `lg:`).
- **Graceful Degradation:** Features like horizontal scrolling for tabs and Sheet-based off-canvas navigation ensure that the heavy dashboard data is perfectly readable on small touch devices without breaking layout grids.

---

## 🏁 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Nexora_frontend.git
   cd Nexora_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔧 Building for Production
To build the app for production, run:
```bash
npm run build
```
This will compile and optimize the assets into the `/dist` directory, ready to be served by any static host (Vercel, Netlify, AWS S3, etc).

---

<p align="center">
  Built with ❤️ for modern expense tracking.
</p>
