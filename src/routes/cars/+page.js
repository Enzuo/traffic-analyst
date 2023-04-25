/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  return {
      searchParams : {
        id : url.searchParams.get('id'),
        tid : parseFloat(url.searchParams.get('tid') || '0'),
        eid : parseFloat(url.searchParams.get('eid') || '0'),
      }
  };
}