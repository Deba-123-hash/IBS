import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  UtensilsCrossed,
  Star,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Sparkles,
  Coffee,
  Sun,
  Cookie,
  Moon,
  TrendingUp,
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';

export default function Mess() {
  const toast = useToast();
  const [menuData, setMenuData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('Tuesday');
  const [mealType, setMealType] = useState('LUNCH');
  
  // Rating states
  const [overallRating, setOverallRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);
  const [tasteRating, setTasteRating] = useState(4);
  const [qualityRating, setQualityRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [portionRating, setPortionRating] = useState(4);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/mess/menu');
        setMenuData(res.data?.data || res.data || res);
      } catch (err) {
        console.warn('Mess load fallback', err);
      }
    }
    load();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const weeklyMenu = {
    Monday: {
      BREAKFAST: { timing: '07:30 - 09:15 AM', items: 'Aloo Paratha, Curd, Pickle, Boiled Eggs / Banana, Tea / Coffee', icon: Coffee, cal: '480 kcal' },
      LUNCH: { timing: '12:30 - 02:15 PM', items: 'Rajma Masala, Steamed Rice, Mix Veg, Phulka, Onion Salad, Boondi Raita', icon: Sun, cal: '650 kcal' },
      SNACKS: { timing: '05:00 - 06:15 PM', items: 'Veg Cutlet with Green Mint Chutney, Hot Masala Tea', icon: Cookie, cal: '240 kcal' },
      DINNER: { timing: '07:45 - 09:45 PM', items: 'Palak Paneer, Yellow Dal Tadka, Jeera Rice, Tawa Roti, Fruit Custard', icon: Moon, cal: '620 kcal' }
    },
    Tuesday: {
      BREAKFAST: { timing: '07:30 - 09:15 AM', items: 'Masala Dosa, Sambar, Coconut Chutney, Boiled Eggs, Coffee / Tea', icon: Coffee, cal: '460 kcal' },
      LUNCH: { timing: '12:30 - 02:15 PM', items: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Cucumber Salad, Gulab Jamun', icon: Sun, cal: '680 kcal' },
      SNACKS: { timing: '05:00 - 06:15 PM', items: 'Samosa with Tamarind Chutney, Ginger Cardamom Tea', icon: Cookie, cal: '260 kcal' },
      DINNER: { timing: '07:45 - 09:45 PM', items: 'Mix Veg Korma, Rajma Dal, Steamed Basmati Rice, Chapati, Fresh Cut Fruits', icon: Moon, cal: '590 kcal' }
    },
    Wednesday: {
      BREAKFAST: { timing: '07:30 - 09:15 AM', items: 'Poha with Peanuts, Sev, Mint Chutney, Boiled Egg, Milk / Tea', icon: Coffee, cal: '410 kcal' },
      LUNCH: { timing: '12:30 - 02:15 PM', items: 'Chole Bhature / Rice, Boondi Raita, Green Salad, Pickled Chilli', icon: Sun, cal: '720 kcal' },
      SNACKS: { timing: '05:00 - 06:15 PM', items: 'Bread Pakora with Tomato Ketchup, Filter Coffee', icon: Cookie, cal: '290 kcal' },
      DINNER: { timing: '07:45 - 09:45 PM', items: 'Egg Curry / Kadhai Paneer, Moong Dal, Steamed Rice, Phulka, Ice Cream', icon: Moon, cal: '640 kcal' }
    },
    Thursday: {
      BREAKFAST: { timing: '07:30 - 09:15 AM', items: 'Idli, Medu Vada, Sambar, Coconut & Tomato Chutney, Tea / Coffee', icon: Coffee, cal: '430 kcal' },
      LUNCH: { timing: '12:30 - 02:15 PM', items: 'Kadhi Pakora, Jeera Aloo, Steamed Rice, Phulka, Papad, Pickle', icon: Sun, cal: '610 kcal' },
      SNACKS: { timing: '05:00 - 06:15 PM', items: 'Pav Bhaji with Butter Pav, Lemonade', icon: Cookie, cal: '320 kcal' },
      DINNER: { timing: '07:45 - 09:45 PM', items: 'Dal Makhani, Mix Veg Jalfrezi, Peas Pulao, Butter Roti, Suji Halwa', icon: Moon, cal: '670 kcal' }
    },
    Friday: {
      BREAKFAST: { timing: '07:30 - 09:15 AM', items: 'Puri Sabzi, Halwa, Boiled Eggs / Banana, Tea / Milk', icon: Coffee, cal: '520 kcal' },
      LUNCH: { timing: '12:30 - 02:15 PM', items: 'Soyabean Curry, Dal Palak, Steamed Rice, Tawa Roti, Sprout Salad', icon: Sun, cal: '580 kcal' },
      SNACKS: { timing: '05:00 - 06:15 PM', items: 'Maggi Noodles / Veg Sandwich, Hot Coffee', icon: Cookie, cal: '280 kcal' },
      DINNER: { timing: '07:45 - 09:45 PM', items: 'Shahi Paneer, Chana Dal, Jeera Rice, Tandoori Roti, Kheer', icon: Moon, cal: '660 kcal' }
    },
    Saturday: {
      BREAKFAST: { timing: '07:30 - 09:30 AM', items: 'Uttapam with Onion & Tomato, Sambar, Chutney, Tea / Coffee', icon: Coffee, cal: '440 kcal' },
      LUNCH: { timing: '12:30 - 02:30 PM', items: 'Veg Pulao, Curd, Aloo Gobi Masala, Phulka, Papad, Salad', icon: Sun, cal: '620 kcal' },
      SNACKS: { timing: '05:00 - 06:30 PM', items: 'Pani Puri / Bhel Puri Counter, Tea', icon: Cookie, cal: '220 kcal' },
      DINNER: { timing: '07:45 - 10:00 PM', items: 'Special Biryani (Veg/Chicken), Mirchi Ka Salan, Raita, Gulab Jamun', icon: Moon, cal: '740 kcal' }
    },
    Sunday: {
      BREAKFAST: { timing: '08:00 - 10:00 AM', items: 'Club Sandwiches, Cornflakes with Milk, Boiled Eggs, Tea / Coffee', icon: Coffee, cal: '450 kcal' },
      LUNCH: { timing: '12:30 - 02:30 PM', items: 'Special Sunday Feast: Paneer Lababdar, Dum Aloo, Veg Biryani, Roti, Rasgulla', icon: Sun, cal: '750 kcal' },
      SNACKS: { timing: '05:00 - 06:30 PM', items: 'Biscuits, Cake, Hot Masala Tea', icon: Cookie, cal: '210 kcal' },
      DINNER: { timing: '07:45 - 09:45 PM', items: 'Light Khichdi / Steamed Rice, Yellow Dal, Aloo Bhaja, Papad, Curd', icon: Moon, cal: '480 kcal' }
    }
  };

  const dayMeals = weeklyMenu[selectedDay] || weeklyMenu.Tuesday;

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post('/mess/feedback', {
        mealType,
        rating: overallRating,
        foodQuality: qualityRating,
        hygiene: hygieneRating,
        portion: portionRating,
        comments
      });
      setSubmitted(true);
      toast.success('Your dining feedback was logged into the Mess Committee ledger', 'Review Recorded');
      setTimeout(() => {
        setSubmitted(false);
        setComments('');
      }, 3500);
    } catch (err) {
      toast.error('Could not submit feedback', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hostel Central Dining & Mess
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
            Mess Menu & Dietary Logistics
          </h1>
          <p className="text-xs text-slate-500">
            Weekly rotational menu, nutritional calorie tracking, and student quality feedback
          </p>
        </div>

        {/* Quality satisfaction pill */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-2xs text-xs">
          <div className="flex items-center gap-1 text-amber-500 font-black">
            <Star className="h-4 w-4 fill-amber-400" />
            <span>4.4 / 5.0</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">94% Hygiene Rating</span>
        </div>
      </div>

      {/* Day Selector Tabs (Monday through Sunday) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {days.map((d) => {
          const isSelected = selectedDay === d;
          const isToday = d === 'Tuesday';
          return (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-soft'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{d}</span>
              {isToday && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full uppercase ${
                  isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4 Meal Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
        {Object.entries(dayMeals).map(([typeKey, details]) => {
          const Icon = details.icon;
          const isCurrentMeal = typeKey === 'LUNCH';

          return (
            <div
              key={typeKey}
              className={`rounded-3xl border p-5 shadow-xs flex flex-col justify-between transition-all hover-lift ${
                isCurrentMeal
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-soft'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      isCurrentMeal ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{typeKey}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{details.cal}</span>
                    </div>
                  </div>
                  {isCurrentMeal && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{details.timing}</span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100 font-medium">
                  {details.items}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Vegetarian & Jain Counter</span>
                <span className="text-emerald-700 font-semibold">Self-Service</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns: Interactive Star Rating Feedback + Dining Committee Telemetry */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Interactive Feedback Form (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Dietary & Taste Feedback</h2>
              <p className="text-xs text-slate-500">Weekly audit ledger reviewed by Hostel Warden & Student Mess Committee</p>
            </div>
          </div>

          {submitted ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center text-emerald-900 space-y-2 animate-fade-in">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold">Feedback Registered Successfully</h3>
              <p className="text-xs text-slate-600">
                Your ratings have been appended to today's dining satisfaction metrics.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              
              {/* Meal Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Select Meal Session</label>
                <div className="grid grid-cols-4 gap-2">
                  {['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMealType(m)}
                      className={`rounded-xl py-2 font-bold transition border ${
                        mealType === m
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overall Star Rating with Micro-interaction */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="block font-bold text-slate-700 mb-2">Overall Meal Rating</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setOverallRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (hoverRating || overallRating)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 font-bold text-slate-700 text-sm">
                    {hoverRating || overallRating} of 5 Stars
                  </span>
                </div>
              </div>

              {/* Granular Criteria Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Taste & Flavour</span>
                    <span className="text-emerald-700">{tasteRating}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={tasteRating}
                    onChange={(e) => setTasteRating(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Food Quality & Freshness</span>
                    <span className="text-emerald-700">{qualityRating}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={qualityRating}
                    onChange={(e) => setQualityRating(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Cleanliness & Hygiene</span>
                    <span className="text-emerald-700">{hygieneRating}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={hygieneRating}
                    onChange={(e) => setHygieneRating(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>Portion Size & Quantity</span>
                    <span className="text-emerald-700">{portionRating}/5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={portionRating}
                    onChange={(e) => setPortionRating(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Suggestions / Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Suggestions for Dietary Committee</label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Suggestions on spice level, curd consistency, roti softness, sweet dish variety..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold transition shadow-soft hover-lift"
              >
                {submitting ? 'Recording...' : 'Submit Dining Review'}
              </button>
            </form>
          )}
        </div>

        {/* Mess Metrics & Committee Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Weekly Dietary Audit Overview</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Student Satisfaction Score</span>
                  <span className="text-emerald-700">88% Positive</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Kitchen Hygiene Audit</span>
                  <span className="text-emerald-700">Grade A (94%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Dietary Waste Reduction</span>
                  <span className="text-blue-700">76% Target Met</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '76%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-950">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Food Safety & FSSAI Standards</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              CAMPUS OS Central Dining adheres to daily water testing, cold-storage temperature logging, and third-party food safety audits.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
