## **Next.js TypeScript Typesense eDashboard - README**

### **Project Overview**

This project is a dashboard built with **Next.js** and **TypeScript**, integrated with **Typesense** for search functionality. It serves as a web interface to manage and interact with collections of data stored in Typesense, displaying relevant statistics, and performing operations like search, view, and settings management.

### **Features**

- **Typesense Integration**: Full integration with Typesense to retrieve collections and perform search operations.
- **Responsive Design**: Adaptive user interface built using modern React components for a smooth user experience across devices.
- **Real-time Collection Management**: View, search, and manage collections dynamically.
- **TypeScript**: Full type-safety using TypeScript for a more maintainable and error-free codebase.
- **Reusable UI Components**: Built with reusable UI components (cards, tables, modals, buttons, etc.) to ensure maintainability and scalability.

---

### **Tech Stack**

- **Next.js**: A React-based framework that enables server-side rendering, static site generation, and routing.
- **TypeScript**: For static typing and improved developer experience.
- **Typesense**: A fast, open-source search engine used for managing and searching collections.
- **Tailwind CSS / Custom UI Components**: Tailwind CSS and custom components for designing the UI.
- **Recoil**: State management to handle global states like sidebar visibility.

---

### **Project Structure**

```bash
├── components          # Reusable UI components (cards, buttons, tables, etc.)
├── pages               # Next.js pages (home, collections, search, etc.)
├── atoms               # Recoil atoms for managing application state
├── lib                 # Utility functions (e.g., helper functions, Typesense client)
├── styles              # Global CSS styles or Tailwind configuration
├── public              # Public assets (images, icons, etc.)
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

---

### **Getting Started**

#### Prerequisites

- **Node.js** (v14 or later)
- **Yarn** or **npm**
- **Typesense Server** (local or cloud)

#### Installation

1. **Clone the repository**:

```bash
git clone https://github.com/your-username/next-ts-typesense-dashboard.git
cd next-ts-typesense-dashboard
```

2. **Install dependencies**:

```bash
# Using Yarn
yarn install

# Using npm
npm install
```

3. **Configure Typesense**:
    - Ensure you have a running **Typesense** instance.
    - Create a `.env.local` file in the root directory and configure your Typesense settings:

```bash
NEXT_PUBLIC_TYPESENSE_HOST=localhost
NEXT_PUBLIC_TYPESENSE_PORT=8108
NEXT_PUBLIC_TYPESENSE_PROTOCOL=http
NEXT_PUBLIC_TYPESENSE_API_KEY=your-typesense-api-key
```

4. **Run the development server**:

```bash
# Using Yarn
yarn dev

# Using npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

### **Typesense Integration**

This dashboard interacts with a Typesense instance to perform search and collection management. The `Typesense` client is initialized using the environment variables provided in the `.env.local` file.

#### **Client Setup Example**:

```ts
import Typesense from 'typesense';

const typesenseClient = new Typesense.Client({
    nodes: [
        {
            host: process.env.NEXT_PUBLIC_TYPESENSE_HOST,
            port: Number(process.env.NEXT_PUBLIC_TYPESENSE_PORT),
            protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL,
        },
    ],
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 2,
});

export default typesenseClient;
```

This client is used throughout the project to fetch collections, search data, and display the results dynamically in the UI.

---

### **Key Components**

- **Sidebar**: A collapsible sidebar for easy navigation.
- **Collections Table**: Displays an overview of the collections available in Typesense, including the number of documents and fields.
- **Search Bar**: Enables users to search through collections in real-time.
- **Collection Details**: Displays detailed information about a selected collection, including its documents and settings.

---

### **Deployment**

1. **Build the project**:

```bash
# Using Yarn
yarn build

# Using npm
npm run build
```

2. **Run the production build**:

```bash
# Using Yarn
yarn start

# Using npm
npm start
```

Your app will be running on [http://localhost:3000](http://localhost:3000) in production mode.

---

### **Available Scripts**

- `dev`: Runs the project in development mode.
- `build`: Builds the project for production.
- `start`: Runs the production build.
- `lint`: Lints the codebase using ESLint.

---

### **Environment Variables**

- `NEXT_PUBLIC_TYPESENSE_HOST`: The Typesense server host.
- `NEXT_PUBLIC_TYPESENSE_PORT`: The Typesense server port.
- `NEXT_PUBLIC_TYPESENSE_PROTOCOL`: The protocol to use (http/https).
- `NEXT_PUBLIC_TYPESENSE_API_KEY`: Your Typesense API key for authentication.

---

### **Contributing**

Feel free to contribute to this project! Follow these steps:

1. Fork the repository.
2. Create a new feature branch: `git checkout -b feature-branch-name`.
3. Commit your changes: `git commit -m "Add some feature"`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Submit a pull request.

---

### **License**

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

---

### **Additional Resources**

- [Next.js Documentation](https://nextjs.org/docs)
- [Typesense Documentation](https://typesense.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
