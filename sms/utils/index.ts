import moment from 'moment';

export function limitedPush<T>(el: T[], item: T, limit: number) {
    if (el.length >= limit) {
        el.splice(0, el.length - limit + 1);
    }
    el.push(item);
}

export function getTimeDiffFromNow(time: Date, format: 'minute'): number {
    let now = moment(new Date()); //today's date
    let end = moment(time); // another date
    let duration = moment.duration(now.diff(end));
    let diff: number;
    if (!format || format === 'minute') {
        diff = Math.round(duration.asMinutes());
    } else {
        diff = Math.round(duration.asMinutes());
    }
    return diff;
}
