# Library Books REST API

## Base URL

`https://api.example.com`

## Endpoints

### 1. List all books

- **Method:** GET
- **Path:** `/books`
- **Description:** Retrieves all books in the library.
- **Success status:** 200 OK

### 2. Get one book

- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Retrieves a single book using its ID.
- **Success status:** 200 OK

### 3. Create a book

- **Method:** POST
- **Path:** `/books`
- **Description:** Adds a new book to the library.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "year": 1958
  }
  ```

- **Success status:** 201 Created

### 4. Update a book

- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Replaces the details of an existing book.
- **Example request body:**

  ```json
  {
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "year": 1958
  }
  ```

- **Success status:** 200 OK

### 5. Delete a book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Deletes a book using its ID.
- **Success status:** 204 No Content

### 6. List books by author

- **Method:** GET
- **Path:** `/books?author=Chinua%20Achebe`
- **Description:** Retrieves books written by the specified author using a query parameter.
- **Success status:** 200 OK

## Error Responses

### 400 Bad Request

- **Description:** The request contains invalid data.
- **Example:** A POST request attempts to create a book without a required title.

### 404 Not Found

- **Description:** The requested resource does not exist.
- **Example:** A GET request for `/books/9999` when no book has that ID.
-