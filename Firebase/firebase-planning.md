Firebase Planning
 
Purpose
 
Firebase will be used as the backend for our project. It will store user information and project data.
 
Firebase Authentication
 
We will use Firebase Authentication for:
 
- User registration
- User login
- User logout
 
Firebase Realtime Database
 
We will use the database to store:
 
- Learner information
- Tasks
- Support bookings
- Learner progress
- Game results
 
Firebase Structure
 
Firebase
│
├── Authentication
│   ├── Register
│   ├── Login
│   └── Logout
│
└── Realtime Database
    │
    ├── Users
    │   ├── Name
    │   ├── Email
    │   └── Role
    │
    ├── Tasks
    │   ├── Title
    │   ├── Description
    │   └── Status
    │
    ├── Bookings
    │   ├── Date
    │   └── Time
    │
    ├── Progress
    │   └── Percentage
    │
    └── Game Results
        ├── Score
        └── Date
 
How Firebase Will Be Used
 
1. The user registers or logs in.
2. Firebase checks the user's account.
3. The user accesses their dashboard.
4. Information is saved in the Firebase database.
5. The assessor can view learner information and progress.
 
Security
 
Only authorised users will be able to access the information they need.