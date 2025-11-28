### **`import_asl_reference_and_generate_stylized_assets.md`**

This task includes:

* Choosing one ASL dataset
* Downloading a sample asset
* Creating a workflow for stylized image generation
* Option A (coding agent generates images using available local models)
* Option B (coding agent hands off to an AWS endpoint or external model)
* File organization
* Future-proofing for scaling the dataset

It assumes you will supply the **Style Guide** in a separate task or message so the agent can use it for conditioning prompts.

---

# **import_asl_reference_and_generate_stylized_assets.md**

**Task ID:** `T_IMPORT_ASL_REFERENCE_AND_GENERATE_STYLIZED_ASSETS`
**Goal:**
Download an ASL dataset, grab one sample file (image or video), extract a representative frame as a reference, and generate a stylized “ASL character” version that follows our internal style guide (to be provided separately). The system must support two modes: the coding agent generating images directly if possible, and a fallback flow where the agent calls an external AWS model endpoint.

---

# 📝 **Task Summary**

We need to begin building our own ASL visual library, not by publishing raw ASL dataset media, but by **generating our own stylized illustrations** based on reference frames.

This task establishes the pipeline:

1. **Select 1 open ASL dataset we can safely download locally.**
   We will use:
   **➡️ The RWTH-PHOENIX-Weather 2014 T Sign Language Dataset (public + research-friendly)**
   This dataset contains sign videos with high-quality frames.

2. **Download one sample video** to `/tmp/reference_asl/` or similar.

3. **Extract a clean reference frame** from the video that shows a clear depiction of one sign.

4. **Send that frame into an image generation pipeline** along with our style guide and a prompt:

   > "Recreate this sign pose using our art style. The final image should use watercolor wash, soft Pixar-like modeling, hand-shape fidelity, and simplified character design.”

5. **Generate a stylized output** stored in `/public/generated/asl/<word>.png`.

6. Implement a flexible module that supports:

   * **Option A:** Use local generation if the coding agent has access to an internal diffusion or image model.
   * **Option B:** If not, send request payload to **AWS Bedrock / Stable Diffusion / Titan Image Generator / ComfyUI server** (user will provide endpoint).

The system must detect which mode is available.

---

# 🎯 **Detailed Requirements**

---

# **1. Dataset Selection & Download**

### Use the **RWTH-PHOENIX-Weather 2014 T** dataset.

It is publicly usable for research/prototyping and accessible via public download mirrors.

Agent must:

* Create a folder:

  ```
  /asl_reference/
  ```
* Download **one sample video** (e.g., the first `.mp4` in the dataset list).

Store as:

```
/asl_reference/sample_asl_video.mp4
```

(We only need one file for now.)

---

# **2. Extract a Reference Frame**

From the video extract:

* A frame at ~1.0–1.5 seconds *or*
* The agent may scan for the “best frame” (where hands are visible and not motion-blurred)

Store frame as:

```
/asl_reference/reference_frame.png
```

---

# **3. Prepare Input for Stylization**

Agent must crop/clean/resize to a consistent aspect ratio:

* Square or 4:5 vertical
* Remove background via segmentation if possible
* Optional: Auto-center the signer
* Resize to **512×512 or 768×768**

Created file:

```
/asl_reference/reference_clean.png
```

---

# **4. Implement Image Generation Pipeline**

Create:

```
src/engine/ASLImageGenerator.ts
```

This module supports:

---

## **Option A — Local/Image Model Available to Coding Agent**

If the coding agent can run image generation directly:

* Load style guide prompt (text file or inline string)
* Provide prompt such as:

```
"Recreate this sign pose in our house art style: watercolor wash textures,
soft Pixar-like lighting, gentle character proportions, expressive hands,
clear handshape accuracy, friendly educational tone. Preserve pose and
handshape fidelity. Remove background. Output transparent PNG."
```

* Pass both:

  * reference_clean.png (conditioning)
  * the style prompt

Save final output to:

```
/public/generated/asl/sample_sign.png
```

---

## **Option B — When Local Model Is NOT Available**

If the coding agent cannot generate images:

Implement a fallback mechanism:

### A. Agent prepares payload:

* Base64 of the reference frame
* Style guide prompt
* Any required generation parameters

### B. Agent POSTs to a configurable endpoint:

```
process.env.ASL_GEN_ENDPOINT
```

Parent will provide an external model such as:

* AWS Bedrock Claude Image
* AWS Titan Image Generator
* Stable Diffusion via AWS Lambda
* A custom ComfyUI server

### C. Store output as:

```
/public/generated/asl/sample_sign.png
```

### D. Log metadata:

```
/asl_reference/generated/sample_sign.meta.json
```

Containing:

* prompt
* settings
* source frame hash
* timestamp

---

# **5. Create a Simple React Demo Page**

Create:

```
src/pages/ASLPreviewPage.tsx
```

Shows:

* Reference frame
* Stylized output
* Prompt text
* "Regenerate" button
* "Try new sample" button

Use for quick visual QA.

---

# **6. Configuration**

Add `.env.local` entries:

```
ASL_GEN_ENDPOINT=""    # optional external URL
ASL_GEN_API_KEY=""     # if needed
ASL_DATASET_PATH="/asl_reference"
ASL_GEN_OUTPUT_PATH="/public/generated/asl"
```

---

# **7. Error Handling**

If dataset disconnects, or frame extraction fails:

* Show a readable error
* Suggest re-run
* Never block the entire app

---

# 🧪 **ACCEPTANCE CRITERIA**

The task is complete when:

* A sample ASL dataset file is downloaded.
* A reference frame is extracted and cleaned.
* The image generator module is implemented supporting both modes (local & AWS).
* At least **one** stylized ASL image is generated and saved to `/public/generated/asl/`.
* A demo page displays side-by-side comparison.
* Style guide integration is ready and referenced.

---

# 📦 **DELIVERABLES**

* `/asl_reference/sample_asl_video.mp4`
* `/asl_reference/reference_clean.png`
* `/public/generated/asl/sample_sign.png`
* `src/engine/ASLImageGenerator.ts`
* `ASLPreviewPage.tsx`
* `.env.local` template entries
* Fallback logic for external generation
