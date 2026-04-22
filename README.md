# Smart Campus Operations Hub 🎓

A professional, production-inspired web system for managing campus facilities and reporting incidents. Built for the **IT3030 – Programming Applications and Frameworks (PAF)** assignment at SLIIT.

## 🚀 Key Features

-   **Facility Management**: Real-time availability tracking and resource catalog.
-   **Advanced Booking System**: Conflict checking, recurring booking support, and multi-user reservation.
-   **Incident Reporting (Ticketing)**: Report equipment/facility issues with up to 3 image attachments.
-   **Admin Command Center**: Usage analytics, operational insights, and resource management.
-   **Real-time Notifications**: Instant alerts for booking status updates and ticket comments.
-   **Secure Access**: Role-Based Access Control (RBAC) with Google OAuth 2.0 integration.

## 🛠️ Technology Stack

-   **Backend**: Java 17, Spring Boot 3, Spring Security, MongoDB (Embedded for Dev).
-   **Frontend**: React 18, Axios, React Router, CSS3 (Modern Design System).
-   **Authentication**: Google Identity Services (OAuth 2.0).
-   **CI/CD**: GitHub Actions.

## 📦 Project Structure

```text
smart-campus-operations-hub/
├── backend/            # Spring Boot REST API
│   ├── src/            # Java source code
│   └── pom.xml         # Maven dependencies
├── frontend/           # React Web Application
│   ├── src/            # Components, Services, Styles
│   └── package.json    # NPM dependencies
└── .github/            # GitHub Actions Workflows
```

## ⚙️ Setup & Installation

### Prerequisites
-   Java 17 JDK
-   Node.js 18+
-   Maven 3.8+

### 1. Backend Setup
1.  Navigate to `backend/`
2.  Configure your Google Client ID in `src/main/resources/application.properties`.
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
    *Note: The project uses an embedded MongoDB for development, so no external database setup is required.*

### 2. Frontend Setup
1.  Navigate to `frontend/`
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file with:
    ```env
    REACT_APP_API_URL=http://localhost:8080/api
    REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
    ```
4.  Start the development server:
    ```bash
    npm start
    ```

## 🧑‍💻 Author & Attribution

-   **Project**: SLIIT PAF Assignment 2026
-   **Team**: [Your Names Here]
-   **Instructor**: [Instructor Name]

---
*Developed with ❤️ for a smarter campus.*
