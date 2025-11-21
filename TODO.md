# TODO: Update Currency Display and Ensure Land Value Accuracy

- [x] Update components/ResultsPanel.tsx to display '₹' for INR currency instead of hardcoded '$'
- [x] Verify that land values are accurate (already in INR from API)

# TODO: Implement View Details Functionality in Dashboard

- [x] Add state to track selected item for details view (selectedItem: DashboardItem | null)
- [x] Implement onClick handler for "View Details" button to set selected item
- [x] Add modal UI to display detailed information about the selected item (title, description, type, date, status, coordinates, value)
- [x] Include close button to dismiss the details modal
- [x] Test the "View Details" functionality on the running server (http://localhost:3000/dashboard)
