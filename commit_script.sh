git reset
git add "app/(main)/details.tsx" "app/(main)/_layout.tsx" "components/CarCard.tsx" "components/AnimatedTabBar.tsx"
git commit -m "feat(details): implement animated double header and persistent car branding" -m "- Added synchronized double-tier header animation (Drawer + Navigation)." -m "- Implemented persistent car branding by showing the Car Name initially in the sub-header." -m "- Added comprehensive Safe Area support to all header states for notched devices."
git add .
git commit -m "feat(hybrid): refine studio UI with mode-specific controls and adaptive themes" -m "- Isolated 3D transformation tools from AR mode for a cleaner interaction." -m "- Implemented environment-adaptive icon color palette (Light/Dark themes)." -m "- Simplified AR navigation and standardized Safe Area padding across all views." -m "- Fixed car data mapping for price-range filtering and improved seating capacity types." -m "- Cleaned up annotations and code styling across Explore and hybrid screens."
git push origin main
