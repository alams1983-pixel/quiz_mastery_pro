# Implementation Plan - Scoped Multi-Tenant Taxonomy & Global Standardized Categories

This plan details the technical architecture for **Taxonomy Ownership & Scoping** (Categories & Tags). It introduces **Global Master Taxonomy** (managed by Super Admin) for global content standardization, and **Institute-Private Taxonomy** for private internal exam organization.

---

## 🏛️ Architecture & Evaluation of the Provision

### Evaluation: Why this Provision is Excellent
Your proposed provision solves a critical multi-tenant SaaS challenge:
1. **Prevents Global Catalog Pollution**: Without standardized global categories, different coaching institutes create duplicate/messy names (`"SSC-Maths"`, `"S.S.C Quantitative"`, `"Maths_SSC_2026"`). Forcing globally published exams to use Super Admin's **Global Master Taxonomy** guarantees a clean, unified public student catalog.
2. **Private Flexibility**: Teachers can freely create custom private categories/tags (e.g. *"Internal Unit Test 01"*, *"Class 10 Revision"*) for internal institute exams without affecting others.

---

## 🧭 Taxonomy Scoping Rules

```
                       🏷️ TAXONOMY SYSTEM
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
🌐 GLOBAL MASTER TAXONOMY                     🏫 INSTITUTE-PRIVATE TAXONOMY
 (Created by Super Admin)                      (Created by Coaching Teachers)
 ├── institute_id = NULL                        ├── institute_id = teacher.institute_id
 ├── is_global = TRUE                           ├── is_global = FALSE
 ├── Visible to ALL Institutes                  ├── Visible ONLY to creating Institute
 └── REQUIRED for Global/Public Content          └── Forbidden on Global/Public Content
```

### 1. Global Master Taxonomy (`institute_id = NULL`, `is_global = TRUE`)
- Created & moderated exclusively by **Super Admin**.
- Visible to **ALL** Teachers, Institutes, and Students.
- Can be used for **both** private internal exams and **Globally Published** (`is_public = TRUE` / `is_global = TRUE`) exams & questions.

### 2. Institute-Private Taxonomy (`institute_id = teacher.institute_id`, `is_global = FALSE`)
- Created by a Coaching Teacher/Admin for their internal institute organization.
- Visible **ONLY** to users of that specific Coaching Institute.
- **Enforced Restriction**: An exam or question tagged with an Institute-Private Category/Tag **CANNOT** be published globally. If a teacher toggles **"Publish Globally"**, the system validates that a Global Master Category is selected.

### 3. Super Admin Taxonomy Promotion
- Super Admin can convert any Institute-Private Category or Tag into a **Global Master Category/Tag** with one click.

---

## 🛑 User Review Required

> [!IMPORTANT]
> **Global Publish Validation**:
> When a teacher attempts to mark an exam or question as **Globally Public**, the backend will validate:
> - The assigned Category must be a **Global Master Category** (`is_global = TRUE` / `institute_id IS NULL`).
> - If a private institute category is attached, the app will show a helpful prompt: *"To publish globally, please select a standardized Global Master Category (e.g. SSC CGL, JEE Main, NEET)."*

> [!NOTE]
> **Category Dropdown Filtering**:
> In Exam & Question creation forms, the category dropdown will display:
> - **🌐 Global Categories** (Grouped under Global Master Header)
> - **🏫 My Institute Categories** (Grouped under My Institute Header)

---

## 🛠️ Proposed Changes & File Checklist

### 1. Database Schema & Backend Updates

#### [MODIFY] [schema.sql](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/schema.sql) & [server/db.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/db.js)
- Add `institute_id INT NULL` and `is_global BOOLEAN DEFAULT TRUE` to `categories` table.
- Add `institute_id INT NULL` and `is_global BOOLEAN DEFAULT TRUE` to `tags` table.

#### [MODIFY] [server/routes/categories.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/categories.js) (or category handlers)
- `GET /api/categories`: Filter `WHERE institute_id IS NULL OR institute_id = req.user.institute_id OR is_global = 1`.
- `POST /api/categories`:
  - If Super Admin: `institute_id = NULL`, `is_global = TRUE`.
  - If Teacher: `institute_id = req.user.institute_id`, `is_global = FALSE`.

#### [MODIFY] [server/routes/tags.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/tags.js)
- `GET /api/tags`: Filter `WHERE institute_id IS NULL OR institute_id = req.user.institute_id`.
- `POST /api/tags`: Assign `institute_id` based on role.

#### [MODIFY] [server/routes/exams.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/server/routes/exams.js)
- Enforce validation in `POST /api/exams` & `PUT /api/exams/:id`: If `is_public = TRUE`, reject if `category_id` is an institute-private category.

---

### 2. Frontend Views & UI Updates

#### [MODIFY] [src/views/TaxonomyView.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/TaxonomyView.js)
- Display two distinct tabs/sections: **"🌐 Global Master Taxonomy"** and **"🏫 My Institute Private Taxonomy"**.
- Super Admin sees a **"Promote to Global Master"** button on institute categories.

#### [MODIFY] [src/views/MasterQuestionEditorView.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/MasterQuestionEditorView.js) & [src/views/InstituteAdminView.js](file:///Users/sarfaraj/EdutorAi_Quiz_Mock/src/views/InstituteAdminView.js)
- Group Category dropdown into `<optgroup label="🌐 Global Master Categories">` and `<optgroup label="🏫 My Institute Private Categories">`.
- Automatically validate category selection when **"Publish Globally"** is checked.

---

## 🧪 Verification Plan

### Automated Build Verification
1. Run `npm run build` to verify clean compilation with zero syntax errors.
2. Verify database migration adds `institute_id` and `is_global` to `categories` and `tags`.

### Manual Verification
1. **Teacher Action**:
   - Create private category `"Batch 2026 Revision"`.
   - Create private exam assigned to `"Batch 2026 Revision"` $\rightarrow$ succeeds.
   - Try to publish exam globally $\rightarrow$ system prompts to select a Global Master Category.
2. **Super Admin Action**:
   - Create global category `"UPSC Civil Services"`.
   - Teacher selects `"UPSC Civil Services"` and publishes exam globally $\rightarrow$ succeeds.
