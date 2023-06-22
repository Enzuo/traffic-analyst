/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  let carIds = url.searchParams.getAll('id')
  let trimIds = url.searchParams.getAll('tid')
  let engineIds = url.searchParams.getAll('eid')
  return {
    carIds : carIds.map((id, index) => ({
      id : id,
      tid : trimIds[index],
      eid : engineIds[index],
    }))
  };
}