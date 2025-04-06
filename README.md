# Email Scheduler API

A RESTful API for scheduling emails using Agenda and Nodemailer.

## Features

- User authentication (register/login)
- Schedule emails to be sent at a specific time
- View all scheduled emails
- View a specific scheduled email
- Cancel a scheduled email
- Emails are sent using Nodemailer
- Jobs are scheduled using Agenda

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- SMTP server credentials (e.g., Gmail)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashish4824/futureblink-backend.git
   cd futureblink
   ```
2. Configure environment variables:
   
   Create a `.env` file and add the following:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/email-scheduler
   JWT_SECRET=your_jwt_secret_key
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

## API Endpoints

### Authentication

#### Register a new user
**POST** `/api/auth/register`

**Request Body:**
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```
**Response:**
```json
{
    "message": "User registered successfully",
    "token": "jwt_token_here"
}
```

#### User login
**POST** `/api/auth/login`

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
**Response:**
```json
{
    "message": "Login successful",
    "token": "jwt_token_here"
}
```

### Email Scheduling

#### Schedule an email
**POST** `/api/emails/schedule`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
    "recipient": "recipient@example.com",
    "subject": "Test Email",
    "body": "<p>This is a test email</p>",
    "scheduledTime": "2024-01-01T10:00:00Z"
}
```
**Response:**
```json
{
    "message": "Email scheduled successfully",
    "emailSchedule": {
        "id": "email_id",
        "recipient": "recipient@example.com",
        "subject": "Test Email",
        "body": "<p>This is a test email</p>",
        "scheduledTime": "2024-01-01T10:00:00Z",
        "status": "scheduled"
    }
}
```

#### Get all scheduled emails
**GET** `/api/emails`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
    "emails": [
        {
            "id": "email_id",
            "recipient": "recipient@example.com",
            "subject": "Test Email",
            "scheduledTime": "2024-01-01T10:00:00Z",
            "status": "scheduled"
        }
    ]
}
```

#### Get a specific scheduled email
**GET** `/api/emails/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
    "email": {
        "id": "email_id",
        "recipient": "recipient@example.com",
        "subject": "Test Email",
        "body": "<p>This is a test email</p>",
        "scheduledTime": "2024-01-01T10:00:00Z",
        "status": "scheduled"
    }
}
```

#### Cancel a scheduled email
**DELETE** `/api/emails/:id`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
    "message": "Email cancelled successfully"
}
```

## Error Responses

```json
{
    "message": "Error message describing the validation error"
}
```
```json
{
    "message": "Authentication required"
}
```
```json
{
    "message": "Resource not found"
}
```
```json
{
    "message": "Server error"
}
```

## Running Tests

Run the test suite using:
```bash
npm test
```

---
This documentation provides a comprehensive overview of all available API endpoints, including request/response formats, authentication requirements, and possible error responses. Each endpoint is documented with example requests and responses to make it easy for developers to understand and implement.

