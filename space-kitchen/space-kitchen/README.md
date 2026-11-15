# YOUR SPACE KITCHEN

A local working prototype: food pantry, profile, daily planning, weekly planning, gram quantities, reminders, preparation animation, opening meal containers and confirmed consumption. Python FastAPI + SQLite + plain HTML/CSS/JavaScript. No Node/React build or paid services required.

## Start in VS Code
1. Extract the ZIP. Open the space-kitchen folder in VS Code (the folder containing main.py).
2. Install Python 3.10 or newer if needed. Open Terminal > New Terminal.
3. Create an environment: `python -m venv .venv`
4. Activate it:
   - Windows PowerShell: `.\.venv\Scripts\Activate.ps1`
   - Windows cmd: `.venv\Scripts\activate.bat`
   - macOS/Linux: `source .venv/bin/activate`
   If your terminal uses python3, use python3 for the creation command. You can avoid activation by invoking .venv's Python directly.
5. `python -m pip install -r requirements.txt`
6. `python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`
7. Open http://127.0.0.1:8000 in a browser. Do not open the HTML directly and do not run VS Code Live Server for this app.
8. Stop with Ctrl+C.

The initial package installation requires internet access. Afterwards this local app has no runtime external-service requests. The server must remain running. Keep it bound to loopback: it has no authentication or production security hardening.

## Working flow
- Edit profile: name, weight, height, age, gender and manual demo targets.
- Build a meal: choose food cards, edit grams, select time, and save.
- An illustrative preparation sequence plays, then opens the meal container.
- View planned nutrients and the delta from the original saved baseline when editing.
- Start eating does not deduct anything. Confirm amount eaten deducts stock and records intake, once only.
- Open eaten meal to view its recorded intake and rest-of-day candidate suggestions.
- Switch to Weekly planner: starts from the date selected in the date input. Open any cell to edit; Copy to copies to an empty date/slot. Clear and recreate to relocate. No drag-and-drop weekly rearranging.
- In-app reminders operate for due, uneaten planned meals while the page is open. Enable reminders requests optional browser-system notification permission. These are not reliable background alarms; no push service or service worker is included. Due reminders remain visible until consumption or clearing. Changing time can trigger another reminder. Browser permission/OS settings can block notifications.
- Optional glove cursor is a small stylized SVG with hover/press effects; Escape restores the normal cursor. It is not a photorealistic hand or a drag-and-drop system. Keyboard and touch interaction do not depend on the glove.

## Inventory semantics
stock_g = physical demo stock. reserved_g = quantities in every uneaten plan, across all days. available_g = stock minus reservations. Saving reserves stock without deducting it. Editing releases the prior reservation within a transaction. Copying reserves additional stock; requests exceeding stock are rejected server-side. Eaten meals are immutable and duplicate recording is rejected. Empty plans are not accepted in the UI. Past uneaten plans keep reservations until cleared deliberately; review and clear missed plans rather than silently releasing them.

For the demo, a partial consumption confirmation deducts only the eaten fraction and releases the rest back into available stock. This does NOT model actual leftovers, discarded food, preparation losses, food safety or a physically cooked meal. Before operational use add separate reserved/prepared/served/consumed/waste ledger events and verified storage rules. Visual preparation is a preview, not a real inventory preparation event.

## Data and safety
ALL 15 foods, nutrient values, stock, portion weights, expiry dates and storage strings in main.py are synthetic examples. The prototype does not embed the previously transcribed 183-row NASA data. This prevents unreviewed records entering automatic selection and keeps setup self-contained. No claim is made that these ingredients, fresh foods, storage conditions or cooking processes are available or approved on the ISS.

All amounts use grams of a demo item and nutrients per its demo portion_g. Drinks are grams, not automatically converted to millilitres. No daily targets are computed from age/gender; manual entries are illustrative. No medical or flight guidance is provided. Protein, carbs and fat progress are demonstration target comparisons, not instructions to maximize every nutrient. Unknown vitamins and minerals are not estimated. This version includes fiber and sodium only besides the macros and mass.

Suggestions are a basic energy/protein nearest-gap ranking from unreserved stock after accounting for recorded intake and all remaining planned meals. They are NOT automatic replanning or a full constrained nutrition optimizer. Users must choose and approve changes manually. Restrictions, allergens, nutrient upper-limit enforcement and clinician approval must be implemented before any real dietary use. Do not interpret a top suggestion as safe or optimal for an individual.

## Visual scope
No external photos or image API calls are included. Foods are rendered as abstract CSS illustrations in reusable containers. The sequence is an arrangement animation, not photorealistic cooking footage. This code is intended as the functional model, not a finished premium design or Figma file. No camera food recognition, nutrient estimation model, authentication, real background scheduling, inventory replenishment screen or multi-user isolation is included.

## Files
main.py: API, schema, synthetic seeds, transactions and validation.
static/index.html: connected views/dialogs.
static/app.js: interactions, calculations, meal cards, reminder loop, cursor.
static/style.css: responsive styling and animations.
test_app.py: API smoke tests.

SQLite creates kitchen.sqlite beside main.py on first startup. Data persists across browser refreshes. To reset: stop server, delete kitchen.sqlite, restart. This destroys local profile, plans and consumption history. Each database is one demonstration profile. Dates/consumption use the server's local calendar date; reminders use browser time. Keep both in the same timezone for this prototype. Mission-clock/timezone configuration is a future requirement.

## Verification
Python syntax and JavaScript syntax were checked during package creation. Core inventory logic was exercised separately with SQLite. A full browser session and FastAPI HTTP test run were not available in the generation environment. Run the supplied API test locally:
`python -m pip install -r requirements-dev.txt`
`python test_app.py`
The tests use a temporary database and do not overwrite kitchen.sqlite.

## Connect the NASA reference catalogue later
Review source rows and portion basis first. Map approved nutrient records into fields in foods. Keep provenance, missing-value flags and review status; extend totals to propagate unknowns rather than treating missing values as zero. Add separately verified mission stock, expiry, prepared/dry mass basis and allergens. Do not copy the reference mass into stock_g: stock is a separate operational quantity. This prototype schema must be extended before importing unknown-valued or source-versioned data.
