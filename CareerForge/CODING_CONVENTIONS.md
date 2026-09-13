# CareerForge Coding Conventions

## 1. General

- Write clear, readable and maintainable code.
- Keep functions and files focused on one responsibility.
- Avoid unnecessary duplication.
- Use meaningful names instead of abbreviations.
- Do not commit passwords, API keys or other secrets to GitHub.

## 2. PHP

### Variables

Use camelCase for variables.

```php
$userName;
$studentProfile;
$careerGoal;


Avoid:
$user_name;
$StudentName;
$usr;
```

### Functions:
Use camelCase and descriptive names.

```php
getUser();
getStudentProfile();
createApplication();
updateProfile();
```

### Classes
Use PascalCase.

```php
User;
StudentProfile;
BusinessProfile;
Opportunity;
Application;
```

Class filenames should match the class name:
User.php
StudentProfile.php
BusinessProfile.php


### Constants
Use uppercase letters with underscores.

```php
MAX_LOGIN_ATTEMPTS;
DEFAULT_ROLE;
```

## 3 Database

### Tables
users
student_profiles
business_profiles
user_skills
career_credits
ai_assessments

### Columns
user_id
student_number
career_goal
created_at
graduation_year

Primary keys should normally be:
id

Foreign keys should follow:
<referenced_table_singular>_id

Examples:
user_id
skill_id
business_id
opportunity_id


### 4. HTML
Use semantic HTML where appropriate.

Use lowercase HTML attributes.
<input type="text" name="email">

Use meaningful class names.
<div class="profile-card">

Avoid vague names such as:
<div class="box1">


### 5. CSS
Use lowercase kebab-case for class names.
```css
.profile-card {
}

.dashboard-header {
}

.login-form {
}
```


### 6. JavaScript

Use camelCase for variables and functions.
```js
const userProfile;
function loadProfile() {
}
```

Use descriptive names.

Avoid:
```js
const x;
const abc;
function doStuff() {
}
```


### 7. File Organisation
config/       Configuration
controllers/  Application/request logic
models/       Database/data logic
views/        User interface
assets/       CSS, JavaScript and images
database/     SQL/database files

Do not put everything into index.php.


### 8. Database Security
- Use prepared statements for database queries.
- Never directly insert user input into SQL queries.
- Hash passwords using PHP's password_hash().
- Verify passwords using password_verify().
- Validate user input.
- Never store plain-text passwords.


### 9. Git Conventions
- Work on your assigned branch.
- Do not directly modify another developer's branch.
- Do not commit directly to main unless the team agrees.
- Make small, meaningful commits.
- Use descriptive commit messages.

Examples:
Create user model
Add database connection
Create student profile endpoint
Add login validation

Avoid:
stuff
changes
update
fixed
test


### 10. Comments

Use comments to explain why something is being done when the reason isn't obvious.

Avoid comments that simply repeat the code.

Good:
```js
// Hash the password before storing it so plain-text passwords are never saved.
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
```

Avoid:
```js
// Create password
$password = $password;
```


### 11. Security

Never commit:

- API keys
- Passwords
- Database credentials for production
- Secret tokens
- Private keys

Use configuration/environment variables for sensitive information.


### 12. Pull Requests

Before merging into main:

1.Test the feature.
2. Make sure it works with the existing application.
3. Check for obvious errors.
4. Create a Pull Request.
5. Have another team member review it.
6. Merge only after approval.