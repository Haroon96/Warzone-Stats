module.exports = {
    validateUser: validateUser
}

function validateUser(u) {
    if (u.platform == 'atvi' && !u.username.includes('#')) {
        throw 'For Activision ID, also append your profile hash (e.g., username#12345)';
    }
    return true;
}