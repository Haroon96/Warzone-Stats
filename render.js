async function render() {
    let mdReq = await fetch('https://raw.githubusercontent.com/Haroon96/warzone-stats/master/README.md');
    let text = await mdReq.text();

    let htmlReq = await fetch('https://api.github.com/markdown', {
        body: JSON.stringify({ text }),
        method: 'POST'
    });

    document.getElementById('readme-md').innerHTML = await htmlReq.text();
}

render();