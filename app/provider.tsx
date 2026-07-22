"use client"
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { UserDetailsContext } from '@/context/UserDetailsContext';

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const [userDetails, setUserDetails] = useState<any>();
    useEffect(() => {
        createNewUser();
    }, []);

    const createNewUser = async () => {
        try {
            const result = await axios.post("/api/users", {});
            console.log("Result", result.data);
            setUserDetails(result.data?.user);
        }
        catch (error) {
            console.log(error);
        }
    }
    return (
        <UserDetailsContext.Provider value={{ userDetails, setUserDetails }}>
            <div>{children}</div>
        </UserDetailsContext.Provider>
    )
}

export default Provider