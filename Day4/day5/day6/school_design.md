# School Database Design

## Tables

### Students
The students table stores each student's ID, name and email address. The student ID is the primary key, and email is required and unique so that two students cannot register with the same email.

### Courses
The courses table stores the ID and name of each course. The course ID is the primary key, and the course name is required and unique.

### Enrolments
The enrolments table records which students take which courses and the grade they receive. Its primary key identifies each enrolment. Foreign keys reference the students and courses tables, and a UNIQUE constraint on student_id and course_id prevents duplicate enrolments in the same course.

## Relationships

### One-to-many
Students and enrolments have a one-to-many relationship: one student can have several enrolment records, but each enrolment belongs to one student.

Courses and enrolments also have a one-to-many relationship: one course can appear in many enrolment records, but each enrolment refers to one course.

### Many-to-many
Students and courses have a many-to-many relationship. A student can take multiple courses, and each course can contain multiple students.

The enrolments table is necessary as a join table to represent this relationship. It connects students to courses and stores information about the relationship itself, such as the student's grade.

## Index

I would add an index on `enrolments(course_id)` to help queries that retrieve students in a particular course or count enrolments per course. This can make lookups more efficient as the enrolments table grows.

## SQL or NoSQL?

I would choose a relational SQL database for this school system. Students, courses and enrolments have clearly defined structures and relationships. Primary keys, foreign keys, uniqueness constraints and transactions help maintain data integrity. SQLite is suitable for a small application or learning project, while PostgreSQL could be appropriate for a larger multi-user system.