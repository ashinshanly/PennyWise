# 💰 Setting Up Real Payments (App Store)

To turn the current "Mock Payment" into real money, we will use **RevenueCat**.
It is the industry standard for React Native apps because it handles the complex receipt validation, cross-platform syncing (iOS/Android), and edge cases that Apple's native APIs make difficult.

## Phase 1: Accounts & Configuration

### 1. App Store Connect
1.  Log in to [App Store Connect](https://appstoreconnect.apple.com).
2.  Go to **My Apps** -> Select PennyWise.
3.  In the sidebar, look for **Subscriptions**.
4.  Create a **Subscription Group** (e.g., "PennyWise Pro").
5.  Create a **Product**:
    *   **Reference Name**: Pro Monthly
    *   **Product ID**: `com.yourname.expense.pro.monthly` (Make sure to save this!)
    *   **Price**: Tier 1 (approx ₹19 or $0.99 depending on your matrix).
6.  FIll in the metadata (Review Screenshot, Name, Description). *Note: The screenshot can just be a picture of your paywall.*

### 2. RevenueCat
1.  Sign up at [RevenueCat.com](https://www.revenuecat.com) (Free tier is generous).
2.  Create a new Project "PennyWise".
3.  Add an **App** (Select iOS/App Store).
4.  It will ask for your **App Store Shared Secret**. Generate this in App Store Connect (Users and Access -> Shared Secrets).
5.  **Products**: Go to the "Entitlements" tab in RevenueCat.
    *   Create an Entitlement called `pro`.
    *   Create an Offering called `default`.
    *   Attach your App Store Product ID (`com.yourname.expense.pro.monthly`) to this offering.

---

## Phase 2: The Code Integration

### 1. Install the SDK
Run this in your terminal:
```bash
npx expo install react-native-purchases
```
*(If extending to Android later, you'll need to update app.json permissions, but for iOS straightforward expo-builds work).*

### 2. Update `_layout.tsx` (Initialize SDK)
You need to initialize the SDK when the app starts.

```typescript
// app/_layout.tsx
import Purchases from 'react-native-purchases';

useEffect(() => {
  // Replace with your API Key from RevenueCat Dashboard
  Purchases.configure({ apiKey: "appl_1234567890abcdef" }); 
}, []);
```

### 3. Update `subscription.tsx` (Purchase Logic)
Replace our current mock logic with this:

```typescript
// app/subscription.tsx
import Purchases from 'react-native-purchases';

const handleSubscribe = async () => {
    setProcessing(true);
    try {
        // Fetch current offerings
        const offerings = await Purchases.getOfferings();
        
        if (offerings.current && offerings.current.availablePackages.length > 0) {
            // Purchase the first available package (Monthly)
            const packageToBuy = offerings.current.availablePackages[0];
            const { customerInfo } = await Purchases.purchasePackage(packageToBuy);
            
            // Check if they are now 'pro'
            if (customerInfo.entitlements.active['pro']) {
                 await unlockPro(); // Update our local state
                 Alert.alert("Success", "Welcome to Pro!");
                 router.back();
            }
        }
    } catch (e: any) {
        if (!e.userCancelled) {
             Alert.alert("Error", e.message);
        }
    } finally {
        setProcessing(false);
    }
};
```

### 4. Restore Purchases
Apple **requires** a "Restore Purchases" button on the paywall. Add this button to your UI:

```typescript
const handleRestore = async () => {
    const customerInfo = await Purchases.restorePurchases();
    if (customerInfo.entitlements.active['pro']) {
       await unlockPro();
       Alert.alert("Restored!", "Your Pro access is back.");
    } else {
       Alert.alert("Info", "No active subscriptions found.");
    }
}
```

## Phase 3: Testing

1.  You **cannot** test real payments in the Simulator.
2.  You must build the app (`npx expo run:ios --device`) and run it on a **Real Device**.
3.  Use an **Apple Sandbox Tester Account** (Create in App Store Connect -> Users -> Sandbox Testers).
4.  Log in with that sandbox account in your iPhone settings (App Store settings) *not* the main iCloud settings.
