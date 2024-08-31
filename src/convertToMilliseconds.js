/**
 * Converts a time string into milliseconds.
 * Supports formats like "10s" (10 seconds), "5m" (5 minutes), "1h" (1 hour), "500ms" (500 milliseconds).
 * 
 * @param {string} timeStr - The time string to convert.
 * @returns {number} - The time in milliseconds.
 */
export default function convertToMilliseconds(timeStr) {
    if (!timeStr) return 10000; // Default to 10 seconds if no input

    // Regular expression to match the time formats
    const match = timeStr.match(/^(\d+(\.\d+)?)([smh]?)$/i);
    if (!match) throw new Error(`Invalid time format: ${timeStr}`);

    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();

    switch (unit) {
        case 's':
            return value * 1000; // seconds to milliseconds
        case 'm':
            return value * 60000; // minutes to milliseconds
        case 'h':
            return value * 3600000; // hours to milliseconds
        case 'ms':
            return value; // already in milliseconds
        default:
            return value; // Assume it's already in milliseconds if no unit is provided
    }
}
