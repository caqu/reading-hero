
```md
# Reading Hero – Word Clusters & Learning Paths
**Task ID:** RH_T_CLUSTERS_PATHS  
**Goal:** Create a simple but extensible system for grouping words into thematic clusters and learner “paths” (e.g., Animals, My World, School), to drive progression and context-based practice.

---

## 📝 Summary

Using the `WordBank` as the foundation, implement:

- A `WordCluster` model (small sets of related words)
- A `LearningPath` model (ordered groups of clusters)
- APIs for retrieving the next word/cluster for a given profile

These structures will let us present words in **contextual themes** (“Pets”, “Food”, “Feelings”), which is key for engagement.

---

## 🎯 Requirements

### 1. Types

Create:

`src/wordbank/paths.ts`

```ts
export type ClusterMode = "single" | "pair" | "sentence" | "mixed";

export interface WordCluster {
  id: string;             // "animals_pets"
  name: string;           // "Animals: Pets"
  description?: string;
  wordIds: string[];      // ["dog", "cat", "fish", ...]
  recommendedMode: ClusterMode;
  gradeBand: "K" | "1-2" | "3-5";
}

export interface LearningPath {
  id: string;             // "path_animals"
  name: string;           // "Animals"
  description?: string;
  clusterIds: string[];   // ["animals_pets", "animals_farm", ...]
  gradeBand: "K" | "1-2" | "3-5";
}
````

---

### 2. Seed Configuration

Create a config file:

`src/wordbank/paths_config.ts`

Seed with a **minimal but real** set, for example:

* Path: `My World`

  * Cluster: `Family` (mom, dad, sister, brother, baby, home, etc.)
  * Cluster: `Feelings` (happy, sad, mad, scared, etc.)
* Path: `Animals`

  * Cluster: `Pets` (dog, cat, fish, bird)
  * Cluster: `Farm` (cow, horse, pig, chicken)
* Path: `School & Play`

  * Cluster: `School` (teacher, school, book, desk, write)

Each cluster’s `wordIds` must reference existing `WordEntry.id` from the WordBank.

---

### 3. Helper APIs

In `paths.ts` or `WordBank.ts`, implement:

```ts
export function getClustersForPath(pathId: string): WordCluster[];
export function getPathById(pathId: string): LearningPath | undefined;
export function getClusterById(clusterId: string): WordCluster | undefined;
export function getDefaultPathForGradeBand(gradeBand: GradeBand): LearningPath;
```

And progression helpers:

```ts
export function getNextClusterForProfile(pathId: string, profileId: string): WordCluster;
export function getNextWordInCluster(
  clusterId: string,
  profileId: string
): WordEntry;
```

> NOTE: For now, the “profile” integration can be stubbed by simply moving sequentially through clusters/words; later tasks will hook in mastery stats.

---

### 4. Developer Preview Page

Add:

`src/pages/PathsDebugPage.tsx` (route `/dev/paths`)

Shows:

* List of paths
* Clicking a path shows its clusters and words
* Per-cluster details: number of words, grade band, recommendedMode

---

## 🧪 Acceptance Criteria

* Clusters and paths load without errors.
* All `wordIds` resolve to existing `WordEntry.id`.
* The debug page can navigate through paths and clusters.
* The “next cluster” and “next word in cluster” helpers work sequentially (even if naive for now).

---

## 📦 Deliverables

* `src/wordbank/paths.ts`
* `src/wordbank/paths_config.ts`
* `src/pages/PathsDebugPage.tsx`

