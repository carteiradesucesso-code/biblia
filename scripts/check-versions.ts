const urls = [
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/kja.json',
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/arc.json', // Tentar achar a ARC real
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/kjv.json',
    'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/rvr.json'
]

async function check() {
    for (const url of urls) {
        try {
            const res = await fetch(url, { method: 'HEAD' })
            console.log(`${url}: ${res.status}`)
        } catch (e) {
            console.log(`${url}: Error`)
        }
    }
}

check()
