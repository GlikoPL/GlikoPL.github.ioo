const default_lang = "en";
const languages = ["en", "pl"]

state = {}
md_converter = new showdown.Converter();

window.onload = function() {
    state.lang = default_lang;
    state.page = 'home';

    let user_lang = navigator.language || navigator.userLanguage;
    languages.forEach(function(value, index, array) {
        if(value == user_lang) state.lang = value;
    });

    if (document.location.search == "") {
        state.prev_url = `?page=${state.page}&lang=${state.lang}`
    }
    else state.prev_url = document.location.search;

    update_lang();
    update_page(false);
}

function set_lang(lang) {
    state.lang = lang;
    update_lang();
    set_page(state.page);
}

function update_element_lang(id) {
    document.getElementById(id).innerHTML = texts[state.lang][id];
}

function update_lang() {
    update_element_lang('home');
    update_element_lang('projects');
    update_element_lang('changelog');
    update_element_lang('other');
    update_element_lang('lang');
    update_element_lang('lang-en');
    update_element_lang('lang-pl');
}

window.addEventListener('popstate', (event) => {
    update_page(false)
});

function set_page(page) {
    new_url = `?page=${page}&lang=${state.lang}`
    history.replaceState({}, '', new_url)
    update_page(true)
}

function update_navbar_highlight(page, lang) {
    let elements = document.getElementsByTagName('a');
    for(let i = 0; i < elements.length; i++) {
        if(elements[i].classList.contains('active')) {
            elements[i].classList.remove('active');
        }
    }
    if(page.startsWith('home')) document.getElementById('home').className = 'active';
    if(page.startsWith('projects')) document.getElementById('projects').className = 'active';
    if(page.startsWith('changelog')) document.getElementById('changelog').className = 'active';
    if(page.startsWith('other')) document.getElementById('other').className = 'active';
    if(lang == 'en') document.getElementById('lang-en').className = 'active';
    else if(lang == 'pl') document.getElementById('lang-pl').className = 'active';
}

function update_page(push_history) {
    const searchParams = new URLSearchParams(document.location.search);
    page = searchParams.get('page');
    lang = searchParams.get('lang');
    if(page == null) page = state.page;
    if(lang == null) lang = state.lang;

    if (push_history) {
        if(document.location.search != state.prev_url) {
            history.pushState({}, '', document.location);
        }
    }
    state.prev_url = document.location.search;

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if(this.readyState == xhr.DONE && this.status == 200) {
            update_from_markdown(xhr.responseText);
        }
    }
    xhr.onerror = function() {
        if(xhr.status == 404) {
            document.getElementById('content').innerHTML = `${texts[state.lang]['404']}: ${lang}/${page}.md`;
        }
        else {
            document.getElementById('content').innerHTML = `${texts[state.lang]['page_error']}: ${lang}/${page}.md`;
        }
    }
    xhr.open('GET', `content/${lang}/${page}.md`, true);
    xhr.send();

    state.page = page;
    update_navbar_highlight(page, lang);
    if(lang != state.lang) {
        state.lang = lang;
        update_lang();
    }
}

function processMarkdownPath(path) {
    let path2 = path.replace(".md", "");
    let urlHref = new URL(path2, "https://kubaglikopl.github.io/" + state.page).href;
    urlHref = urlHref.replace("https://kubaglikopl.github.io/", "")
    return urlHref;
}

function update_from_markdown(md) {
    content_element = document.getElementById('content');
    content_element.innerHTML = md_converter.makeHtml(md);
    links = content_element.getElementsByTagName("a");
    for(let i = 0; i < links.length; i++) {
        link_href = links[i].getAttribute("href");
        const is_markdown_link = link_href.includes(".md");
        const is_web_link = ((link_href.includes("https://")) || (link_href.includes("http://")));
        if(is_markdown_link && !is_web_link) {
            links[i].id = link_href;
            links[i].setAttribute('href', '#');
            links[i].onclick = function() {
                console.log(this.id);
                let href = this.id;
                set_page(processMarkdownPath(href));
            }
        }
    }
}
