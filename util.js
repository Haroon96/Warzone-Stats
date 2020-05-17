module.exports = {
    tokenize: tokenize
};

function tokenize(msg) {
    return msg.toLowerCase().split(' ').filter(x => x != '');
}