#Sign-in Learner

Collection Name: Learners

Document Parent Path:
Learners

Document ID:
{AuthenticatedUserID} // u8Kx92LmPqR5Az7Y

Fields:

Field Name        Type
--------------------------------
name              String        // "Kamohelo"
surname           String        // "Mokoteli"
email             String        // "kamo@gmail.com"
lastLogin         Timestamp     // 2026-08-27T08:15:00Z
registrationDate  Timestamp     // 2026-08-01T10:30:00Z
progress          Number        // 75
role              String        // "Learner"
status            String        // "Active"
....................................................................
#Sign-in Assessor

Collection Name: Assessors

Document Parent Path: Assessors

Document ID: {AuthenticatedUserID}

Fields:

Field Name          Type
--------------------------------
name                String
surname             String
email               String
role                String
department          String
lastLogin           Timestamp
registrationDate    Timestamp
status              String
..........................................................................
#Learner Registration

Collection Name: Learners

Document Parent Path: Learners

Document ID: {AuthenticatedUserID}

Fields:

Field Name          Type
--------------------------------
name                String
surname             String
email               String
registrationDate    Timestamp
lastLogin           Timestamp
progress            Number
role                String
status              String
.............................................................................
# Assessor Registration

Collection Name: Assessors

Document Parent Path: Assessors

Document ID: {AuthenticatedUserID}

Field Name          Type
--------------------------------
name                String
surname             String
email               String
registrationDate    Timestamp
lastLogin           Timestamp
role                String
status              String
department          String
.............................................................................
# Forgot Password

Firebase Authentication

User ID: AuthenticatedUserID

Email: user@email.com

Password: Managed securely by Firebase Authentication
NOT stored in Firestore
.............................................................................
# # Task Totals

Collection Name:
Tasks

Document Parent Path:
Tasks

Document ID:
{TaskID}

Fields name       Type
----------------------------------
learnerID         String
subject           String
taskTitle         String
taskDescription   String
dueDate           Timestamp
status            String
dateCreated       Timestamp
..............................................................................
# Book Support Appointment

Collection Name: Bookings

Document Parent Path: Bookings

Document ID:
{BookingID}

Field Name           Type
--------------------------------
learnerID            String
assessorName         String
appointmentDate      Timestamp
appointmentTime      String
sessionType          String
supportType          String
bookingDescription   String
bookingStatus        String
dateCreated          Timestamp
....................................................................................
# Completed Work

Document Parent Path:
Submissions

Document ID:
{SubmissionID}

Field Name           Type
--------------------------------
learnerID            String
taskID               String
taskTitle            String
completionDate       Timestamp
completionStatus     String
submissionFileURL    String
assessorFeedback     String
markObtained         Number
dateSubmitted        Timestamp
........................................................................................
# Calculated Progress

Document Parent Path:
Tasks

Document ID:
{TaskID}

Field Name          Type
--------------------------------
learnerID           String
taskTitle           String
taskDescription     String
dueDate             Timestamp
status              String
dateCreated         Timestamp
completedDate       Timestamp
pdfFileURL          String
............................................................................................
# Outstanding Work

Document Parent Path:
Tasks

Document ID:
{TaskID}

Field Name          Type
--------------------------------
learnerID           String
taskTitle           String
taskDescription     String
dueDate             Timestamp
status              String
pdfFileURL          String
dateCreated         Timestamp
completedDate       Timestamp
...........................................................................................
# Reports Page

Document Parent Path:
Learners

Document ID:
{LearnerID}

Fields:

Field Name          Type
--------------------------------
name                String
surname             String
email               String
progress            Number
registrationDate    Timestamp
status              String

Document Parent Path:
Tasks

Document ID:
{TaskID}

Fields:

Field Name          Type
--------------------------------
learnerID           String
taskTitle           String
taskDescription     String
dueDate             Timestamp
status              String
dateCreated         Timestamp
completedDate       Timestamp

Document Parent Path:
Bookings

Document ID:
{BookingID}

Fields:

Field Name           Type
--------------------------------
learnerID            String
assessorID           String
assessorName         String
appointmentDate      Timestamp
appointmentTime      String
sessionType          String
supportType          String
bookingStatus        String
dateCreated          Timestamp

Document Parent Path:
GameResults

Document ID:
{ResultID}

Fields:

Field Name          Type
--------------------------------
learnerID           String
gameName            String
score               Number
totalQuestions      Number
correctAnswers      Number
incorrectAnswers    Number
datePlayed          Timestamp

#Total Learners

Collection:
Learners

Calculation:
COUNT(All Learner Documents)

#Tasks Completed
Collection:
Tasks

Condition:
status = "Completed"

Calculation:
COUNT(Task Documents)

#Outstanding Tasks
Collection:
Tasks

Condition:
status != "Completed"

Calculation:
COUNT(Task Documents)

#Outstanding Tasks
Collection:
Tasks

Condition:
status != "Completed"

Calculation:
COUNT(Task Documents)

#Average Progress
Collection:
Learners

Field:
progress

Calculation:
AVERAGE(progress)

#Average Game Score
Collection:
GameResults

Field:
score

Calculation:
AVERAGE(score)

#Learner Progress Report
Collection:
Learners

Fields Displayed:
name
surname
progress

#Game Results Report

Collection:
GameResults

Fields Displayed:
gameName
score
correctAnswers
incorrectAnswers
datePlayed

#Support Bookings Report

Collection:
Bookings

Fields Displayed:
learnerID
assessorName
appointmentDate
supportType
bookingStatus
...............................................................................................
#Support Bookings Management

Document Parent Path:
Bookings

Document ID:
{BookingID}

Field Name            Type
----------------------------------
learnerID             String
learnerName           String
assessorID            String
assessorName          String
appointmentDate       Timestamp
appointmentTime       String
sessionType           String
supportType           String
bookingDescription    String
bookingStatus         String
dateCreated           Timestamp
lastUpdated           Timestamp

# Approve Button 
Collection Name:
Bookings

Document Parent Path:
Bookings

Document ID:
BookingID

Field:
bookingStatus

Type:
String

Value:
Approved

Field:
lastUpdated

Type:
Timestamp

Value:
CurrentDateTime

# Reject Button

Collection Name:
Bookings

Document Parent Path:
Bookings

Document ID:
BookingID

Field:
bookingStatus

Type:
String

Value:
Rejected

Field:
lastUpdated

Type:
Timestamp

Value:
CurrentDateTime

# Reschedule Button

Collection Name:
Bookings

Document Parent Path:
Bookings

Document ID:
BookingID

Field:
appointmentDate

Type:
Timestamp

Value:
NewDate

Collection Name:
Bookings

Document Parent Path:
Bookings

Document ID:
BookingID

Field:
appointmentTime

Type:
String

Value:
NewTime

Collection Name:
Bookings

Document Parent Path:
Bookings

Document ID:
BookingID

Field:
bookingStatus

Type:
String

Value:
Rescheduled

Collection Name:
Bookings

Document Parent Path:
Bookings

Document ID:
BookingID

Field:
lastUpdated

Type:
Timestamp

Value:
CurrentDateTime
..................................................................................
# Learners Page
Document Parent Path:
Learners

Document ID:
{LearnerID}

Field Name          Type
--------------------------------
name                String
surname             String
email               String
progress            Number
registrationDate    Timestamp
lastLogin           Timestamp
role                String
status              String

# calculate learner statistics
Document Parent Path:
Tasks

Document ID:
{TaskID}

Field Name          Type
--------------------------------
learnerID           String
taskTitle           String
status              String
dueDate             Timestamp
dateCreated         Timestamp
completedDate       Timestamp

# Total Tasks
Collection:
Tasks

Condition:
learnerID = SelectedLearnerID

Calculation:
COUNT(All Matching Tasks)

# Completed Tasks
Collection:
Tasks

Condition:
learnerID = SelectedLearnerID
AND status = "Completed"

Calculation:
COUNT(Matching Tasks)

# Outstanding Tasks
Collection:
Tasks

Condition:
learnerID = SelectedLearnerID
AND status != "Completed"

Calculation:
COUNT(Matching Tasks)
........................................................................................................
# Upload Learner Tasks
Document Parent Path:
Learners

Document ID:
{LearnerID}

Fields:

Field Name          Type
--------------------------------
name                String
surname             String
email               String
progress            Number
status              String

# Collection: Tasks
Document Parent Path:
Tasks

Document ID:
{TaskID}

Field Name          Type
--------------------------------
learnerID           String
taskTitle           String
taskDescription     String
pdfFileURL          String
dueDate             Timestamp
status              String
dateCreated         Timestamp
createdBy           String

# Collection: Assessors
Document Parent Path:
Assessors

Document ID:
{AssessorID}

Fields:

Field Name          Type
--------------------------------
name                String
surname             String
email               String
.........................................................................................................................
# Game Results
Document Parent Path:
Learners

Document ID:
{LearnerID}

Fields:

Field Name          Type
--------------------------------
name                String
surname             String
email               String
progress            Number
status              String

# GameResults
Document Parent Path:
GameResults

Document ID:
{ResultID}

Field Name          Type
--------------------------------
learnerID           String
learnerName         String
gameName            String
score               Number
totalQuestions      Number
correctAnswers      Number
incorrectAnswers    Number
datePlayed          Timestamp

.....................................................................................

































