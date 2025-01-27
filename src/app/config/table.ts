export const tableConfig = {
  /**
   * Maximum number of characters to display in table cells before truncating
   * @default 100
   */
  maxCellTextLength: 100,

  /**
   * Text to append to truncated cell content
   * @default '(...truncated)'
   */
  truncationSuffix: '(...truncated)',
} as const;
