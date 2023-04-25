/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  console.log(url)
  return {
      searchParams : {
        id : url.searchParams.get('id')
      }
  };
}