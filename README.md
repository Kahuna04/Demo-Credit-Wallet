# Demo Credit Wallet Service

## Overview
Demo Credit Wallet Service is a wallet application that allows users to fund their accounts, transfer funds, and withdraw money. It includes features for user management, and authentication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
- [Documentation](#documentation)
- [E-R Diagram](#e-r-diagram)
- [Folder](#folder)


## Features

- User Registration and Authentication
- Account Funding
- Funds Transfer
- Withdrawal
- Input validation and error handling
- JWT-based Authentication

## Technologies

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MySQL, Knex.js ORM
- **Testing:** Jest
- **Other Libraries:** bcrypt, jsonwebtoken, body-parser

## Setup

### Requirements

- Node.js
- MySQL
- npm

### Installation

1. Clone the repository: `git clone <https://github.com/Kahuna04/Demo-Credit-Wallet.git>`
2. Install dependencies: `npm install`

### Configuration

1. Create a `.env` file in the root directory and add the necessary environment variables:

### Running the Application

To start the application, run:

```bash
npm start
```

## Usage

- Register a New User
- Log in an Existing User
- Fund Account
- Transfer Funds
- Withdraw Funds

### Documentation

Detailed API documentation is available and accessible via Swagger UI. To view documentation, click:

```bash
http://localhost:3000/docs
```

### ER Diagram:
![Screenshot (60)](https://github.com/user-attachments/assets/166a769f-fc69-424f-9973-ef1887ac7579)


### Folder Structure:
- src/
  - config/
    - knexfile.ts
    - logger.ts
  - controllers/
    - transactionController.ts
    - userController.ts
  - middlewares
    - authMiddleware.ts
  - routes/
    - transactionRoute.ts
    - userRoute.ts
  - server.ts
- tests\controllers
  - transactionController.test.ts
  - userController.test.ts
- .env.example
- .gitignore
- jest.config.ts
- package.json
- README.md
- tsconfig.spec.json

