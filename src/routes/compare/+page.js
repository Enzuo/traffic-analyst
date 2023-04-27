/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  let carIds = url.searchParams.getAll('id')
  return {
    carIds
  };
}