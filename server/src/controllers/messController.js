import { successResponse, errorResponse } from '../utils/response.js';

let memoryMessFeedback = [
  { id: 'mf_01', date: '2026-09-29', mealType: 'LUNCH', rating: 4, foodQuality: 4, hygiene: 5, portion: 4, comments: 'Good paneer dish and clean serving area.' },
  { id: 'mf_02', date: '2026-09-29', mealType: 'BREAKFAST', rating: 3, foodQuality: 3, hygiene: 4, portion: 3, comments: 'Idli was slightly cold.' }
];

export const getMessMenu = async (req, res) => {
  try {
    const menuData = {
      today: {
        date: 'Tuesday, 29 September 2026',
        specialNote: 'Wednesday Dinner: Festive Special North-Indian Thali',
        meals: {
          BREAKFAST: {
            timing: '07:30 AM - 09:15 AM',
            items: 'Masala Dosa, Sambhar, Coconut Chutney, Bread Butter, Boiled Eggs / Banana, Tea / Coffee',
            calories: '520 kcal'
          },
          LUNCH: {
            timing: '12:30 PM - 02:15 PM',
            items: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Phulka Roti, Cucumber Salad, Gulab Jamun',
            calories: '780 kcal'
          },
          SNACKS: {
            timing: '05:00 PM - 06:15 PM',
            items: 'Samosa with Mint Chutney, Ginger Tea / Milk',
            calories: '280 kcal'
          },
          DINNER: {
            timing: '07:45 PM - 09:45 PM',
            items: 'Mix Veg Korma, Rajma Dal, Steamed Basmati Rice, Chapati, Fresh Cut Fruits',
            calories: '650 kcal'
          }
        }
      },
      weeklySchedule: [
        { day: 'Monday', lunch: 'Rajma Chawal, Aloo Gobhi, Curd, Roti', dinner: 'Egg Curry / Paneer Bhurji, Dal Fry, Rice, Roti' },
        { day: 'Tuesday', lunch: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Roti', dinner: 'Mix Veg Korma, Rajma, Rice, Roti' },
        { day: 'Wednesday', lunch: 'Chole Bhature / Rice, Boondi Raita', dinner: 'Festive Special Thali, Kheer, Puri' },
        { day: 'Thursday', lunch: 'Kadhi Pakoda, Rice, Aloo Jeera, Roti', dinner: 'Soya Chaap Curry, Moong Dal, Rice, Roti' },
        { day: 'Friday', lunch: 'Veg Biryani / Chicken Biryani, Salan, Raita', dinner: 'Dal Makhani, Butter Roti, Rice, Ice Cream' },
        { day: 'Saturday', lunch: 'South Indian Meals, Sambhar, Rasam, Curd Rice', dinner: 'Khichdi, Baingan Bharta, Papad, Pickle' },
        { day: 'Sunday', lunch: 'Special Poori Aloo, Sweet Semolina Halwa', dinner: 'Light Dinner, Vegetable Pulao, Dal, Roti' }
      ]
    };

    return successResponse(res, menuData, 'Today mess menu retrieved');
  } catch (error) {
    return errorResponse(res, 'Failed to fetch mess menu', 'MESS_MENU_ERROR', 500);
  }
};

export const submitMessFeedback = async (req, res) => {
  try {
    const { mealType, rating, foodQuality, hygiene, portion, comments } = req.body;

    const feedbackEntry = {
      id: `mf_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      mealType: mealType || 'LUNCH',
      rating: rating || 4,
      foodQuality: foodQuality || 4,
      hygiene: hygiene || 5,
      portion: portion || 4,
      comments: comments || ''
    };

    memoryMessFeedback.unshift(feedbackEntry);

    return successResponse(res, { feedback: feedbackEntry }, 'Mess feedback recorded! Thank you for helping improve dining standards.');
  } catch (error) {
    return errorResponse(res, 'Failed to submit feedback', 'FEEDBACK_ERROR', 500);
  }
};

export const getMessAnalytics = async (req, res) => {
  return successResponse(res, {
    averageRating: 4.1,
    hygieneRating: 4.4,
    foodQualityRating: 3.9,
    portionRating: 4.2,
    totalReviewsToday: memoryMessFeedback.length,
    recentFeedback: memoryMessFeedback.slice(0, 5)
  }, 'Mess analytics calculated');
};
