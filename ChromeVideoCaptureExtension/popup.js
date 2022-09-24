
function readStorage()
{
    chrome.storage.sync.get({   outputType: "saveToFileWebM",
                                outputPath: ""},
                            dataread => {
                                document.getElementById('output_type').value = dataread.outputType;
                                document.getElementById('output_path').value = dataread.outputPath;
                            });
    
}

document.getElementById('output_type').onchange = () =>{

    chrome.storage.sync.set({   outputType: document.getElementById('output_type').value});
}

document.getElementById('output_path').onchange = () =>{

    chrome.storage.sync.set({ outputPath: document.getElementById('output_path').value});
}


async function getCurrentTabId()
{
    let tabarray = await chrome.tabs.query({active:true, currentWindow:true});
    if (tabarray.length == 1)
    {
        return tabarray[0].id;
    }
}


document.getElementById('startbutton').addEventListener('click',  async () => {

    console.log("Start pressed");
    let tabid = await getCurrentTabId();
    let options = {
        outputType: document.getElementById('output_type').value,
        outputPath: document.getElementById('output_path').value
    }
    chrome.tabs.sendMessage(tabid, options, function(response) {});
    chrome.tabs.sendMessage(tabid, "start", function(response) {});
});



document.getElementById('stopbutton').addEventListener('click',  async () => {

    console.log("Stop pressed");
    let tabid = await getCurrentTabId();
    chrome.tabs.sendMessage(tabid, "stop", function(response) {});
});



readStorage();