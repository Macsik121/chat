import React, { FC, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import Signin from "./Signin";
import Signup from "./Signup";

const Auth: FC<any> = (props: any) => {
    if (localStorage.getItem('token')) {
        props.history.push('/');
        return <div></div>;
    }
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        console.log('setisMounted(true)')
        setIsMounted(true);
    }, []);

    return (
        <div
            className="auth-forms"
            style={{
                opacity: isMounted ? 1 : 0,
                pointerEvents: isMounted ? 'all' : 'none'
            }}
        >
            <Signin />
            <Signup />
        </div>
    )
}

export default withRouter(Auth);
