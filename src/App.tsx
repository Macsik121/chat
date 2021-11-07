import React from 'react';
import ReactDOM from 'react-dom';
import {
    HashRouter as Router
} from 'react-router-dom';
import './styles/style.css';
import Routing from './Routing';

function App() {
    return (
        <Routing />
    )
};

ReactDOM.render(
    <Router>
        <App />
    </Router>,
    document.getElementById('content')
);
