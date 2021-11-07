import fetch from 'isomorphic-fetch';
import globals from './globals';

const __API_ENDPOINT__ = globals.__API_ENDPOINT__;

interface FetchDataParams {
    query: string;
    variables?: any
}

const fetchData: (
    query: string,
    variables?: any
) => any = async (query, variables = {}) => {
    let result: any = await fetch(__API_ENDPOINT__ || 'http://localhost:3000/graphql', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ query, variables })
    });

    result = await result.json();
    return result.data;
}

export default fetchData;
