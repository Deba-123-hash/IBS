import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { UtensilsCrossed, Star, CheckCircle2, Clock, ThumbsUp } from 'lucide-react';

export default function Mess() {
  const [menu, setMenu] = useState(null);
  const [mealType, setMealType] = useState('LUNCH');
  const [rating, setRating] = useState(4);
  const [foodQuality, setFoodQuality] = useState(4);
  const [hygiene, setHygiene] = useState(5);
  const [portion, setPortion] = useState(4);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/mess/menu');
        setMenu(res.data);
      } catch (err) {
        console.warn('Mess load fallback', err);
      }
    }
    load();
  }, []);

  const handleFeedback = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/mess/feedback', {
        mealType,
        rating,
        foodQuality,
        hygiene,
        portion,
        comments
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setComments('');
      }, 3000);
    } catch (err) {
      alert('Feedback submission failed');
    }
  };

  const meals = menu?.today?.meals || {
    BREAKFAST: { timing: '07:30 AM - 09:15 AM', items: 'Masala Dosa, Sambhar, Coconut Chutney, Boiled Eggs / Banana, Tea / Coffee' },
    LUNCH: { timing: '12:30 PM - 02:15 PM', items: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Cucumber Salad, Gulab Jamun' },
    SNACKS: { timing: '05:00 PM - 06:15 PM', items: 'Samosa with Mint Chutney, Ginger Cardamom Tea' },
    DINNER: { timing: '07:45 PM - 09:45 PM', items: 'Mix Veg Korma, Rajma Dal, Steamed Basmati Rice, Chapati, Fresh Cut Fruits' }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mess & Dietary Logistics</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Daily active dining menu, nutritional breakdown, and student quality feedback
        </p>
      </div>

      {/* Today's Meals Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(meals).map(([typeKey, details]) => (
          <div
            key={typeKey}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                <span>{typeKey}</span>
                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  {details.timing}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {details.items}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Section: Feedback Form + Weekly Schedule */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Meal Rating Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Submit Meal Feedback</h2>
          </div>

          {submitted ? (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center text-emerald-800 text-xs font-bold space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <div>Thank you! Your dining review was registered in the Mess Committee ledger.</div>
            </div>
          ) : (
            <form onSubmit={handleFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Meal</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="SNACKS">Evening Snacks</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="block text-[11px] text-slate-500 mb-1">Food Taste</span>
                  <select
                    value={foodQuality}
                    onChange={(e) => setFoodQuality(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-1 text-xs text-center"
                  >
                    <option value={5}>5 ★ Excellent</option>
                    <option value={4}>4 ★ Good</option>
                    <option value={3}>3 ★ Average</option>
                    <option value={2}>2 ★ Poor</option>
                    <option value={1}>1 ★ Bad</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="block text-[11px] text-slate-500 mb-1">Cleanliness</span>
                  <select
                    value={hygiene}
                    onChange={(e) => setHygiene(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-1 text-xs text-center"
                  >
                    <option value={5}>5 ★ Spotless</option>
                    <option value={4}>4 ★ Clean</option>
                    <option value={3}>3 ★ Acceptable</option>
                    <option value={2}>2 ★ Poor</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="block text-[11px] text-slate-500 mb-1">Portion Size</span>
                  <select
                    value={portion}
                    onChange={(e) => setPortion(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-1 text-xs text-center"
                  >
                    <option value={5}>5 ★ Abundant</option>
                    <option value={4}>4 ★ Sufficient</option>
                    <option value={3}>3 ★ Adequate</option>
                    <option value={2}>2 ★ Deficient</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Comments / Suggestions</label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share feedback on seasoning, warmth, refill speed..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-2.5 font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Submit Dining Review
              </button>
            </form>
          )}
        </div>

        {/* Weekly Menu Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-3">Weekly Rotation Menu</h2>
          <div className="space-y-2 text-xs max-h-80 overflow-y-auto pr-1">
            {(menu?.weeklySchedule || [
              { day: 'Monday', lunch: 'Rajma Chawal, Aloo Gobhi, Curd, Roti', dinner: 'Egg Curry / Paneer Bhurji, Dal, Rice' },
              { day: 'Tuesday', lunch: 'Paneer Butter Masala, Dal Tadka, Jeera Rice', dinner: 'Mix Veg Korma, Rajma, Rice, Roti' },
              { day: 'Wednesday', lunch: 'Chole Bhature / Steamed Rice, Boondi Raita', dinner: 'Festive Special Thali, Kheer, Puri' },
              { day: 'Thursday', lunch: 'Kadhi Pakoda, Rice, Aloo Jeera, Roti', dinner: 'Soya Chaap Curry, Moong Dal, Rice' },
              { day: 'Friday', lunch: 'Veg Biryani / Chicken Biryani, Salan, Raita', dinner: 'Dal Makhani, Butter Roti, Ice Cream' },
              { day: 'Saturday', lunch: 'South Indian Meals, Sambhar, Rasam', dinner: 'Khichdi, Baingan Bharta, Papad, Pickle' },
              { day: 'Sunday', lunch: 'Special Poori Aloo, Sweet Semolina Halwa', dinner: 'Light Dinner, Vegetable Pulao, Dal, Roti' }
            ]).map((d, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                <span className="font-bold text-slate-900 block mb-0.5">{d.day}</span>
                <div className="text-slate-600"><strong className="text-slate-700">Lunch:</strong> {d.lunch}</div>
                <div className="text-slate-600 mt-0.5"><strong className="text-slate-700">Dinner:</strong> {d.dinner}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
