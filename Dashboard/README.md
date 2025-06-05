# This is the dashboard for our project

The dashboard is hosted on AWS Amplify.

URL: https://main.d5l0x3luaudb1.amplifyapp.com/

![image](https://github.com/user-attachments/assets/7366966f-a4df-4351-af98-0b8f767764f7)

![image](https://github.com/user-attachments/assets/fe75e926-546a-4bf4-81c6-d94f2eeb7684)

![image](https://github.com/user-attachments/assets/5cba6ad8-6121-48dd-a71a-ad1e16843ca2)

![image](https://github.com/user-attachments/assets/b995441d-482e-476d-8d80-141d4794e5b2)


# Smart Attendance System Dashboard Deployment Tutorial

A guide to deploy the web dashboard for the Smart Attendance System built with React and AWS Amplify.

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or later)
- **npm** or **yarn**
- **Git**
- **AWS CLI** (v2)
- **Amplify CLI**

### AWS Account Setup
- Active AWS account with billing enabled
- IAM user with programmatic access
- Basic understanding of AWS services

### Required Permissions
Your AWS IAM user needs permissions for:
- AWS Amplify
- AWS AppSync
- DynamoDB
- CloudFormation
- S3
- IAM role creation

## 🚀 Quick Start

### 1. Copy the attendance-amplify-app or clone the original repository
```bash
git clone https://github.com/19Jal/attendance-amplify-app
cd attendance-amplify-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID, Secret Key, Region, and Output format
```

### 4. Install and Configure Amplify CLI
```bash
npm install -g @aws-amplify/cli
amplify configure
```

### 5. Initialize Amplify Project
```bash
amplify init
# Follow the prompts to set up your project
```

### 6. Deploy Backend Services
```bash
amplify push
```

### 7. Start Local Development
```bash
npm start
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.js     # Main dashboard interface
│   ├── DatabaseAdmin.js # Database management
│   ├── DiagnosticPanel.js # System diagnostics
│   └── ConnectionTest.js # Connection testing
├── services/           # API services
│   └── api.js          # API functions
├── utils/              # Utility functions
│   └── seedData.js     # Database seeding
├── graphql/            # GraphQL queries and mutations
└── aws-exports.js      # Amplify configuration (auto-generated)

amplify/
├── backend/            # Backend configuration
│   ├── api/           # GraphQL API setup
│   └── storage/       # DynamoDB tables
└── team-provider-info.json # Environment settings
```

## 🗄️ Database Setup

The system uses two main DynamoDB tables:

### FaceIndex Table
- **Primary Key:** StudentID (String)
- **Attributes:** FaceID, ImageID, Name
- **Purpose:** Store student information and face recognition data

### Attendance Table  
- **Primary Key:** StudentID (String)
- **Sort Key:** Date (String)
- **Attributes:** Image, Name, Time
- **Purpose:** Store attendance records

## ⚙️ Configuration Steps

### 1. Environment Setup
The dashboard automatically configures itself using `aws-exports.js`. Key configurations include:
- GraphQL endpoint URL
- API authentication type
- AWS region settings

### 2. API Configuration
Located in `amplify/backend/api/attendanceamplifyapp/`:
- GraphQL schema definition
- Resolver configurations
- Authentication rules

### 3. Database Configuration
Tables can be:
- **Created new** - Amplify generates fresh DynamoDB tables
- **Imported existing** - Connect to existing DynamoDB tables


## 🌐 Deployment via AWS Amplify Console (Web Interface)

This section covers deploying the dashboard using the AWS Amplify Console web interface - ideal for users who prefer a GUI approach over CLI commands.

### Prerequisites for Console Deployment
- GitHub account with the repository
- AWS account with appropriate permissions
- Repository pushed to GitHub/GitLab/Bitbucket

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit for Amplify deployment"
   git push origin main

Here's the additional section to add to your README.md:

## 🌐 Deployment via AWS Amplify Console (Web Interface)

This section covers deploying the dashboard using the AWS Amplify Console web interface - ideal for users who prefer a GUI approach over CLI commands.

### Prerequisites for Console Deployment
- GitHub account with the repository
- AWS account with appropriate permissions
- Repository pushed to GitHub/GitLab/Bitbucket

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit for Amplify deployment"
   git push origin main
   ```

2. **Ensure your repository includes:**
   - All source code from this project
   - `package.json` with correct dependencies
   - `amplify/` folder with backend configuration
   - `public/` folder with static assets

### Step 2: Access AWS Amplify Console

1. **Login to AWS Console:**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Sign in with your AWS credentials

2. **Navigate to Amplify:**
   - Search for "Amplify" in the AWS services search bar
   - Click on "AWS Amplify" from the results

3. **Start New App:**
   - Click "New app" → "Host web app"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)

### Step 3: Connect Your Repository

1. **Authorize AWS Amplify:**
   - Click "Connect branch"
   - Authorize AWS Amplify to access your repositories
   - Select your repository from the dropdown

2. **Choose Branch:**
   - Select the branch to deploy (usually `main` or `master`)
   - Click "Next"

### Step 4: Configure Build Settings

1. **App Name:**
   - Enter a name for your app (e.g., "smart-attendance-dashboard")

2. **Environment Selection:**
   - Choose "Create new environment" or select existing
   - Name your environment (e.g., "production", "staging")

3. **Build Settings:**
   Amplify should auto-detect the build settings. Verify they match:
   ```yaml
   version: 1
   backend:
     phases:
       build:
         commands:
           - '# Execute Amplify CLI with the helper script'
           - amplifyPush --simple
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Advanced Settings (Optional):**
   - Environment variables (if needed)
   - Build timeout settings
   - Custom headers

### Step 5: Review and Deploy

1. **Review Configuration:**
   - Verify repository and branch selection
   - Check build settings
   - Confirm app name and environment

2. **Save and Deploy:**
   - Click "Save and deploy"
   - Amplify will start the deployment process

### Step 6: Monitor Deployment

1. **Deployment Phases:**
   - **Provision:** Setting up resources
   - **Build:** Installing dependencies and building
   - **Deploy:** Deploying to CDN
   - **Verify:** Running post-deployment checks

2. **View Logs:**
   - Click on each phase to view detailed logs
   - Monitor for any errors or warnings

### Step 7: Configure Backend (If Not Already Done)

If this is your first deployment, you may need to set up the backend:

1. **Backend Environment:**
   - Go to "Backend environments" tab
   - Click "Create backend environment"
   - Follow the setup wizard

2. **API Configuration:**
   - Amplify will detect your GraphQL schema
   - Confirm the API settings
   - Deploy backend changes

### Step 8: Access Your Deployed App

1. **Get URL:**
   - Once deployment is complete, you'll see a green checkmark
   - Your app URL will be displayed (e.g., `https://main.d1234567890.amplifyapp.com`)

2. **Test Functionality:**
   - Open the URL in your browser
   - Test the dashboard features
   - Verify database connectivity

### Managing Your Deployment

#### Automatic Deployments
- **Code Changes:** Push to your connected branch triggers automatic deployment
- **Backend Changes:** Amplify detects and deploys backend changes automatically

#### Manual Operations
- **Redeploy:** Click "Redeploy this version" for manual deployment
- **Stop Auto-Deploy:** Disable automatic deployments if needed
- **Environment Variables:** Add/modify through the console

#### Branch-based Deployments
- **Multiple Environments:** Connect different branches to different environments
- **Feature Branches:** Create preview deployments for feature branches
- **Pull Request Previews:** Enable automatic previews for pull requests

### Environment Configuration

#### Production Environment
```
Environment name: production
Branch: main
Auto-deploy: Enabled
```

#### Staging Environment
```
Environment name: staging  
Branch: develop
Auto-deploy: Enabled
```

### Monitoring and Management

#### Performance Monitoring
- **Amplify Console:** Built-in analytics and performance metrics
- **CloudWatch:** Detailed logging and monitoring
- **Real User Monitoring:** Track user interactions and performance

#### Domain Management
1. **Custom Domain:**
   - Go to "Domain management"
   - Click "Add domain"
   - Follow DNS configuration steps

2. **SSL Certificate:**
   - Automatically provisioned by Amplify
   - Free SSL/TLS certificates included

## 📝 GraphQL Schema Configuration

The heart of the Smart Attendance System's API is the GraphQL schema that defines the data structure and operations. This section explains the schema setup and customization.

### Schema Overview

The GraphQL schema is located at `amplify/backend/api/attendanceamplifyapp/schema.graphql` and defines two main data types that correspond to DynamoDB tables.

### Schema Code

```graphql
# Schema for imported existing tables - NO automatic timestamps
# This matches your actual DynamoDB table structure

type FaceIndex @model @auth(rules: [{ allow: public }]) {
  StudentID: String! @primaryKey
  FaceID: String!
  ImageID: String!  
  Name: String!
  # Note: No createdAt/updatedAt - these don't exist in imported tables
}

# Attendance table has composite primary key (StudentID + Date)
type Attendance @model @auth(rules: [{ allow: public }]) {
  StudentID: String! @primaryKey(sortKeyFields: ["Date"])
  Date: String! 
  Image: String
  Name: String!
  Time: String!
  # Note: No createdAt/updatedAt - these don't exist in imported tables
}
```

## 🆘 Support and Resources

### Documentation
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Documentation](https://reactjs.org/docs/)
- [GraphQL Documentation](https://graphql.org/learn/)
