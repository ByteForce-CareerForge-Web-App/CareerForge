<?php

/*

find user
create user
update user
delete user
find by email

*/

/*
### Think of it like this

MySQL                         PHP

users table  ←──────────────→  User.php
     │                              │
     │                              │
     ├── id                         ├── findById()
     ├── name                       ├── findByEmail()
     ├── email                      ├── create()
     ├── password                   └── update()
     ├── role
     ├── status
     └── created_at

*/

/**
 * User Model
 *
 * Handles database operations related to users.
 */

class User
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // Find a user by their ID
    public function findById(int $id): ?array
    {
        $sql = "SELECT id, name, email, role, status, created_at
                FROM users
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    // Find a user by their email address
    public function findByEmail(string $email): ?array
    {
        $sql = "SELECT id, name, email, password, role, status, created_at
                FROM users
                WHERE email = ?";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$email]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        return $user ?: null;
    }

    // Create a new user
    public function create(
        string $name,
        string $email,
        string $password,
        string $role = 'student'
    ): int {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (name, email, password, role)
                VALUES (?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $name,
            $email,
            $hashedPassword,
            $role
        ]);

        return (int) $this->db->lastInsertId();
    }

    // Update basic user information
    public function update(
        int $id,
        string $name,
        string $email
    ): bool {
        $sql = "UPDATE users
                SET name = ?, email = ?
                WHERE id = ?";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            $name,
            $email,
            $id
        ]);
    }
}

?>