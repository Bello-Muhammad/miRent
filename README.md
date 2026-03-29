## MIRENT

## Description
MiRent is a rental management system designed to help users easily find apartments for rent and enable property agents to connect with potential tenants. The platform provides features for agents to create and manage property listings with relevant details such as property type, rent amount, location, and contact information, while users can search available listings and contact agents directly through the provided details.

## Features
-> User authentication and authorization
-> Property listing creation and management.
-> Property search and filtering.
-> Property image upload support.
-> Input validation and request handling.
-> Chacing using Redis (making JWT token statefull)

## Tech Stack
-> Backend Framework: NestJs
-> Language: TypeScript
-> Database: PostgreSQL
-> ORM: Prisma
-> Validation: class-validator
-> Authentication: JWT
-> API Testing: Rest Client and Postman

## Project Structure
src/ 
 │──domain
  │── auth/
  │── helper/
  │── middleware/
  │── prisma/
  │── user/ 
  │── property/
  │── doains.module.ts
│── config/
│── app.module.ts
│── main.ts

## Core Modules
> Authentication Module

Handles user registration, login, token generation, and route protection.

> Users Module

Manages user profiles and account-related operations.

> Properties Module

Allows creation, update, deletion, and retrieval of rental property listings.

## Project setup
```bash
$ git clone <repository-url> 
$ cd mirent 
$ npm install
```

## Environment Variables

Create a .env file and configure:

DATABASE_URL=postgresql://username:password@127.0.0.1:PORT/dbname?schema=public
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

REDIS_URL='Redis://localhost:port'
Redis_TTL=36000000 <!-- 1hrs time to life -->
JWT_SECRET=your secret


## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Api Documentation
For the api documentation check for the folder "restApi" in the root of the project folder
<a href='./restApi'>restApi</a>

Author
Developed by Bello Muhammad Bello