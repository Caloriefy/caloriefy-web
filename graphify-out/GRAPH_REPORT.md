# Graph Report - caloriefy-web  (2026-10-09)

## Corpus Check
- 28 files · ~193,062 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .jsonc 1)

## Summary
- 157 nodes · 358 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.82)
- Token cost: 153,411 input · 0 output

## Community Hubs (Navigation)
- Site Pages & Blog Index
- Cursor Ring WebGL Field
- Package Dependencies
- TypeScript Config
- Product Features & Pricing
- Customer Success Stories
- Framer Overrides Script
- Consistency & Habit Blog
- AI Meal Personalization
- Next.js Config

## God Nodes (most connected - your core abstractions)
1. `Home Page (Caloriefy AI)` - 28 edges
2. `Pricing Page` - 26 edges
3. `Contact Page` - 24 edges
4. `Privacy Policy Page` - 24 edges
5. `Download Page` - 22 edges
6. `Blogs Page` - 21 edges
7. `Stories Page` - 21 edges
8. `Terms and Conditions Page` - 21 edges
9. `April McKinsey Story` - 17 edges
10. `Olivia Bennet Story` - 17 edges

## Surprising Connections (you probably didn't know these)
- `AI Meal Builder` --semantically_similar_to--> `Personalized Meal Recommendations`  [INFERRED] [semantically similar]
  public/blogs/mastering-the-ai-meal-builder.html → public/blogs/how-ai-is-transforming-nutrition-tracking.html
- `robots.txt (Allow all crawlers)` --conceptually_related_to--> `Home Page (Caloriefy AI)`  [INFERRED]
  public/robots.txt → public/index.html
- `Mastering the AI Meal Builder (blog)` --conceptually_related_to--> `Caly AI Meal Builder`  [INFERRED]
  public/blogs/mastering-the-ai-meal-builder.html → public/index.html
- `Contact FAQ (offline, sync, wearables, data safety)` --semantically_similar_to--> `Data Storage & Security (encryption at rest/in transit)`  [INFERRED] [semantically similar]
  public/contact.html → public/privacy-policy.html
- `AI Meal Builder` --conceptually_related_to--> `Nutrition App as AI Personal Coach`  [INFERRED]
  public/blogs/mastering-the-ai-meal-builder.html → public/blogs/how-ai-is-transforming-nutrition-tracking.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Framer-exported pages sharing nav/footer shell and caloriefy-overrides.js** — public_index, public_blogs, public_contact, public_download, public_pricing, public_privacy_policy, public_stories, public_terms_and_conditions, public_caloriefy_overrides, public_framer_site_runtime [EXTRACTED 1.00]
- **Freemium pricing tiers** — public_pricing_free_plan, public_pricing_pro_plan, public_pricing_top_tier_plan, public_pricing_plan_comparison [EXTRACTED 1.00]
- **Caloriefy AI core feature set** — public_index_ai_food_scanning, public_index_caly_ai_meal_builder, public_index_ai_suggestion, public_index_food_database, public_index_progress_tracking, public_index_meal_plans [INFERRED 0.85]
- **Caloriefy blog posts sharing overrides script and site nav** — public_blogs_celebrating_200k_downloads, public_blogs_consistency_over_perfection, public_blogs_how_ai_is_transforming_nutrition_tracking, public_blogs_mastering_the_ai_meal_builder, public_blogs_understanding_macros, public_caloriefy_overrides, public_blogs [EXTRACTED 1.00]
- **Caloriefy AI personalization feature set** — public_blogs_how_ai_is_transforming_nutrition_tracking_ai_food_recognition, public_blogs_how_ai_is_transforming_nutrition_tracking_personalized_meal_recommendations, public_blogs_mastering_the_ai_meal_builder_ai_meal_builder, public_blogs_understanding_macros_ai_macro_rebalancing, public_blogs_mastering_the_ai_meal_builder_ai_day_plans [INFERRED 0.85]
- **Goal-based nutrition (fat loss / muscle gain / maintenance)** — public_blogs_understanding_macros_macro_split_by_goal, public_blogs_mastering_the_ai_meal_builder_goal_based_meal_adaptation, public_blogs_understanding_macros_macronutrients [INFERRED 0.85]
- **Customer success story pages (shared Framer template + overrides)** — public_stories_april_mckinsey, public_stories_ava_mitchell, public_stories_daniel_hayes, public_stories_lucas_reed, public_stories_olivia_bennet, public_stories_tanisha_white [INFERRED 0.95]
- **Caloriefy AI features cited in testimonials** — public_stories_ai_meal_builder, public_stories_barcode_scanner, public_stories_meal_photo_scanning, public_stories_weekly_insights, public_stories_adaptive_meal_plan [INFERRED 0.85]

## Communities (12 total, 3 thin omitted)

### Community 0 - "Site Pages & Blog Index"
Cohesion: 0.30
Nodes (26): 404 Not Found Page, Blogs Page, Celebrating 200K Downloads (blog), 200K App Store Downloads Milestone, How AI Is Transforming Nutrition Tracking (blog), Mastering the AI Meal Builder (blog), AI-Generated Day Plans, Understanding Macros (blog) (+18 more)

### Community 1 - "Cursor Ring WebGL Field"
Cohesion: 0.15
Nodes (17): buildField(), compile(), hexToRgb(), linMap(), makeContext(), mount(), mulberry32(), poissonDisk() (+9 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.09
Nodes (21): dependencies, next, react, react-dom, devDependencies, @types/node, @types/react, typescript (+13 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 4 - "Product Features & Pricing"
Cohesion: 0.14
Nodes (15): Contact FAQ (offline, sync, wearables, data safety), Wearable Integrations (Apple Health, Fitbit, Google Fit), AI Food Photo & Barcode Scanning, AI Nutrition Suggestions, Caloriefy AI (product), Caly AI Meal Builder, Verified Food Database (10M+ foods), Strategic Meal Plans (+7 more)

### Community 5 - "Customer Success Stories"
Cohesion: 0.30
Nodes (15): AI Auto-Adjusted Meal Plan, AI Meal Builder, App Store Social Proof (200k downloads, #1 nutrition app), April McKinsey Story, Ava Mitchell Story, Barcode Scanner, Daniel Hayes Story, Framer Main Script Bundle (+7 more)

### Community 6 - "Framer Overrides Script"
Cohesion: 0.29
Nodes (10): afterPaint(), fixOne(), fixTitle(), fixTree(), hex2(), isFramerLink(), markFreeNames(), paintOpaqueCards() (+2 more)

### Community 7 - "Consistency & Habit Blog"
Cohesion: 0.36
Nodes (5): One-Tap Meal Logging, Consistency Over Perfection (blog), Habit Compounding, Streaks and Gentle Reminders, AI Barcode and Photo Food Recognition

### Community 8 - "AI Meal Personalization"
Cohesion: 0.29
Nodes (8): Nutrition App as AI Personal Coach, Personalized Meal Recommendations, AI Meal Builder, Goal-Based Meal Adaptation (fat loss / muscle gain / balanced), Instant Meal Tweaks and Rebalancing, AI Real-Time Macro Rebalancing, Macro Split by Goal (40/30/30 baseline), Macronutrients (protein, carbs, fats)

## Knowledge Gaps
- **16 isolated node(s):** `next`, `react`, `react-dom`, `@types/node`, `@types/react` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 58 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Home Page (Caloriefy AI)` connect `Site Pages & Blog Index` to `Product Features & Pricing`, `Customer Success Stories`, `Framer Overrides Script`, `Consistency & Habit Blog`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `next`, `react`, `react-dom` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cursor Ring WebGL Field` be split into smaller, more focused modules?**
  _Cohesion score 0.14624505928853754 - nodes in this community are weakly interconnected._
- **Why does `Pricing Page` connect `Site Pages & Blog Index` to `Product Features & Pricing`, `Customer Success Stories`, `Framer Overrides Script`, `Consistency & Habit Blog`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Why does `Privacy Policy Page` connect `Site Pages & Blog Index` to `Product Features & Pricing`, `Customer Success Stories`, `Framer Overrides Script`, `Consistency & Habit Blog`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._