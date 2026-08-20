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
