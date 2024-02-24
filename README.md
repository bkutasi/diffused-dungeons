# Diffused Dungeons

This is a small project designed for to help with the quick generation of RPG characters using ComfyUI as a backend. 
Currently the fastest model that retains quality is DreamshaperXL-Lightning.

# <span style="color:red"> *Please note: This was not desiged as production grade site, never expose it to the internet.* </span>
Since we are directly going to access and send info to ComfyUI, there are so many attack vectors i cannot even count.

### Prerequisites
- ComfyUI
- Javascript enabled browser

## Getting Started
Clone the project
```
git clone https://github.com/bkutasi/diffused-dungeons
```

Start ComfyUI with 
```bash
main.py --port 8888 --enable-cors-header
```

Open index.html in diffused-dungeons in your browser and press the random button then submit. Enjoy your new character.

### How to use it with remote servers
Make a tunnel to the server with ssh
```bash
ssh -L 8888:localhost:8888 user@remote-server
```

Then start ComfyUI on the remote server.


## Plans, issues and futures
- At the moment I have many ideas for features but im working on other projects.
    - If you have anything in mind, feel free to open an issue or a pull request.
    - I'll be happy to help you with any questions you have regarding implementation. 
- The initial goal was to make a simple character generator that is *not* text based.
- The next step would be adding resolution sliders and making it more user friendly.
- A simple solution for internet exposure would be to use https certs, reverse proxy, and a simple login system with data validation.