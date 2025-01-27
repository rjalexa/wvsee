export const colors = {
  table: {
    header: {
      date: '!bg-blue-100',      // Light blue for dates
      number: '!bg-gray-100',    // Light gray for numbers
      text: '!bg-green-100',     // Light green for text
      array: '!bg-purple-100',   // Light purple for arrays
      default: '!bg-gray-100'    // Default fallback
    },
    rowHover: 'hover:bg-gray-50',
    border: 'divide-gray-200'
  }
} as const;
