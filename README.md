# Student Management System

A comprehensive Student Management System with full authentication, designed to manage student information, fees, and semester details.

## Features

### Student Information
- Add, edit, and delete student records
- View detailed student profiles
- Search and filter students by name, ID, or course

### Fees Details
- Track student fee payments and dues
- Generate fee receipts
- View payment history per student
- Automated fee reminders

### Semester Details
- Manage semester schedules and subjects
- Assign students to semesters
- Track academic progress and grades

### Authentication & Security
- Secure login and registration for admins and users
- Role-based access control
- Password reset and recovery

## Tech Stack

- **Frontend:** React, Redux, Material UI
- **Backend:** Node.js, Express, MYSQL
- **Authentication:** JWT, bcrypt

## Getting Started

### Prerequisites
- Node.js & npm
- MYSQL Server
- Git

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/roshan-metrix/student-management-system.git
    ```

2. Install dependencies for frontend and backend:
    ```bash
    cd frontend
    npm install

    cd ../backend
    npm install
    ```

3. Configure environment variables in `backend/.env` and `frontend/.env`.

4. Start the backend server:
    ```bash
    npm start
    ```

5. Start the frontend app:
    ```bash
    npm start
    ```

## Folder Structure

```
Project/
├── frontend/   # React app for UI
├── backend/    # Express API server
└── README.md
```

## API Endpoints

- `/api/students` - Manage student records
- `/api/fees` - Manage fee details
- `/api/semesters` - Manage semester information
- `/api/auth` - Authentication routes

## Videos
- [Demo Video](demo.gif)

## License
This project is licensed under the [MIT License](license.txt).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Contact

For queries, contact [roshanpatel12309@gmail.com](mailto:roshanpatel12309@gmail.com).
