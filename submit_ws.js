document.getElementById('random').addEventListener('click', function() {
    // Get all select elements in the form
    let selects = document.getElementById('options').getElementsByTagName('select');

    // Loop through the select elements
    for (let i = 0; i < selects.length; i++) {
        // Get the options of the select element
        let options = selects[i].options;

        // Select a random option, excluding the first one
        let randomOptionIndex = Math.floor(Math.random() * (options.length - 1)) + 1;
        selects[i].selectedIndex = randomOptionIndex;
    }
});

document.getElementById('options').addEventListener('submit', function(event) {
    event.preventDefault();
    // Get all select elements in the form
    let selects = this.getElementsByTagName('select');

    // Loop through the select elements
    for (let i = 0; i < selects.length; i++) {
        // If a select has its default value (empty string), prevent form submission
        if (selects[i].value === '') {
            event.preventDefault();
            alert('Please select an option for ' + selects[i].name + '.');
            return; // Stop the function
        }
    }
    const serverAddress = "localhost:8888";
    const clientId = Math.random().toString(36).substring(2);

    async function queuePrompt(prompt) {
        const response = await fetch(`http://${serverAddress}/prompt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({prompt: prompt, client_id: clientId})
        });
        return await response.json();
    }

    async function getImage(filename, subfolder, folderType) {
        const response = await fetch(`http://${serverAddress}/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${encodeURIComponent(folderType)}`);
        return await response.blob();
    }

    async function getHistory(promptId) {
        const response = await fetch(`http://${serverAddress}/history/${promptId}`);
        return await response.json();
    }

    async function getImages(ws, prompt) {
        const {prompt_id} = await queuePrompt(prompt);
        let outputImages = {};

        return new Promise((resolve, reject) => {
            ws.onmessage = async function(event) {
                const message = JSON.parse(event.data);
                if (message.type === 'executing' && message.data.node === null && message.data.prompt_id === prompt_id) {
                    const history = (await getHistory(prompt_id))[prompt_id];
                    for (let nodeId in history.outputs) {
                        let nodeOutput = history.outputs[nodeId];
                        if (nodeOutput.images) {
                            let imagesOutput = [];
                            for (let image of nodeOutput.images) {
                                let imageData = await getImage(image.filename, image.subfolder, image.type);
                                imagesOutput.push(imageData);
                            }
                            outputImages[nodeId] = imagesOutput;
                        }
                    }
                    resolve(outputImages);
                }
            };
        });
    }

    let promptText = `
{
  "3": {
    "inputs": {
      "seed": 1075992049681369,
      "steps": 3,
      "cfg": 1,
      "sampler_name": "dpmpp_sde",
      "scheduler": "karras",
      "denoise": 1,
      "model": [
        "4",
        0
      ],
      "positive": [
        "6",
        0
      ],
      "negative": [
        "7",
        0
      ],
      "latent_image": [
        "5",
        0
      ]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  },
  "4": {
    "inputs": {
      "ckpt_name": "dreamshaperXL_sfwLightningDPMSDE.safetensors"
    },
    "class_type": "CheckpointLoaderSimple",
    "_meta": {
      "title": "Load Checkpoint"
    }
  },
  "5": {
    "inputs": {
      "width": 1024,
      "height": 768,
      "batch_size": 1
    },
    "class_type": "EmptyLatentImage",
    "_meta": {
      "title": "Empty Latent Image"
    }
  },
  "6": {
    "inputs": {
      "text": "fantasy dragon",
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "7": {
    "inputs": {
      "text": "nudity, nsfw, naked, bad hands, multiple persons",
      "clip": [
        "4",
        1
      ]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {
      "title": "CLIP Text Encode (Prompt)"
    }
  },
  "8": {
    "inputs": {
      "samples": [
        "3",
        0
      ],
      "vae": [
        "4",
        2
      ]
    },
    "class_type": "VAEDecode",
    "_meta": {
      "title": "VAE Decode"
    }
  },
  "10": {
    "inputs": {
      "images": [
        "8",
        0
      ]
    },
    "class_type": "PreviewImage",
    "_meta": {
      "title": "Preview Image"
    }
  }
}
    `;

	let prompt = JSON.parse(promptText);
	// Set the text prompt for our positive CLIPTextEncode
	prompt["6"]["inputs"]["text"] = document.getElementsByName('option1')[0].value + ", " +
									document.getElementsByName('option0')[0].value + ", " +
									document.getElementsByName('option2')[0].value + ", " + 
									document.getElementsByName('option3')[0].value + ", " + 
									document.getElementsByName('option4')[0].value + ", " + 
									document.getElementsByName('option5')[0].value + ", " + 
									document.getElementsByName('option6')[0].value + ", " + 
									document.getElementsByName('option7')[0].value + ", " +
									"fantasy, dungeons and dragons, realistic, full body, single rpg character";
	console.log('Text prompt for positive CLIPTextEncode:', prompt["6"]["inputs"]["text"]);
	// Set the seed for our KSampler node
	prompt["3"]["inputs"]["seed"] = Math.floor(Math.random() * 101);
	//prompt["3"]["inputs"]["seed"] = Number(document.getElementsByName('option2')[0].value);
	console.log('Seed for KSampler node:', prompt["3"]["inputs"]["seed"]);

    let ws = new WebSocket(`ws://${serverAddress}/ws?clientId=${clientId}`);
    getImages(ws, prompt).then(images => {
        // Convert the first image Blob to a data URL and display it in an img element
        let reader = new FileReader();
        reader.onloadend = function() {
            let img = document.createElement('img');
            img.src = reader.result;
            let frame = document.getElementById('frame');
            frame.innerHTML = ''; // Clear the contents of the #frame div
            frame.appendChild(img); // Add the new img element to the #frame div
        }
        reader.readAsDataURL(images[Object.keys(images)[0]][0]);
    });
});

