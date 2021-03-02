const React = require('react');
const axios = require('axios');
const uuid = require('uuid');
const register = require('./ws');

var deviceId = uuid.v4().replace(/-/g, '').substr(0, 8);
var Prompt = deviceId + ' > ';
var ShellApi = 'http://websocket.serverless.fun/send';

const App = React.createClass({
    getInitialState: function () {
        register(this, deviceId);
        this.offset = 0
        this.cmds = []
        return {
            history: [],
            prompt: Prompt,
        }
    },
    clearHistory: function () {
        this.setState({history: []});
    },
    execShellCommand: function (cmd) {
        const that = this;
        that.setState({'prompt': ''})
        that.offset = 0
        that.cmds.push(cmd)
        axios.post(ShellApi, cmd, {
            headers: {
                'Content-Type': 'application/octet-stream',
                "x-ca-deviceid": deviceId
            }
        }).then(function (res) {
            that.setState({'prompt': Prompt});
        }).catch(function (err) {
            const errText = err.response ? err.response.status + ' ' + err.response.statusText : err.toString();
            that.addHistory(errText);
            that.setState({'prompt': Prompt})
        });
    },
    showWelcomeMsg: function () {
        this.addHistory(deviceId + ', Welcome to Serverless Devs ChatApp! Have fun!');
    },
    openLink: function (link) {
        return function () {
            window.open(link, '_blank');
        }
    },
    componentDidMount: function () {
        const term = this.refs.term.getDOMNode();

        this.showWelcomeMsg();
        term.focus();
    },
    componentDidUpdate: function () {
        var container = document.getElementById('holder')
        container.scrollTop = container.scrollHeight
    },
    handleInput: function (e) {
        switch (e.key) {
            case "Enter":
                var input_text = this.refs.term.getDOMNode().value;

                if ((input_text.replace(/\s/g, '')).length < 1) {
                    return
                }

                if (input_text === 'clear') {
                    this.state.history = []
                    this.showWelcomeMsg()
                    this.clearInput()
                    this.offset = 0
                    this.cmds.length = 0
                    return
                }

                this.addHistory(this.state.prompt + " " + input_text);
                this.execShellCommand(input_text);
                this.clearInput();
                break
            case 'ArrowUp':
                if (this.offset === 0) {
                    this.lastCmd = this.refs.term.getDOMNode().value
                }

                this.refs.term.getDOMNode().value = this.cmds[this.cmds.length - ++this.offset] || this.cmds[(this.offset = this.cmds.length, 0)] || this.lastCmd
                return false
            case 'ArrowDown':
                this.refs.term.getDOMNode().value = this.cmds[this.cmds.length - --this.offset] || (this.offset = 0, this.lastCmd)
                return false
        }
    },
    clearInput: function () {
        this.refs.term.getDOMNode().value = "";
    },
    addHistory: function (output) {
        const history = this.state.history.slice(0)

        if (output instanceof Array) {
            history.push.apply(history, output)
        } else {
            history.push(output)
        }

        this.setState({
            'history': history
        });
    },
    handleClick: function () {
        const term = this.refs.term.getDOMNode();
        term.focus();
    },
    render: function () {
        const output = this.state.history.map(function (op, i) {
            return <p key={i}>{op}</p>
        });
        return (
            <div className='input-area' onClick={this.handleClick}>
                {output}
                <p>
                    <span className="prompt">{this.state.prompt}</span>
                    <input type="text" onKeyDown={this.handleInput} ref="term"/>
                </p>
            </div>
        )
    }
});

const AppComponent = React.createFactory(App);
React.render(AppComponent(), document.getElementById('app'));
