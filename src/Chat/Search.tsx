import React, { FC, useReducer } from 'react';
import { Send, Search, Close } from '@material-ui/icons';
import { User, VoidFunction } from '../interfaces';

interface SearchProps {
    searchUsers: (search: string) => void,
    cancelSearching: VoidFunction
}

const initState = {
    searchFocused: false,
    searchValue: '',
    sent: false
};

const reducer = function(state: any, action: any) {
    return {
        ...state,
        [action.type]: action.payload
    }
}

const SearchBar: FC<SearchProps> = ({
    searchUsers,
    cancelSearching
}) => {
    const [{
        searchValue,
        sent,
        searchFocused
    }, dispatch] = useReducer(reducer, initState);

    function unfocusState() {
        dispatch({ type: 'searchFocused', payload: !searchFocused });
    }

    return (
        <div className="search">
            <input
                type="text"
                className="search-input"
                id="searchInput"
                placeholder="Search people..."
                onFocus={unfocusState}
                onBlur={unfocusState}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (sent) {
                        dispatch({ type: 'sent', payload: false })
                    }
                    if (e.target.value == '') cancelSearching();
                    dispatch({ type: 'searchValue', payload: e.target.value });
                }}
                value={searchValue}
            />
            <Send
                className="search-icon"
                style={{
                    transform: searchValue || searchFocused ? 'rotate(0)' : 'rotate(-180deg)',
                    opacity: searchValue || searchFocused ? 1 : 0,
                    pointerEvents: searchValue || searchFocused ? 'all' : 'none',
                    display: sent && searchValue.length > 0 ? 'none' : 'inline-block'
                }}
                onClick={() => {
                    dispatch({ type: 'sent', payload: true });
                    searchUsers(searchValue);
                }}
            />
            <Search
                className="search-icon"
                style={{
                    transform: searchValue || searchFocused ? 'rotate(180deg)' : 'rotate(0)',
                    opacity: searchValue || searchFocused ? 0 : 1,
                    pointerEvents: 'none'
                }}
            />
            <Close
                className="search-icon"
                style={{
                    display: sent && searchValue.length > 0 ? 'inline-block' : 'none'
                }}
                onClick={() => {
                    cancelSearching();
                    dispatch({ type: 'searchValue', payload: '' });
                    dispatch({ type: 'sent', payload: false });
                }}
            />
        </div>
    )
};

export default SearchBar;
