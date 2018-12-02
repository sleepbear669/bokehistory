import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {MenuItem, Input, Select, FormControl, InputLabel} from "@material-ui/core";

const GameSelect = (props) => {
    const {value, games, onChange} = props;


    return <FormControl style={{minWidth: 120}}>
        <InputLabel>게임선택</InputLabel>
        <Select
            value={value}
            onChange={onChange}
        >
            {
                games.map(game => {
                    return <MenuItem value={game.name} key={game.name}>{game.name}</MenuItem>
                })
            }
        </Select>
    </FormControl>
};

GameSelect.propTypes = {
    value: PropTypes.string,
    games: PropTypes.array,
    onChange: PropTypes.func
};

export default GameSelect;
