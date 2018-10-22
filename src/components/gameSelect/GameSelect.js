import React, {PureComponent}from 'react';
import PropTypes from 'prop-types';
import {MenuItem, Select} from "@material-ui/core";

const GameSelect = (props) => {
    const {value, games, onChange} = props;


    return <Select
        value={value}
        onChange={onChange}
    >
        <MenuItem value={'all'}>모든 게임</MenuItem>
        {
            games.map(game => {
                return <MenuItem value={game.name} key={game.name}>{game.name}</MenuItem>
            })
        }
    </Select>
};

GameSelect.propTypes = {
    value : PropTypes.string,
    games : PropTypes.array,
    onChange: PropTypes.func
};

export default GameSelect;
