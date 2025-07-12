/**
 * Converts a given Unix timestamp to a formatted date and time string.
 *
 * @param {number} timestamp - The Unix timestamp to convert (in seconds).
 * @param {string} [locale="en-US"] - The locale string (e.g., 'en-US').
 * @param {Intl.DateTimeFormatOptions} [dateOptions] - Formatting options for the date.
 * @param {Intl.DateTimeFormatOptions} [timeOptions] - Formatting options for the time.
 * @returns {{ date: string, time: string }} An object containing the formatted date and time strings.
 */

export function convertUnixTimestamp(
    timestamp: number,
    locale: string = 'en-US',
    dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
    },
    timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    },
): { date: string; time: string } {
    try {
        // Convert Unix timestamp (in seconds) to milliseconds
        const date = new Date(timestamp * 1000);

        const formattedDate = new Intl.DateTimeFormat(
            locale,
            dateOptions,
        ).format(date);
        const formattedTime = new Intl.DateTimeFormat(
            locale,
            timeOptions,
        ).format(date);

        return {
            date: formattedDate,
            time: formattedTime,
        };
    } catch (error) {
        console.error('Invalid timestamp provided', error);
        return {
            date: 'Invalid date',
            time: 'Invalid time',
        };
    }
}
