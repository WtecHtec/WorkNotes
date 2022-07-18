let g_noteStatus = false
let g_fabric_canvas = null
let g_loadingel = null
const g_unactives = ['close', 'save', 'other']
let g_select_status = false
let g_login = false
let g_account = ''
let g_note_id = ''

async function checkHasData() {
    let cacheData = null
    console.log('checkHasData=====')
    try {
        let pageUrl = window.location.href
        if (getLogin() === 'true') {
            const res = await requestApi('hasnote', {
                accountAuthor: getAccount(),
                notePath: pageUrl,
            })
            if (res && res.statusCode === 200 && res.responseData && res.responseData.data && res.responseData.data.noteString) {
                cacheData = res.responseData.data.noteString;
                g_note_id = res.responseData.data.noteId;
                return cacheData
            } else {
                getLogin('set', false)
            }
            console.log(res)
        } else {
            cacheData = window.localStorage.getItem(pageUrl)
        }
    } catch (e) { }
    return cacheData;
}

function handleReadStatus(type = 'get', status) {
    try {
        let pageUrl = window.location.href
        if (type === 'set') {
            window.localStorage.setItem(`${pageUrl}_note_read_status`, status)
        } else {
            return window.localStorage.getItem(`${pageUrl}_note_read_status`)
        }
    } catch (e) { }
    return false
}

function getLogin(type = 'get', value) {
    try {
        if (type === 'set') {
            window.localStorage.setItem(`note_g_login`, value)
        } else {
            return window.localStorage.getItem(`note_g_login`)
        }
    } catch (e) { }
    return false
}

function getAccount(type = 'get', value) {
    try {
        if (type === 'set') {
            window.localStorage.setItem(`note_g_account`, value)
        } else {
            return window.localStorage.getItem(`note_g_account`)
        }
    } catch (e) { }
    return false
}

function getToken(type = 'get', value) {
    try {
        if (type === 'set') {
            window.localStorage.setItem(`note_g_author`, value)
        } else {
            return window.localStorage.getItem(`note_g_author`)
        }
    } catch (e) { }
    return ''
}
function requestApi(url, params) {
    return new Promise((resolve, reject) => {
        let h = {}
        if (url !== 'accountlogin') {
            h = {
                Authorization: `Bearer ${getToken()}`
            }
        }
        axios.post(`https://sr7.top/webnote/${url}`, {
            ...params
        }, {
            headers: {
                ...h,
            }
        })
            .then(function (response) {
                // console.log(response.data);
                resolve(response.data)
            })
            .catch(function (error) {
                console.log(error);
                resolve(null)
            });

    });

}