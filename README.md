# CareerForge PHP API

This project contains the PHP API for the CareerForge mobile application.

CareerForge is being developed as a graduate employability platform. The mobile application will eventually communicate with the PHP API to retrieve and manage CareerForge data.

This version of the API is an initial prototype and uses temporary data for testing.

## Current Development Stage

The current API was created to establish the basic communication between the mobile application and the backend.

At this stage:

- No database connection is being used.
- Temporary/fake data is being used.
- API responses are returned in JSON format.
- The endpoints can be tested locally using XAMPP and Apache.

The current flow is:

React Native Mobile App
        ↓
    PHP API
        ↓
 Temporary Data
        ↓
   JSON Response

---

## Project Structure

```text
APICAREERFORGE/
│
├── opportunities.php
├── profiles.php
├── applications.php
└── README.md

IMPORTANT: XAMPP / localhost

When running the API with XAMPP, make sure **Apache is running**.

To test the opportunities endpoint, use:

text
http://localhost/opportunities.php