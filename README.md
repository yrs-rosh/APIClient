# 🚀 API Client

A modern, feature-rich web-based API testing client that helps developers interact with OpenAPI/Swagger specifications directly in their browser. No installation required—just upload your API spec and start testing!

**Live Demo:** [yrs-rosh.github.io/APIClient](https://yrs-rosh.github.io/APIClient)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Why Use API Client?](#why-use-api-client)
- [Quick Start](#quick-start)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Development](#development)
- [Deployment](#deployment)

---

## 🎯 Overview

**API Client** is a lightweight, browser-based tool designed to streamline API testing and exploration. Instead of switching between multiple tools like Postman or Insomnia, you can directly load your OpenAPI/Swagger specification and test your API endpoints right in your browser.

### What is an OpenAPI Specification?

OpenAPI (formerly Swagger) is a standardized format for describing REST APIs. It documents:

- Available endpoints
- Request parameters and body schemas
- Response formats and status codes
- Authentication requirements
- Server URLs

API Client reads this specification and provides an interactive interface to test every endpoint without writing any code.

---

## ✨ Features

### 🎨 Core Features

- **📂 Load OpenAPI Specs** - Upload YAML or JSON specifications directly
- **🔧 Interactive Request Builder** - Easily configure:
  - Path parameters
  - Query parameters
  - Request headers
  - Request body (JSON)
  - Authentication tokens
  - Custom base URLs

- **📤 Send HTTP Requests** - Execute GET, POST, PUT, DELETE, PATCH, and other HTTP methods
- **📥 View Detailed Responses** - See:
  - Status codes and status messages
  - Response body (formatted JSON)
  - Response headers
  - Request duration and payload size

- **📚 API Documentation Browser** - Explore:
  - Operation details and descriptions
  - Request/response schemas
  - Parameter definitions
  - Available tags and endpoints

- **🏷️ Endpoint Organization** - Filter and browse endpoints by tags
- **🔐 Authentication Support** - Built-in support for bearer tokens and custom headers
- **🌓 Dark/Light Theme Toggle** - Comfortable viewing in any lighting condition
- **⌚ Request History** - View previously sent requests and responses
- **🔍 Search & Filter** - Quickly find endpoints by name
- **📝 Sample Spec Included** - Get started immediately with a pre-loaded example API

---

## 💡 Why Use API Client?

### Problems It Solves

1. **No Installation Burden** - Works directly in your browser, no setup required
2. **Visual Parameter Configuration** - No need to manually construct complex URLs and JSON bodies
3. **Immediate Documentation** - View API docs alongside the testing interface
4. **Server Environment Management** - Switch between different API servers (dev, staging, prod)
5. **Team Collaboration** - Share your OpenAPI spec URL and everyone can test the same API
6. **Offline Capability** - Upload specs locally and test without internet (once loaded)

### Use Cases

- **API Development** - Test your endpoints while building
- **API Exploration** - Learn how to use third-party APIs
- **Integration Testing** - Verify API responses before writing integration code
- **Documentation Verification** - Ensure your OpenAPI spec matches implementation
- **Client Onboarding** - Provide clients with an easy way to test your API
- **QA Testing** - Non-technical QA can test APIs without CLI knowledge

---

## 🚀 Quick Start

### Online (No Installation)

1. Visit: [yrs-rosh.github.io/APIClient](https://yrs-rosh.github.io/APIClient)
2. The application loads with a sample API pre-configured
3. Click on any endpoint in the sidebar
4. Configure parameters as needed
5. Click "Send Request"
6. View the response in the Response tab

### Upload Your Own API Spec

1. Click the **"Upload Spec"** button (or use the file input at the top)
2. Select your `openapi.yaml` or `openapi.json` file
3. Your endpoints appear in the sidebar automatically
4. Start testing!

---

## 💻 Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Local Development

1. **Clone the repository:**

   ```bash
   git clone git@github.com:yrs-rosh/APIClient.git
   cd APIClient
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3005`

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview production build locally:**
   ```bash
   npm run preview
   ```

### Environment

- **Development Server Port:** 3005
- **Build Output:** `dist/` folder
- **Base Path (for GitHub Pages):** `/APIClient/`

---

## 📖 Usage Guide

### 1. Loading an API Specification

#### Using the Sample Spec

The app comes with a sample Notes API (JSONPlaceholder) pre-loaded. Use this to explore features.

#### Uploading Your Own Spec

1. Click the file upload area or button
2. Select your OpenAPI YAML or JSON file
3. Endpoints load automatically in the sidebar

#### Pasting Spec Text

You can also paste spec content directly into the text editor.

### 2. Selecting an Endpoint

1. Click on any endpoint in the **Endpoint Sidebar** (left panel)
2. The endpoint details load into the **Request Tab**
3. View parameters, request body schema, and response schemas

### 3. Configuring a Request

In the **Request Tab**, configure:

- **Server URL** - Select from available servers or enter a custom URL
- **Path Parameters** - Auto-extracted from the endpoint path (e.g., `/posts/{id}`)
- **Query Parameters** - Optional filters and pagination options
- **Headers** - Custom headers and authentication
- **Request Body** - JSON editor for POST/PUT/PATCH requests
- **Authorization Token** - Bearer token input for protected endpoints

### 4. Sending a Request

1. Click the **"Send Request"** button
2. The request is executed using the browser's Fetch API
3. Results appear in the **Response Tab**

### 5. Viewing the Response

The **Response Tab** shows:

- **Status Code** - HTTP status (200, 404, 500, etc.)
- **Response Body** - Formatted JSON response
- **Response Headers** - HTTP headers returned by server
- **Metadata** - Request duration and payload size
- **Request URL** - The exact URL that was called

### 6. Viewing API Documentation

The **Docs Tab** displays:

- **Operation Details** - Summary and description
- **Parameters** - Full parameter specifications
- **Request/Response Schemas** - Data structure documentation
- **All Available Schemas** - Reference definitions

### 7. Using Request History

All previous requests are stored in the **History** panel. Click any history item to reload its configuration.

### 8. Switching Themes

Click the **Theme Toggle** button (sun/moon icon) to switch between light and dark modes.

---

## 📁 Project Structure

```
src/
├── main.jsx                          # React entry point
├── app/
│   └── App.jsx                      # Main app component
├── pages/
│   └── ApiClientPage.jsx            # Main page layout
├── features/
│   └── api-client/
│       ├── components/              # UI components
│       │   ├── DocsTab.jsx         # Documentation view
│       │   ├── EndpointSidebar.jsx # Endpoint list
│       │   ├── ParamSection.jsx    # Parameter inputs
│       │   ├── RequestTab.jsx      # Request builder
│       │   ├── ResponseTab.jsx     # Response viewer
│       │   ├── SchemaPreview.jsx   # Schema visualization
│       │   └── ThemeToggle.jsx     # Theme switcher
│       ├── constants/
│       │   └── sampleSpec.js       # Sample OpenAPI spec
│       ├── lib/
│       │   ├── openapi.js          # OpenAPI parsing logic
│       │   ├── request.js          # HTTP request handling
│       │   └── yaml.js             # YAML parsing
│       └── styles/
│           └── apiClient.css       # Component styles
├── shared/
│   ├── components/
│   │   └── AppErrorBoundary.jsx   # Error handling
│   ├── utils/
│   │   ├── hash.js                # Utility functions
│   │   ├── text.js                # Text utilities
│   │   └── theme.js               # Theme utilities
│   └── styles/
│       └── global.css             # Global styles
└── styles/
    └── global.css                 # App-wide styles
```

---

## 🛠️ Technology Stack

### Frontend Framework

- **React 19** - Modern UI library with hooks
- **Vite 8** - Lightning-fast build tool and dev server

### OpenAPI Parsing

- **js-yaml** - YAML parsing and stringification
- **Custom OpenAPI Parser** - Extracts endpoints, parameters, and schemas

### HTTP Requests

- **Fetch API** - Browser-native HTTP client
- **Custom Request Builder** - Constructs proper requests from OpenAPI specs

### Styling

- **CSS3** - Responsive, theme-aware styles
- **CSS Variables** - Theme support (dark/light mode)

### Development Tools

- **ESLint** - Code quality and style enforcement
- **GitHub Pages** - Automated deployment pipeline

---

## 🔧 Development

### Code Standards

The project uses ESLint for code quality. Run linting with:

```bash
npm run lint
```

### Key Development Patterns

1. **Component Organization** - Features are grouped by domain
2. **State Management** - React hooks for local state
3. **Reusable Utilities** - Shared helpers for text, hashing, and theming
4. **Error Boundaries** - Global error handling with `AppErrorBoundary`
5. **CSS Modules Pattern** - Component-scoped styles

### Adding a New Feature

1. Create a new component in `src/features/api-client/components/`
2. Import and use it in `ApiClientPage.jsx`
3. Add styles to `src/features/api-client/styles/apiClient.css`
4. Test with `npm run dev`

---

## 🚢 Deployment

### GitHub Pages (Automated)

The project is configured for automatic deployment via GitHub Actions.

**How it works:**

1. Push changes to the `main` branch
2. GitHub Actions automatically:
   - Installs dependencies
   - Builds the project
   - Deploys to GitHub Pages
3. Your site updates at: `https://yrs-rosh.github.io/APIClient/`

**View deployment status:** Go to **Actions** tab in your GitHub repository

### Manual Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. The `dist/` folder contains the production build

3. Deploy `dist/` contents to your hosting provider

### Environment Configuration

The base path is configured for GitHub Pages:

```javascript
// vite.config.js
export default defineConfig({
  base: "/APIClient/",
  // ...
});
```

To deploy to a different URL, update the `base` path in `vite.config.js`.

---

## 📝 Available Scripts

```bash
npm run dev      # Start development server (port 3005)
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Areas for Contribution

- New authentication methods (OAuth, API Key, etc.)
- Export request/response to different formats
- GraphQL support
- Persistent local storage for specs
- Advanced filtering and search
- Performance optimizations

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🆘 Troubleshooting

### Spec Won't Load

- **Issue:** Invalid YAML/JSON format
- **Solution:** Validate your spec using [swagger.io/validator](https://validator.swagger.io/)

### Requests Fail with CORS Error

- **Issue:** API server doesn't allow cross-origin requests
- **Solution:** The API server needs to include `Access-Control-Allow-Origin` headers. This is a browser security feature.

### Theme Doesn't Save

- **Issue:** Local storage disabled
- **Solution:** Enable local storage in your browser settings

### Spec Text Disappears

- **Issue:** Browser storage limit exceeded
- **Solution:** Clear browser storage or use a smaller spec file

---

## 📞 Support

- **GitHub Issues:** Report bugs or request features on the [issues page](https://github.com/yrs-rosh/APIClient/issues)
- **Live Demo:** [yrs-rosh.github.io/APIClient](https://yrs-rosh.github.io/APIClient)

---

## 🎓 Learning Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger Documentation](https://swagger.io/resources/articles/best-practices-in-api-documentation/)
- [REST API Best Practices](https://restfulapi.net/)
- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Made with ❤️ by [yrs-rosh](https://github.com/yrs-rosh)**

⭐ If you find this useful, please consider starring the repository!
