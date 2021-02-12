import { assert } from "console";
import { trimWhitespace } from "./utilities/util";
import { tokenizeMessage } from "./controller/controller";
import TaskRepeater from "./utilities/task-repeater";

function test_trimWhitespace() {
    let inputs = ['test    1', 'test    2  ', '     test 3', '    test    4   '];
    let outputs = ['test 1', 'test 2', 'test 3', 'test 4'];
    inputs.forEach((v, i) => {
        assert(trimWhitespace(v) === outputs[i]);
    });
}

function test_tokenizeMessage() {
    let input = '!wz cmd arg0 arg1 arg2';
    let tokens = tokenizeMessage(input);
    assert(tokens.command == 'cmd');
    assert(tokens.args.length == 3);
    assert(tokens.args[0] == 'arg0');
    assert(tokens.args[1] == 'arg1');
    assert(tokens.args[2] == 'arg2');
}

function test_taskRepeater() {
    let i = 0;
    let task = (a) => {
        return new Promise((res, rej) => {
            console.log(a);
            i++;
            if (i < 2) rej('failed');
            if (i >= 2) res('success');    
        })
    }

    try {
        const repeater = new TaskRepeater(task, 'arg0', 5000, 1);
        repeater.run()
            .then(res => {
                console.log('response', res);
            })
            .catch(err => {
                console.log('error', err);
            });
    } catch (e) {
        console.log(e);
    }
}

test_trimWhitespace();
test_tokenizeMessage();
test_taskRepeater();
