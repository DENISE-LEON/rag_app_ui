// app.js
const API_BASE_URL = 'http://localhost:8000';

let currentMode = "";
let pendingQuery = "";

// 1. Handle Welcome Screen Selection
async function selectIntent(intent) {
    try {
        const response = await fetch(`${API_BASE_URL}/rag/welcome_page?intent=${intent}`);
        const data = await response.json();
        
        // Set the mode assigned by the backend and update the dropdown UI
        currentMode = data.default_mode;
        document.getElementById('mode-selector').value = currentMode;
        
        // Switch views
        document.getElementById('welcome-view').classList.remove('active');
        document.getElementById('chat-view').classList.add('active');
    } catch (error) {
        console.error("Error connecting to backend:", error);
        alert("Could not connect to the backend server. Is FastAPI running?");
    }
}

// 2. Handle Manual Mode Switch from UI Dropdown
function manualModeSwitch() {
    const selector = document.getElementById('mode-selector');
    currentMode = selector.value;
    
    // Optional: Add a small system message indicating the switch
    appendMessage('ai', `*(Switched to ${currentMode.toUpperCase()} mode)*`);
}

// 3. Handle File Previews
function updateFilePreview() {
    const fileInput = document.getElementById('file-upload');
    const previewContainer = document.getElementById('file-preview-container');
    
    previewContainer.innerHTML = ''; 
    
    if (fileInput.files.length > 0) {
        previewContainer.classList.remove('hidden');
        Array.from(fileInput.files).forEach(file => {
            const badge = document.createElement('div');
            badge.className = 'file-badge';
            badge.innerText = `📄 ${file.name}`;
            previewContainer.appendChild(badge);
        });
    } else {
        previewContainer.classList.add('hidden');
    }
}

// 4. Send Message to Backend
async function handleSend(event, wantToSwitch = false) {
    if (event) event.preventDefault();
    
    const queryInput = document.getElementById('query-input');
    const fileInput = document.getElementById('file-upload');
    
    const text = wantToSwitch ? pendingQuery : queryInput.value.trim();
    if (!text && fileInput.files.length === 0) return;

    if (!wantToSwitch) {
        appendMessage('user', text);
        queryInput.value = ''; 
        pendingQuery = text; 
    }

    const formData = new FormData();
    const queryRequestData = {
        query: text,
        mode: currentMode
    };
    
    formData.append("query_request", JSON.stringify(queryRequestData));
    formData.append("want_to_switch", wantToSwitch);
    
    Array.from(fileInput.files).forEach(file => {
        formData.append("files", file);
    });

    try {
        const response = await fetch(`${API_BASE_URL}/rag/ask_query`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();

        // Handle Mode Switch Suggestion
        if (data.awaiting_confirmation) {
            showSwitchModal(data.suggested_mode, data.reason);
            return; 
        }

        // Handle Normal Success Response
        if (data.message === "No files found") {
            appendMessage('ai', "I didn't receive any files. Please attach them using the paperclip icon.");
        } else {
            // If the backend forced a mode change, update our variable and the dropdown UI
            if (data.message.includes("mode selected")) {
                 currentMode = data.message.split(' ')[0].toLowerCase();
                 document.getElementById('mode-selector').value = currentMode;
            }
            
            let reply = data.response;
            if (data.sources && data.sources.length > 0) {
                reply += `\n\n*(Sources: ${data.sources.join(', ')})*`;
            }
            appendMessage('ai', reply);
            
            // Clear files after successful query
            // fileInput.value = '';
            // updateFilePreview();
        }

    } catch (error) {
        console.error("Error querying backend:", error);
        appendMessage('ai', "Sorry, there was an error processing your request.");
    }
}

// UI Helpers
function appendMessage(sender, text) {
    const history = document.getElementById('chat-history');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = text.replace(/\n/g, '<br>'); 
    
    msgDiv.appendChild(contentDiv);
    history.appendChild(msgDiv);
    
    history.scrollTop = history.scrollHeight;
}

function showSwitchModal(suggestedMode, reason) {
    const modal = document.getElementById('switch-modal');
    document.getElementById('switch-reason-text').innerText = 
        `${reason}\n\nWould you like to switch to ${suggestedMode.toUpperCase()} mode?`;
    modal.classList.remove('hidden');
}

function confirmSwitch(willSwitch) {
    document.getElementById('switch-modal').classList.add('hidden');
    handleSend(null, willSwitch);
}