# Members Only 🔐

A full-stack authentication web app where users can sign up, log in, and post messages. Only verified members can see who wrote each post, keeping the author hidden from non-members.

🔗 **[Live Demo](https://members-only-2j7u.onrender.com)**

---

## Features

- User registration and login with session-based authentication
- Password hashing with **bcrypt**
- Passport.js strategies for local authentication
- Member-only access: only logged-in members can see message authors
- Admin role with ability to delete messages
- PostgreSQL database for persistent data storage

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** Passport.js, bcrypt
- **Database:** PostgreSQL
- **Template Engine:** EJS
- **Architecture:** MVC (Model-View-Controller)

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL

### Installation

```bash
# Clone the repository
git clone https://github.com/Cesare-V/Members-only.git
cd Members-only

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL and SESSION_SECRET in .env

# Run the app
node app.js
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
├── controllers/   # Route logic and business logic
├── db/            # Database queries and connection
├── routes/        # Express route definitions
├── views/         # EJS templates
└── app.js         # App entry point
```
