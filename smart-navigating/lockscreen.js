// Author: Basil Toufexis 11/11/2025
// basil2fxs@gmail.com 

// Comprehensive emoji mapping (same as main app)
const itemEmojis = {
    'milk': '🥛', 'cheese': '🧀', 'yogurt': '🥛', 'butter': '🧈', 'cream': '🥛',
    'egg': '🥚', 'cheddar': '🧀', 'mozzarella': '🧀', 'parmesan': '🧀', 'feta': '🧀',
    'bread': '🍞', 'roll': '🥖', 'baguette': '🥖', 'croissant': '🥐', 'bagel': '🥯',
    'muffin': '🧁', 'donut': '🍩', 'cake': '🎂', 'pie': '🥧', 'cookie': '🍪',
    'juice': '🧃', 'orange': '🧃', 'apple juice': '🧃', 'water': '💧', 'coffee': '☕',
    'tea': '🍵', 'soda': '🥤', 'cola': '🥤', 'drink': '🥤', 'wine': '🍷', 'beer': '🍺',
    'apple': '🍎', 'banana': '🍌', 'strawberr': '🍓', 'grape': '🍇', 'watermelon': '🍉',
    'orange': '🍊', 'lemon': '🍋', 'peach': '🍑', 'pear': '🍐', 'cherry': '🍒',
    'kiwi': '🥝', 'mango': '🥭', 'pineapple': '🍍', 'blueberr': '🫐', 'avocado': '🥑',
    'carrot': '🥕', 'broccoli': '🥦', 'potato': '🥔', 'tomato': '🍅', 'corn': '🌽',
    'cucumber': '🥒', 'lettuce': '🥬', 'spinach': '🥬', 'pepper': '🫑', 'onion': '🧅',
    'garlic': '🧄', 'mushroom': '🍄', 'eggplant': '🍆', 'pumpkin': '🎃', 'cabbage': '🥬',
    'chicken': '🍗', 'turkey': '🦃', 'beef': '🥩', 'steak': '🥩', 'pork': '🥓',
    'bacon': '🥓', 'ham': '🥓', 'sausage': '🌭', 'salami': '🥩', 'prosciutto': '🥓',
    'roast': '🍗', 'schnitzel': '🍗', 'nugget': '🍗', 'wing': '🍗', 'mince': '🥩',
    'burger': '🍔', 'patty': '🍔', 'meatball': '🍝', 'kebab': '🍢', 'drumstick': '🍗',
    'fish': '🐟', 'salmon': '🐟', 'tuna': '🐟', 'prawn': '🦐', 'shrimp': '🦐',
    'lobster': '🦞', 'crab': '🦀', 'oyster': '🦪', 'squid': '🦑', 'octopus': '🐙',
    'pasta': '🍝', 'spaghetti': '🍝', 'noodle': '🍜', 'rice': '🍚', 'bean': '🫘',
    'lentil': '🫘', 'chickpea': '🫘', 'pea': '🫛', 'cereal': '🥣', 'oat': '🥣',
    'flour': '🌾', 'sugar': '🧂', 'salt': '🧂', 'oil': '🫗', 'sauce': '🥫',
    'soup': '🥫', 'tomato paste': '🥫', 'can': '🥫', 'jar': '🫙', 'honey': '🍯',
    'ice cream': '🍦', 'frozen': '🧊', 'pizza': '🍕', 'chip': '🍟', 'fries': '🍟',
    'popsicle': '🍡', 'sorbet': '🍧', 'gelato': '🍨', 'cone': '🍦', 'tub': '🍨',
    'chocolate': '🍫', 'candy': '🍬', 'lolly': '🍭', 'gum': '🍬', 'crisp': '🥔',
    'pretzel': '🥨', 'popcorn': '🍿', 'nut': '🥜', 'peanut': '🥜', 'almond': '🌰',
    'cashew': '🥜', 'walnut': '🌰', 'pistachio': '🥜', 'seed': '🌻', 'trail mix': '🥜',
    'sushi': '🍣', 'ramen': '🍜', 'dumpling': '🥟', 'spring roll': '🥢', 'wonton': '🥟',
    'tempura': '🍤', 'teriyaki': '🍱', 'curry': '🍛', 'stir fry': '🍜', 'fried rice': '🍚',
    'ketchup': '🍅', 'mustard': '🌭', 'mayo': '🥚', 'jam': '🍓', 'jelly': '🍇',
    'peanut butter': '🥜', 'nutella': '🍫', 'spread': '🧈', 'dip': '🫙', 'hummus': '🫘',
    'baby food': '👶', 'formula': '🍼', 'diaper': '👶', 'wipe': '🧻', 'toy': '🧸',
    'soap': '🧼', 'shampoo': '🧴', 'detergent': '🧽', 'tissue': '🧻', 'paper': '📄',
    'towel': '🧻', 'sponge': '🧽', 'cleaner': '🧹', 'bleach': '🧴', 'bag': '🛍️',
    'smoothie': '🥤', 'shake': '🥤', 'latte': '☕', 'cappuccino': '☕', 'espresso': '☕',
    'mocha': '☕', 'frappe': '🥤', 'bubble tea': '🧋', 'kombucha': '🍵', 'cider': '🍺',
    'default': '🛒'
};

let shoppingData = {
    items: [],
    currentIndex: 0,
    collectedItems: []
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    loadShoppingData();
    updateWidget();
});

function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
}

function loadShoppingData() {
    // Try to get data from localStorage
    const stored = localStorage.getItem('colesShoppingData');
    if (stored) {
        try {
            shoppingData = JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing shopping data:', e);
            setDefaultData();
        }
    } else {
        setDefaultData();
    }
}

function setDefaultData() {
    // Default data if nothing is stored
    shoppingData = {
        items: [
            {
                name: "Coles Iodised Salt 500g",
                aisle: "3C",
                price: 1.30,
                stock: 78
            },
            {
                name: "Coles Long Life Milk 1L",
                aisle: "2A",
                price: 1.45,
                stock: 156
            },
            {
                name: "Coles Free Range Eggs 12pk",
                aisle: "4B",
                price: 6.50,
                stock: 45
            }
        ],
        currentIndex: 0,
        collectedItems: []
    };
}

function getItemEmoji(itemName) {
    const name = itemName.toLowerCase();
    for (const [key, emoji] of Object.entries(itemEmojis)) {
        if (name.includes(key)) {
            return emoji;
        }
    }
    return '🛒';
}

function getAisleDisplayName(aisle) {
    if (!aisle) return 'UNKNOWN';
    const aisleNum = aisle.toString().charAt(0);
    if (aisleNum === '6') return 'Bakery';
    if (aisleNum === '7') return 'Deli';
    if (aisleNum === '8') return 'Produce';
    return `AISLE ${aisle}`;
}

function updateWidget() {
    const uncollectedItems = shoppingData.items.filter((_, idx) => 
        !shoppingData.collectedItems.includes(idx)
    );
    
    if (uncollectedItems.length === 0) {
        showCompletionState();
        return;
    }
    
    const currentItem = uncollectedItems[0];
    const emoji = getItemEmoji(currentItem.name);
    const aisleDisplay = getAisleDisplayName(currentItem.aisle);
    
    document.getElementById('itemEmoji').textContent = emoji;
    document.getElementById('itemName').textContent = currentItem.name;
    document.getElementById('itemLocation').textContent = `📍 ${aisleDisplay}`;
    document.getElementById('itemPrice').textContent = `$${currentItem.price.toFixed(2)}`;
    document.getElementById('itemStock').textContent = `Stock: ${currentItem.stock}`;
    
    const collected = shoppingData.collectedItems.length;
    const total = shoppingData.items.length;
    const remaining = total - collected;
    
    document.getElementById('itemsRemaining').textContent = 
        `${remaining} of ${total} item${remaining !== 1 ? 's' : ''} remaining`;
}

function showCompletionState() {
    document.getElementById('itemEmoji').textContent = '🎉';
    document.getElementById('itemName').textContent = 'All items collected!';
    document.getElementById('itemLocation').textContent = '📍 Head to Checkout';
    document.getElementById('itemPrice').textContent = '';
    document.getElementById('itemStock').textContent = '';
    
    const nextBtn = document.getElementById('nextItemBtn');
    nextBtn.textContent = 'Go to Checkout →';
    nextBtn.onclick = returnToApp;
    
    document.getElementById('itemsRemaining').textContent = 
        `${shoppingData.items.length} items collected ✓`;
}

function moveToNextItem() {
    const uncollectedIndices = shoppingData.items
        .map((_, idx) => idx)
        .filter(idx => !shoppingData.collectedItems.includes(idx));
    
    if (uncollectedIndices.length === 0) {
        returnToApp();
        return;
    }
    
    const currentItemIndex = uncollectedIndices[0];
    const currentItem = shoppingData.items[currentItemIndex];
    
    // Mark as collected
    shoppingData.collectedItems.push(currentItemIndex);
    
    // Save to localStorage
    localStorage.setItem('colesShoppingData', JSON.stringify(shoppingData));
    
    // Show notification
    showNotification(currentItem.name);
    
    // Update widget after a brief delay
    setTimeout(() => {
        updateWidget();
    }, 300);
}

function showNotification(itemName) {
    const notification = document.getElementById('notification');
    const message = document.getElementById('notifMessage');
    
    message.textContent = `${itemName} collected`;
    notification.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function returnToApp() {
    // Save state before returning
    localStorage.setItem('colesShoppingData', JSON.stringify(shoppingData));
    window.location.href = 'index.html';
}

// Listen for updates from the main app
window.addEventListener('storage', (e) => {
    if (e.key === 'colesShoppingData') {
        loadShoppingData();
        updateWidget();
    }
});

// Export function for external use
window.updateShoppingWidget = function(items, collectedIndices) {
    shoppingData.items = items;
    shoppingData.collectedItems = collectedIndices || [];
    localStorage.setItem('colesShoppingData', JSON.stringify(shoppingData));
    updateWidget();
};