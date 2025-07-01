
import { format, isToday, isYesterday, isTomorrow, addDays, isSameDay, parse, isValid } from "date-fns";

// Format a date as a relative day (Today, Tomorrow, Yesterday) or full date
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return `Today, ${format(dateObj, "h:mm a")}`;
  }
  if (isTomorrow(dateObj)) {
    return `Tomorrow, ${format(dateObj, "h:mm a")}`;
  }
  if (isYesterday(dateObj)) {
    return `Yesterday, ${format(dateObj, "h:mm a")}`;
  }
  
  // If it's within the next 6 days, show the day name
  const today = new Date();
  const maxDayToShow = addDays(today, 6);
  
  if (dateObj > today && dateObj <= maxDayToShow) {
    return format(dateObj, "EEEE, h:mm a");
  }
  
  // Otherwise show the full date
  return format(dateObj, "MMM d, yyyy, h:mm a");
};

// Format seconds into a human-readable time format (HH:MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

// Format seconds into a human-readable duration (e.g., "2 hours 30 minutes")
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? "s" : ""}`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  
  if (remainingMins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  
  return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMins} minute${
    remainingMins !== 1 ? "s" : ""
  }`;
};

// Get start and end dates for the current week
export const getCurrentWeekDates = (): { start: Date; end: Date } => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Parse date from natural language text
export const parseNaturalDate = (text: string): Date | null => {
  const today = new Date();
  const lowerText = text.toLowerCase();

  // Handle "today"
  if (lowerText.includes('today')) {
    return today;
  }

  // Handle "tomorrow"
  if (lowerText.includes('tomorrow')) {
    return addDays(today, 1);
  }

  // Handle "in X days" or "X days from now"
  const daysMatch = lowerText.match(/(?:in\s+)?(\d+)\s+days?(?:\s+from\s+now)?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1]);
    return addDays(today, days);
  }

  // Handle "next week"
  if (lowerText.includes('next week')) {
    return addDays(today, 7);
  }

  // Handle specific days of the week
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (lowerText.includes(dayNames[i])) {
      const currentDay = today.getDay();
      const targetDay = i;
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next occurrence
      }
      return addDays(today, daysToAdd);
    }
  }

  // Try to parse common date formats
  const datePatterns = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      let day, month, year;
      if (pattern.source.startsWith('(\\d{4})')) {
        // YYYY-MM-DD format
        [, year, month, day] = match;
      } else {
        // MM/DD/YYYY or MM-DD-YYYY format
        [, month, day, year] = match;
      }
      
      const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }
  }

  return null;
};
