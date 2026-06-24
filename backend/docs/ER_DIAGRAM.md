# Spreetail HR Portal — Entity Relationship Diagram

This is the logical data model behind the PostgreSQL schema in `migrations/001_init_schema.sql`.
Paste the block below into [mermaid.live](https://mermaid.live) or any Markdown viewer that supports
Mermaid (GitHub, GitLab, VS Code with the Mermaid extension) to render it visually.

```mermaid
erDiagram
    DEPARTMENT ||--o{ EMPLOYEE : "has many"
    EMPLOYEE ||--o| USER : "has one account"
    EMPLOYEE ||--o{ EMPLOYEE : "manages (self-referential)"
    EMPLOYEE ||--o{ ATTENDANCE : "has many"
    EMPLOYEE ||--o{ LEAVE : "has many"
    EMPLOYEE ||--o{ PAYROLL : "has many"
    EMPLOYEE ||--o{ PERFORMANCE_REVIEW : "has many"
    EMPLOYEE ||--o{ DOCUMENT : "has many"
    EMPLOYEE ||--o{ ANNOUNCEMENT : "authors"
    USER ||--o{ NOTIFICATION : "receives"

    DEPARTMENT {
        uuid id PK
        string name
        string code
        text description
        uuid headEmployeeId FK
        decimal budget
        string colorTag
    }

    EMPLOYEE {
        uuid id PK
        string employeeCode
        string firstName
        string lastName
        string email
        string phone
        enum gender
        date dateOfBirth
        uuid departmentId FK
        string designation
        uuid managerId FK
        enum employmentType
        enum employmentStatus
        date joiningDate
        date exitDate
        decimal annualSalary
        string profilePicture
        jsonb address
        jsonb emergencyContact
        jsonb bankDetails
    }

    USER {
        uuid id PK
        uuid employeeId FK
        string email
        string passwordHash
        enum role
        boolean isEmailVerified
        boolean isActive
        text refreshToken
        string resetPasswordToken
        date resetPasswordExpires
        date lastLoginAt
        enum themePreference
    }

    ATTENDANCE {
        uuid id PK
        uuid employeeId FK
        date date
        enum status
        time checkIn
        time checkOut
        decimal hoursWorked
        decimal overtimeHours
    }

    LEAVE {
        uuid id PK
        uuid employeeId FK
        enum leaveType
        date startDate
        date endDate
        decimal totalDays
        text reason
        enum status
        date appliedOn
        uuid approvedById FK
        text decisionNote
        date decidedOn
    }

    PAYROLL {
        uuid id PK
        uuid employeeId FK
        string payslipNumber
        int month
        int year
        decimal basic
        decimal hra
        decimal otherAllowances
        decimal bonus
        decimal incentives
        decimal providentFund
        decimal tax
        decimal otherDeductions
        decimal grossPay
        decimal netPay
        enum status
        date paidOn
    }

    PERFORMANCE_REVIEW {
        uuid id PK
        uuid employeeId FK
        uuid reviewerId FK
        enum quarter
        int year
        decimal kpiScore
        int rating
        jsonb goals
        text strengths
        text areasForImprovement
        text managerFeedback
        date reviewDate
    }

    ANNOUNCEMENT {
        uuid id PK
        string title
        text body
        enum category
        uuid postedById FK
        enum audienceRole
        boolean isPinned
        date postedAt
    }

    NOTIFICATION {
        uuid id PK
        uuid userId FK
        string title
        text message
        enum type
        boolean isRead
        string link
    }

    DOCUMENT {
        uuid id PK
        uuid employeeId FK
        string title
        enum type
        string fileUrl
        uuid uploadedById FK
    }
```

## Notes

- All primary keys are UUIDs generated at the application layer (`DataTypes.UUIDV4`).
- `Employee.managerId` is a self-referential foreign key, forming the org chart.
- `Employee` and `User` are split intentionally: `Employee` is the HR system-of-record profile,
  `User` is the login/auth identity. This lets HR create an employee profile before (or without)
  provisioning system access.
- `Attendance` and `Payroll` both carry a unique composite index (`employeeId` + `date` /
  `employeeId` + `month` + `year`) to prevent duplicate records.
- See `migrations/001_init_schema.sql` for the exact PostgreSQL DDL (enums, indexes, constraints)
  generated from this model.
