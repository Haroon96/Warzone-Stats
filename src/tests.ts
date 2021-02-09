import { assert } from "console";
import { trimWhitespace } from "./utilities/util";
import { tokenizeMessage } from './controller/controller';

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

test_trimWhitespace();
test_tokenizeMessage();
