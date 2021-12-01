import React from 'react'
import {AppBar, Button, Toolbar, Typography} from "@mui/material";
import Link from 'next/link'

function Header() {
    return (
        <AppBar position="static" style={{marginBottom: "10px"}}>
            <Toolbar>
                {/*<IconButton*/}
                {/*    size="large"*/}
                {/*    edge="start"*/}
                {/*    color="inherit"*/}
                {/*    aria-label="menu"*/}
                {/*    sx={{mr: 2}}*/}
                {/*>*/}
                {/*    <MenuIcon/>*/}
                {/*</IconButton>*/}
                <Link href={"/"}>
                    <Typography variant={"h1"} component="h1" fontSize={"medium"} style={{marginRight: "auto"}}>
                        CrowdCoin
                    </Typography>
                </Link>
                <Button variant={"contained"}>Campaigns</Button>
            </Toolbar>
        </AppBar>
    )
}

export default Header