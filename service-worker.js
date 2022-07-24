const APP_PREFIX = 'Budget-Tracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION

const FILES_TO_CACHE = [
    "./index.html",
    "./css/style.css",
]


self.addEventListener('install', function (e) {
    //waits until the function is finished before terminatin event listener
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache){
            console.log('installing cache :' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    );
});

//Activation event clears out old data from the cache and tells the S.W how to manage caches
self.addEventListener('activate', function(e){
    e.waitUntil(
        //keys() returns an array of all cache names
        caches.keys().then(function (keyList) {
            //filters out all the files that only contain the appPreFix
            let cacheKeeplist = keyList.filter(function(key){
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            //returns a promise once all old versions of the cache have been deleted
            return Promise.all(
                keyList.map(function(key, i){
                    if(cacheKeeplist.indexOf(key) === -1){
                        console.log('deleting cache: ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

//offline functionality
self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url)
    //intercepts fetch request to see if the request is stored in the cache first
    e.respondWith(
        caches.match(e.request).then(function(request) {
            if(request){
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {
                console.log('files is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})