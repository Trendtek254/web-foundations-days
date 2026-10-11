PRAGMA foreign_keys=ON;
CREATE TABLE  students(
    student_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);
CREATE TABLE courses(
    course_id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL UNIQUE

);
CREATE TABLE enrolments(
    enrolment_id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY(student_id)
        REFERENCES students(student_id)
    FOREIGN KEY(course_id)  
        REFERENCES courses(course_id)  ,
    UNIQUE(student_id,course_id)    
);
INSERT INTO students(student_id,name,email)
VALUES
(1,'Amina Hassan','amina@example.com'),
(2,'Brian Otieno','brian@example.com'),
(3,'Carol Mwangi','carol@example.com'),
(4,'David Kimani','david@example.com');
INSERT INTO courses(course_id,course_name)
VALUES
(1,'Database Fundamentals'),
(2,'Web development'),
(3,'Pytrhon programming');
INSERT INTO enrolments(enrolment_id,student_id,course_id,grade)
VALUES
(1,1,1,'A'),
(2,1,2,'B'),
(3,2,1,'B'),
(4,2,3,'A'),
(5,3,2,'A');
SELECT s.name, c.course_name, e.grade
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE s.name = 'Amina Hassan';
SELECT s.name, c.course_name, e.grade
FROM students AS s
JOIN enrolments AS e
    ON s.student_id = e.student_id
JOIN courses AS c
    ON e.course_id = c.course_id
WHERE c.course_name = 'Database Fundamentals';
SELECT
    c.course_name,
    COUNT(e.student_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e
    ON c.course_id = e.course_id
GROUP BY c.course_id, c.course_name
ORDER BY c.course_id;
SELECT s.student_id, s.name
FROM students AS s
LEFT JOIN enrolments AS e
    ON s.student_id = e.student_id
WHERE e.student_id IS NULL;
UPDATE enrolments
SET grade = 'A'
WHERE enrolment_id = 3;
