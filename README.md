# PennyWise

A **Privacy-First** auto-tracking expense manager built for iOS. PennyWise solves "manual entry fatigue" by automating expense tracking and applying **smart categorization algorithms** to bank SMS messages, while ensuring **100% of your data stays on your device**. No servers, no cloud, no tracking.

<p align="center">
  <img src="assets/readme-images/app_home_screen.png" width="300" alt="Home Screen" />
  <img src="assets/readme-images/app_analytics_screen.png" width="300" alt="Analytics Screen" />
</p>

---

## Why I Built This?

Most expense trackers require you to manually open the app and log every coffee you buy. I wanted something that felt more automated. Since iOS doesn't allow apps to read your SMS inbox directly (for good reason), I built a workaround using **iOS Shortcuts** + **Deep Linking**.

Now, when I get a bank SMS, an automation runs, extracts the details, and pushes it to the app instantly. It feels native and "magic", but it's just some clever engineering.

## Key Features

- **Automated Tracking:** Parses SMS text to find Amount (`750`), Merchant (`Starbucks`), and Account (`HDFC`).
- **Deep Compatibility:** Works with any bank SMS format via Regex patterning.
- **Multiple Accounts:** Separate tracking for distinct Bank Accounts, Cash, and Wallets.
- **Privacy First:** Data lives locally on your device (`AsyncStorage`). No external servers.
- **Fluid UI:** heavily uses `react-native-reanimated` for smooth 60fps interactions.

---

## 📸 Screenshots

### Dashboard & Analytics
The UI is designed to be minimal and information-dense.
<p align="center">
  <img src="assets/readme-images/app_home_screen.png" width="220" alt="Home" />
  <img src="assets/readme-images/app_history_screen.png" width="220" alt="History" />
  <img src="assets/readme-images/app_analytics_screen.png" width="220" alt="Analytics" />
</p>

### Account Management
<p align="center">
  <img src="assets/readme-images/acc_list_final.png" width="220" alt="Accounts" />
  <img src="assets/readme-images/add_acc_form.png" width="220" alt="Add Account" />
</p>

---

## ⚙️ The Technical Stuff (How it works)

### The "Loophole" (Shortcuts Automation)
Since we can't read SMS directly, we use the iOS **Shortcuts** app as a bridge.

1.  **Trigger:** An iOS Automation triggers `When Message Received` containing keywords like "Spent" or "Debited".
2.  **Pass-through:** The Shortcut takes the `Content` of the message and opens a Deep Link to the app.
    ```
    expense-tracker://add-from-shortcut?sms=<MESSAGE_CONTENT>&sender=<BANK_NAME>
    ```
3.  **Parsing Logic:** Inside the React Native app, we parse the raw SMS string.
    - **Amount:** Regex search for patterns like `Rs. \d+` or `INR \d+`.
    - **Merchant:** Heuristics to find the vendor name (usually after "at" or "to").
    - **Account Linking:** Fuzzy matching the `sender` param (e.g., "HDFC-Bank") to your local Account names.

<p align="center">
  <img src="assets/readme-images/sms_verified.png" width="500" alt="Shortcuts Setup" />
</p>

### Tech Stack
- **Framework:** [Expo](https://expo.dev) (SDK 52)
- **Navigation:** `expo-router` (File-based routing, very Next.js like)
- **Animations:** `react-native-reanimated` (for the sweet layout transitions)
- **Charts:** `react-native-gifted-charts`
- **Design:** Custom-built components (no massive UI library bloat)

---

## 💻 Running Locally

If you want to tweak this or run it on your own phone:

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/yourusername/pennywise.git
    ```

2.  **Install dependencies:**
    ```bash
    cd pennywise
    npm install
    ```

3.  **Start the server:**
    ```bash
    npx expo start
    ```

4.  **Run on iOS:**
    - Download **Expo Go** on your iPhone.
    - Scan the QR code shown in your terminal.
    - *Note: The SMS automation feature requires a real device, but you can test everything else in the Simulator.*

---

<p align="center">
  Made with ❤️ by Ashin Shanly
</p>
