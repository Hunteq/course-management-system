# Course Management System (CMS) - README

## Project Overview

The Course Management System (CMS) is a comprehensive web application designed to manage student data, course materials, tests, and results. It provides different interfaces for administrators, staff, and students with role-based access control.

Key functionalities include:

- User management (admin, staff, students)
- Batch management
- Course material distribution
- Test creation and administration
- Online test taking and grading
- Result tracking and analysis

## Features

### Admin Features

- Dashboard with system statistics
- User management (CRUD operations)
- Batch management (create, edit, delete batches)
- Assign/remove students to/from batches
- View all system data

### Staff Features

- Upload and manage course materials
- Create and manage test questions
- Create and publish tests
- Grade student submissions
- View test results and statistics

### Student Features

- View assigned course materials
- Take online tests within specified time windows
- View test results and feedback
- Track academic progress

## Technologies Used

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Passport.js** - Authentication middleware
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Dotenv** - Environment variable management

### Frontend

- **EJS** - Templating engine
- **Bootstrap** - CSS framework
- **JavaScript** - Client-side scripting
- **jQuery** - DOM manipulation (optional)

### Development Tools

- **Git** - Version control
- **NPM** - Package management

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-repo/course-management-system.git
   cd student-management-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:

   ```
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```

4. **Start the application**

   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## Configuration

### Environment Variables

- `MONGO_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret for session encryption
- `PORT`: Port for the application to run on (default: 3000)

### Database Connection

The database connection is configured in `db.js` using Mongoose:

## Database Models

### User

- **Fields**: name, email, password, role (admin/staff/student), batch (for students)
- **Methods**: Password hashing before save

### Batch

- **Fields**: name, description, createdBy, students (array of User references)

### Material

- **Fields**: title, description, filePath, fileType, fileSize, uploadedBy, batches

### Question

- **Fields**: questionType (mcq/short/long/image), questionText, questionImage, marks, options (for MCQ), correctAnswer

### Test

- **Fields**: title, description, duration, totalMarks, passingMarks, startDate, endDate, batches, questions, createdBy, isPublished

### Result

- **Fields**: test, student, answers (array with question, answer, isCorrect, marksObtained), totalMarksObtained, submittedAt, gradedBy, isGraded

## Controllers

### Admin Controller

- Manages users, batches, and system statistics
- Key methods: dashboard, manageUsers, deleteUser, manageBatches, createBatch, viewBatch, addStudentToBatch, removeStudentFromBatch, deleteBatch

### Auth Controller

- Handles authentication processes
- Key methods: register, login, logout, dashboard (role-based redirection)

### Staff Controller

- Manages course materials and questions
- Key methods: dashboard, viewMaterials, uploadMaterial, saveMaterial, deleteMaterial, showEditMaterialForm, updateMaterial

### Question Controller

- Manages test questions
- Key methods: listQuestions, showCreateForm, createQuestion, showEditForm, updateQuestion, deleteQuestion, previewQuestion

### Test Controller

- Manages tests and results
- Key methods: listTests, showCreateForm, createTest, manageQuestions, addQuestion, removeQuestion, previewTest, publishTest, unpublishTest, deleteTest, takeTest, submitTest, viewResults, gradeResult, saveGrading

### Student Controller

- Provides student interfaces
- Key methods: dashboard, viewMaterials, viewResults, viewResult

## Routes

### Admin Routes

- `/admin/dashboard` - Admin dashboard
- `/admin/manage-users` - User management
- `/admin/batches` - Batch management
- `/admin/batches/:id` - View batch details

### Auth Routes

- `/login` - Login page
- `/register` - Registration page (admin only)
- `/logout` - Logout
- `/dashboard` - Role-based dashboard redirect

### Staff Routes

- `/staff/dashboard` - Staff dashboard
- `/staff/materials` - Course materials management
- `/staff/upload-material` - Upload new material

### Question Routes

- `/questions` - List all questions
- `/questions/create` - Create new question
- `/questions/:id/edit` - Edit question
- `/questions/:id/preview` - Preview question

### Test Routes

- `/tests` - List all tests
- `/tests/create` - Create new test
- `/tests/:id/questions` - Manage test questions
- `/tests/:id/preview` - Preview test
- `/tests/:id/publish` - Publish test
- `/tests/:id/take` - Take test (student)
- `/tests/:id/submit` - Submit test (student)

### Student Routes

- `/student/dashboard` - Student dashboard
- `/student/materials` - View course materials
- `/student/results` - View test results

## Views

### Admin Views

- `admin/dashboard.ejs` - Admin dashboard with statistics
- `admin/manageUsers.ejs` - User management interface
- `admin/batches.ejs` - Batch management interface
- `admin/viewBatch.ejs` - Batch details view

### Auth Views

- `auth/login.ejs` - Login form
- `auth/register.ejs` - Registration form

### Staff Views

- `staff/dashboard.ejs` - Staff dashboard
- `staff/materials.ejs` - Course materials list
- `staff/uploadMaterial.ejs` - Material upload form
- `staff/editMaterial.ejs` - Material edit form

### Question Views

- `questions/list.ejs` - Question bank
- `questions/create.ejs` - Question creation form
- `questions/edit.ejs` - Question editing form
- `questions/preview.ejs` - Question preview

### Test Views

- `tests/list.ejs` - Test management list
- `tests/create.ejs` - Test creation form
- `tests/manageQuestions.ejs` - Test question management
- `tests/preview.ejs` - Test preview
- `tests/results.ejs` - Test results
- `tests/grade.ejs` - Test grading interface
- `student/takeTest.ejs` - Test taking interface

### Student Views

- `student/dashboard.ejs` - Student dashboard with active/upcoming/completed tests
- `student/materials.ejs` - Course materials list
- `student/testResults.ejs` - Test results list
- `student/viewResult.ejs` - Detailed test result view

## Authentication

The system uses Passport.js with local strategy for authentication:

## Authorization

Role-based authorization is implemented with middleware:

## File Uploads

The system handles file uploads for:

- Course materials (PDF, PPT, DOC, XLS, ZIP)
- Question images (JPEG, JPG, PNG, GIF)

## Testing

The application includes comprehensive error handling and validation throughout all controllers. Key validation checks include:

- User input validation
- File type and size validation
- Test date validation
- Role-based access control
- Batch assignment validation

## Deployment

To deploy the application:

1. Set up a MongoDB database (Atlas or self-hosted)
2. Configure environment variables in production
3. Use a process manager like PM2 for Node.js
4. Set up a reverse proxy (Nginx or Apache)
5. Configure SSL for secure connections

## Contributing

1. Fork the repository
2. Create a new branch for your feature/fix
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.
