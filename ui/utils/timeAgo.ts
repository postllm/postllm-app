export function timeAgo(date: number) {
	const units = [
	  { max: 60, value: 'second' },
	  { max: 60, value: 'minute' },
	  { max: 24, value: 'hour' },
	  { max: 30, value: 'day' },
	  { max: 12, value: 'month' },
	  { max: Infinity, value: 'year' }
	];
  
	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  
	// @ts-ignore
	let duration = (new Date(date) - Date.now()) / 1000;
  
	for (let unit of units) {
	  if (Math.abs(duration) < unit.max) {
		// @ts-ignore
		return rtf.format(Math.round(duration), unit.value);
	  }
	  duration /= unit.max;
	}
  }