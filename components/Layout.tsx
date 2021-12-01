import React from 'react'
import Header from "./Header";
import {Container} from "@mui/material";

export default props => {
    return (
        <Container>
            <Header/>
            {props.children}
        </Container>
    )

}