import {createAction} from 'redux-act'
import _defaults from 'lodash.defaults';

export const ASYNC_META = {
  REQUEST: "REQUEST",
  OK: "OK",
  ERROR: "ERROR"
}

const defaultOption = {
  request:{
    metaReducer: () => {
      return ASYNC_META.REQUEST
    }
  },
  ok:{
    metaReducer: () => {
      return ASYNC_META.OK
    }
  },
  error:{
    metaReducer: () => {
      return ASYNC_META.ERROR
    }
  }
}

export default function createActionAsync(description, api, options = defaultOption) {
  _defaults(options, defaultOption);
  let actions = {
    request: createAction(`${description}_REQUEST`, options.request.payloadReducer, options.request.metaReducer),
    ok: createAction(`${description}_OK`, options.ok.payloadReducer, options.ok.metaReducer),
    error: createAction(`${description}_ERROR`, options.error.payloadReducer, options.error.metaReducer)
  }

  let actionAsync = (...args) => {
    return (dispatch, getState) => {
      dispatch(actions.request(...args));
      if(options.request.callback) options.request.callback(dispatch, getState, ...args);
      return api(...args, dispatch, getState)
      .then(response => {
        const out = {
            request: args,
            response: response
        }

        dispatch(actions.ok(out))
        if(options.ok.callback) options.ok.callback(dispatch, getState, response, ...args);
        return out;
      })
      .catch(error => {
        const errorOut = {
            actionAsync,
            request: args,
            error: error
        }
        dispatch(actions.error(errorOut))
        if(options.error.callback) options.error.callback(dispatch, getState, errorOut, ...args);
        if(!options.noRethrow) throw errorOut;
      })
    }
  }
  actionAsync.request = actions.request;
  actionAsync.ok = actions.ok;
  actionAsync.error = actions.error;
  return actionAsync;

}
