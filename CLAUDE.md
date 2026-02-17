# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Disney Bounding catalog - a website for finding Disney character color palettes to guide clothing choices. Built with Next.js App Router, React 19, TypeScript, and Tailwind CSS v4.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Package manager:** pnpm (not npm or yarn)

No test framework is configured yet.

## Architecture

- **Next.js 16 App Router** (`app/` directory) with server components as default
- **Tailwind CSS v4** using `@import "tailwindcss"` syntax in `app/globals.css`
- **Path alias:** `@/*` maps to project root
- **TypeScript strict mode** enabled
- **ESLint** flat config (`eslint.config.mjs`) extending `core-web-vitals` and `typescript` rules
