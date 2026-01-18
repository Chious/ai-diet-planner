# AI Diet Planner - Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 18, 2026  
**Product Owner:** kevinyien  
**Platform:** React Native (iOS & Android)

---

## 1. Executive Summary

### 1.1 Product Vision

An AI-powered diet planning and nutrition tracking mobile application that empowers users to manage their nutritional goals through intelligent food scanning, personalized meal planning, and comprehensive data tracking. Unlike MyNetDiary, this app provides users with full control over their AI capabilities using their own API tokens.

### 1.2 Problem Statement

Current diet tracking apps have several limitations:

- Proprietary AI features locked behind subscriptions
- Limited support for basic ingredients and raw foods
- Inflexible nutrition plans that don't adapt to individual goals
- Poor data portability and export capabilities
- Incomplete nutritional databases

### 1.3 Solution Overview

A React Native mobile app featuring:

- User-controlled AI food scanner using personal API tokens
- Adaptive nutrition plans based on personalized questionnaires
- Comprehensive food database (Open Food Facts + custom ingredients)
- Macro and micronutrient tracking beyond basic calories
- Recipe management and meal history with full data export

---

## 2. User Personas

### 2.1 Primary Persona: Health-Conscious Professional

- **Age:** 25-45
- **Goals:** Weight management, muscle gain, or health optimization
- **Tech Savviness:** High - comfortable with API tokens and data management
- **Pain Points:** Subscription fatigue, lack of customization, poor ingredient tracking
- **Needs:** Control over costs, accurate tracking, flexibility

### 2.2 Secondary Persona: Fitness Enthusiast

- **Age:** 20-35
- **Goals:** Performance optimization, body composition
- **Tech Savviness:** Medium to High
- **Pain Points:** Need detailed macro tracking, recipe management for meal prep
- **Needs:** Bulk meal logging, detailed nutritional breakdowns

---

## 3. Core Features & Requirements

### 3.1 AI Food Scanner

#### 3.1.1 User Stories

- As a user, I want to scan food with my phone camera so that I can quickly log meals without manual entry
- As a user, I want to use my own AI API token so that I control costs and privacy
- As a user, I want the scanner to recognize packaged foods and fresh ingredients so that I can track any meal

#### 3.1.2 Functional Requirements

- **FR-1.1:** App shall allow users to configure their own AI API token (OpenAI, Anthropic, Google, or compatible services)
- **FR-1.2:** Camera interface shall capture food images with standard photo controls (flash, focus, gallery upload)
- **FR-1.3:** AI integration shall analyze images and return:
  - Food item identification
  - Estimated portion size
  - Suggested nutritional values
  - Confidence score
- **FR-1.4:** User shall review and edit AI suggestions before saving
- **FR-1.5:** System shall provide fallback manual entry if AI fails
- **FR-1.6:** App shall display token usage and estimated costs

#### 3.1.3 Technical Requirements

- **TR-1.1:** Support multiple AI providers via configurable API endpoints
- **TR-1.2:** Image preprocessing to optimize quality and reduce token usage
- **TR-1.3:** Implement vision-language model prompts optimized for food recognition
- **TR-1.4:** Secure token storage using device keychain/keystore
- **TR-1.5:** Maximum image size: 4MB, auto-compress if needed
- **TR-1.6:** Response timeout: 30 seconds with retry logic

#### 3.1.4 UI/UX Requirements

- **UX-1.1:** Camera viewfinder with guide overlay for optimal food positioning
- **UX-1.2:** Real-time preview of captured image before submission
- **UX-1.3:** Loading indicator showing AI processing status
- **UX-1.4:** Clear error messages for failed scans with action suggestions
- **UX-1.5:** Token configuration screen with setup instructions and test button

---

### 3.2 Personalized Nutrition Planning

#### 3.2.1 User Stories

- As a user, I want to answer questions about my goals so that I get a personalized nutrition plan
- As a user, I want my plan to adapt to weight loss, maintenance, or muscle gain so that it aligns with my objectives
- As a user, I want to see daily macro targets so that I know what to eat

#### 3.2.2 Functional Requirements

- **FR-2.1:** Onboarding questionnaire shall collect:
  - Age, gender, height, weight
  - Activity level (sedentary to very active)
  - Primary goal (lose weight, maintain, gain muscle, health)
  - Dietary restrictions/preferences (vegan, keto, allergies, etc.)
  - Timeline and target weight (if applicable)
- **FR-2.2:** System shall calculate daily targets using evidence-based formulas:
  - TDEE (Total Daily Energy Expenditure) using Mifflin-St Jeor
  - Protein: 1.6-2.2g per kg body weight (goal-dependent)
  - Fats: 20-35% of total calories
  - Carbs: Remaining calories
- **FR-2.3:** User shall modify targets manually if desired
- **FR-2.4:** System shall recalculate weekly based on progress
- **FR-2.5:** User shall set custom macro ratios (e.g., 40/30/30)

#### 3.2.3 Technical Requirements

- **TR-2.1:** Store user profile data locally with cloud backup option
- **TR-2.2:** Implement calculation engine for multiple nutrition formulas
- **TR-2.3:** Version control for plan changes with history
- **TR-2.4:** Validate input ranges (prevent extreme/unhealthy targets)

#### 3.2.4 UI/UX Requirements

- **UX-2.1:** Multi-step questionnaire with progress indicator
- **UX-2.2:** Dashboard showing daily macro targets with visual progress rings
- **UX-2.3:** Educational tooltips explaining each metric
- **UX-2.4:** Easy access to modify plan from settings
- **UX-2.5:** Color-coded indicators (green=on target, yellow=close, red=exceeded)

---

### 3.3 Meal Logging & Food Database

#### 3.3.1 User Stories

- As a user, I want to log meals with accurate nutritional data so that I track my intake
- As a user, I want access to packaged foods AND basic ingredients so that I can log home-cooked meals
- As a user, I want to see macro and micronutrients so that I have complete nutritional insight

#### 3.3.2 Functional Requirements

- **FR-3.1:** App shall integrate with Open Food Facts API for packaged foods
- **FR-3.2:** App shall include built-in database of basic ingredients:
  - Raw meats, poultry, fish
  - Vegetables, fruits
  - Grains, legumes, nuts
  - Dairy products, eggs
  - Cooking oils and condiments
  - USDA FoodData Central as reference
- **FR-3.3:** User shall search by name, barcode scan, or recent items
- **FR-3.4:** User shall create custom foods with nutritional values
- **FR-3.5:** Each food entry shall display:
  - Calories
  - Macros: Protein, Carbs, Fats (with subtypes: fiber, sugar, saturated fat)
  - Key micronutrients: Vitamins (A, C, D, B12), Minerals (Iron, Calcium, Potassium)
  - Sodium
- **FR-3.6:** User shall adjust serving sizes with common units (g, oz, cups, pieces)
- **FR-3.7:** System shall categorize meals (breakfast, lunch, dinner, snacks)
- **FR-3.8:** User shall log multiple items per meal
- **FR-3.9:** Quick-add favorites and frequently eaten items

#### 3.3.3 Technical Requirements

- **TR-3.1:** Local SQLite database for offline access
- **TR-3.2:** Sync with Open Food Facts daily for updated product data
- **TR-3.3:** Cache frequently accessed foods
- **TR-3.4:** Implement fuzzy search for forgiving name matching
- **TR-3.5:** Barcode scanner using device camera
- **TR-3.6:** Data validation for custom entries (reasonable ranges)
- **TR-3.7:** Implement nutrient calculation engine with unit conversions

#### 3.3.4 UI/UX Requirements

- **UX-3.1:** Quick-add buttons for meal categories on home screen
- **UX-3.2:** Search with autocomplete and recent items
- **UX-3.3:** Detailed nutritional panel expandable/collapsible
- **UX-3.4:** Portion size selector with visual portion guides
- **UX-3.5:** Barcode scan option in search flow
- **UX-3.6:** Swipe-to-delete for logged items
- **UX-3.7:** Copy meals from previous days

---

### 3.4 Recipe Management

#### 3.4.1 User Stories

- As a user, I want to save recipes I cook regularly so that I can log them quickly
- As a user, I want recipes to calculate nutritional values automatically so that I don't do math
- As a user, I want to specify servings so that portions are accurate

#### 3.4.2 Functional Requirements

- **FR-4.1:** User shall create recipes with:
  - Recipe name
  - Ingredients list (from food database)
  - Quantities per ingredient
  - Number of servings
  - Optional: preparation notes
- **FR-4.2:** System shall calculate per-serving nutrition automatically
- **FR-4.3:** User shall edit recipes and update calculations
- **FR-4.4:** User shall log recipes as meals with serving adjustments
- **FR-4.5:** User shall share recipes via export (JSON format)
- **FR-4.6:** User shall import recipes from others
- **FR-4.7:** Recipe library with search and categorization

#### 3.4.3 Technical Requirements

- **TR-4.1:** Store recipes with ingredient references (not copies)
- **TR-4.2:** Recalculate nutrition when base ingredients update
- **TR-4.3:** Export format: JSON schema for portability
- **TR-4.4:** Import validation and conflict resolution

#### 3.4.4 UI/UX Requirements

- **UX-4.1:** Recipe builder with add ingredient flow
- **UX-4.2:** Visual ingredient list with quantities
- **UX-4.3:** Automatic nutritional summary card
- **UX-4.4:** Quick-log from recipe library
- **UX-4.5:** Recipe categories/tags for organization

---

### 3.5 History & Analytics

#### 3.5.1 User Stories

- As a user, I want to view my eating history so that I understand my patterns
- As a user, I want to see trends over time so that I track my progress
- As a user, I want to export my data so that I own and can analyze it elsewhere

#### 3.5.2 Functional Requirements

- **FR-5.1:** Calendar view showing logged days with indicators
- **FR-5.2:** Daily summary showing:
  - Total calories vs target
  - Macro breakdown vs targets
  - Meal-by-meal log
- **FR-5.3:** Weekly/monthly trend charts:
  - Average calories
  - Macro adherence
  - Weight trend (if tracking weight)
- **FR-5.4:** Export options:
  - CSV format (date, meal, food, nutrition columns)
  - JSON format (complete data structure)
  - PDF summary report
  - Date range selection
- **FR-5.5:** Filter history by date range, meal type, food item
- **FR-5.6:** Streak tracking for consistent logging

#### 3.5.3 Technical Requirements

- **TR-5.1:** Efficient data aggregation queries
- **TR-5.2:** Chart rendering library (e.g., Victory Native)
- **TR-5.3:** Export generation with progress indicator
- **TR-5.4:** File sharing via native share sheet
- **TR-5.5:** Data retention: minimum 2 years locally

#### 3.5.4 UI/UX Requirements

- **UX-5.1:** Calendar heat map showing logging consistency
- **UX-5.2:** Swipeable daily cards
- **UX-5.3:** Interactive charts with zoom/pan
- **UX-5.4:** Export screen with format selection and preview
- **UX-5.5:** Insights panel highlighting achievements/concerns

---

## 4. Technical Architecture

### 4.1 Technology Stack

- **Frontend Framework:** React Native (0.73+)
- **Language:** TypeScript
- **State Management:** Redux Toolkit or Zustand
- **Local Database:** SQLite (via react-native-sqlite-storage)
- **Cloud Sync:** Optional Firebase or custom backend
- **API Integration:**
  - Open Food Facts API
  - USDA FoodData Central
  - AI Provider APIs (OpenAI, Anthropic, etc.)
- **Charts:** Victory Native or React Native Chart Kit
- **Camera:** react-native-vision-camera
- **Barcode Scanner:** react-native-camera or ML Kit

### 4.2 Data Models

#### User Profile

```typescript
{
  id: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  activityLevel: 1.2 | 1.375 | 1.55 | 1.725 | 1.9
  goal: 'lose' | 'maintain' | 'gain'
  targetWeight?: number
  dietaryRestrictions: string[]
  createdAt: Date
  updatedAt: Date
}
```

#### Nutrition Plan

```typescript
{
  id: string
  userId: string
  dailyCalories: number
  proteinGrams: number
  carbsGrams: number
  fatsGrams: number
  customRatios?: { protein: number, carbs: number, fats: number }
  startDate: Date
  isActive: boolean
}
```

#### Food Item

```typescript
{
  id: string
  name: string
  brand?: string
  barcode?: string
  source: 'off' | 'usda' | 'custom'
  servingSize: number
  servingUnit: string
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fiber: number
    sugar: number
    fats: number
    saturatedFat: number
    sodium: number
    micronutrients?: Record<string, number>
  }
  createdAt: Date
}
```

#### Meal Log

```typescript
{
  id: string
  userId: string
  date: Date
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  items: Array<{
    foodId: string
    quantity: number
    unit: string
  }>
  notes?: string
  createdAt: Date
}
```

#### Recipe

```typescript
{
  id: string
  userId: string
  name: string
  servings: number
  ingredients: Array<{
    foodId: string
    quantity: number
    unit: string
  }>
  instructions?: string
  tags: string[]
  nutritionPerServing: NutritionInfo
  createdAt: Date
  updatedAt: Date
}
```

### 4.3 Security & Privacy

- **SP-1:** All API tokens stored in secure device storage
- **SP-2:** No transmission of user data to third parties (except chosen AI provider)
- **SP-3:** Local-first architecture - all data on device
- **SP-4:** Optional cloud backup with end-to-end encryption
- **SP-5:** Compliance with GDPR, CCPA for data export/deletion

---

## 5. MVP Scope (Phase 1)

### 5.1 In Scope

1. Basic AI food scanner with one provider (OpenAI)
2. Onboarding questionnaire and nutrition plan calculation
3. Meal logging with Open Food Facts integration
4. 100 common ingredients database
5. Macro nutrient tracking (calories, protein, carbs, fats)
6. Basic recipe creation and management
7. Daily and weekly history view
8. CSV export

### 5.2 Out of Scope (Future Phases)

- Multiple AI provider support (Phase 2)
- Micronutrient tracking (Phase 2)
- Social features and recipe sharing (Phase 3)
- Integration with fitness trackers (Phase 3)
- Meal planning and suggestions (Phase 3)
- Photo meal diary (Phase 2)
- Water tracking (Phase 2)

---

## 6. User Experience Flow

### 6.1 First-Time User Flow

1. Welcome screen with app overview
2. Account creation (optional, for cloud sync)
3. Onboarding questionnaire (6-8 screens)
4. Review personalized nutrition plan
5. AI token setup (with skip option)
6. Tutorial overlay on main screens
7. Log first meal

### 6.2 Daily User Flow

1. Open app → Dashboard showing today's progress
2. Tap meal category (breakfast, lunch, etc.)
3. Choose logging method:
   - AI scan
   - Search database
   - Recent items
   - Recipes
4. Adjust portion, confirm
5. View updated daily totals
6. Repeat as needed

### 6.3 Recipe Creation Flow

1. Navigate to Recipes tab
2. Tap "Create Recipe"
3. Enter recipe name and servings
4. Add ingredients via search
5. Enter quantities per ingredient
6. Review auto-calculated nutrition
7. Save recipe
8. Quick-log from recipe library

---

## 7. Non-Functional Requirements

### 7.1 Performance

- **NFR-1.1:** App launch time < 2 seconds
- **NFR-1.2:** Food search results < 1 second
- **NFR-1.3:** AI scan processing < 10 seconds
- **NFR-1.4:** Smooth 60fps scrolling on lists
- **NFR-1.5:** Offline functionality for logged data

### 7.2 Reliability

- **NFR-2.1:** 99.9% uptime for local functionality
- **NFR-2.2:** Graceful degradation when network unavailable
- **NFR-2.3:** Auto-save all user inputs
- **NFR-2.4:** Data backup recovery options

### 7.3 Usability

- **NFR-3.1:** Support for iOS 14+ and Android 10+
- **NFR-3.2:** Accessibility: VoiceOver/TalkBack support
- **NFR-3.3:** Localization: English (MVP), expandable
- **NFR-3.4:** Dark mode support

### 7.4 Scalability

- **NFR-4.1:** Support up to 10,000 food items locally
- **NFR-4.2:** Handle 5+ years of meal logs
- **NFR-4.3:** Recipe library up to 500 recipes

---

## 8. Success Metrics (KPIs)

### 8.1 Engagement Metrics

- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average meals logged per day
- Retention rate (7-day, 30-day)
- AI scanner usage rate

### 8.2 Quality Metrics

- AI scan accuracy (user acceptance rate)
- Food database search success rate
- App crash rate < 0.1%
- Average user rating > 4.5 stars

### 8.3 Business Metrics

- User acquisition cost
- Average AI token cost per user
- User-reported goal achievement rate

---

## 9. Development Timeline

### Phase 1: MVP (12 weeks)

- **Weeks 1-2:** Project setup, architecture, design system
- **Weeks 3-4:** User profile, onboarding, nutrition calculator
- **Weeks 5-7:** Food database, meal logging, search
- **Weeks 8-9:** AI scanner integration
- **Weeks 10-11:** Recipe management, history views
- **Week 12:** Testing, bug fixes, polish

### Phase 2: Enhanced Features (8 weeks)

- Multiple AI providers
- Micronutrient tracking
- Advanced charts and insights
- Photo meal diary

### Phase 3: Growth Features (TBD)

- Social features
- Fitness tracker integration
- Meal planning AI

---

## 10. Risks & Mitigations

| Risk                                | Impact | Probability | Mitigation                                           |
| ----------------------------------- | ------ | ----------- | ---------------------------------------------------- |
| AI API costs too high for users     | High   | Medium      | Provide usage estimates, caching, fallback to manual |
| Open Food Facts data quality issues | Medium | Medium      | User reporting, custom override, multiple sources    |
| Complex nutrition calculations      | Medium | Low         | Use established formulas, expert review              |
| Battery drain from camera/AI        | Medium | Medium      | Optimize image processing, background limits         |
| User abandonment in onboarding      | High   | Medium      | Streamline flow, allow skip, progressive disclosure  |

---

## 11. Open Questions

1. Should we support food photos without AI analysis (just as visual log)?
2. What level of micronutrient tracking is needed for MVP?
3. Should recipes support scaling (e.g., double the recipe)?
4. Do we need barcode scanning for MVP or can it wait?
5. What cloud backup solution provides best cost/privacy balance?
6. Should we support multiple user profiles on one device?

---

## 12. Dependencies

### External Dependencies

- Open Food Facts API availability and rate limits
- AI provider API stability and pricing
- USDA FoodData Central data licensing
- App store approval and guidelines

### Internal Dependencies

- Design system and UI components
- Testing infrastructure
- CI/CD pipeline
- Analytics and crash reporting setup

---

## 13. Appendix

### A. Competitive Analysis

- **MyNetDiary:** Strong database, limited AI, subscription model
- **MyFitnessPal:** Large user base, ads, limited customization
- **Cronometer:** Excellent micronutrients, complex UI, expensive
- **Lose It!:** Simple UX, basic features, photo scanning premium

### B. Technical References

- [Open Food Facts API Documentation](https://world.openfoodfacts.org/data)
- [USDA FoodData Central](https://fdc.nal.usda.gov/)
- [Mifflin-St Jeor Equation](https://en.wikipedia.org/wiki/Basal_metabolic_rate)
- [React Native Best Practices](https://reactnative.dev/docs/performance)

### C. Glossary

- **TDEE:** Total Daily Energy Expenditure
- **Macro:** Macronutrient (protein, carbs, fats)
- **Micro:** Micronutrient (vitamins, minerals)
- **OFF:** Open Food Facts
- **BMR:** Basal Metabolic Rate

---

**Document Status:** Draft v1.0  
**Next Review:** Stakeholder feedback session  
**Approval Required:** Product Owner, Tech Lead, Design Lead
