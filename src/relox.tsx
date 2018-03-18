import * as React from "react";
import * as ReactDOM from "react-dom";
import * as PropTypes from "prop-types";

/*
- options flag for runtime type checks
- support middleware
- run all redux and react-redux tests to ensure API compatibility as much as possible
*/

export type State = any;
export type OwnProps = object;
export type Action = any;
export type Reducer = any;
export type Subscriber = (state: State, key?: object | string) => void;
export type Unsubscriber = () => void;
export type Selector = (state: State, ...args: any[]) => any;
export type MapStateToProps = (state: State, ownProps: any) => any;
export type MapDispatchToProps = { [key: string]: Selector };
export type MergeProps = (stateProps: any, dispatchProps: any, ownProps: any) => any;
export type ConnectOptions = { stateTree?: string } | undefined;
export type ProviderChildContext = any;
export type ReactComponentToConnectType = any;

export interface Listeners {
    [key: string]: Selector[];
}

export interface Store {
    getState: () => State;
    dispatch: (action: Action) => void;
    subscribe: (cb: Subscriber) => Unsubscriber;
    // selector: (stateTree: object | string, callback: Selector) => Selector;
    replaceReducer: (nextReducer: Function) => void;
}

// // TODO rename storeShape to storeType
// const storeShape = PropTypes.shape({
//     subscribe: PropTypes.func.isRequired,
//     dispatch: PropTypes.func.isRequired,
//     getState: PropTypes.func.isRequired
// });
export const EMPTY_OBJECT = {};

export function connect(
    mapStateToProps: MapStateToProps = () => (EMPTY_OBJECT),
    mapDispatchToProps: any, // MapDispatchToProps = EMPTY_OBJECT,
    mergeProps: MergeProps = (s, d, o) => ({ ...s, ...d, ...o }),
    options: ConnectOptions = EMPTY_OBJECT,
) {
    return function(component: ReactComponentToConnectType): any {
        const ReactComponentToConnect = component;

        class Connect extends React.Component<any, any> {
            public static contextTypes = {
                store: PropTypes.object,
            };
            private unsubsriber: Unsubscriber | undefined;
            constructor(props: any, context: ProviderChildContext) {
                super(props, context);
                this.props = props;
                // this.props = props;
            }
            public componentWillMount() {
                this.unsubsriber = this.context.store.subscribe((state: State, changed: object | string | undefined) => {
                    if (typeof changed === "string"
                        && typeof options.stateTree === "string"
                        && options.stateTree === changed
                    ) {
                        this.setState({
                            newProps: mapStateToProps(state, this.props),
                        });
                    }
                });
            }
            public componentWillReceiveProps(nextProps: any) {
                this.props = nextProps;
            }
            public render() {
                const store = this.context.store;
                const state = store.getState();
                const ownProps = this.props;
                const stateProps = mapStateToProps ? mapStateToProps(state, ownProps) : {};
                // TODO add support for mapDispatchToProps as function
                const dispatchProps = Object.keys(mapDispatchToProps).reduce((memo: object, key: string) => {
                    memo[key] = (...args: any[]) => store.dispatch(mapDispatchToProps[key](...args));
                    return memo;
                }, {});

                const allProps = mergeProps(stateProps, dispatchProps, ownProps);

                return (
                    <ReactComponentToConnect {...allProps} />
                );
            }
            public componentWillUnmount() {
                this.unsubsriber && this.unsubsriber();
            }
        }

        return Connect;
    }
}

export interface ProviderProps {
    store: Store;
}

class Provider extends React.Component<ProviderProps, {}> {
    public static childContextTypes = {
        store: PropTypes.object.isRequired,
    };
    private store: Store;
    constructor(props: any, context: any) {
        super(props, context);
        this.store = props.store;
    }
    public getChildContext(): ProviderChildContext {
        return { store: this.store };
    }
    public render() {
        return React.Children.only(this.props.children);
    }
}

export function createStore(reducers: object, initialState?: State): Store {
    // TODO handle argument switching as redux does
    const INITIALIZE = "@@INITIALIZE";
    const subscribers: Subscriber[] = [];
    const reducerKeys = Object.keys(reducers);
    // const listeners: Listeners = reducerKeys.reduce((memo: Listeners, key: string) => {
    //     memo[key] = [];
    //     return memo;
    // }, {});

    // overwrite initial state from createStore with default state of reducers
    let state = reducerKeys.reduce((memo: State, key: string) => {
        memo[key] = reducers[key](undefined, { type: INITIALIZE });
        return memo;
    }, initialState);

    function dispatch(action: Action): void {
        reducerKeys.forEach(key => {
            const prevState = state[key];
            const newState = reducers[key](prevState, action);
            if (prevState !== newState) {
                state[key] = newState;
                subscribers.forEach(subscriber => subscriber(state, key));
            }
        });
    }

    function getState(): State {
        return state;
    }

    function subscribe(callback: Subscriber): Unsubscriber {
        // TODO add support for subscribing to separate parts of state
        subscribers.push(callback);
        return () => {
            subscribers.splice(subscribers.indexOf(callback), 1);
        }
    }

    // function selector(stateTree: object | string, callback: Selector): Selector {
    //     if (typeof stateTree === "string") {
    //         if (!listeners[stateTree]) {
    //             listeners[stateTree] = [];
    //         }
    //         listeners[stateTree].push(callback);
    //     } else {

    //     }
    //     // // TODO stateTree mapping
    //     return callback;
    // }

    function replaceReducer(reducer: Function) {
        console.warn("replaceReducer is not implemented");
    }

    return {
        // selector,
        subscribe,
        dispatch,
        getState,
        replaceReducer,
    };
}
