import fetchData from './';

export default async function updateLastSeen(id: number, online: boolean) {
    await fetchData(`
        mutation updateLastSeen($id: Int!, $online: Boolean!) {
            updateLastSeen(id: $id, online: $online)
        }
    `, {
        id,
        online
    });
}
