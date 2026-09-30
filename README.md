# SahiKagaz 📄⚡

> **Lightning-Fast, 100% Client-Side Image Compressor (MB to KB) & Format Converter**  
> *Zero Uploads • Absolute Privacy • Exact Target KB Engine • Tailored for Govt Exams & High-Performance Web*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-sachinmandawi.github.io%2Fsahikagaz-4f46e5?style=for-the-badge&logo=githubpages&logoColor=white)](https://sachinmandawi.github.io/sahikagaz/)
[![Deploy Status](https://img.shields.io/github/actions/workflow/status/sachinmandawi/sahikagaz/deploy.yml?branch=main&label=Deploy&style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/sachinmandawi/sahikagaz/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Built with Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20Client--Side-10b981?style=for-the-badge&logo=shield&logoColor=white)](#privacy-guarantee)
[![Zero Uploads](https://img.shields.io/badge/Cloud%20Uploads-0%20Bytes-success?style=for-the-badge)](#privacy-guarantee)

---

## 🌟 Overview

**SahiKagaz** is an enterprise-grade, ultra-lightweight web application designed to solve one of the most common digital hurdles: **reducing heavy image files (from megabytes down to exact kilobytes) without destroying visual clarity or leaking sensitive personal documents to external cloud servers.**

Whether you are a student submitting passport photos and signatures to strict government portals (SSC, UPSC, IBPS, NEET, GATE) or a web developer optimizing web graphics for Core Web Vitals, **SahiKagaz guarantees your files meet exact size limits in milliseconds.**

🔗 **Live Website**: [https://sachinmandawi.github.io/sahikagaz/](https://sachinmandawi.github.io/sahikagaz/)

---

## 🚀 Key Features

### 1. 🎯 Exact Target KB Binary Search Engine
- Enter your exact file size limit (e.g. `20 KB`, `50 KB`, `100 KB`, `200 KB`, `500 KB`).
- Intelligent binary search automatically balances canvas dimensions, aspect ratio, and compression quality to hit your target under the limit.
- No more guessing percentage sliders or dealing with rejected uploads!

### 2. 🔒 100% Client-Side Privacy Guarantee
- **Zero Server Uploads**: Every byte is processed locally within your browser using HTML5 Canvas & Blob APIs.
- Your sensitive certificates, ID cards, passport photos, and handwritten signatures never travel over the internet.
- Works entirely offline once cached.

### 3. 📋 Pre-Configured Govt Exam & Job Presets
One-click dimension and file size presets for all major recruitment boards:
- **SSC (CGL, CHSL, MTS, GD)**: Photo (20–50 KB, 3.5×4.5 cm) & Signature (10–20 KB)
- **UPSC (Civil Services, NDA, CDS)**: Photo (20–50 KB) & Signature (10–20 KB)
- **IBPS / SBI Bank PO & Clerk**: Photo (20–50 KB) & Signature (10–20 KB)
- **NTA NEET / JEE Main**: Postcard/Passport Photo (10–200 KB) & Signature (4–30 KB)
- **GATE / IIT JAM**: Photograph (20–200 KB) & Signature (5–200 KB)
- **State PSC / Police / Teaching Exams**: Standardized document profiles

### 4. 🔄 Standalone Multi-Format Converter
- Convert instantly between **JPG / JPEG**, **PNG**, **WebP**, and **PDF Document**.
- Image-to-PDF engine with custom page layouts (Fit to Page, Margin, Full Stretch).
- Lossless transparent PNG support and next-gen Google WebP output.

### 5. 📦 High-Speed Batch Queue & ZIP Export
- Drag and drop dozens of images simultaneously.
- Compress or convert whole batches in parallel.
- Download everything at once bundled in a single `.zip` file with one click.

### 6. 🎨 Polished Modern UX & Dark Mode
- Clean, minimal header showcasing official SahiKagaz folded-document brand identity.
- Dual-theme support with automatic system preference detection and smooth toggle.
- Non-intrusive ad placement architecture compliant with Google AdSense program policies.
- 100% mobile, tablet, and desktop responsive layout.

---

## 📊 Comparison: SahiKagaz vs Traditional Compressors

| Feature | SahiKagaz | Traditional Online Tools |
| :--- | :---: | :---: |
| **Privacy & Security** | 🟢 **100% In-Browser (0 Uploads)** | 🔴 Uploads to remote servers |
| **Target KB Accuracy** | 🟢 **Exact Target Match (e.g. 50 KB)** | 🔴 Guesswork percentages (e.g. 70%) |
| **Govt Exam Presets** | 🟢 **SSC, UPSC, NEET, IBPS Built-in** | 🔴 None |
| **PDF Conversion** | 🟢 **Direct Image to PDF Engine** | 🔴 Separate paid tool |
| **Batch ZIP Download** | 🟢 **Free & Unlimited** | 🔴 Restricted / Paywalled |
| **Watermarks** | 🟢 **Zero Watermarks** | 🔴 Often watermarked |
| **Sign-Up Required** | 🟢 **No Account Needed** | 🔴 Email capture / Sign-up walls |

---

## 🛠️ Architecture & Tech Stack

- **Core Runtime**: Vanilla ES Modules (Zero framework overhead for maximum speed)
- **Build Tooling**: [Vite 8](https://vitejs.dev/)
- **Styling**: Modern CSS3 (Custom Design System, CSS Variables, Glassmorphism, Responsive Grid & Flexbox)
- **Archiving**: [JSZip](https://stuk.github.io/jszip/) for client-side archive packaging
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) for client-side vector & image document compilation
- **Compliance & SEO**: Google Consent Mode v2, JSON-LD Schema (`WebApplication`, `FAQPage`, `BreadcrumbList`), semantic HTML5

---

## 📂 Project Directory Structure

```text
sahikagaz/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated GitHub Pages CI/CD workflow
├── dist/                       # Production distribution build (generated)
├── public/
│   ├── ads.txt                 # Authorized Google AdSense publisher specification
│   ├── favicon.svg             # Official SahiKagaz folded document brand icon
│   ├── robots.txt              # Search bot crawler rules & sitemap pointer
│   ├── sample-photo.jpg        # Demo test photo for instant user previews
│   └── sitemap.xml             # XML sitemap for Google Search Console indexing
├── src/
│   ├── compressor.js           # Binary search target KB compression engine
│   ├── main.js                 # App controller, event handlers, and tool views
│   └── style.css               # Complete responsive CSS stylesheet & dark theme
├── .gitignore                  # Git ignore rules
├── index.html                  # Main application markup & SEO structured data
├── package.json                # Project dependencies & npm build scripts
├── README.md                   # Repository documentation
└── vite.config.js              # Vite configuration (relative path base for GitHub Pages)
```

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` (bundled with Node.js)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sachinmandawi/sahikagaz.git
   cd sahikagaz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   The optimized production bundle will be generated inside the `dist/` directory.

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🌐 Deployment

### GitHub Pages (Automated)
This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys the latest commit on `main` directly to GitHub Pages.

### Manual / Other Platforms (Vercel, Netlify, Cloudflare Pages)
Because SahiKagaz produces a purely static build:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Output**: Fully static HTML/CSS/JS (no Node server required at runtime)

---

## 📈 AdSense & Monetization Architecture

SahiKagaz is fully built to satisfy Google AdSense Publisher Program Policies:
- **Google Consent Mode v2**: Explicit user opt-in/opt-out with automatic cookie storage handling.
- **`ads.txt`**: Standardized file placed at root `/ads.txt` verifying authorized seller identity.
- **`robots.txt`**: Grants full crawler access to `Mediapartners-Google` and search indexers.
- **Deep Content**: Over 2,000 words of original educational and regulatory guidelines detailing photographic specifications for Indian competitive examinations.
- **High-CTR Non-Intrusive Ad Slots**: Clean leaderboard, mid-content, native in-article, and dismissible mobile sticky slots labeled strictly as `ADVERTISEMENT`.

---

## 👤 Author & Maintainer

**Sachin Mandawi**
- **GitHub**: [@sachinmandawi](https://github.com/sachinmandawi)
- **Email**: sachinmandawi@gmail.com
- **Project**: [SahiKagaz](https://sachinmandawi.github.io/sahikagaz/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to use, modify, and distribute with attribution.
