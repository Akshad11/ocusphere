export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getAvailableTimeSlots(): string[] {
  return [
    '10:00 AM - 10:45 AM',
    '10:45 AM - 11:30 AM',
    '11:30 AM - 12:15 PM',
    '12:15 PM - 01:00 PM',
    '02:00 PM - 02:45 PM',
    '02:45 PM - 03:30 PM',
    '03:30 PM - 04:15 PM',
    '04:15 PM - 05:00 PM',
    '05:00 PM - 05:45 PM',
    '06:00 PM - 06:45 PM',
    '07:00 PM - 07:45 PM',
  ];
}
