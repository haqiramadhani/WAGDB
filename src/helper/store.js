const SESSION = {};

const addSession = (license, session) => {
    SESSION[license] = session;
}

const checkSession = async (license) => {
    if (!Object.keys(SESSION).includes(license)) return false;
    if (['CONNECTED'].includes(await SESSION[license].getConnectionState())) return true;
    if (!['CONFLICT', 'UNLAUNCHED'].includes(await SESSION[license].getConnectionState())) return false;
    SESSION[license].forceRefocus().then(null).catch(null);
    return true;
}

module.exports = {
    SESSION,
    addSession,
    checkSession,
};