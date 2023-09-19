export interface Time {
    years: number;
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export interface Timestamp {
    year: number;
    month: number;
    day: number;

    hour: number;
    minute: number;
    second: number;

    ampm: "AM" | "PM";

    string: string;
}

export const timeInSeconds = {
    minute: 60,
    hour: 60 * 60,
    day: 60 * 60 * 24,
    week: 60 * 60 * 24 * 7,
    year: 60 * 60 * 24 * 365,
};

export const timeInMiliseconds = {
    seconds: 1000,
    minutes: 1000 * timeInSeconds.minute,
    hours: 1000 * timeInSeconds.hour,
    days: 1000 * timeInSeconds.day,
    weeks: 1000 * timeInSeconds.week,
    years: 1000 * timeInSeconds.year,
};

export function convertSecondsToTime(totalSeconds: number): Time {
    const years = Math.floor(totalSeconds / 31536000);
    totalSeconds %= 31536000;
    const weeks = Math.floor(totalSeconds / 604800);
    totalSeconds %= 604800;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return {
        years: years,
        weeks: weeks,
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
    };
}

export function convertTimeToSeconds(time: Time): number {
    let seconds;

    seconds += time.seconds;
    seconds += time.minutes * timeInSeconds.minute;
    seconds += time.hours * timeInSeconds.hour;
    seconds += time.days * timeInSeconds.day;
    seconds += time.weeks * timeInSeconds.week;
    seconds += time.years * timeInSeconds.year;

    return seconds;
}

export function convertTimeStringToSeconds(timeExpr: string): number {
    let units = {
        y: timeInSeconds.year,
        w: timeInSeconds.week,
        d: timeInSeconds.day,
        h: timeInSeconds.hour,
        m: timeInSeconds.minute,
        s: 1,
    };

    const regex = /(\d+)([ywdhms])/g;

    let seconds = 0;
    let match: RegExpExecArray;

    while ((match = regex.exec(timeExpr))) {
        seconds += parseInt(match[1]) * units[match[2]];
    }

    return seconds;
}

export function convertTimeStringToMiliseconds(timeExpr: string): number {
    return convertTimeStringToSeconds(timeExpr) * 1000;
}

export function convertSecondsToTimeString(totalSeconds: number): string {
    const time = convertSecondsToTime(totalSeconds);

    let string: string = "";

    if (time.years > 0) string += `${time.years} Year(s), `;
    if (time.weeks > 0) string += `${time.weeks} Week(s), `;
    if (time.days > 0) string += `${time.days} Day(s), `;
    if (time.hours > 0) string += `${time.hours} Hour(s), `;
    if (time.minutes > 0) string += `${time.minutes} Minute(s), `;
    if (time.seconds > 0) string += `${time.seconds} Second(s), `;

    return string.slice(0, -2);
}

export function convertMilisecondsToTimeString(
    totalMiliseconds: number,
): string {
    return convertSecondsToTimeString(Math.floor(totalMiliseconds / 1000));
}

export function generateTimestampFromDate(date: Date = new Date()): Timestamp {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const hour = date.getHours() % 12;
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const ampm = Math.floor(date.getHours() / 12) === 0 ? "AM" : "PM";

    const timestamp: Timestamp = {
        year: year,
        month: month,
        day: day,

        hour: hour,
        minute: minute,
        second: second,

        ampm: ampm,

        string: `${year}-${month}-${day} ${hour}:${minute}:${second} ${ampm}`,
    };

    return timestamp;
}
