# Privacy Policy

This privacy policy outlines the data practices for our extension. We respect your privacy and are committed to being transparent about our data usage.

---

### 1. Data Collection

The extension does not collect, transmit, or share any personal data. It has no servers, no analytics, and makes no network requests.

- **Active Tab Access (`activeTab`):**  
  When you open the extension, it identifies the currently active browser tab so that the device emulation is applied to that tab only.

- **Debugger Usage (`debugger`):**  
  The extension uses the Chrome Debugger API to switch the active tab between the mobile and desktop viewports. It sends exactly two commands: one to apply the mobile screen size and one to remove it.

- **Session Storage (`storage`):**  
  To remember which tabs are in mobile mode, the extension keeps the numeric tab ID, whether mobile mode is on, and the result of the last toggle (success or the kind of error) in the browser's session storage.

---

### 2. Use of Data

- **Active Tab Access:**

  - Used exclusively to perform the toggle device functionality (switching between desktop and mobile views).
  - The tab's address may be checked on your device to tell you when a page cannot be emulated (for example, browser settings pages or the Chrome Web Store). It is never stored or transmitted.

- **Debugger:**

  - Attached to a tab when you switch it to mobile mode, and **it stays attached for as long as mobile mode is on for that tab**. Chrome shows a "Device Toggle started debugging this browser" notice during that time.
  - Detached when you switch the tab back to desktop mode, close the tab, dismiss Chrome's debugging notice, or close the browser.
  - While attached, it is used only to set and clear the screen size override. The extension does not read or change the page's content, network traffic, cookies, or any other data in the tab.

- **Session Storage:**
  - Holds only the per-tab state described above, on your device, in memory.
  - A tab's entry is removed when it returns to desktop mode without an error or when the tab is closed, and everything is erased when the browser closes.

---

### 3. Data Protection

- The extension requests no host permissions, so it has no standing access to the websites you visit.
- Debugger access exists only on tabs you have switched to mobile mode, and only until mobile mode is turned off for that tab.
- Nothing the extension handles leaves your device, is shared with third parties, or persists after the browser session ends.

---

### 4. Changes to the Policy

- Any updates or changes to this privacy policy will be communicated to you through the extension.
- We encourage you to review the policy periodically to stay informed about how we use your data.

---

> [!NOTE]
> If you have any questions, feel free to contact us anytime [here!](https://github.com/gusmagnago)
