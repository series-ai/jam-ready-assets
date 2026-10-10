# CLAUDE.md - working agreements for this repository

**The full guide to this library lives in [`AGENTS.md`](AGENTS.md): layout, themes, how to find
assets, licence rules, thumbnails, and the GCS mirror. Read it before changing anything.**

This file exists so the one rule you cannot afford to miss is the first thing you read.

## ⚠️ This repository is PUBLIC. Everything in it is public communication.

`series-ai/jam-ready-assets` is open to the world. Anyone, logged in or not, can read every file,
commit message, pull request title and body, issue, and code review comment, and search engines
index them. Treat anything you write here as published under the RUN name, because it is.

**Write for an outside reader, and assume creators whose work is in the library will read it.**

- **Never name a creator or pack in a negative light.** Do not record that a pack was rejected on
  taste, that a creator's licence wording is contradictory, or that their art was not good enough.
  Make the technical point without the name: "a store licence tag can disagree with the page terms"
  rather than naming who. A rejection note that helps nobody here can cost a small creator real
  standing, and they can find it.
- **Never put a personal name in a committed file.** `Verified-by` is `run-workshop maintainers`,
  not a person. These licence files are copied into every creator's project, so a name here travels
  much further than a commit author line.
- **No internal references.** No Linear issue keys (`RUN-123`), no references to private repos or
  their pull requests, no internal service names, dashboards, Slack channels, or employee emails.
  Describe the reason, not the ticket.
- **No internal process narration.** Sprint plans, review gates, launch dates, headcount, and
  anything about what the company is about to ship stay out.
- **Keep the licence reasoning, drop the gossip.** Explaining *why* a pack is admissible is useful
  to everyone and belongs here. Explaining *who* failed and how is neither.
- **Commit messages are the hard case.** A pull request body can be edited; a commit message that
  has been pushed is effectively permanent. Get it right the first time.

If something genuinely needs to be said and cannot be said in public, put it in the internal
tracker and link nothing.

## Before you open a pull request here

1. Reread the body as though you were a creator whose pack is in the library. Remove anything you
   would not want said about your own work.
2. Check the diff for internal references with something like
   `grep -rniE "RUN-[0-9]+|linear\.app|slack|@series\.ai" --include="*.md" --include="*.json" .`
3. Credit is the point of the Credits table in [`README.md`](README.md). Keep it accurate and keep
   it generous: most packs here are CC0 and ask for nothing, which is exactly why naming the
   creator well is the least we can do.

## Adding animation artwork

Follow [the animation grouping rules in AGENTS.md](AGENTS.md#keep-animation-assets-usable-together).
Preserve complete sheets, keep related frames and companion files together, and verify
individual selection in the generated catalog before describing a pack as ready for it.

## Adding pack thumbnails

Always follow [the listing-thumbnail rules in AGENTS.md](AGENTS.md#choose-pack-thumbnails-from-the-original-listing).
Use the original listing's representative cover or gallery image, preserve its source
and provenance, and check the result at catalog-card size before adding a pack.
