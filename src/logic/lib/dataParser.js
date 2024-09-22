/**
 *
 * @param {string|number} date
 * @returns {[number, number]} year period range year1 -> year2
 */
export function parseDate(date) {
  if(!date){
    return [null, null]
  }

  if(typeof date === 'number'){
    return [date, date]
  }

  const years = date.match(/\d+/g).map(y => parseInt(y, 10))

  if(years.length < 2){
    return [years[0], years[0]]
  }

  return years[0] > years[1] ? [years[1], years[0]] : [years[0], years[1]]
}