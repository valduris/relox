# Relox

Relox is a reimplementation of redux and react-redux libraries (hackathon project / work in progress).
Relox allows components to subscribe to different parts of state.

```javascript
import { connect, createStore } from "./src/relox";

export const INCREMENT_FIRST_NUMBER = "numbers/INCREMENT_STATE_NUMBER";

export function incrementFirstNumber(amount) {
    return {
        payload: amount,
        type: INCREMENT_FIRST_NUMBER,
    };
}

export const initialState = {
    firstNumber: 1,
};

export function numbers(state = initialState, action) {
    switch (action.type) {
        case INCREMENT_FIRST_NUMBER:
            return { ...state, firstNumber: state.firstNumber + action.payload };
        default:
            return state;
    }
}

export class TestComponent extends React.Component {
    public render() {
        return (
            <button type="button" onClick={this.onClick}>
                {this.props.currentNumber}
            </button>
        );
    }
    private onClick = (e) => {
        this.props.incrementFirstNumber();
    }
}

export function words(state, action) {
    switch (action.type) {
        // ... imagine there are actions changing this part of state
        default:
            return state;
    }
}

const reducers = { numbers, words };
const initialStoreState = { numbers: undefined, words: [] };
const store = createStore(reducers, initialStoreState);

function selectCurrentNumber(state, ownProps) {
    return ownProps.useDefaultNumber
        ? 100
        : state.numbers.firstNumber;
}

const mapStateToProps = (state, ownProps) => ({
    currentNumber: selectCurrentNumber(state, ownProps),
});

const mapDispatchToProps = { incrementFirstNumber };

const TestComponentConnected = connect(
    mapStateToProps,
    mapDispatchToProps,
    undefined,
    // mapStateToProps will be called only if "numbers" reducer changes state,
    // other state changes will not trigger calling mapStateToProps
    { stateTree: "numbers" },
)(TestComponent);

ReactDOM.render(
    <Provider store={store}>
        <TestComponentConnected useDefaultNumber={false} />
    </Provider>,
    document.querySelector("#rooty"),
);
```