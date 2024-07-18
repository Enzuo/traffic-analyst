/** @type {import('./$types').PageLoad} */
export function load({ url }) {
  return {
      searchParams : {
        id : url.searchParams.get('id'),
        tid : parseFloat(url.searchParams.get('tid') || '0'),
        cid : parseFloat(url.searchParams.get('cid') || '0'),
      }
  };
}