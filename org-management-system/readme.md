readme.md
Here are the essential API endpoints:

User Management

Register: POST /api/register
Login: POST /api/login
Switch Organization: POST /api/switch-organization
Get User Info: GET /api/user
Organization Management

Create Organization: POST /api/organizations
Get User's Organizations: GET /api/organizations
Task Management

Create Task: POST /api/tasks
Get Tasks by Organization: GET /api/organizations/:orgId/tasks

// sql commands
-- Users table
CREATE TABLE Users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL, -- hashed password
role_id INT,
FOREIGN KEY (role_id) REFERENCES Roles(id)
);

-- Roles table
CREATE TABLE Roles (
id INT AUTO_INCREMENT PRIMARY KEY,
role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Organizations table
CREATE TABLE Organizations (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL UNIQUE
);

-- User_Organizations table
CREATE TABLE User_Organizations (
user_id INT,
organization_id INT,
PRIMARY KEY (user_id, organization_id),
FOREIGN KEY (user_id) REFERENCES Users(id),
FOREIGN KEY (organization_id) REFERENCES Organizations(id)
);

-- Tasks table
CREATE TABLE Tasks (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
description TEXT,
organization_id INT,
user_id INT,
FOREIGN KEY (organization_id) REFERENCES Organizations(id),
FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Sessions table
CREATE TABLE Sessions (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
session_token VARCHAR(255) NOT NULL UNIQUE,
current_organization_id INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES Users(id),
FOREIGN KEY (current_organization_id) REFERENCES Organizations(id)
);

-- Privileges table
CREATE TABLE Privileges (
id INT AUTO_INCREMENT PRIMARY KEY,
privilege_name VARCHAR(50) NOT NULL UNIQUE
);

-- Role_Privileges table
CREATE TABLE Role_Privileges (
role_id INT,
privilege_id INT,
PRIMARY KEY (role_id, privilege_id),
FOREIGN KEY (role_id) REFERENCES Roles(id),
FOREIGN KEY (privilege_id) REFERENCES Privileges(id)
);
