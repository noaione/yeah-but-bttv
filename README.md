# Yeah but BTTV
It's like a third party thing, I don't know.

A webserver for Youtube chat with custom emotes support for your OBS ![:)](https://static-cdn.jtvnw.net/emoticons/v2/1/static/light/1.0).<br />
Deployed/public version: [https://naotimes-og.glitch.me/yeah-but-bttv/](https://naotimes-og.glitch.me/yeah-but-bttv/)

You just need to append your Youtube channel ID after `/yeah-but-bttv/` so it look like this: `https://naotimes-og.glitch.me/yeah-but-bttv/UCQ61CFTVuOGqav_siaiSWhg`

## Features
- [x] Dynamic live chat fetching (No need to manually change the Video ID anymore!)
- [x] Emotes from BTTV, FFZ, and 7TV
- [x] Support for channel emotes.
- [x] Customizable with https://chatv2.septapus.com/ (This webserver is basically Youtube chat but with emotes injection)

## Self-hosting Usage

1. Download Node
2. Clone this repository
3. Install all the packages with `npm install`
4. Run the program with `node .`

It should open a localhost server at port 7776.
After that you can just use this link: `http://localhost:7776/yeah-but-bttv/your_youtube_channel_id_here`

## Adding to OBS
1. Create a new Browser sources
2. Enter the full URL with your channel ID into the URL section
3. Customize the chat with https://chatv2.septapus.com/ (Put the CSS result in the `Custom CSS` section)
4. Press OK to save, and it will shows in a bit.

To refresh the chat to use your new stream, just click Refresh
![image](https://user-images.githubusercontent.com/34302902/135239053-d68a700e-2777-473f-b1d2-0b19f61292ec.png)

## Screenies

![OBS](https://user-images.githubusercontent.com/34302902/135238400-0c462df6-9f54-4d53-ad6c-24750c11e058.png)
![Configuration](https://user-images.githubusercontent.com/34302902/135238649-6a5eb35c-07bf-4bac-a314-4c38c6d0b339.png)

## License

MIT License, for more info check the [LICENSE](https://github.com/noaione/yeah-but-bttv/blob/master/LICENSE) file.

## Love this project?
If you like this project, I would love for some donation ![:)](https://static-cdn.jtvnw.net/emoticons/v2/1/static/light/1.0) <br/>
You can donate to me here: https://n4o.xyz/#/donate