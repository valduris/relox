import { connect, createStore } from "./src/relox";

export const INCREMENT_FIRST_NUMBER = "numbers/INCREMENT_STATE_NUMBER";

export interface IncrementFirstNumberAction {
    payload: number;
    type: typeof INCREMENT_FIRST_NUMBER;
}

export function incrementFirstNumber(amount: number = 1): IncrementFirstNumberAction {
    return {
        payload: amount,
        type: INCREMENT_FIRST_NUMBER,
    };
}

export interface NumbersState {
    firstNumber: number;
    secondNumber: number;
}

export const initialState: NumbersState = {
    firstNumber: 1,
    secondNumber: 9000,
};

export type NumbersAction = IncrementFirstNumberAction;

export function numbers(state = initialState, action: NumbersAction) {
    switch (action.type) {
        case INCREMENT_FIRST_NUMBER:
            return { ...state, firstNumber: state.firstNumber + action.payload };
        default:
            return state;
    }
}

export interface TestComponentStateProps {
    currentNumber: number;
}

export interface TestComponentDispatchProps {
    incrementFirstNumber: typeof incrementFirstNumber;
}

export interface TestComponentOwnProps {
    useFirstNumber?: boolean;
}

export interface TestComponentState {
    previousNumber: number;
}

export type TestComponentProps = TestComponentStateProps & TestComponentDispatchProps & TestComponentOwnProps;

export class TestComponent extends React.Component<TestComponentProps, TestComponentState> {
    public static defaultProps = {
        isNumberRounded: false,
        currentNumber: -1,
    };
    public state = { previousNumber: -1 };

    public shouldComponentUpdate(nextProps: TestComponentProps, nextState: TestComponentState) {
        return (
            this.props.currentNumber !== nextProps.currentNumber
            || this.state.previousNumber !== nextState.previousNumber
        );
    }
    public render() {
        const style: any = {
            background: "gray",
            width: "500px",
            height: "125px",
            position: "absolute",
            fontSize: "45px",
            textAlign: "center",
            lineHeight: "125px",
            top: this.props.useFirstNumber ? "20px" : "150px",
            left: "0",
            right: "0",
        };

        const buttonStyle = {
            border: "1px solid #333",
            fontSize: "45px",
            padding: "0 5px",
            margin: "10px",
            outline: "none",
        };

        return (
            <div style={style}>
                <span>{this.props.currentNumber}</span>
                <button
                    type="button"
                    onClick={this.onClick}
                    style={buttonStyle}
                >
                    Increment
                </button>
                <span>{this.state.previousNumber}</span>
            </div>
        );
    }
    private onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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

function selectCurrentNumber(state: any, ownProps: any): number {
    return ownProps.useFirstNumber
        ? state.numbers.firstNumber
        : state.numbers.secondNumber;
}

const mapStateToProps = (state: any, ownProps: any) => ({
    currentNumber: selectCurrentNumber(state, ownProps),
});

const mapDispatchToProps = { incrementFirstNumber };

const TestComponentConnected = connect(
    mapStateToProps,
    mapDispatchToProps,
    undefined,
    // mapStateToProps will not be called if "words" reducer changes state
    { stateTree: "numbers" },
)(TestComponent);

export function renderTestComponent() {
    ReactDOM.render(
        <Provider store={store}>
            <div>
                <TestComponentConnected useFirstNumber={true} />
                <TestComponentConnected useFirstNumber={false} />
            </div>
        </Provider>,
        document.querySelector("#rooty"),
    );
}
