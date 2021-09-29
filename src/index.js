const express = require("express");
const fs = require("fs");

const utils = require("./lib/utils");
const youtube = require("./lib/youtube");

const app = express();
const PORT = 7776;

const EmoteScriptInjection = fs.readFileSync(__dirname + "/inject/emote.js").toString();

function injectObserver(htmlBase, channelId) {
    let injectedChannelId = "let injectedChannelId = ";
    if (utils.isNone(channelId)) {
        injectedChannelId += "undefined;";
    } else {
        injectedChannelId += `"${channelId}";`;
    }
    // inject just before body closing
    const injectedHTML = htmlBase.replace(/<\/body>/, `<script id="yeah-but-bttv">
        ${injectedChannelId}
        ${EmoteScriptInjection}
        </script>
        </body>
    `);
    return injectedHTML;
}

app.use(express.json());

app.get("/", (q, r) => {
    r.end("</ Made by N4O />");
})

// Real chat path
app.get("/yeah-but-bttv/:channelId", async (req, res) => {
    const { channelId } = req.params;
    if (!utils.isNone(channelId)) {
        console.info("Fetching channel live page:", channelId);
        const [videoId, chIdParsed] = await youtube.getLiveVideoID(channelId);
        if (videoId === null) {
            console.warn("Failed to get live chat, possibly offline!")
            res.status(404).send("Cannot get live chat, possibly offline.");
        } else {
            console.info("Fetching live page information for:", videoId, channelId);
            const videoPage = await youtube.getLiveChatPage(videoId);
            if (videoPage === null) {
                console.error("Failed to get video page for:", videoId, channelId);
                res.redirect("https://www.youtube.com/live_chat?v=" + videoId)
            } else {
                console.info("Found video page, will inject BTTV/FFZ/7TV stuff");
                res.send(injectObserver(videoPage, chIdParsed || channelId));
            }
        }
    } else {
        res.status(400).send("Invalid channel ID.");
    }
})

// Mirror of get_live_chat
app.post("/youtubei/v1/live_chat/get_live_chat", async (req, res) => {
    const data = req.body;
    const [jsonData, statusCode] = await youtube.getChatData(data, req.query.key);
    res.status(statusCode).json(jsonData);
})

// listen for requests :)
const listener = app.listen(PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
