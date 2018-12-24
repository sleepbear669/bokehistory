import React from 'react'
import {AppBar, Typography} from "@material-ui/core";
import {Link} from 'react-router-dom'
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
            <h2 className={classes.header} onClick={props.onClick}>
                <Link style={{color: 'white'}} to='/'>보드케이브</Link>
            </h2>
            {
                title && <h5 className={classes.header}>{title.name}</h5>
            }
        </AppBar>
    )
};

export default withStyles(styles)(BokeAppBar);
