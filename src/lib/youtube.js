const axios = require("axios").default;
const { JSDOM } = require("jsdom");

const { traverse } = require("./utils");

const LIVE_VIDEO_PATH = "currentVideoEndpoint.watchEndpoint.videoId";
const CHANNEL_VIDEO_PATH = "contents.twoColumnWatchNextResults.results.results.contents.1.videoSecondaryInfoRenderer.owner.videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId";

function findInitialDataNode(document) {
    const allScript = document.querySelectorAll("script");
    for (let i = 0; i < allScript.length; i++) {
        const elem = allScript[i];
        const textElem = elem.innerHTML || elem.innerText || "";
        if (textElem.includes("ytInitialData")) {
            return textElem;
        }
    }
    return null;
}

async function getLiveVideoID(channelId) {
    let webpage;
    try {
        webpage = await axios.get(`https://www.youtube.com/channel/${channelId}/live`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.115 Safari/537.36"
            },
            responseType: "text",
        })
    } catch (e) {
        console.error(`Failed to download webpage for: ${channelId}`);
        return [null, null];
    }

    const dom = new JSDOM(webpage.data);
    const document = dom.window.document;
    const initialData = findInitialDataNode(document);
    if (initialData === null) {
        console.error("Failed to find the initialData, got empty response");
        return [null, null];
    }

    const realContents = initialData.split("ytInitialData = ");
    if (realContents.length !== 2) {
        console.error("Failed to extract the JSON data from ytInitialData");
        return [null, null];
    }

    let realJsonData = realContents[1];
    realJsonData = realJsonData.slice(0, realJsonData.length - 1);

    const parsedYTInitialData = JSON.parse(realJsonData);
    const videoIdNode = traverse(parsedYTInitialData, LIVE_VIDEO_PATH);
    const channelIdNode = traverse(parsedYTInitialData, CHANNEL_VIDEO_PATH);
  
    console.info(`Search complete, found VideoNode: ${videoIdNode}`);
    return [videoIdNode, channelIdNode];
}

async function getLiveChatPage(videoId) {
    let webpage;
    try {
        webpage = await axios.get(`https://www.youtube.com/live_chat?v=${videoId}`, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.115 Safari/537.36"
            },
            responseType: "text",
        })
    } catch (e) {
        console.error(`Failed to download webpage for: ${videoId}`);
        return null;
    }
    return webpage.data;
}

async function getChatData(data, apiKey) {
    let response;
    try {
        response = await axios.post("https://www.youtube.com/youtubei/v1/live_chat/get_live_chat", data, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
            },
            responseType: "json",
            params: {
                key: apiKey,
            }
        });
    } catch (e) {
        if (e.response) {
            response = e.response;
        }
    }

    return [response.data, response.status];
}

exports.getLiveVideoID = getLiveVideoID;
exports.getLiveChatPage = getLiveChatPage;
exports.getChatData = getChatData;