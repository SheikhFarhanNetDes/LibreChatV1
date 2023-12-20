---
title: User Auth System
weight: 0
--- 

# User/Auth System

LibreChat has a user authentication system that allows users to sign up and log in securely and easily. The system is scalable and can handle a large number of concurrent users without compromising performance or security.

By default, we have email signup and login enabled, which means users can create an account using their email address and a password. They can also reset their password if they forget it.

Additionally, our system can integrate social logins from various platforms such as Google, GitHub, Discord, OpenID, and more. This means users can log in using their existing accounts on these platforms, without having to create a new account or remember another password.

>❗**Important:** When you run the app for the first time, you need to create a new account by clicking on "Sign up" on the login page. The first account you make will be the admin account. The admin account doesn't have any special features right now, but it might be useful if you want to make an admin dashboard to manage other users later. 

>> **Note:** The first account created should ideally be a local account (email and password).

## Basic Configuration:

### General

Here's an overview of the general configuration, located in the `.env` file at the root of the LibreChat folder.

  - `ALLOW_EMAIL_LOGIN`: Email login. Set to `true` or `false` to enable or disable ONLY email login.
  - `ALLOW_REGISTRATION`: Email registration of new users. Set to `true` or `false` to enable or disable Email registration.
  - `ALLOW_SOCIAL_LOGIN`: Allow users to connect to LibreChat with various social networks, see below. Set to `true` or `false` to enable or disable.
  - `ALLOW_SOCIAL_REGISTRATION`: Enable or disable registration of new user using various social network. Set to `true` or `false` to enable or disable.

> **Note:** OpenID does not support the ability to disable only registration.

>> **Quick Tip:** Even with registration disabled, add users directly to the database using `npm run create-user`. If you can't get npm to work, try `sudo docker exec -ti LibreChat sh` first to "ssh" into the container.

![image](https://github.com/danny-avila/LibreChat/assets/81851188/52a37d1d-7392-4a9a-a79f-90ed2da7f841)

```bash
ALLOW_EMAIL_LOGIN=true
ALLOW_REGISTRATION=true       
ALLOW_SOCIAL_LOGIN=false
ALLOW_SOCIAL_REGISTRATION=false
```

### Session Expiry and Refresh Token

- Default values: session expiry: 15 minutes, refresh token expiry: 7 days
  - For more information: [Refresh Token](https://github.com/danny-avila/LibreChat/pull/927)

```bash
SESSION_EXPIRY=1000 * 60 * 15
REFRESH_TOKEN_EXPIRY=(1000 * 60 * 60 * 24) * 7
```

``` mermaid
sequenceDiagram
    Client->>Server: Login request with credentials
    Server->>Passport: Use authentication strategy (e.g., 'local', 'google', etc.)
    Passport-->>Server: User object or false/error
    Note over Server: If valid user...
    Server->>Server: Generate access and refresh tokens
    Server->>Database: Store hashed refresh token
    Server-->>Client: Access token and refresh token
    Client->>Client: Store access token in HTTP Header and refresh token in HttpOnly cookie
    Client->>Server: Request with access token from HTTP Header
    Server-->>Client: Requested data
    Note over Client,Server: Access token expires
    Client->>Server: Request with expired access token
    Server-->>Client: Unauthorized
    Client->>Server: Request with refresh token from HttpOnly cookie
    Server->>Database: Retrieve hashed refresh token
    Server->>Server: Compare hash of provided refresh token with stored hash
    Note over Server: If hashes match...
    Server-->>Client: New access token and refresh token
    Client->>Server: Retry request with new access token
    Server-->>Client: Requested data
```

### JWT Secret and Refresh Secret

- You should use new secure values. The examples given are 32-byte keys (64 characters in hex). 
  - Use this replit to generate some quickly: [JWT Keys](https://replit.com/@daavila/crypto#index.js)

```bash
JWT_SECRET=16f8c0ef4a5d391b26034086c628469d3f9f497f08163ab9b40137092f2909ef
JWT_REFRESH_SECRET=eaa5191f2914e30b9387fd84e254e4ba6fc51b4654968a9b0803b456a54b8418
```

---

## Automated Moderation System (optional)

The Automated Moderation System is enabled by default. It uses a scoring mechanism to track user violations. As users commit actions like excessive logins, registrations, or messaging, they accumulate violation scores. Upon reaching a set threshold, the user and their IP are temporarily banned. This system ensures platform security by monitoring and penalizing rapid or suspicious activities.

To set up the mod system, review [the setup guide](../../features/mod_system.md).

> *Please Note: If you want this to work in development mode, you will need to create a file called `.env.development` in the root directory and set `DOMAIN_CLIENT` to `http://localhost:3090` or whatever port  is provided by vite when runnning `npm run frontend-dev`*

---

## **Email and Password Reset**

### General setup

in the .env file modify these variables:

```
EMAIL_SERVICE=                  # eg. gmail - see https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services/
EMAIL_HOST=                     # eg. example.com - if EMAIL_SERVICE is not set, connect to this server.
EMAIL_PORT=25                   # eg. 25 - mail server port to connect to with EMAIL_HOST (usually 25, 465, 587)
EMAIL_ENCRYPTION=               # eg. starttls - valid values: starttls (force STARTTLS), tls (obligatory TLS), anything else (use STARTTLS if available)
EMAIL_ENCRYPTION_HOSTNAME=      # eg. example.com - check the name in the certificate against this instead of EMAIL_HOST
EMAIL_ALLOW_SELFSIGNED=         # eg. true - valid values: true (allow self-signed), anything else (disallow self-signed)
EMAIL_USERNAME=                 # eg. me@gmail.com - the username used for authentication. For consumer services, this MUST usually match EMAIL_FROM.
EMAIL_PASSWORD=                 # eg. password - the password used for authentication
EMAIL_FROM_NAME=                # eg. LibreChat - the human-readable address in the From is constructed as "EMAIL_FROM_NAME <EMAIL_FROM>". Defaults to APP_TITLE.
```

If you want to use one of the predefined services, configure only these variables:

EMAIL\_SERVICE is the name of the email service you are using (Gmail, Outlook, Yahoo Mail, ProtonMail, iCloud Mail, etc.) as defined in the NodeMailer well-known services linked above.
EMAIL\_USERNAME is the username of the email service (usually, it will be the email address, but in some cases, it can be an actual username used to access the account).
EMAIL\_PASSWORD is the password used to access the email service. This is not the password to access the email account directly, but a password specifically generated for this service.
EMAIL\_FROM is the email address that will appear in the "from" field when a user receives an email.
EMAIL\_FROM\_NAME is the name that will appear in the "from" field when a user receives an email. If left unset, it defaults to the app title.

If you want to use a generic SMTP service or need advanced configuration for one of the predefined providers, configure these variables:

EMAIL\_HOST is the hostname to connect to, or an IP address.
EMAIL\_PORT is the port to connect to. Be aware that different ports usually come with different requirements - 25 is for mailserver-to-mailserver, 465 requires encryption at the start of the connection, and 587 allows submission of mail as a user.
EMAIL\_ENCRYPTION defines if encryption is required at the start (`tls`) or started after the connection is set up (`starttls`). If either of these values are set, they are enforced. If they are not set, an encrypted connection is started if available.
EMAIL\_ENCRYPTION\_HOSTNAME allows specification of a hostname against which the certificate is validated. Use this if the mail server does have a valid certificate, but you are connecting with an IP or a different name for some reason.
EMAIL\_ALLOW\_SELFSIGNED defines whether self-signed certificates can be accepted from the server. As the mails being sent contain sensitive information, ONLY use this for testing.

NOTE: ⚠️ **Failing to perform either of the below setups will result in LibreChat using the unsecured password reset! This allows anyone to reset any password on your server immediately, without mail being sent at all!** The variable EMAIL\_FROM does not support all email providers **but is still required**. To stay updated, check the bug fixes [here](https://github.com/danny-avila/LibreChat/tags).

### Setup with Gmail

1. Create a Google Account and enable 2-step verification.
2. In the [Google Account settings](https://myaccount.google.com/), click on the "Security" tab and open "2-step verification."
3. Scroll down and open "App passwords." Choose "Mail" for the app and select "Other" for the device, then give it a random name.
4. Click on "Generate" to create a password, and copy the generated password.
5. In the .env file, modify the variables as follows:

```
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=email address for the from field, e.g., noreply@librechat.ai
EMAIL_FROM_NAME="My LibreChat Server"
```

### Setup with custom mail server

1. Gather your SMTP login data from your provider. The steps are different for each, but they will usually list values for all variables.
2. In the .env file, modify the variables as follows, assuming some sensible example values:

```
EMAIL_HOST=mail.example.com
EMAIL_PORT=587
EMAIL_ENCRYPTION=starttls
EMAIL_USERNAME=your-email
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=email address for the from field, e.g., noreply@librechat.ai
EMAIL_FROM_NAME="My LibreChat Server"
```

---

## Social Authentication - Setup and Configuration

### Discord

#### Create a new Discord Application

- Go to **[Discord Developer Portal](https://discord.com/developers)**

- Create a new Application and give it a name

![image](https://github.com/danny-avila/LibreChat/assets/32828263/7e7cdfa0-d1d6-4b6b-a8a9-905aaa40d135)

#### Discord Application Configuration

- In the OAuth2 general settings add a valid redirect URL:
    - Example for localhost: `http://localhost:3080/oauth/discord/callback` 
    - Example for a domain: `https://example.com/oauth/discord/callback`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/6c56fb92-f4ab-43b9-981b-f98babeeb19d)

- In `Default Authorization Link`, select `In-app Authorization` and set the scopes to `applications.commands`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/2ce94670-9422-48d2-97e9-ec40bd331573)

- Save changes and reset the Client Secret

![image](https://github.com/danny-avila/LibreChat/assets/32828263/3af164fc-66ed-4e5e-9f5a-9bcab3df37b4)
![image](https://github.com/danny-avila/LibreChat/assets/32828263/2ece3935-68e6-4f2e-8656-9721cba5388a)

#### .env Configuration

- Paste your `Client ID` and `Client Secret` in the `.env` file:

```bash
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_CALLBACK_URL=/oauth/discord/callback
```

- Save the `.env` file
- Run `docker-compose up -d` to apply the .env configuration changes
---

### Facebook - WIP

> ⚠️ Warning: Work in progress, not currently functional
> ❗ Note: Facebook Authentication will not work from `localhost`

#### Create a Facebook Application

- Go to the **[Facebook Developer Portal](https://developers.facebook.com/)**

- Click on "My Apps" in the header menu

![image](https://github.com/danny-avila/LibreChat/assets/32828263/b75ccb8b-d56b-41b7-8b0d-a32c2e762962)

- Create a new application

![image](https://github.com/danny-avila/LibreChat/assets/32828263/706f050d-5423-44cc-80f0-120913695d8f)

- Select "Authenticate and request data from users with Facebook Login"

![image](https://github.com/danny-avila/LibreChat/assets/32828263/2ebbb571-afe8-429e-ab39-be6e83d12c01)

- Choose "No, I'm not creating a game" 

![image](https://github.com/danny-avila/LibreChat/assets/32828263/88b5160a-9c72-414a-bbcc-7717b81106f3)

- Provide an `app name` and `App contact email` and click `Create app`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/e1282c9e-4e7d-4cbe-82c9-cc76967f83e1)

#### Facebook Application Configuration

- In the side menu, select "Use cases" and click "Customize" under "Authentication and account creation."

![image](https://github.com/danny-avila/LibreChat/assets/32828263/39f4bb70-d9dc-4d1c-8443-2666fe56499b)

-  Add the `email permission`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/dfa20879-2cb8-4daf-883d-3790854afca0)

- Now click `Go to settings`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/512213a2-bd8b-4fd3-96c7-0de6d3222ddd)

- Ensure that `Client OAuth login`, `Web OAuth login` and `Enforce HTTPS` are **enabled**.

![image](https://github.com/danny-avila/LibreChat/assets/32828263/3a7d935b-97bf-493b-b909-39ecf9b3432b)

- Add a `Valid OAuth Redirect URIs` and "Save changes"
    - Example for a domain: `https://example.com/oauth/facebook/callback`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/ef8e54ee-a766-4871-9719-d4eff7a770b6)

- Click `Go back` and select `Basic` in the `App settings` tab

![image](https://github.com/danny-avila/LibreChat/assets/32828263/0d14f702-5183-422e-a12c-5d1b6031581b)

- Click "Show" next to the App secret.

![image](https://github.com/danny-avila/LibreChat/assets/32828263/9a009e37-2bb6-4da6-b5c7-9139c3db6185)

#### .env Configuration

- Copy the `App ID` and `App Secret` and paste them into the `.env` file as follows:

```bash
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
FACEBOOK_CALLBACK_URL=/oauth/facebook/callback
```

- Save the `.env` file.

- Run `docker-compose up -d` to apply the .env configuration changes

#### Error

![image](https://github.com/danny-avila/LibreChat/assets/32828263/f194a5ee-f785-4142-851b-668ea7f90cf9)
![image](https://github.com/danny-avila/LibreChat/assets/32828263/1c93cb36-2a1a-435c-bc3e-d1754d75564b)
![image](https://github.com/danny-avila/LibreChat/assets/32828263/c6f53a30-5d47-49d5-b67a-b5946693296e)
![image](https://github.com/danny-avila/LibreChat/assets/32828263/28533ed7-5fa9-4b11-91ee-a6fda82a3405)

---

### GitHub

1. Go to your **[Github Developer settings](https://github.com/settings/apps)**
2. Create a new Github app
3. Give it a GitHub App name and set in the Homepage URL "your-domain")    (example: http://localhost:3080)
4. Add a callback URL and set it as "your-domain/oauth/github/callback" (example: http://localhost:3080/oauth/github/callback)
5. Remove the Active checkbox in the Webhook section
6. Save changes and generate a Client Secret
7. In the Permissions & events tab select, open the Account Permissions and set Email addresses to Read-only
8. Put the Client ID and Client Secret in the .env file:
```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=/oauth/github/callback # this should be the same for everyone
```
9. Save the .env file

---

### Google

To enable Google login, you must create an application in the [Google Cloud Console](https://cloud.google.com) and provide the client ID and client secret in the `/.env` file.

1. Go to "APIs and Services" in your Google Cloud account and click on "Credentials".
2. Click on "Configure consent screen" and select "External" as the user type.
3. Add "profile", "email" and "openid" as the scopes for your app. These are the first three checkboxes when you click on "Add or remove scopes".
4. Click on "Save and continue" and then "Back to dashboard".
5. Click on "Create Credentials" and then "OAuth client ID".
6. Select "Web application" as the application type and give it a name.
7. Add `https://yourdomain`, `http://localhost:3080` and `http://localhost:3090` to the authorized JavaScript origins.
8. Add `https://your-domain/oauth/google/callback` to the authorized redirect URIs. (if you use localhost then use this `http://localhost:3080/oauth/google/callback`)
9. Click on "Create" and copy your client ID and client secret.
10. Paste them into your `/.env` file.
11. Enable the feature in the `/.env` file

---

### OpenID with AWS Cognito

#### Create a new User Pool in Cognito

- Visit: **[https://console.aws.amazon.com/cognito/](https://console.aws.amazon.com/cognito/)**
- Sign in as Root User
- Click on `Create user pool`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/e9b412c3-2cf1-4f54-998c-d1d6c12581a5)

#### Configure sign-in experience

Your Cognito user pool sign-in options should include `User Name` and `Email`.

![image](https://github.com/danny-avila/LibreChat/assets/32828263/d2cf362d-469e-4993-8466-10282da114c2)

#### Configure Security Requirements

You can configure the password requirements now if you desire

![image](https://github.com/danny-avila/LibreChat/assets/32828263/e125e8f1-961b-4a38-a6b7-ed1faf29c4a3)

#### Configure sign-up experience

Choose the attributes required at signup. The minimum required is `name`. If you want to require users to use their full name at sign up use: `given_name` and `family_name` as required attributes.

![image](https://github.com/danny-avila/LibreChat/assets/32828263/558b8e2c-afbd-4dd1-87f3-c409463b5f7c)

#### Configure message delivery

Send email with Cognito can be used for free for up to 50 emails a day

![image](https://github.com/danny-avila/LibreChat/assets/32828263/fcb2323b-708e-488c-9420-7eb482974648)

#### Integrate your app

Select `Use Cognitio Hosted UI` and chose a domain name

![image](https://github.com/danny-avila/LibreChat/assets/32828263/111b3dd4-3b20-4e3e-80e1-7167d2ad0f62)

Set the app type to `Confidential client`
Make sure `Generate a client secret` is set.
Set the `Allowed callback URLs` to `https://YOUR_DOMAIN/oauth/openid/callback`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/1f92a532-7c4d-4632-a55d-9d00bf77fc4d)

Under `Advanced app client settings` make sure `Profile` is included in the `OpenID Connect scopes` (in the bottom)

![image](https://github.com/danny-avila/LibreChat/assets/32828263/5b035eae-4a8e-482c-abd5-29cee6502eeb)

#### Review and create
You can now make last minute changes, click on `Create user pool` when you're done reviewing the configuration

![image](https://github.com/danny-avila/LibreChat/assets/32828263/dc8b2374-9adb-4065-85dc-a087d625372d)

![image](https://github.com/danny-avila/LibreChat/assets/32828263/67efb1e9-dfe3-4ebd-9ebb-92186c514b5c)

![image](https://github.com/danny-avila/LibreChat/assets/32828263/9f819175-ace1-44b1-ba68-af21ac9f6735)

![image](https://github.com/danny-avila/LibreChat/assets/32828263/3e7b8b17-4e12-49af-99cf-78981d6331df)

#### Get your environment variables

1. Open your User Pool

![image](https://github.com/danny-avila/LibreChat/assets/32828263/b658ff2a-d252-4f3d-90a7-9fbde42c01db)

2. The `User Pool ID` and your AWS region will be used to construct the `OPENID_ISSUER` (see below)

![image](https://github.com/danny-avila/LibreChat/assets/32828263/dc8ae403-cbff-4aae-9eee-42d7cf3485e7)
![image](https://github.com/danny-avila/LibreChat/assets/32828263/d606f5c8-c60b-4d20-bdb2-d0d69e49ea1e)

3.  Go to the `App Integrations` tab

![image](https://github.com/danny-avila/LibreChat/assets/32828263/58713bdc-24bc-47de-bdca-020dc321e997)

4.  Open the app client

![image](https://github.com/danny-avila/LibreChat/assets/32828263/271bf7d2-3df2-43a7-87fc-e50294e49b2e)

5. Toggle `Show Client Secret`

![image](https://github.com/danny-avila/LibreChat/assets/32828263/a844fe65-313d-4754-81b4-380336e0e336)

- Use the `Client ID` for `OPENID_CLIENT_ID`

- Use the `Client secret` for `OPENID_CLIENT_SECRET`

- Generate a random string for the `OPENID_SESSION_SECRET` 

> The `OPENID_SCOPE` and `OPENID_CALLBACK_URL` are pre-configured with the correct values

6. Open the .env file at the root of your LibreChat folder and add the following variables with the values you copied:

```
OPENID_CLIENT_ID=Your client ID
OPENID_CLIENT_SECRET=Your client secret
OPENID_ISSUER=https://cognito-idp.[AWS REGION].amazonaws.com/[USER POOL ID]/.well-known/openid-configuration
OPENID_SESSION_SECRET=Any random string
OPENID_SCOPE=openid profile email
OPENID_CALLBACK_URL=/oauth/openid/callback
```
7. Save the .env file and you're done! You have successfully set up OpenID authentication with Cognito for your app.

---

### OpenID with Azure AD

1. Go to the [Azure Portal](https://portal.azure.com/) and sign in with your account.
2. In the search box, type "Azure Active Directory" and click on it.
3. On the left menu, click on App registrations and then on New registration.
4. Give your app a name and select Web as the platform type.
5. In the Redirect URI field, enter `http://localhost:3080/oauth/openid/callback` and click on Register.
6. You will see an Overview page with some information about your app. Copy the Application (client) ID and the Directory (tenant) ID and save them somewhere.
7. On the left menu, click on Authentication and check the boxes for Access tokens and ID tokens under Implicit grant and hybrid flows.
8. On the left menu, click on Certificates & Secrets and then on New client secret. Give your secret a name and an expiration date and click on Add.
9. You will see a Value column with your secret. Copy it and save it somewhere. Don't share it with anyone!
10. Open the .env file in your project folder and add the following variables with the values you copied:

```
OPENID_CLIENT_ID=Your Application (client) ID
OPENID_CLIENT_SECRET=Your client secret
OPENID_ISSUER=https://login.microsoftonline.com/Your Directory (tenant ID)/v2.0/
OPENID_SESSION_SECRET=Any random string
OPENID_SCOPE=openid profile email #DO NOT CHANGE THIS
OPENID_CALLBACK_URL=/oauth/openid/callback # this should be the same for everyone
```
11. Save the .env file and you're done! You have successfully set up OpenID authentication with Azure AD for your app.

---