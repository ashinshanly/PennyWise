import { CategoryId } from '@/constants/Colors';

// Keyword mappings for auto-categorization
const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
    food: [
        // Food delivery
        'swiggy', 'zomato', 'uber eats', 'ubereats', 'dominos', 'pizza hut', 'pizzahut',
        'mcdonalds', 'mcd', 'burger king', 'kfc', 'subway', 'starbucks', 'cafe',
        // Restaurants
        'restaurant', 'dining', 'food', 'kitchen', 'biryani', 'curry', 'hotel',
        'bakery', 'eatery', 'diner', 'bistro', 'canteen',
        // Groceries
        'bigbasket', 'blinkit', 'zepto', 'instamart', 'grofers', 'dmart', 'reliance fresh',
        'grocery', 'supermarket', 'vegetables', 'fruits',
    ],
    transport: [
        // Ride sharing
        'uber', 'ola', 'rapido', 'meru', 'auto', 'taxi', 'cab',
        // Fuel
        'petrol', 'diesel', 'fuel', 'indian oil', 'iocl', 'hp', 'bharat petroleum', 'bpcl',
        'shell', 'reliance petrol', 'essar',
        // Public transport
        'metro', 'railway', 'irctc', 'bus', 'redbus', 'abhibus',
        // Parking & tolls
        'parking', 'fastag', 'toll', 'paytm fastag',
    ],
    shopping: [
        // E-commerce
        'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'snapdeal', 'tata cliq',
        'nykaa', 'purplle', 'mamaearth',
        // Electronics
        'croma', 'reliance digital', 'vijay sales', 'apple', 'samsung',
        // Fashion
        'zara', 'h&m', 'uniqlo', 'pantaloons', 'lifestyle', 'shoppers stop', 'max',
        // General
        'mall', 'shop', 'store', 'mart', 'retail', 'purchase',
    ],
    bills: [
        // Utilities
        'electricity', 'electric', 'power', 'bescom', 'tata power', 'adani power',
        'gas', 'mahanagar gas', 'piped gas', 'lpg', 'indane', 'bharat gas',
        'water', 'water board',
        // Telecom
        'jio', 'airtel', 'vi', 'vodafone', 'idea', 'bsnl', 'recharge', 'prepaid', 'postpaid',
        // Internet
        'broadband', 'wifi', 'internet', 'act fibernet', 'hathway',
        // Insurance
        'insurance', 'lic', 'hdfc life', 'icici prudential', 'premium',
        // Rent & EMI
        'rent', 'emi', 'loan', 'housing',
    ],
    entertainment: [
        // Streaming
        'netflix', 'prime video', 'amazon prime', 'hotstar', 'disney', 'sony liv',
        'zee5', 'voot', 'jiocinema', 'mubi', 'apple tv',
        // Music
        'spotify', 'gaana', 'jiosaavn', 'wynk', 'apple music', 'youtube music',
        // Gaming
        'steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'gaming',
        // Movies & events
        'bookmyshow', 'paytm movies', 'pvr', 'inox', 'cinepolis', 'movie', 'cinema',
        'concert', 'event', 'ticket',
        // Subscriptions
        'subscription', 'membership',
    ],
    health: [
        // Pharmacy
        'apollo', 'netmeds', '1mg', 'pharmeasy', 'medplus', 'pharmacy', 'medicine',
        'medical', 'drug', 'tablet',
        // Healthcare
        'hospital', 'clinic', 'doctor', 'consultation', 'diagnostic', 'lab', 'pathology',
        'healthcare', 'health', 'treatment',
        // Fitness
        'gym', 'fitness', 'yoga', 'cult.fit', 'cult fit', 'gold gym',
        // Wellness
        'spa', 'massage', 'wellness', 'ayurveda',
    ],
    income: [
        // Salary & payments
        'salary', 'credited', 'received', 'payment received', 'refund',
        'cashback', 'reward', 'bonus', 'incentive', 'commission',
        // Transfers
        'transferred to your', 'money received', 'upi cr', 'imps cr', 'neft cr',
    ],
    other: [],
};

// Patterns to identify income vs expense from bank messages
const INCOME_PATTERNS = [
    /credited/i,
    /received/i,
    /cr\b/i,
    /deposit/i,
    /refund/i,
    /cashback/i,
];

const EXPENSE_PATTERNS = [
    /debited/i,
    /spent/i,
    /paid/i,
    /dr\b/i,
    /purchase/i,
    /withdrawn/i,
    /payment of/i,
];

/**
 * Extract amount from a bank SMS message
 * Handles formats like: Rs.450, INR 450, ₹450, Rs 450.00
 */
export function extractAmount(message: string): number | null {
    const patterns = [
        /(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d{2})?)/i,
        /([\d,]+(?:\.\d{2})?)\s*(?:rs\.?|inr|₹)/i,
        /(?:amount|amt)[:\s]*([\d,]+(?:\.\d{2})?)/i,
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match) {
            const amountStr = match[1].replace(/,/g, '');
            const amount = parseFloat(amountStr);
            if (!isNaN(amount) && amount > 0) {
                return amount;
            }
        }
    }
    return null;
}

/**
 * Determine if the transaction is income or expense
 */
export function detectTransactionType(message: string): 'income' | 'expense' {
    const lowerMessage = message.toLowerCase();

    // Check income patterns first
    for (const pattern of INCOME_PATTERNS) {
        if (pattern.test(lowerMessage)) {
            return 'income';
        }
    }

    // Check expense patterns
    for (const pattern of EXPENSE_PATTERNS) {
        if (pattern.test(lowerMessage)) {
            return 'expense';
        }
    }

    // Default to expense (most common)
    return 'expense';
}

/**
 * Auto-categorize a transaction based on description/merchant keywords
 */
export function categorizeTransaction(description: string): CategoryId {
    const lowerDesc = description.toLowerCase();

    // Check each category's keywords
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'other') continue;

        for (const keyword of keywords) {
            if (lowerDesc.includes(keyword.toLowerCase())) {
                return category as CategoryId;
            }
        }
    }

    // Default to 'other' if no match
    return 'other';
}

/**
 * Parse a bank SMS message and extract transaction details
 */
export function parseBankMessage(message: string): {
    amount: number | null;
    type: 'income' | 'expense';
    category: CategoryId;
    description: string;
} {
    const amount = extractAmount(message);
    const type = detectTransactionType(message);

    // If it's income, always use income category
    const category = type === 'income' ? 'income' : categorizeTransaction(message);

    // Extract a short description (merchant name if possible)
    const description = extractMerchantName(message) || 'Transaction';

    return {
        amount,
        type,
        category,
        description,
    };
}

/**
 * Try to extract merchant/vendor name from message
 */
function extractMerchantName(message: string): string | null {
    // Common patterns in bank SMS
    const patterns = [
        /(?:at|to|for|@)\s+([A-Z][A-Za-z0-9\s&.-]+?)(?:\s+on|\s+via|\s+ref|\.|\s*$)/,
        /(?:UPI|IMPS|NEFT)[:\s-]+([A-Za-z0-9\s&.-]+?)(?:\s+on|\s+via|\s+ref|\.|\s*$)/i,
        /(?:spent|paid|purchase)\s+(?:at|to|for)\s+([A-Za-z0-9\s&.-]+)/i,
    ];

    for (const pattern of patterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
            const name = match[1].trim();
            if (name.length > 2 && name.length < 50) {
                return name;
            }
        }
    }

    return null;
}

/**
 * Build URL for deep linking from Shortcuts
 */
export function buildTransactionUrl(
    amount: number,
    description: string,
    type: 'income' | 'expense' = 'expense'
): string {
    const params = new URLSearchParams({
        amount: amount.toString(),
        desc: description,
        type,
    });
    return `expense-tracker://add?${params.toString()}`;
}
