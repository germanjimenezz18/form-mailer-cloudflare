# Form Mailer Cloudflare

This repository contains a form mailer project built using **Cloudflare Workers** and **TypeScript** with **Bun**. It is designed for seamless email handling across multiple domains, making it ideal for landing pages and contact forms.

## Features

- **Multi-Domain Support:** Handle forms across various domains with ease.
- **Authentication:** Secure connections with authentication mechanisms.
- **Resend Integration:** Integration with Resend for email functionality.
- **Turso Connection:** Database integration for reliable data management.
- **Lightweight Framework:** Built with Hono for optimized performance.

## Recent Commits

- **feat: Schema adjust** ([commit](https://github.com/germanjimenezz18/form-mailer-cloudflare/commit/b7e93bfdb59cfa7bb999c77c901155e846512a84))
- **refactor: Clean code** ([commit](https://github.com/germanjimenezz18/form-mailer-cloudflare/commit/83bc051fe46277b543d0a0e2b37d8ee1446aedba))
- **feat: Resend Integration** ([commit](https://github.com/germanjimenezz18/form-mailer-cloudflare/commit/f42100f1cd9c6e18439ccf7b0ac6139f55940f23))
- **feat: Authentication + Turso connection** ([commit](https://github.com/germanjimenezz18/form-mailer-cloudflare/commit/bf8a718033eb4efbf24b3898dbf71100a605423f))
- **hono setup** ([commit](https://github.com/germanjimenezz18/form-mailer-cloudflare/commit/831f861556b4fe818f67e3a7e989c517ab9841d9))

## Getting Started

To set up and deploy the project, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/germanjimenezz18/form-mailer-cloudflare.git
   ```

2. **Navigate to the project directory:
   ```sh
   cd form-mailer-cloudflare
   ```
3. **Install dependencies:
   ```sh
   bun install
   ```
4. **Deploy to Cloudflare:
   ```sh
    npx wrangler publish
   ```


## Usage
This project is designed to handle form submissions and send emails using Cloudflare Workers. You can customize it for your specific use case, such as:

- **Email Forwarding:** Redirect form submissions to specified email addresses.
- **Data Storage:** Store form data in Turso or other databases for later processing.
- **Email Automation:** Use Resend integration for sending automated responses.

