import React, { useState } from 'react';
import { ShoppingCart, Camera, List, Sparkles, Package, DollarSign, Zap, Award } from 'lucide-react';
import { useEffect } from 'react';

const API_BASE_URL = 'http://brannigan.taila277ca.ts.net:8000';

const App = () => {
  const [items, setItems] = useState('');
  const [preference, setPreference] = useState('');
  const [trolley, setTrolley] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [view, setView] = useState('input'); // 'input' or 'trolley'
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [otherInfo, setOtherInfo] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        alert('Failed to load products from backend');
      }
    };

    fetchProducts();
  }, []);

  // Call backend API instead of OpenAI directly
  const callBackendAPI = async (itemList, preference) => {
    const response = await fetch(`${API_BASE_URL}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: itemList,
        preference: preference,
        other_info: otherInfo
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.products;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExtracting(true);

    try {
      // Convert image to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Call backend API to extract text from image
      const response = await fetch(`${API_BASE_URL}/api/extract-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          media_type: file.type
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to extract text: ${response.status}`);
      }

      const data = await response.json();
      setItems(data.items);
    } catch (error) {
      console.error('Error extracting text from image:', error);
      alert('Failed to extract text from image. Make sure the backend is running.');
    } finally {
      setExtracting(false);
    }
  };

  // AI-powered trolley generation
  const generateTrolley = async () => {
    if (!items.trim()) {
      alert('Please add items to your list first!');
      return;
    }

    setLoading(true);

    try {
      const itemList = items.toLowerCase().split('\n').filter(i => i.trim());

      // Call backend API
      const recommendations = await callBackendAPI(itemList, preference, otherInfo);

      const initialQuantities = {};
      recommendations.forEach(item => {
        initialQuantities[item.id] = 1;
      });
      setQuantities(initialQuantities);

      setTrolley(recommendations);
      setView('trolley');
    } catch (error) {
      console.error('Error generating trolley:', error);
      alert('Failed to generate trolley. Make sure the backend is running on http://100.81.70.37:8000');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change)
    }));
  };

  const removeItem = (itemId) => {
    setTrolley(prev => prev.filter(item => item.id !== itemId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[itemId];
      return newQuantities;
    });
  };

  const totalPrice = trolley.reduce((sum, item) => sum + (item.price * (quantities[item.id] || 1)), 0);
  const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const PreferenceIcon = ({ type }) => {
    switch(type) {
      case 'budget': return <DollarSign className="w-4 h-4" />;
      case 'quality': return <Award className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    // THEME: Changed gradient from blue/indigo to red
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* THEME: Changed icon color to red */}
            <ShoppingCart className="w-10 h-10 text-red-600" />
            <h2 className="text-base font-bold text-gray-800">Smart Grocery Trolley</h2>
          </div>
          <p className="text-gray-600">Shopping trolley recommendations</p>
        </div>

        {view === 'input' ? (
          /* Input View */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              {/* Manual Input */}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                  Your Shopping List
                </label>
                <textarea
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder="Enter items or meals&#10;(one per line)&#10;milk&#10;bread&#10;eggs"
                  // THEME: Changed focus border to red
                  className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none resize-none text-lg"
                />
              </div>

              {/*Other info*/}
              <div>
                <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-3">
                  Other Information (Optional)
                </label>
                <input
                  type="text"
                  value={otherInfo}
                  onChange={(e) => setOtherInfo(e.target.value)}
                  placeholder="e.g., gluten-free, nut allergy, vegan"
                  // THEME: Changed focus border to red
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-lg"
                />
              </div>
              {/* === END OF NEW BLOCK === */}

              {/* Photo Upload */}
              {/* THEME: Changed hover border to red */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-400 transition-colors">
                <label className="cursor-pointer">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <span className="text-gray-600 block mb-2">
                    {extracting ? 'Extracting items...' : 'Or upload a photo of your list'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"  // Add this line to enable camera on mobile
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={extracting}
                  />
                </label>
              </div>

              {/* Preference Selector */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Shopping Preference
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'budget', label: 'Budget', icon: 'budget', desc: 'Best prices' },
                    { value: 'quality', label: 'Premium', icon: 'quality', desc: 'Top quality' },
                    { value: 'inspiration', label: 'Inspiration', icon: 'inspiration', desc: 'Inspiration Suggestions' }
                  ].map(pref => (
                    <button
                      key={pref.value}
                      onClick={() => setPreference(pref.value)}
                      // THEME: Changed selection/hover colors to red
                      className={`p-4 rounded-xl border-2 transition-all ${
                        preference === pref.value
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <PreferenceIcon type={pref.icon} />
                        <span className="font-semibold text-gray-800">{pref.label}</span>
                        <span className="text-xs text-gray-500">{pref.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateTrolley}
                disabled={loading}
                // THEME: Changed gradient from indigo/purple to red
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    AI is building your trolley...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Create Smart Trolley from List
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Trolley View */
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Your Smart Trolley</h2>
                <p className="text-gray-600">
                  Optimized for: <span className="font-semibold capitalize">{preference}</span>
                </p>
              </div>
              <button
                onClick={() => setView('input')}
                // THEME: Changed hover border to red
                className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-red-400 transition-colors"
              >
                ← Edit List
              </button>
            </div>

            {/* Trolley Items */}
            <div className="space-y-3 mb-6">
              {/* ================================================================
                START: Trolley Item Component Update
                - The layout is changed to match the user's screenshot.
                - It now uses a flex container to put details and price side-by-side.
                - Quantity controls and Remove button are stacked under the title.
                - Removed reason, aisle, etc. to match the clean look of the photo.
                - Kept all existing logic for updateQuantity and removeItem.
                ================================================================
              */}
              {trolley.map(item => (
                <div
                  key={item.id}
                  // Main container: flex, items-start (for vertical alignment), justify-between
                  className="flex items-start justify-between border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition-colors"
                >
                  {/* Column 1: Details (Title, Qty, Remove) */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>

                    {/* Container for controls, matches image layout */}
                    <div className="mt-2">
                      {/* Quantity Controls: Styled to look like the image's selector box */}
                      <div className="flex items-center gap-0 border-2 border-gray-300 rounded-lg w-fit">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-3 py-1 text-lg text-gray-700 rounded-l-md hover:bg-gray-200 transition"
                          disabled={quantities[item.id] <= 1}
                        >
                          −
                        </button>
                        <span className="text-lg font-semibold text-gray-800 px-4 border-l-2 border-r-2 border-gray-300">
                          {quantities[item.id] || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, +1)}
                          className="px-3 py-1 text-lg text-gray-700 rounded-r-md hover:bg-gray-200 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button: Styled as a text link to match image */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Price (Aligned to the right) */}
                  <div className="flex-shrink-0 text-right ml-4">
                    {/* Price color changed to neutral to match image */}
                    <p className="text-2xl font-bold text-gray-800">
                      ${(item.price * (quantities[item.id] || 1)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {/* ================================================================
                END: Trolley Item Component Update
                ================================================================
              */}
            </div>


            {/* Total */}
            <div className="border-t-2 border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-gray-700">Total:</span>
                {/* THEME: Changed total price color to red */}
                <span className="text-3xl font-bold text-red-600">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  const trolleyIds = trolley.map(item => item.id);
                  window.location.href = `http://brannigan.taila277ca.ts.net:8001/?items=${trolleyIds.join(',')}`;
                }}
                // THEME: Changed gradient from green to red
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
              >
                Find your items in store
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
