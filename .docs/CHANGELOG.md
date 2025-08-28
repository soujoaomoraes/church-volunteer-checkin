# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] - 2025-08-28

### Added
- **Project Scaffolding (FASE 1):**
  - Initialized Node.js project with `package.json`.
  - Created the complete directory structure for assets, services, utils, and tests.
  - Set up a local web server (`serve`) for development.
  - Created a test runner (`test-runner.html`) to execute unit tests in the browser.
  - Added initial documentation (PRD, FRD, Technical Analysis).

- **Core System Backend (FASE 2):**
  - Implemented `Logger` for standardized logging across the application.
  - Implemented `DatabaseManager` to handle all IndexedDB operations transactionally.
  - Defined custom error classes (`ValidationError`, `BusinessRuleError`) for robust error handling.
  - Created a `Validator` utility for data integrity.
  - Implemented `VolunteerService` to manage volunteer data.
  - Implemented `MaterialService` to manage material data and status transitions.
  - Implemented `CheckinService` with transactional logic for checking in volunteers.
  - Implemented `CheckoutService` with transactional logic for checking out volunteers.
  - Developed a comprehensive unit test suite for the entire core services layer.
