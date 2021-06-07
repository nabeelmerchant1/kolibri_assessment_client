import 'babel-polyfill';

import es6Promise              from 'es6-promise';
import React                   from 'react';
import ReactDOM                from 'react-dom';
import { Provider }            from 'react-redux';
import injectTapEventPlugin    from 'react-tap-event-plugin';
import { LiveAnnouncer }       from 'react-aria-live';

import routes                  from './routes';
import DevTools                from '../dev/dev_tools';
import configureStore          from './store/configure_store';
import jwt                     from '../loaders/jwt';
import QueryString             from '../utils/query_string';
import { getInitialSettings }  from './reducers/settings';


// Polyfill es6 promises for IE
es6Promise.polyfill();

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin

injectTapEventPlugin();


class Root extends React.Component {
  render() {
    const devTools = __DEV__ ? <DevTools /> : null;
    const { store } = this.props;
    return (
      <LiveAnnouncer>
        <Provider store={store}>
          <div>
            {routes}
            {devTools}
          </div>
        </Provider>
      </LiveAnnouncer>
    );
  }
}

const settings = getInitialSettings(window.DEFAULT_SETTINGS, QueryString.params());
const store = configureStore({ settings, jwt: window.DEFAULT_JWT });
if (window.DEFAULT_JWT) { // Setup JWT refresh
  jwt(store.dispatch, settings.user_id);
}

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('main-app'),
);
