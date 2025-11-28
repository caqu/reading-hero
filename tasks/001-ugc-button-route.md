# ✅ **TASK 1 — Add "Create Your Own Word" Button & Page Routing**

**Goal:** Add a left-bar button "Create Your Own" that routes to a new page.

---

## **Requirements**

### **1. Add a Button to Left Sidebar**

* Label: **"Create Your Own"**
* Emoji/icon: 🖍️ or ✏️
* Position: Under **Profiles** and **Stats**

### **2. Add Route**

Create a new page:

```
/src/pages/CreateYourOwnPage.tsx
```

Accessible via internal router:

```
/create
```

### **3. Update URL sync**

* Navigating to the page updates URL without reload
* Sidebar button reflects active state

### **4. Layout Scaffold**

On this new page, include placeholders for:

* Word input
* Syllabification input
* Segments input
* Image upload
* Drawing canvas
* Camera capture
* Save button

No logic yet—just the structure.

### **Acceptance Criteria**

✔ Button appears in sidebar
✔ URL navigates correctly
✔ Page scaffold loads
✔ No backend yet
