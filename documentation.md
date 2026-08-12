# SkillsTrackApp
Learner support portal

1. Project Overview

The learner Support portal is a browser-based web application developed to support 
learners with managing learning tasks, support bookings, learning resources and progress

the application uses Javascript for application and firebase for database/ data storage

2. Client Brief Summary
 - 
3. Project Objectives

The main Objectives are :

- Allow learners to register and sign-in
- Manage learning tasks
- View learning progress
- Access learning resources
- Store application data in firebase
- play basic coding game
- Use GitHub for Team collaboration

4. Technologies Used

 - Firgma Board
 - Miro Board
 - Chrome
 - Github
 
  Firebase Authentication

Authentication system for sign-in, when new user register

1. install Firebase

# Use modular

# choose platform and firebase (React)

# The auth components used throughout this guide are available from that registry, including sign-in-auth-screen, sign-up-auth-screen, email-link-auth-screen, oauth-screen, phone-auth-screen,google-sign-in-button

# add the components you want to use

# React apps without shadcn/ui, install

2. Initialize FirebaseUI

# Create a shared UI store with initializeUI, pass it to your framework integration.

3. Include styles

# Include the FirebaseUI styles(css)

4. Set up sign-in methode

# Email address and password

    Enable Email/Password in the Firebase console
    
    Render EmailLinkAuthScreen in React

# Email link authentication

    Enable Email/Password in the Firebase console

    Render EmailLinkAuthScreen in React

    Complete sign-in with the current URL using the core helpers when needed

# Phone number

    Enable Phone in the Firebase console

    Add your app domain to Authorized domains

    Render PhoneAuthScreen in React, the generated phone-auth-screen

5. Customization

# Require a display name during sign-up

6. Sign in

# Render the auth screen you want and handle success in component callbacks(React) 

7. Sign out

# Use the standard Firebase Authentication sign-out API

8. Google One Tap

# Use the oneTapSignIn(...) behavior to enable Google One Tap

9. Terms of service and privacy policy

# Attach policy links through the platform provider configuration(React)

10. Sign up new users

# Create a new users to register with your app using their email address and a password

# Validate the email address and password

# CreateUserWithEmailAndPassword method

11. Sign in existing users

# Sign in using email address and password

# SignInWithEmailAndPassword method

12. Authentication state observer and get user data

# Get information about the user in the observer

# onAuthStateChanged method

13. Update a user's profile

# updateProfile method

14. set user's email address

15. verification email

# send email verfication

16.  set a user's password

# update password

# send Password reset email

17. Password Authentication

#  email addresses and passwords, 
# Add firebase to javascript project

18. create a password-based account

# create a new account with password
# sign in a user with email address and password
# validating a password on the client

19. Email Authentication

# add firebase on javascript project
# Enable email-link sign-in
# send an authentication link to the user's email address.
