import React from 'react';
import {Route, Switch} from 'react-router-dom';
import GameHistory from 'screen/gameHistory';
import RegistryUser from 'screen/registryUser';
import RegistryGame from 'screen/registryGame';

export const createRoutes = (store) => (
    <div style={{height: '100%'}}>
        <Switch>
            <Route exact path="/" component={GameHistory}/>
            <Route exact path="/registryUser" component={RegistryUser}/>
            <Route exact path="/registryGame" component={RegistryGame}/>
            <Route component={NoMatch}/>
        </Switch>
    </div>
);

const NoMatch = ({location}) => (
    <div>
        <h3>페이지를 찾을 수 없습니다 <code>{location.pathname}</code></h3>
    </div>
);

export default createRoutes
