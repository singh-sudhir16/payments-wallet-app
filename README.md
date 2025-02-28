# Payment Wallet App

A full-stack Payment Wallet App that allows users to sign up, sign in, view their profile, add money to their wallet, transfer funds, and view their transaction history. The app uses a Node.js/Express backend with MongoDB (via Mongoose) and a React frontend. It includes secure authentication with JWT, password hashing with bcrypt, and input validation with Zod.

## Features

- **User Authentication:** Signup and signin with JWT authentication.
- **Password Security:** Passwords are hashed using bcrypt before being stored.
- **Input Validation:** Request bodies are validated using Zod.
- **Wallet Management:** 
  - View wallet balance (formatted to two decimal places).
  - Add money to wallet.
  - Transfer funds to other users.
- **Transaction History:** View detailed transaction history.
- **User Profile:** Update personal information and change password.
- **Robust Error Handling:** Graceful error responses and validations on both backend and frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (local instance or hosted service)

## Setup Instructions

### Backend Setup

1. **Clone the repository:**

   ```
   git clone https://github.com/singh-sudhir16/payments-wallet-app.git
   cd payments-wallet-app/backend
   ```
2. **Install dependencies:**
  ```
    npm install
  ```
3. **Create a .env file in the backend folder with the following environment variables:**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```
4. **Start the backend server:**
```
npx nodemon index.js
(This assumes you are using nodemon; otherwise, run node index.js.)
```
## Frontend Setup
Navigate to the frontend folder:
```
cd ../frontend
```
Install dependencies:
```
npm install
```
Start the frontend development server:
```
npm run dev
```
The frontend should now be running (commonly on http://localhost:5173).
## API Endpoints
### User Routes
#### POST /api/v1/user/signup: Create a new user account.
#### POST /api/v1/user/signin: Authenticate an existing user.
#### GET /api/v1/user/profile: Retrieve the authenticated user's profile.
#### PUT /api/v1/user: Update the user's profile.
#### PUT /api/v1/user/change-password: Change the user's password.
### Account Routes
#### GET /api/v1/account/balance: Retrieve the current wallet balance.
#### GET /api/v1/account/transactions: Retrieve the user's transaction history.
#### POST /api/v1/account/add: Add money to the wallet.
#### POST /api/v1/account/transfer: Transfer funds to another user.

### Contributing
#### Contributions are welcome! Please fork the repository and submit a pull request with your improvements or bug fixes. Make sure to test your changes thoroughly before #### submitting.

This README provides an overview of the project, outlines its features and tech stack
