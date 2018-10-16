import React from 'react'
import {
    AppBar,
    Typography,
    Select,
    MenuItem
} from "@material-ui/core";

import {
    withStyles
} from '@material-ui/core/styles';

const styles = theme => ({
    appBar: {
        height: 48,
        zIndex: theme.zIndex.drawer + 1,
    }
});


const BokeAppBar = (props) => {

    const {classes} = props;

    return (
        <AppBar position="fixed"
                color="primary"
                className={classes.appBar}>
            <Typography variant="title" color="inherit">
                보드케이브
            </Typography>
        </AppBar>
    )
};

export default withStyles(styles)(BokeAppBar);
