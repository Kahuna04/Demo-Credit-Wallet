# Demo Credit Wallet Service

### Project Overview:
Demo Credit is a mobile lending app that requires wallet functionality to facilitate loan disbursement, repayment, and fund transfers between users. This MVP (Minimum Viable Product) of the wallet service will allow users to create accounts, fund their wallets, transfer funds to other users, and withdraw funds.

### Tech Stack:
- NodeJS (LTS version)
- KnexJS ORM
- MySQL database
- TypeScript

### Features:
#### User Account Management:
- Users can create an account with basic information.

#### Wallet Funding:
- Users can fund their wallet using various payment methods.

#### Funds Transfer:
- Users can transfer funds from their wallet to another user's wallet.

#### Withdrawal:
- Users can withdraw funds from their wallet to an external account.

### Implementation Details:
#### Authentication:
- A faux token-based authentication system will be implemented for basic security.

#### Database Design:
- MySQL database will be used with appropriate tables for users, wallets, transactions, etc. An ER diagram is provided below for reference.

#### API Design:
- RESTful API endpoints will be designed using NodeJS and TypeScript.

#### Transaction Management:
- Proper transaction scoping will be used to ensure data consistency during fund transfers and withdrawals.

#### Unit Testing:
- Unit tests will be implemented using Jest for both positive and negative scenarios.

#### Documentation:
- Detailed README documentation will be provided, including setup instructions, API endpoints, and ER diagram.

### ER Diagram:
[ER Diagram](https://dbdesigner.page.link/npjPQzuGHGRfzXe56)

### Folder Structure:
- src/
  - controllers/
    - userController.ts
  - routes/
    - userRour.ts
  - config/
    - knexfile.ts
- server.ts
- .env.example
- .gitignore
- package.json




### Development Workflow:
1. Clone the repository.
2. Install dependencies using `npm install`.
3. Setup MySQL database and configure connection details in `src/config/knex.ts`.
4. Start the server using `npm run dev`.
5. Use provided API endpoints for testing.

### Commit History:
- Commit messages will follow a descriptive and concise format, summarizing the changes made in each commit.
