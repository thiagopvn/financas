# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Meu Orçamento" is a personal finance management web application built with React and Firebase. It allows users to upload bank statements (CSV files from Nubank), visualize spending patterns, and track expenses by category.

## Architecture

### Tech Stack
- **Frontend**: React 18 with React Router for SPA routing
- **Styling**: Tailwind CSS (via CDN in index.html)
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Deployment**: Vercel
- **Key Libraries**: 
  - react-dropzone (file uploads)
  - react-icons (UI icons)
  - papaparse (CSV parsing)
  - date-fns (date manipulation)
  - recharts (data visualization)

### Core Components Structure
- **Context Providers**:
  - `AuthContext`: Manages user authentication state with Firebase Auth
  - `DataContext`: Handles transaction data, filtering, and statistics calculations
- **Protected Routes**: All routes except `/login` require authentication
- **Main Pages**:
  - `/login`: Authentication page
  - `/dashboard`: Main dashboard with spending visualizations and KPIs
  - `/upload`: CSV file upload interface for importing bank statements

### Data Flow
1. User uploads Nubank CSV file via `/upload` page
2. `csvParser.js` processes the CSV, normalizing categories and formatting data
3. Transactions are stored in Firestore with userId association
4. `DataContext` provides real-time data synchronization and filtering capabilities
5. Dashboard components consume filtered data for visualization

## Development Commands

This is a Vite project with React and Tailwind CSS. Use these commands:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Important Security Note

The Firebase configuration in `src/firebase/config.js` contains API keys that are currently exposed. While Firebase security rules should protect the backend, consider:
1. Implementing proper Firebase Security Rules
2. Using environment variables for sensitive configuration
3. Restricting API key usage in Firebase Console

## CSV Format Expected

The system now expects a simplified CSV format with automatic category classification:
- `date`: Transaction date (YYYY-MM-DD format)
- `title`: Transaction description (used for automatic categorization)
- `amount`: Transaction amount

**Category Auto-Classification**: Categories are automatically assigned based on intelligent keyword matching in the transaction title. The system includes comprehensive rules for Brazilian financial institutions and can be customized.

## New Features

### Intelligent Category Classification
- **Auto-categorization**: Transactions are automatically classified based on keywords in their titles
- **Editable Categories**: Users can manually edit the category of any transaction
- **Customizable Rules**: Classification rules can be customized, exported, and imported via JSON files
- **Category Manager**: Interface to add/remove keywords for each category

### Key Components Added
- `TransactionsList`: Displays transactions with editable categories
- `CategoryEditor`: Modal for editing individual transaction categories
- `CategoryRulesManager`: Interface for managing classification rules
- `categoryRules.js`: Service for handling classification logic and rule management

### Category Management Features
- Export current rules as JSON file
- Import custom rules from JSON file
- Reset to default classification rules
- Add/remove keywords for any category
- Real-time category updates with Firebase sync

## Deployment

The project is configured for Vercel deployment with SPA routing support (see `vercel.json`). All routes are rewritten to the root to enable client-side routing.