# AL 7ALLAG 💈

AL 7ALLAG is a premium, modern barbershop web application built to streamline customer bookings and salon management. Designed with a sleek, dark-themed aesthetic, it offers a seamless experience for both customers and barbershop administrators.

## 🚀 Features

### For Customers:
*   **Dual Language Support:** Fully bilingual interface supporting both English and Arabic (RTL).
*   **Live Booking System:** Customers can seamlessly select services, available barbers, and pick open time slots.
*   **Smart Availability:** The calendar intelligently hides time slots that are already booked or blocked.

### For Administrators (Admin Dashboard):
*   **Secure Login:** Protected dashboard using Next.js server-side sessions.
*   **Manage Bookings:** View all appointments, sort by date/status, and update statuses (Pending, Confirmed, Cancelled).
*   **Automated WhatsApp Integration:** One-click button to open WhatsApp and send pre-filled confirmation/cancellation messages to customers.
*   **Manage Staff & Services:** Add, remove, or edit barbers and the services they provide.
*   **Block Time Slots:** Easily block out time slots for breaks, lunches, or vacations.

## 🛠️ Technology Stack

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Database:** [Firebase Firestore](https://firebase.google.com/) (Serverless NoSQL database)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom premium color tokens (Gold & Dark Mode).
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Language:** TypeScript

## ⚙️ Local Development Setup

To run this project on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/al-7allag.git
   cd al-7allag
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase credentials and Admin password:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment
This project is optimized to be deployed effortlessly on [Vercel](https://vercel.com/). Simply import the GitHub repository into your Vercel dashboard, paste your `.env.local` variables into the Environment Variables section, and click Deploy.
