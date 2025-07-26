# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The goal of this project is to build a data-logging mobile app for allied healthcare professionals working in South African government hospitals.

To start, we first want to build a basic MVP using the following tech stack:

- HTML
- CSS
- JavaScript
- Supabase

We just want a quick working prototype showcasing the UX, workflow and database model.

Once proven, we will rebuild the project from scratch in a seperate project using the following tech stack:

- Next.js
- React
- TypeScript
- Tailwind

This can be the real app for production that is clean, maintainable and scalable.

## Standard Workflow

1. First, carefully and systematically think through the problem and break it up into phases.

2. Write your plan to PLANNING.md and break each phase into a subset of to-do items.

3. Review your plan with me before you start coding.

4. Once approved, start working through the items and cross them off as you complete them.

5. Always add unit tests, integration tests and end-to-end tests where relevant.

6. After completing a phase, add a high level summary/explanation of the completed work at the end of each phase. Also which tests you added relating to that phase.

7. Make every task and code change as simple as possible. Don't overcomplicate the code, especially not for an MVP.

8. Never use hardcoded API keys in the source code. Use a .env file to store API keys and database connection credentials. Since you do not have access to the .env file, use .env.example to build an example .env file.

9. If you are unsure how to proceed, rather stop and ask than just assuming and doing something I might not like.

## MCP Usage

1. Use the Context7 MCP server for up-to-date documentation on the different technologies being used.

2. Use the Supabase MCP server to create and modify tables.

3. Use the Magic UI MCP server for UI inspiration. I would like a minimalist look like Google uses with the class and style associated with Apple. I think the Roboto font from Google could be nice.

4. When you find yourself needing to think more carefully about a problem, use the Sequential Thinking MCP.

5. If you need to search the web, use the Exa or Brave MCP servers---Exa for more detailed technical research and Brave for more general-purpose research.

6. To remeber key aspects of the project, use the Memory MCP to store context.
