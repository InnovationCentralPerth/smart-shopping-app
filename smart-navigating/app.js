// Author: Basil Toufexis 11/11/2025
// basil2fxs@gmail.com 

const API_URL = 'http://brannigan.taila277ca.ts.net:8001';
let currentItems = [];
let allItems = [];
let collectedItems = new Set();
let currentMode = 'fastest';
let checkoutPath = [];
let fullPath = [];
let allItemsCollected = false;

// Comprehensive emoji mapping
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

const modeDescriptions = {
    'fastest': '⚡ Express Route',
    'specials': '🔍 Explore Specials'
};

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadItemsJSON();
    renderStoreLayout();
});

function setupEventListeners() {
    document.getElementById('resetBtn').addEventListener('click', resetShoppingList);
    document.getElementById('finishBtn').addEventListener('click', finishTrip);
    document.getElementById('zoomIn').addEventListener('click', () => adjustZoom(0.1));
    document.getElementById('zoomOut').addEventListener('click', () => adjustZoom(-0.1));
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentMode = e.target.dataset.mode;
            if (currentItems.length > 0) {
                calculateRoute();
            }
        });
    });
}

async function loadItemsJSON() {
    try {
        const response = await fetch('items.json');
        allItems = await response.json();
        console.log(`Loaded ${allItems.length} items from JSON`);
        loadItemsFromURL();
    } catch (error) {
        console.error('Error loading items.json:', error);
        alert('Error loading items.json. Make sure the file is in the same directory.');
    }
}

function loadItemsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemsParam = urlParams.get('items');
    
    if (itemsParam) {
        const itemIds = itemsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        console.log('Loading items from URL:', itemIds);
        
        if (itemIds.length > 0) {
            const foundItems = [];
            for (const id of itemIds) {
                const item = allItems.find(i => i.id === id);
                if (item) {
                    foundItems.push(item);
                } else {
                    console.warn(`Item with ID ${id} not found`);
                }
            }
            
            if (foundItems.length > 0) {
                currentItems = foundItems;
                collectedItems.clear();
                allItemsCollected = false;
                calculateRoute();
                return;
            }
        }
    }
    
    selectRandomItems(5);
}

function selectRandomItems(count) {
    if (allItems.length === 0) return;
    const shuffled = [...allItems].sort(() => 0.5 - Math.random());
    currentItems = shuffled.slice(0, count);
    collectedItems.clear();
    allItemsCollected = false;
    calculateRoute();
}

function resetShoppingList() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('items')) {
        loadItemsFromURL();
    } else {
        selectRandomItems(5);
    }
    document.getElementById('finishBtn').style.display = 'none';
}

function finishTrip() {
    alert('🎉 Shopping trip completed! Thank you for using Coles Store Locator.');
    resetShoppingList();
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
    const aisleNum = aisle.charAt(0);
    if (aisleNum === '6') return 'Bakery';
    if (aisleNum === '7') return 'Deli';
    if (aisleNum === '8') return 'Produce';
    return `AISLE ${aisle}`;
}

async function calculateRoute() {
    try {
        const response = await fetch(`${API_URL}/api/shopping-list?mode=${currentMode}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(currentItems)
        });
        
        const data = await response.json();
        currentItems = data.items;
        checkoutPath = data.checkout_path || [];
        fullPath = data.full_path || [];
        
        console.log('Route calculated with full A* pathfinding');
        console.log('Full path waypoints:', fullPath.length);
        
        renderStoreLayout();
        renderCurrentPath();
        renderShoppingList();
        updateModeInfo();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderStoreLayout() {
    const mapContainer = document.getElementById('storeMap');
    
    mapContainer.innerHTML = `
        <div class="store-layout" id="storeLayout">
            <div class="entrance"></div>
            <div class="checkout-area">CHECKOUT<br>COUNTERS</div>
            <div class="bakery-section">BAKERY</div>
            <div class="deli-section">DELI</div>
            <div class="fresh-produce">PRODUCE</div>
            
            <div class="shelf shelf-0"></div>
            <div class="shelf shelf-1"></div>
            <div class="shelf shelf-2"></div>
            <div class="shelf shelf-3"></div>
            <div class="shelf shelf-4"></div>
            <div class="shelf shelf-5"></div>
            
            <div class="aisle-label aisle-label-1">Aisle 1</div>
            <div class="aisle-label aisle-label-2">Aisle 2</div>
            <div class="aisle-label aisle-label-3">Aisle 3</div>
            <div class="aisle-label aisle-label-4">Aisle 4</div>
            <div class="aisle-label aisle-label-5">Aisle 5</div>
            
            <div id="pathContainer"></div>
        </div>
    `;
    
    addSpecialMarkers();
}

async function addSpecialMarkers() {
    try {
        const response = await fetch(`${API_URL}/api/specials`);
        const data = await response.json();
        const container = document.getElementById('pathContainer');
        
        data.specials.forEach(special => {
            const marker = document.createElement('div');
            marker.className = 'special-marker';
            marker.textContent = '$';
            
            let x = special.x;
            let y = special.y;
            
            if (x > 350 && x < 450) {
                x += 60;
            }
            
            marker.style.left = x + 'px';
            marker.style.top = y + 'px';
            marker.title = `${special.discount}% OFF at ${special.aisle}`;
            container.appendChild(marker);
        });
    } catch (error) {
        console.error('Error loading specials:', error);
    }
}

function renderCurrentPath() {
    const container = document.getElementById('pathContainer');
    if (!container) return;
    
    const specials = container.querySelectorAll('.special-marker');
    container.innerHTML = '';
    specials.forEach(s => container.appendChild(s));
    
    const startMarker = document.createElement('div');
    startMarker.className = 'start-marker';
    startMarker.textContent = '🚪';
    startMarker.style.left = '380px';
    startMarker.style.top = '570px';
    container.appendChild(startMarker);
    // Add ENTRY text label to the right side of start

    
    let nextItemIndex = -1;
    for (let i = 0; i < currentItems.length; i++) {
        if (!collectedItems.has(i)) {
            nextItemIndex = i;
            break;
        }
    }
    
    // Show ALL item markers (including special waypoints)
    renderAllItemMarkers(container, nextItemIndex);
    
    if (nextItemIndex === -1 && currentItems.length > 0) {
        allItemsCollected = true;
        document.getElementById('finishBtn').style.display = 'flex';
        
        if (checkoutPath && checkoutPath.length > 1) {
            for (let i = 0; i < checkoutPath.length - 1; i++) {
                drawPathSegment(container, checkoutPath[i], checkoutPath[i + 1]);
            }
            
            const checkoutMarker = document.createElement('div');
            checkoutMarker.className = 'checkout-marker';
            checkoutMarker.textContent = '✓';
            const lastPoint = checkoutPath[checkoutPath.length - 1];
            checkoutMarker.style.left = lastPoint.x + 'px';
            checkoutMarker.style.top = lastPoint.y + 'px';
            container.appendChild(checkoutMarker);
        }
        return;
    } else {
        document.getElementById('finishBtn').style.display = 'none';
    }
    
    if (nextItemIndex >= 0) {
        const nextItem = currentItems[nextItemIndex];
        
        // Draw FULL A* path for current segment using waypoint lines
        if (nextItem.path_to_item && nextItem.path_to_item.length > 1) {
            for (let i = 0; i < nextItem.path_to_item.length - 1; i++) {
                drawPathSegment(container, nextItem.path_to_item[i], nextItem.path_to_item[i + 1]);
            }
            // Add animated waypoint lines (thin dashed orange with arrows)
            for (let i = 0; i < nextItem.path_to_item.length - 1; i++) {
                drawWaypointLine(container, nextItem.path_to_item[i], nextItem.path_to_item[i + 1]);
            }
            // Add waypoint dots at corners
            nextItem.path_to_item.forEach((waypoint, idx) => {
                if (idx > 0 && idx < nextItem.path_to_item.length - 1) {
                    const dot = document.createElement('div');
                    dot.className = 'waypoint-dot';
                    dot.style.left = waypoint.x + 'px';
                    dot.style.top = waypoint.y + 'px';
                    container.appendChild(dot);
                }
            });
        }
    }
}

function renderAllItemMarkers(container, nextItemIndex) {
    const positionMap = new Map();
    
    currentItems.forEach((item, idx) => {
        const isCollected = collectedItems.has(idx);
        const isNext = idx === nextItemIndex;
        const isSpecial = item.is_special === true;
        
        let x = item.shelf_x;
        let y = item.shelf_y;
        
        // Handle overlap
        const posKey = `${Math.round(x/5)}_${Math.round(y/5)}`;
        if (positionMap.has(posKey)) {
            const offset = positionMap.get(posKey);
            positionMap.set(posKey, offset + 1);
            const angle = (offset * Math.PI * 2) / 3;
            x += Math.cos(angle) * 25;
            y += Math.sin(angle) * 25;
        } else {
            positionMap.set(posKey, 1);
        }
        
        const marker = document.createElement('div');
        
        if (isSpecial) {
            // Special waypoint marker (only in specials mode)
            marker.className = `item-marker special-waypoint ${isNext ? 'active' : ''} ${isCollected ? 'passed' : ''}`;
            marker.textContent = '$';
        } else {
            // Regular item marker
            marker.className = `item-marker ${isNext ? 'active' : ''} ${isCollected ? 'collected' : ''}`;
            marker.textContent = isCollected ? '✓' : item.waypoint_number;
        }
        
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        
        if (!isSpecial) {
            marker.onclick = () => toggleItemCollection(idx);
        }
        
        marker.title = `${item.waypoint_number}. ${item.name}`;
        container.appendChild(marker);
    });
}

function drawPathSegment(container, point1, point2) {
    const segment = document.createElement('div');
    segment.className = 'path-segment';
    
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    segment.style.width = length + 'px';
    segment.style.left = point1.x + 'px';
    segment.style.top = point1.y + 'px';
    segment.style.transform = `rotate(${angle}deg)`;
    segment.style.transformOrigin = 'left center';
    
    container.appendChild(segment);
}

function drawWaypointLine(container, point1, point2) {
    const seg = document.createElement('div');
    seg.className = 'waypoint-line';

    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    seg.style.width = length + 'px';
    seg.style.left = point1.x + 'px';
    seg.style.top = point1.y + 'px';
    seg.style.transform = `rotate(${angle}deg)`;
    seg.style.transformOrigin = 'left center';

    container.appendChild(seg);
}


function renderShoppingList() {
    const container = document.getElementById('shoppingList');
    
    if (currentItems.length === 0) {
        container.innerHTML = `
            <div style="padding: 30px 20px; text-align: center; color: #999;">
                <p style="font-size: 16px; margin-bottom: 10px;">Loading items...</p>
            </div>
        `;
        return;
    }
    
    const sectionLabel = document.getElementById('currentSection');
    if (sectionLabel) {
        // Count only non-special items
        const regularItems = currentItems.filter(item => !item.is_special);
        const collectedCount = Array.from(collectedItems).filter(idx => !currentItems[idx].is_special).length;
        const totalCount = regularItems.length;
        sectionLabel.textContent = `${collectedCount}/${totalCount} COLLECTED - ${modeDescriptions[currentMode]}`;
    }
    
    const uncollected = [];
    const collected = [];
    
    currentItems.forEach((item, index) => {
        if (collectedItems.has(index)) {
            collected.push({item, index});
        } else {
            uncollected.push({item, index});
        }
    });
    
    const allToRender = [...uncollected, ...collected];
    
    container.innerHTML = allToRender.map(({item, index}) => {
        const emoji = item.is_special ? '💰' : getItemEmoji(item.name);
        const isCollected = collectedItems.has(index);
        const isSpecial = item.is_special === true;
        const aisleDisplay = getAisleDisplayName(item.aisle);
        
        return `
            <div class="item-card ${isCollected ? 'collected' : ''} ${isSpecial ? 'special-item' : ''}" 
                 data-index="${index}"
                 draggable="${!isCollected && !isSpecial}"
                 ondragstart="handleDragStart(event)"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event)"
                 ondragend="handleDragEnd(event)">
                <div class="drag-handle" style="cursor: ${isCollected || isSpecial ? 'default' : 'grab'}; margin-right: 8px; color: #999; font-size: 18px;">
                    ${isCollected || isSpecial ? '' : '☰'}
                </div>
                <div class="item-checkbox ${isSpecial ? 'special-checkbox' : ''} ${isCollected ? 'checked' : ''}" 
                     ${isSpecial ? '' : `onclick="toggleItemCollection(${index})"`}></div>
                
                <div class="item-image">${emoji}</div>
                
                <div class="item-details">
                    <div class="item-name">
                        ${item.name}
                        <span class="item-waypoint">#${item.waypoint_number}</span>
                    </div>
                    <div class="item-aisle">📍 ${aisleDisplay}</div>
                    <div class="item-price">
                        ${isSpecial ? `${item.discount}% OFF` : `$${item.price.toFixed(2)} • Stock: ${item.stock}`}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Check if all REGULAR items collected (not special waypoints)
    const regularItemsCollected = currentItems.every((item, idx) => 
        item.is_special || collectedItems.has(idx)
    );
    
    if (regularItemsCollected && currentItems.length > 0) {
        allItemsCollected = true;
        const banner = document.createElement('div');
        banner.className = 'completion-banner';
        banner.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 8px;">✓</div>
            <div style="font-weight: bold;">All items collected!</div>
            <div style="font-size: 13px; margin-top: 4px;">Follow the path to checkout</div>
        `;
        container.insertBefore(banner, container.firstChild);
    }
}

let draggedIndex = null;

function handleDragStart(event) {
    draggedIndex = parseInt(event.target.dataset.index);
    event.target.style.opacity = '0.5';
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const dropTarget = event.target.closest('.item-card');
    if (!dropTarget) return false;
    
    const dropIndex = parseInt(dropTarget.dataset.index);
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
        if (!collectedItems.has(draggedIndex) && !collectedItems.has(dropIndex)) {
            const draggedItem = currentItems[draggedIndex];
            const newItems = [...currentItems];
            
            newItems.splice(draggedIndex, 1);
            const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
            newItems.splice(adjustedDropIndex, 0, draggedItem);
            
            currentItems = newItems;
            calculateRouteWithCurrentOrder();
        }
    }
    
    return false;
}

function handleDragEnd(event) {
    event.target.style.opacity = '1';
    draggedIndex = null;
}

async function calculateRouteWithCurrentOrder() {
    try {
        const response = await fetch(`${API_URL}/api/shopping-list?mode=custom`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(currentItems)
        });
        
        const data = await response.json();
        currentItems = data.items;
        checkoutPath = data.checkout_path || [];
        fullPath = data.full_path || [];
        
        renderCurrentPath();
        renderShoppingList();
        
    } catch (error) {
        console.error('Error recalculating route:', error);
    }
}

function toggleItemCollection(index) {
    // Don't allow toggling special waypoints
    if (currentItems[index].is_special) return;
    
    if (collectedItems.has(index)) {
        collectedItems.delete(index);
        allItemsCollected = false;
    } else {
        collectedItems.add(index);
        
        // Check if all regular items collected
        const regularItemsCollected = currentItems.every((item, idx) => 
            item.is_special || collectedItems.has(idx)
        );
        
        if (regularItemsCollected) {
            allItemsCollected = true;
        }
    }
    
    renderCurrentPath();
    renderShoppingList();
}

function updateModeInfo() {
    let modeInfo = document.querySelector('.mode-info');
    if (!modeInfo) {
        modeInfo = document.createElement('div');
        modeInfo.className = 'mode-info';
        document.querySelector('.store-layout').appendChild(modeInfo);
    }
    modeInfo.textContent = modeDescriptions[currentMode];
}

let zoomLevel = 1;
function adjustZoom(delta) {
    zoomLevel = Math.max(0.7, Math.min(1.5, zoomLevel + delta));
    const layout = document.getElementById('storeLayout');
    if (layout) {
        layout.style.transform = `scale(${zoomLevel})`;
        layout.style.transformOrigin = 'center center';
    }
}

window.toggleItemCollection = toggleItemCollection;
window.handleDragStart = handleDragStart;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.handleDragEnd = handleDragEnd;

console.log('Coles Store Locator initialized with full A* pathfinding');
console.log('A* paths stay on white walkable areas only');
console.log('Specials mode includes sale waypoints that auto-pass');

// Menu functionality
function setupMenuListeners() {
    const menuBtn = document.getElementById('menuBtn');
    const menuPopup = document.getElementById('menuPopup');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuPopup.style.display = 'flex';
        });
    }
}

function closeMenu() {
    const menuPopup = document.getElementById('menuPopup');
    menuPopup.style.display = 'none';
}

function goToLockScreen() {
    // Save current shopping data to localStorage
    const uncollectedItems = currentItems.filter((item, idx) => 
        !item.is_special && !collectedItems.has(idx)
    );
    
    const shoppingData = {
        items: uncollectedItems.map(item => ({
            name: item.name,
            aisle: item.aisle,
            price: item.price,
            stock: item.stock
        })),
        currentIndex: 0,
        collectedItems: []
    };
    
    localStorage.setItem('colesShoppingData', JSON.stringify(shoppingData));
    
    // Navigate to lock screen
    window.location.href = 'lockscreen.html';
}

// Initialize menu on page load
document.addEventListener('DOMContentLoaded', () => {
    setupMenuListeners();
    
    // Sync shopping data from lock screen if returning
    const storedData = localStorage.getItem('colesShoppingData');
    if (storedData) {
        try {
            const data = JSON.parse(storedData);
            // You can use this to sync collected items if needed
            console.log('Synced data from lock screen:', data);
        } catch (e) {
            console.error('Error parsing stored data:', e);
        }
    }
});

// Make functions globally accessible
window.closeMenu = closeMenu;
window.goToLockScreen = goToLockScreen;