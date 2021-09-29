let cachedBTTVEmotes = [];
let cachedFFZEmotes = [];
let cached7TVEmotes = [];
let initialChildProcess = [];

// XXX: Implement channel emotes.
// Scuffed implementation, but it works I guess so I'm not complaining :)

const fetchBTTVEmotes = async () => {
    const response = await fetch("https://api.betterttv.net/3/cached/emotes/global");
    const data = await response.json();
    cachedBTTVEmotes = data;

    if (typeof injectedChannelId === "string") {
        console.info("[BTTV] Fetching channel emotes:", injectedChannelId);
        const bttvYTChannel = await fetch("https://api.betterttv.net/3/cached/users/youtube/" + injectedChannelId);
        const bttvYTData = await bttvYTChannel.json();
        if (!Array.isArray(bttvYTData)) {
            console.warn("[BTTV] Channel doesn't exist on BTTV:", injectedChannelId);
            return;
        } else {
            console.info("[BTTV] Merging back with cached emotes list:", injectedChannelId);
            bttvYTData.forEach((content) => {
                cachedBTTVEmotes.push(content);
            })
        }
    }
}

const fetchFFZEmotes = async () => {
    const response = await fetch("https://api.betterttv.net/3/cached/frankerfacez/emotes/global");
    const data = await response.json();

    data.forEach((content) => {
        cachedFFZEmotes.push(
            {
                "id": content.id.toString(),
                "code": content.code,
            }
        )
    })
}

const fetch7TVEmotes = async () => {
    const response = await fetch("https://api.7tv.app/v2/emotes/global");
    const data = await response.json();

    data.forEach((content) => {
        cached7TVEmotes.push(
            {
                "id": content.id,
                "code": content.name,
            }
        )
    })

    if (typeof injectedChannelId === "string") {
        console.info("[7TV] Fetching channel emotes:", injectedChannelId);
        const sevenTVYTChannel = await fetch("https://api.7tv.app/v2/users/" + injectedChannelId + "/emotes");
        const sevenTVYTData = await sevenTVYTChannel.json();
        if (!Array.isArray(sevenTVYTData)) {
            console.warn("[7TV] Channel doesn't exist on 7TV:", injectedChannelId);
            return;
        } else {
            console.info("[7TV] Merging back with cached emotes list:", injectedChannelId);
            sevenTVYTData.forEach((content) => {
                cached7TVEmotes.push(
                    {
                        "id": content.id,
                        "code": content.name,
                    }
                )
            })
        }
    }
}

function createEmote(emote, pepela) {
    let emoteElement = document.createElement("img");
    emoteElement.className = "emoji yt-formatted-string style-scope yt-live-chat-text-message-renderer yeah-but-bttv";
    emoteElement.alt = emote.code;
    if (pepela === "bttv") {
        emoteElement.src = "https://cdn.betterttv.net/emote/" + emote.id + "/1x";
        emoteElement.srset = "https://cdn.betterttv.net/emote/" + emote.id + "/1x 1x, https://cdn.betterttv.net/emote/"  + emote.id + "/2x 2x, https://cdn.betterttv.net/emote/" + emote.id + "/3x 3x";
    } else if (pepela === "ffz") {
        emoteElement.src = "https://cdn.frankerfacez.com/emoticon/" + emote.id + "/1";
        emoteElement.srset = "https://cdn.frankerfacez.com/emoticon/" + emote.id + "/1 1x, https://cdn.frankerfacez.com/emoticon/" + emote.id + "/2 2x, https://cdn.frankerfacez.com/emoticon/" + emote.id + "/4 4x";
    } else if (pepela === "7tv") {
        emoteElement.src = "https://cdn.7tv.app/emote/" + emote.id + "/1x";
        emoteElement.srset = "https://cdn.7tv.app/emote/" + emote.id + "/1x 1x, https://cdn.7tv.app/emote/" + emote.id + "/2x 2x, https://cdn.7tv.app/emote/" + emote.id + "/3x 3x, https://cdn.7tv.app/emote/" + emote.id + "/4x 4x";
    }
    return emoteElement.outerHTML;
}

// replace #message contents
const replaceContents = (node) => {
    if (!node) {
        return;
    }
    const textContent = node.innerHTML;
    // try to replace if message match any emotes in
    // cachedBTTVEmotes, cachedFFZEmotes, cached7TVEmotes
    cachedBTTVEmotes.forEach((emote) => {
        const regex = new RegExp(emote.code, "g");
        const replaced = textContent.replace(regex, createEmote(emote, "bttv"));
        if (replaced !== textContent) {
            node.innerHTML = replaced;
        }
    })

    cachedFFZEmotes.forEach((emote) => {
        const regex = new RegExp(emote.code, "g");
        const replaced = textContent.replace(regex, createEmote(emote, "ffz"));
        if (replaced !== textContent) {
            node.innerHTML = replaced;
        }
    })

    cached7TVEmotes.forEach((emote) => {
        const regex = new RegExp(emote.code, "g");
        const replaced = textContent.replace(regex, createEmote(emote, "7tv"));
        if (replaced !== textContent) {
            node.innerHTML = replaced;
        }
    })
}

const mutationObserver = new MutationObserver((mut) => {
    mut.forEach((e) => {
        replaceContents(e.addedNodes[0].querySelector("#message"));
    });
})

window.addEventListener('load', async () => {
    console.info("Loaded everything...");

    console.info("Fetching BTTV Emotes...");
    await fetchBTTVEmotes();
    console.info("Fetching FFZ Emotes...");
    await fetchFFZEmotes();
    console.info("Fetching 7TV emotes...");
    await fetch7TVEmotes();

    const chatContainer = document.getElementsByTagName("yt-live-chat-item-list-renderer")[0].querySelector("#contents #items");
    initialChildProcess = chatContainer.getElementsByTagName("yt-live-chat-text-message-renderer");
    console.info("Initial child process: ", initialChildProcess.length);
    for (let i = 0; i < initialChildProcess.length; i++) {
        replaceContents(initialChildProcess[i].querySelector("#message"));
    }

    window.fetchFallback = window.fetch;
    window.fetch = async (...args) => {
        let url = args[0].url;
        const result = await window.fetchFallback(...args);
        if (url.startsWith(
            'https://www.youtube.com/youtubei/v1/live_chat/get_live_chat')
        ) {
            const response = JSON.stringify(await (await result.clone()).json());
            window.dispatchEvent(new CustomEvent('messageReceive', { detail: response }));
        }
        return result;
    }
    console.info("Binding observer...");
    mutationObserver.observe(chatContainer, {
        childList: true,
    });
});
