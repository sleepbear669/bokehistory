import React from 'react'
import {AppBar, Typography} from "@material-ui/core";

import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    appBar: {
        height: 48,
        zIndex: theme.zIndex.drawer + 1,
    },
    header: {
        margin: 0
    }
});


const BokeAppBar = (props) => {

    const {classes, title} = props;

    return (
        <AppBar position="relative"
                color="primary"
                className={classes.appBar}>
            div.
            <h1 className={classes.header}>
                보드케이브
            </h1>
            {
                title && <h6>{title.name}</h6>
            }
        </AppBar>
    )
};

export default withStyles(styles)(BokeAppBar);
