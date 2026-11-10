# Device Toggle

Switch any page to a mobile viewport (375×600) in one click, without opening DevTools.

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/device-toggle/daoknkjhfjpkoomnkmeadpfgnclpbogd)** · 800+ users · 5.0 rating

## Why

Built for customer-support colleagues who needed to see a site the way a customer sees it on mobile, without learning DevTools. It does one thing, in one click.

## How it works

- Manifest V3 extension with a React + TypeScript popup (MUI)
- Attaches to the active tab via `chrome.debugger` and calls the Chrome DevTools Protocol: `Emulation.setDeviceMetricsOverride` to switch to mobile, `Emulation.clearDeviceMetricsOverride` to switch back
- Minimal permissions: `debugger` and `activeTab`; no data collected ([privacy policy](privacyPolicy.md))

## Run locally

```sh
npm install
npm run dev     # dev server
npm run build   # builds to dist/, load it via chrome://extensions → "Load unpacked"
```

## Stack

React · TypeScript · Vite · MUI · Chrome Extensions (MV3) · Chrome DevTools Protocol
