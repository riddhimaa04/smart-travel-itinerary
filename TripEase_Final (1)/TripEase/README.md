# TripEase – Smart Trip Management System

A travel-planning website made with **plain HTML, CSS and beginner-level JavaScript**.
No frameworks, no Node.js, no database, no internet needed.

## How to run
1. Unzip the folder.
2. **Double-click `index.html`** (Chrome, Edge, Firefox or Safari).

**Demo admin login:** `admin@tripease.com` / `admin123`
Customers create their own account on the *Sign up* page.

## What you can do
| Area | Features |
|---|---|
| Everyone (guest) | Home, Explore (search + type + budget filters), Destination Details (gallery, highlights, activities), **Smart AI Trip Recommendations** |
| Customer (login needed) | Plan / edit / delete trips (with interests) · **Day-wise itinerary** (add, edit, delete, move up/down) · **Budget planner** (expenses by category, progress bar, over-budget alert) · **Packing checklist** · **Favorites** · **My Trips dashboard** (statistics, status tabs, saved destinations) |
| Admin | Dashboard statistics · add / edit / delete destinations · feature / un-feature · add / edit / delete activities · reset to sample data |
| Everywhere | Form validation messages, pop-up (toast) messages, responsive layout |

## Files
```
index.html  explore.html  destination.html  recommend.html     public pages
login.html  register.html                                       accounts
create-trip.html (create AND edit)  my-trips.html  trip.html    customer pages
admin.html                                                      admin page
css/style.css            all styles (grouped in numbered sections)
js/data.js               sample destinations (our small dataset)
js/common.js             shared helpers: formatting, users/login, favorites, trips, toast messages
js/layout.js             draws navbar + footer, protects pages that need a login
js/home.js explore.js destination.js recommend.js     page scripts (public pages)
js/login.js register.js                                page scripts (accounts)
js/create-trip.js my-trips.js trip.js                  page scripts (customer)
js/itinerary.js budget.js packing.js                   the three tabs of trip.html
js/admin.js                                            admin panel
```
Every page loads scripts in this order: `data.js` → `common.js` → `layout.js` → its own script.

## How the data is stored (LocalStorage keys)
| Key | Content |
|---|---|
| `tripease_users` | list of users `{id, name, email, password, role}` (role = customer or admin) |
| `tripease_current_user` | id of the logged-in user |
| `tripease_trips` | all trips; each trip has `userId`, dates, budget, `interests`, `itinerary`, `expenses`, `packing` |
| `tripease_favorites_<userId>` | list of favorite destination ids of that user |
| `tripease_destinations` | destination list edited by the admin (if missing, `data.js` is used) |

LocalStorage keeps only text, so we use `JSON.stringify` to save and `JSON.parse` to load.
A trip belongs to one user, so users only see their own trips and favorites.

## Feature explanations (what / how / where)
- **Navbar & page protection** – `layout.js`: builds the menu with a `for` loop; the menu changes with the login state. `checkPageAccess()` sends visitors who are not logged in (or not admin) away from protected pages.
- **Login / Register** – `register.js` checks the form and calls `registerUser()`; `login.js` calls `loginUser()` which compares email and password with the saved users. The user id is saved in `tripease_current_user`; `getCurrentUser()` reads it.
- **Explore / Details** – `explore.js` loops over `getDestinations()` and shows a card only if it passes the search, type and budget checks. `destination.js` reads `?id=goa` from the address with `getQueryValue()`.
- **Recommendations** – `recommend.js` (see scoring below).
- **Favorites** – heart button → `handleFavoriteClick()` in `common.js` adds/removes the id in the user's favorites list and updates every heart on the page.
- **Trips (create / edit)** – `create-trip.js`: `checkTrip()` validates; `createNewTrip()` or `updateExistingTrip()` saves. The same form is used for editing (`create-trip.html?edit=ID`).
- **Itinerary** – `itinerary.js`: `trip.itinerary` is an array with one object per day, each holding an `activities` array. `splice` removes, swapping two items moves up/down.
- **Budget** – `budget.js`: `calculatePlannedTotal()` adds all expenses; percentage = planned ÷ budget × 100; the bar turns orange at 80% and red above 100%, and an alert appears.
- **Packing** – `packing.js`: starting list from `makeDefaultPackingList(type)`; progress = packed ÷ total.
- **Dashboard** – `my-trips.js`: counts trips by status (Upcoming / Ongoing / Completed, decided by comparing dates with today), tab buttons filter the cards.
- **Admin** – `admin.js`: copies the destination list, changes it, saves it to `tripease_destinations`. Every page reads the list through `getDestinations()`, so changes show everywhere.

## Recommendation score (rule-based, out of 100)
| Rule | Points |
|---|---|
| Destination type equals your choice (or you chose "Any") | 30 |
| Cost ≤ budget (15 points if up to 20% over budget) | 30 |
| Days inside the ideal range (10 points if exactly 1 day outside) | 20 |
| Travel style suits the destination | 20 |

Destinations below 50 are hidden; the rest are sorted by score (ties: higher rating).
**Example:** *Mountains, ₹20,000, 4 days, adventurous* → Manali (cost ₹18,000, 4–5 days, adventurous): 30+30+20+20 = **100%**. Goa (Beaches, ₹22,000, 4–6 days, adventurous): 0+15+20+20 = **55%**.

## Honest limitations
- **Not real AI.** The recommender uses fixed rules written by us. It is not machine learning, not ChatGPT, and uses no live data. All destination costs and ratings are hand-written sample data. `getRecommendations()` is the single place where a real AI API could be connected later.
- **The login is a demo.** Passwords are stored as plain text in the browser and pages are "protected" only by JavaScript. Anyone who knows how to open browser developer tools can read or change the data. A real system needs a server, password hashing and secure sessions.
- Data lives only in the browser it was created in (clearing browser data deletes it). There is no backend, database or real-time data.
- Destination pictures are coloured tiles; the gallery can show real photos if a destination has an `images` list (files placed in `images/`).
- Trips for destinations the admin later deletes still open, shown as "Removed destination".

## Ten likely viva questions
1. **Is this real AI?** No. It is a rule-based recommender: compare preferences, score, rank, explain. It does not learn from data.
2. **How is the match % calculated?** Four rules give 30+30+20+20 points; the total out of 100 is the percentage.
3. **Where is data stored without a database?** In the browser's LocalStorage as text (`JSON.stringify` to save, `JSON.parse` to load).
4. **How does login work?** `loginUser()` searches the saved users for the same email and password and saves that user's id as the current user. It is a demo, not secure.
5. **How do users see only their own trips?** Each trip stores `userId`; `getMyTrips()` returns only trips whose `userId` equals the logged-in user's id.
6. **How does the admin's change reach all pages?** The admin saves the list in `tripease_destinations`; every page calls `getDestinations()`, which prefers that saved list.
7. **How does `trip.html` know which trip to show?** The link has `?id=...`; `getQueryValue('id')` reads it and `findTrip()` searches the user's trips.
8. **How is the itinerary stored?** Inside the trip: an array with one object per day, each having an array of activities.
9. **What does `event.preventDefault()` do?** It stops the form from reloading the page so JavaScript can validate and save the data.
10. **What are the limitations and future scope?** Sample data, demo login, one-browser storage. Future: backend + database, secure authentication, real prices/maps/weather APIs, and a real AI model behind `getRecommendations()`.
