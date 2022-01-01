import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from "react-router-dom";
import Routing from '../src/Routing';
import template from './template';

const render = (req, res) => {
    const html = (ReactDOMServer.renderToString(
        <StaticRouter location={req.url}>
            <Routing />
        </StaticRouter>
    ));
    res.send(template(html));
}

export default render;
