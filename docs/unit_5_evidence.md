Part 1 - Architecture Investigation
......................................................................................................
1. What is client-side development, and where does client-side code execute?
Client-side development is the creation of application features that run in the user’s browser, such as the interface, interactions. Client-side code executes on the client device, typically in the web browser after the page is loaded.

2. What is server-side development, and how is it different from code executing in the browser?
Server-side development is the creation of application features that run on a web server, handling tasks such as data processing, authentication, and database access. Server-side code runs on the server before the response is sent to the client, and users do not directly see or interact with that code.

 3. Within SkillsTrack, explain the role of HTML, CSS, JavaScript, Firebase Authentication, Firebase 
Realtime Database and the Firebase REST API.
Within SkillsTrack, HTML provides the structure of the pages, such as forms, buttons, navigation and content areas. CSS is used to style the application, controlling colours, layout, spacing and making the interface user-friendly. JavaScript adds interactivity and logic, such as responding to user actions, validating input, loading data and updating the page dynamically.

Firebase Authentication is used to manage user sign-up, sign-in and secure access to the app so that each user can access their own account. Firebase Realtime Database stores and synchronises application data, such as user progress or task information, in real time across connected devices. The Firebase REST API allows SkillsTrack to send, retrieve, update and delete data in Firebase through HTTP requests, making it possible for the JavaScript code to communicate with the backend services.

4. Is Firebase the same thing as server-side JavaScript? Explain your answer.
No, Firebase is not the same thing as server-side JavaScript. Firebase is a Backend-as-a-Service platform that provides ready-made backend tools such as authentication, databases, hosting and cloud services. Server-side JavaScript refers to JavaScript code that runs on a server, for example with Node.js, where developers write and control the backend logic themselves. In SkillsTrack, Firebase provides backend services, while JavaScript in the app can communicate with Firebase without requiring the developer to build a full custom server.

 5. When a learner creates a learning task, which operations happen on the client side and which involve a remote/server-side service?
When a learner creates a learning task, client-side operations include displaying the task form, capturing what the learner types, validating required fields, and sending the request when the learner clicks save. Remote/server-side services are involved when Firebase Authentication confirms the user identity and permissions, and when the Firebase Realtime Database (through the REST API) stores the new task, assigns it to the learner’s account, and synchronises it across devices.

6. Firebase Authentication -The server asks for access,but the server must verify and decide whether the user is allowed to access the resource. this prevent unauthorised access; and users changing informaion they should not have access to.
databese access: the client should not have unrestricted access to the database, the server should control what data a user can read, add,, update or delete. Security checks must happen on the sver because users can modify cliet-side code.

7. Alternative 1
Supabase provides backend  services to Firebase(Auth,Storage Realtime data) but uses relational postgreSQL database.
Database- Learner profiles and tasks change from nested JSON trees to strict, relational SQL tables linked by Foreign keys. Instead of using Firebase security rules authorization is enforce directly inside PostgreSQL using row level security polies. Client-side Javascript interects with SuperBase using auto-Generated REST/PostgREST endpoints provided by supabase client library. Data access "learner progress" are calculated directly on the database via SQL queries or database functions rather than handling client-side filtering.

Alternative 2
Custom Node.js + Express REST API,this custom approach separates client interaction completely from third party BaaS platforms by using a custon server.
Architectural changes: the browser no longer talks directly to database. Client Javascript sends HTTP REST request.
Firebase Authentication is replaced with custom authentication middleware
for the skill trach app supabase would be easier alternative because it provides authentication,database APIs and server-side functions in one platform.

8. Placing sensitive information or core security responsibilities in client-side JavaScript exposes the application to serious vulnerabilities because anything sent to the browser can be viewed, modified, or bypassed by the user.
1.  Exposure of Sensitive Credentials & API Keys
Hardcoding private API keys, database credentials,Password, admin tokens, or encryption keys in client-side JavaScript files makes them publicly accessible to anyone using browser Developer Tools or viewing the page source.
Malicious users can extract these credentials and access cloud resources directly, compromise third-party services, read private user data, or wipe database collections.
2. Client-Side Authorization Bypass
Relying on client-side JavaScript to enforce user permissions (e.g., using if (user.role === 'admin') to control access to sensitive functions or hide UI buttons) allows users to bypass security rules entirely.
An attacker can modify the local JavaScript variables via the browser console, alter network payload values, or call hidden functions directly, gaining unauthorized admin access to perform restricted actions.
3. Data Tampering & Lack of Server-Side Validation
Performing data validation purely in the browser assumes that incoming data will always be trustworthy.
Attackers can intercept and alter outgoing HTTP requests using tools like Postman or OWASP ZAP to send malicious data, execute Cross-Site Scripting.
Client-side JavaScript should mainly handle the user interface and user experience. Sensitive data, authentication, authorization, validation and database access should be protected on the server/backend, where users cannot directly change the security logic

Part 2
Feature                     Classification               Justification
...................................................................................................................
Registration                   Both                        Client-side Javascript captures and validates form
.....................................................................................................................
Login                          Both                       The browser handles user credentials entry while Firebase
                                                          authentication verifies credentials,manages sessions states 
                                                          and returns authentication tokens
                                                          ................................................................
Form Validation                Client side               Execute locally in the browser engine to provide immediate UI  
                                                         feedback before network dispatche
...........................................................................................................................
Displaying the dashboard       Client-side               Manipulates HTML and CSS directly within the browser's DOM to render
                                                         user interface componets
..............................................................................................................................
Creating a Learning Task       Both                      Firebase RealTime database validates authorization and persists the 
                                                         record
Retrieving Tasks               Both                      Firebase fetches stored data from cloud server,while client-side Javascript
                                                         receives the response and renders the task list 
Updating a Task                Both                      Client Javascript captures edit actions while Firebase updates the dataset 
                                                         and enforces database write rule                                                        
Deleting a Task                Both                      Client-side scripts send a delete request for a specific resource ID,while 
                                                         the cloud backend verifies permission and removes the record.
Calculating Learner Progress   Both                      The backend aggregates stored a task completion states, while client-side scripts
                                                         calculate local persentages and render progress bar
Filtering/searching tasks      Client Side               Operates directly on locally cached task arrays in browser memory for instant UI 
                                                         search filtering without extra backend API calls.                     
Storing learner data:          Server/Cloud Service      Persistent database storage must be maintained centrally on remote Firebase servers
                                                         to ensure data persistence across sessions.
Authentication:                Server/Cloud Service      Password hashing, identity verification, and token issuance occur entirely within 
                                                         Firebase Authentication backend services.
Database security/access rules: Server/Cloud Service     Firebase Security Rules execute strictly on cloud servers to prevent unauthorized 
                                                         database read/write attempts.
Updating the DOM:              Client Side               Directly modifies page elements and structure using browser APIs 
                                                         like JavaScript document methods.
Displaying success/error messages: Client Side           Receives API status codes or client validation states and renders alert 
                                                         components dynamically in the browser viewport.                                                        



Part 3
[ USER (Learner) ]
       │
       │ 1. Submits Task Form
       ▼

             CLIENT-SIDE PROCESSING (BROWSER)           
                                                         
  [ Learner Form ] ──► [ JS Input Validation ]           
                               │                         
                  ┌────────────┴───────────┐            
                  ▼                        ▼             
            (If Invalid)              (If Valid)         
         [ DOM Error Alert ]     [ Attach Auth Token ]   

                                            │
                                            │ 2. SDK / REST Request
                                            ▼

      REMOTE / SERVER-SIDE SERVICES (FIREBASE)         
                                                         
   [ Firebase Auth ] ──► Verifies Token & User UID       
                               │                         
                               ▼                         
   [ Realtime DB ]   ──► Evaluates Security Rules        
                               │                         
                 ┌────────────┴───────────┐             
                 ▼                        ▼             
            (If Denied)              (If Allowed)       
          [ Return 403 ]          [ Persist Task Data ]  

                                            │
                                            │ 3. Return Response Data
                                            ▼

             DOM UPDATES & CLIENT RESPONSE               

                                                         
  [ JS Receives Response ] ──► [ Update DOM Viewport ]   
                                - Render New Task        
                                - Reset Form Input       
│                                - Recalculate Progres   

User Registration/Login

USER  --->  CLIENT ---> REQUEST ---> FIREBASE ---> RESPONSE ---> CLIENT ---> USER

1. What action does the user perform?           | The user enters their **name, email and password** when registering,
                                                  or enters their **email and password** when logging
                                                  then clicks the relevant button.
2. What does JavaScript do in the browser?      | JavaScript reads the form values, checks the input, and prepares the registration or login request.
3. What validation occurs?                      | JavaScript checks that required fields are completed, the email has a 
                                                  valid format, and the password meets the required rules.
4. What information leaves the browser?         | The user's registration or login information, such as **email and password**, is sent securely to Firebase.
5. Which Firebase service receives the request? | **Firebase Authentication** receives the registration/login request.
6. What does Firebase do with it?               | Firebase Authentication creates the user account during registration or 
                                                  checks the user's credentials during login. It securely manages the user's authentication information.
7. What response/data is returned?              | Firebase returns a **success or error response**. If successful, it can return authenticated user 
                                                  information and authentication token/session information.
8. How does JavaScript process the result?      | JavaScript checks whether the Firebase request was successful or failed. 
                                                  It then decides what action to take based on the result.
9. How is the interface updated?                | If successful, JavaScript can display a success message and redirect the user to the **dashboard**. 
                                                  If there is an error, it displays an appropriate error message on the login/registration form.
10. What should happen if the request fails?      The user should remain on the login/registration page, receive a clear error message, 
                                                  and be allowed to correct their information and try again.


USER
  ↓
Enters registration/login details and clicks button
  ↓
CLIENT (JavaScript)
  ↓
Validates input and prepares request
  ↓
REQUEST
  ↓
Sends authentication details securely
  ↓
FIREBASE (Firebase Authentication)
  ↓
Creates account or checks credentials
  ↓
RESPONSE
  ↓
Success or error returned
  ↓
CLIENT (JavaScript)
  ↓
Processes response and updates the page
  ↓
USER
Sees dashboard/success message or an error message.