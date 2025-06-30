# National University of Management - Room Scheduler

![NUM Logo](https://numregister.com/assets/img/logo/num.png)

A comprehensive room and class scheduling management system designed for the National University of Management. This application provides separate dashboards and functionalities for Administrators and Instructors, allowing for efficient management of university resources.

---

## ✨ Features

This project is a full-stack application built with Next.js and a separate backend API, featuring:

-   **Role-Based Dashboards**: Separate, tailored views for Administrators and Instructors.
-   **Admin Dashboard**: At-a-glance statistics on class assignments, room availability charts, and recent activity logs.
-   **Instructor Dashboard**: View assigned classes, today's schedule, and class-related statistics.
-   **Room Management**: A visual, grid-based interface for viewing room layouts by building and floor. Admins can edit room details like capacity and equipment.
-   **Schedule Management**:
    -   Dynamic weekly schedule view for individual rooms.
    -   Drag-and-drop interface for assigning classes to rooms.
    -   Smart swap functionality with confirmation prompts.
-   **Class & Instructor Management**: Full CRUD (Create, Read, Update, Delete/Archive) capabilities for classes and instructors.
-   **User Authentication**: Secure login, logout, and profile management powered by NextAuth.js. Includes forgot/reset password functionality with OTP email verification.
-   **Role-Based Access Control**: Middleware ensures that admins and instructors can only access their respective routes (`/admin/*` and `/instructor/*`).
-   **Real-time Updates**: Client-side data fetching with `useSWR` to keep schedule and room availability information constantly updated.
-   **Notifications**: A real-time notification system for both admins (e.g., room requests) and instructors (e.g., request status).
-   **PDF Generation**: Download class and room schedules as PDF files directly from the browser.
-   **Responsive Design**: A modern, responsive UI built with Tailwind CSS that works on all screen sizes.
-   **Light/Dark Mode**: Theme toggling for user preference, with automatic detection based on system settings.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.18.0 or later recommended)
-   [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/RoomScheduler-reach-api.git](https://github.com/your-username/RoomScheduler-reach-api.git)
    cd RoomScheduler-reach-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add the following variables.

    ```env
    # A secret key for NextAuth.js to sign tokens.
    # Generate a secret: `openssl rand -base64 32`
    NEXTAUTH_SECRET=your_nextauth_secret_here

    # The base URL of your backend API
    NEXT_PUBLIC_API_URL=[https://jaybird-new-previously.ngrok-free.app/api/v1](https://jaybird-new-previously.ngrok-free.app/api/v1)
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application will automatically redirect you to the login page.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) 14+ (App Router)
-   **Language**: JavaScript / JSX
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **Data Fetching**: [SWR](https://swr.vercel.app/) for client-side fetching and revalidation.
-   **API Communication**: [Axios](https://axios-http.com/)
-   **Charting**: [Chart.js](https://www.chartjs.org/) with `react-chartjs-2`
-   **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

---

## 📁 Key Directories

The project follows a standard Next.js App Router structure to organize its files logically.

-   `src/app/admin/`: Contains all pages and components specific to the Administrator dashboard.
-   `src/app/instructor/`: Contains all pages and components specific to the Instructor dashboard.
-   `src/app/api/`: Includes Next.js API routes used for authentication (`/auth`) and as a backend proxy (`/[...path]`).
-   `src/components/`: Home for shared, reusable React components used across the application, such as layouts, sidebars, and popups.
-   `src/services/`: Houses the data service files (`*.service.js`) responsible for communicating with the external backend API.
-   `public/`: Stores static assets like images and logos that are served directly.

---

## 🔐 Authentication & API Proxy

-   **Authentication**: Handled by `NextAuth.js`. The configuration in `src/app/api/auth/[...nextauth]/route.js` uses the `CredentialsProvider` to authenticate against the backend's `/auth/login` endpoint.
-   **API Proxy**: To avoid CORS issues and keep the backend URL centralized, client-side API calls are made to local Next.js API routes (e.g., `/api/room`). The route handler in `src/app/api/[...path]/route.js` then forwards these requests to the actual backend API defined in your environment variables.
-   **Protected Routes**: The `middleware.js` file protects the `/admin` and `/instructor` routes, ensuring only authenticated users with the correct role can access them.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.