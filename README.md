# Path Finder: A Trip & Expense Manager

Path Finder is a full-stack web application that lets you create, join, and share trips with friends, track trip details, manage expenses, split costs, and keep notes on activities. It integrates social features like friend requests and trip collaboration, along with analytics and a clean, responsive UI.

---

## Features

- **Trip Management**: Create, join, and share trips with unique trip codes.
- **Expense Tracking**: Log expenses, track who paid, and split costs.
- **Friends System**: Send, accept, and decline friend requests.
- **Trip & Expense Analytics**: Visualize trip data and expenses comparison.
- **Activity Notes**: Add and manage notes for trip activities per date.
- **User Authentication**: JWT-based auth with secure cookies.
- **Responsive Frontend**: Built with Material tailwind.

---

## Tech Stack

### Frontend
- **React** (with Vite)
- **Material Tailwind**
- **Recharts** for data visualizations

### Backend
- **Node.js** with **Express**
- **MongoDB** 
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Vitest** for unit and integration tests

### Docker
- Multi-service setup using **Docker Compose**
  - MongoDB container
  - Backend container (Express)
  - Frontend container (React)

---

## Setup & Development

### Clone the repository:
```bash
git clone https://github.com/sanjay004mk/travel-tracker.git
cd travel-tracker
```

### Run (Docker)
```bash
docker-compose up --build
```

### Run (Local)
```bash
npm install
npm run dev
```

- Frontend runs at `http://localhost:5173`
- Backend runs at `http://localhost:5050`
- Expects MongoDB to be accessible at `mongodb://localhost:27017/` with database `travel-tracker`

### Environment Variables

Backed uses specific environment files for development & testing: `.env.development`. If the file is not present, it falls back to `.env`

Example `.env` for backend:
```
MONGO_URI=mongodb://localhost:27017/
JWT_SECRET=supersecurekey
NODE_ENV=development
FRONT_END_URL=http://localhost:5173
PORT=5050
```

Example `.env` for frontend:
```
VITE_BACKEND_URL=http://localhost:5050
```

---

## Running Tests

### Backend Tests
Written using **Vitest** for routes with mock Mongoose models like so:
```javascript
vi.mock("../database/expense.js", () => ({
  default: {
    find: vi.fn()
  }
}));
```

```bash
cd backend
npm run test
```

Tests run automatically in **Jenkins** CI pipeline.

---

## Docker & Containerized testing

A `docker-test.yml` file is provided to run tests in a docker container
```bash
docker compose -f docker-test.yml up --build --abort-on-container-exit
```

---

## CI/CD & Jenkins Integration

- **Jenkins pipeline** configured to:
  1. Pull latest code
  2. Build Docker images
  3. Start containers
  4. Run Vitest tests inside the backend container
  5. Report test results

Jenkinsfile snippet:
```groovy
stage('Unit test') {
    steps {
        bat 'docker compose -f docker-test.yml up --build --abort-on-container-exit'
    }
}
```

---

## Screenshots

The home page provides an overview of the features provided by the site along with a nav bar to navigate the site
![home page](/screenshots/home.png)
The sign in and sign up page allow users to register and access their dashboards
![sign in](/screenshots/signin.png)
The dashboard shows an overview of the trips, allows creation of new trips or joining existing ones. The dashboard side-nav contains options to view favorites, compare trips, manage expenses and configure the dashboard's appearance
![dashboard](/screenshots/dashboard.png)
Users can see comparisons and metrics of their trips such as the total expenditure of each trips, the duration or the split up of expenses on the trip.
![compare](/screenshots/compare.png)
Users can also see an in detail view of the expenses that were incurred on the trips getting an overview of their total expenditure and identifying who they owe money to along with who owes them
![expenses](/screenshots/expenses.png)

