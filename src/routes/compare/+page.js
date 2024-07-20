/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  let carIds = url.searchParams.getAll('id')
  let trimIds = url.searchParams.getAll('tid')
  let configIds = url.searchParams.getAll('cid')
  return {
    carIds : carIds.map((id, index) => ({
      id : id,
      tid : trimIds[index],
      cid : configIds[index],
    }))
  };
}